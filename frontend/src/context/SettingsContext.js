import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  persistSettings,
  resetStoredSettings,
} from '../utils/settingsStorage';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => loadSettings());

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      return persistSettings(next);
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(resetStoredSettings());
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}

export { DEFAULT_SETTINGS };
export default SettingsContext;
