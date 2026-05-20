export const AUTH_STORAGE_KEYS = {
  userId: 'userId',
  username: 'username',
  email: 'email',
  timezone: 'timezone',
  emailRemindersEnabled: 'emailRemindersEnabled',
  defaultAlarmTime: 'defaultAlarmTime',
};

const LEGACY_TOKEN_STORAGE_KEYS = ['token', 'refreshToken'];

export function normalizeTime(value) {
  if (!value) return '08:00';
  return String(value).slice(0, 5);
}

export function readStoredUser() {
  const userId = localStorage.getItem(AUTH_STORAGE_KEYS.userId);
  const username = localStorage.getItem(AUTH_STORAGE_KEYS.username);

  if (!userId || !username) {
    return null;
  }

  return {
    userId: Number(userId),
    username,
    email: localStorage.getItem(AUTH_STORAGE_KEYS.email) || '',
    timezone:
      localStorage.getItem(AUTH_STORAGE_KEYS.timezone)
      || Intl.DateTimeFormat().resolvedOptions().timeZone
      || 'UTC',
    emailRemindersEnabled:
      localStorage.getItem(AUTH_STORAGE_KEYS.emailRemindersEnabled) === 'true',
    defaultAlarmTime: normalizeTime(localStorage.getItem(AUTH_STORAGE_KEYS.defaultAlarmTime)),
  };
}

export function persistUser(user) {
  LEGACY_TOKEN_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.setItem(AUTH_STORAGE_KEYS.userId, String(user.userId));
  localStorage.setItem(AUTH_STORAGE_KEYS.username, user.username);
  localStorage.setItem(AUTH_STORAGE_KEYS.email, user.email || '');
  localStorage.setItem(AUTH_STORAGE_KEYS.timezone, user.timezone || 'UTC');
  localStorage.setItem(
    AUTH_STORAGE_KEYS.emailRemindersEnabled,
    String(!!user.emailRemindersEnabled),
  );
  localStorage.setItem(
    AUTH_STORAGE_KEYS.defaultAlarmTime,
    normalizeTime(user.defaultAlarmTime),
  );
}

export function clearStoredUser() {
  Object.values(AUTH_STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  LEGACY_TOKEN_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

const GUEST_KEY = 'medalarm-guest';

export function persistGuest() {
  localStorage.setItem(GUEST_KEY, 'true');
}

export function isStoredGuest() {
  return localStorage.getItem(GUEST_KEY) === 'true';
}

export function clearStoredGuest() {
  localStorage.removeItem(GUEST_KEY);
}

export function normalizeSession(data) {
  return {
    token: data.token,
    userId: Number(data.userId),
    username: data.username,
    email: data.email || '',
    timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    emailRemindersEnabled: !!data.emailRemindersEnabled,
    defaultAlarmTime: normalizeTime(data.defaultAlarmTime),
  };
}
