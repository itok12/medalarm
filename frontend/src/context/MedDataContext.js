import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { alarmAPI, logAPI, medicineAPI } from '../services/api';
import { getJson, setJson } from '../services/deviceStorage';
import { useAuth } from './AuthContext';

const CACHE_KEY = 'medalarm-data-cache-v1';
const MedDataContext = createContext(null);

function createEmptyState() {
  return {
    medicines: [],
    alarms: [],
    logs: [],
    lastSyncedAt: null,
  };
}

export function MedDataProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState(createEmptyState());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState('');
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const persistCache = useCallback(async (nextData) => {
    if (!user) return;
    await setJson(CACHE_KEY, {
      userId: user.userId,
      ...nextData,
    });
  }, [user]);

  const applyData = useCallback((nextData) => {
    setData({
      medicines: nextData.medicines ?? [],
      alarms: nextData.alarms ?? [],
      logs: nextData.logs ?? [],
      lastSyncedAt: nextData.lastSyncedAt ?? null,
    });
  }, []);

  const refreshAll = useCallback(async ({ background = false } = {}) => {
    if (!user) return;

    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const [medicineResponse, alarmResponse, logResponse] = await Promise.all([
        medicineAPI.getAll(),
        alarmAPI.getAll(),
        logAPI.getMine(),
      ]);

      const nextData = {
        medicines: medicineResponse.data ?? [],
        alarms: alarmResponse.data ?? [],
        logs: logResponse.data ?? [],
        lastSyncedAt: new Date().toISOString(),
      };

      applyData(nextData);
      setOffline(false);
      await persistCache(nextData);
    } catch (refreshError) {
      console.error('Failed to refresh MedAlarm data:', refreshError);
      setOffline(true);
      const currentData = dataRef.current;
      if (!currentData.medicines.length && !currentData.alarms.length && !currentData.logs.length) {
        setError('Unable to sync with the server. Showing nothing until a connection is available.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [applyData, persistCache, user]);

  useEffect(() => {
    let ignore = false;

    async function hydrate() {
      if (!user) {
        setData(createEmptyState());
        setLoading(false);
        setOffline(false);
        setError('');
        return;
      }

      setLoading(true);
      const cached = await getJson(CACHE_KEY, null);
      if (!ignore && cached?.userId === user.userId) {
        applyData(cached);
      }

      if (!ignore) {
        await refreshAll({ background: !!cached });
      }
    }

    hydrate();
    return () => {
      ignore = true;
    };
  }, [applyData, refreshAll, user]);

  const value = useMemo(() => ({
    ...data,
    loading,
    refreshing,
    offline,
    error,
    refreshAll,
  }), [data, error, loading, offline, refreshAll, refreshing]);

  return (
    <MedDataContext.Provider value={value}>
      {children}
    </MedDataContext.Provider>
  );
}

export function useMedData() {
  const context = useContext(MedDataContext);
  if (!context) {
    throw new Error('useMedData must be used within a MedDataProvider');
  }
  return context;
}
