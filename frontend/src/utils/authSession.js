export const AUTH_STORAGE_KEYS = {
  token: 'token',
  userId: 'userId',
  username: 'username',
  email: 'email',
  refreshToken: 'refreshToken',
  timezone: 'timezone',
  emailRemindersEnabled: 'emailRemindersEnabled',
  defaultAlarmTime: 'defaultAlarmTime',
};

export function normalizeTime(value) {
  if (!value) return '08:00';
  return String(value).slice(0, 5);
}

export function readStoredUser() {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
  const userId = localStorage.getItem(AUTH_STORAGE_KEYS.userId);
  const username = localStorage.getItem(AUTH_STORAGE_KEYS.username);

  if (!token || !userId || !username) {
    return null;
  }

  return {
    token,
    userId: Number(userId),
    username,
    email: localStorage.getItem(AUTH_STORAGE_KEYS.email) || '',
    refreshToken: localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken) || '',
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
  localStorage.setItem(AUTH_STORAGE_KEYS.token, user.token);
  localStorage.setItem(AUTH_STORAGE_KEYS.userId, String(user.userId));
  localStorage.setItem(AUTH_STORAGE_KEYS.username, user.username);
  localStorage.setItem(AUTH_STORAGE_KEYS.email, user.email || '');
  localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, user.refreshToken || '');
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
}

export function normalizeSession(data) {
  return {
    token: data.token,
    userId: Number(data.userId),
    username: data.username,
    email: data.email || '',
    refreshToken: data.refreshToken || '',
    timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    emailRemindersEnabled: !!data.emailRemindersEnabled,
    defaultAlarmTime: normalizeTime(data.defaultAlarmTime),
  };
}
