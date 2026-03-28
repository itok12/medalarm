import {
  AUTH_STORAGE_KEYS,
  clearStoredUser,
  normalizeSession,
  persistUser,
  readStoredUser,
} from './authSession';

describe('authSession', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('normalizes server session payloads', () => {
    expect(normalizeSession({
      token: 'access-token',
      userId: '7',
      username: 'alice',
      emailRemindersEnabled: 1,
      defaultAlarmTime: '09:45:00',
    })).toEqual(expect.objectContaining({
      token: 'access-token',
      userId: 7,
      username: 'alice',
      email: '',
      refreshToken: '',
      emailRemindersEnabled: true,
      defaultAlarmTime: '09:45',
    }));
  });

  it('persists and reads a stored user', () => {
    persistUser({
      token: 'access-token',
      userId: 5,
      username: 'meduser',
      email: 'meduser@example.com',
      refreshToken: 'refresh-token',
      timezone: 'Europe/London',
      emailRemindersEnabled: true,
      defaultAlarmTime: '07:30:00',
    });

    expect(readStoredUser()).toEqual({
      token: 'access-token',
      userId: 5,
      username: 'meduser',
      email: 'meduser@example.com',
      refreshToken: 'refresh-token',
      timezone: 'Europe/London',
      emailRemindersEnabled: true,
      defaultAlarmTime: '07:30',
    });
  });

  it('clears every auth key on logout', () => {
    Object.values(AUTH_STORAGE_KEYS).forEach((key) => localStorage.setItem(key, 'value'));
    clearStoredUser();
    Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
      expect(localStorage.getItem(key)).toBeNull();
    });
  });
});
