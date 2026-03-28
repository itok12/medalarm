export const SNOOZE_STORAGE_KEY = 'medalarm-snoozed-alarms';

export function readStoredSnoozes() {
  try {
    return new Map(Object.entries(JSON.parse(localStorage.getItem(SNOOZE_STORAGE_KEY) || '{}')));
  } catch {
    return new Map();
  }
}

export function persistSnoozes(map) {
  localStorage.setItem(SNOOZE_STORAGE_KEY, JSON.stringify(Object.fromEntries(map)));
  return map;
}

export function getSnoozeUntil(snoozes, alarmId) {
  return Number(snoozes.get(String(alarmId)) || 0);
}
