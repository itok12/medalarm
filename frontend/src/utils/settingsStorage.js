export const SETTINGS_STORAGE_KEY = 'medalarm-local-settings';

export const DEFAULT_SETTINGS = {
  notificationSound: true,
  snoozeDurationMinutes: 10,
  alarmTone: 'default',
  dateFormat: 'MM/DD/YYYY',
  compactView: false,
};

export function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function persistSettings(settings) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  return settings;
}

export function resetStoredSettings() {
  return persistSettings(DEFAULT_SETTINGS);
}
