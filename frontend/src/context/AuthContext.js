import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  clearStoredUser,
  normalizeSession,
  normalizeTime,
  persistUser,
} from '../utils/authSession';
import { authAPI, setAccessToken } from '../services/api';
import { setTelemetryUser } from '../services/telemetry';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    setTelemetryUser(user);
  }, [user]);

  useEffect(() => {
    let ignore = false;

    async function restoreSession() {
      try {
        const response = await authAPI.refresh();
        if (ignore) return;

        const nextUser = normalizeSession(response.data);
        setAccessToken(nextUser.token);
        persistUser(nextUser);
        setUser(nextUser);
      } catch (error) {
        if (!ignore) {
          setAccessToken(null);
          clearStoredUser();
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setAuthLoading(false);
        }
      }
    }

    restoreSession();
    return () => {
      ignore = true;
    };
  }, []);

  const login = (sessionPayload) => {
    const nextUser = normalizeSession(sessionPayload);
    setAccessToken(nextUser.token);
    persistUser(nextUser);
    setUser(nextUser);
  };

  const updateUserFromProfile = (profilePayload) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextUser = {
        ...prev,
        email: profilePayload.email ?? prev.email,
        timezone: profilePayload.timezone ?? prev.timezone,
        emailRemindersEnabled:
          profilePayload.emailRemindersEnabled ?? prev.emailRemindersEnabled,
        defaultAlarmTime: normalizeTime(profilePayload.defaultAlarmTime ?? prev.defaultAlarmTime),
      };
      persistUser(nextUser);
      return nextUser;
    });
  };

  const logout = () => {
    setAccessToken(null);
    clearStoredUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, logout, updateUserFromProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
