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
      timezone: 'Europe/London',
      emailRemindersEnabled: true,
      defaultAlarmTime: '07:30:00',
    });

    expect(readStoredUser()).toEqual({
      userId: 5,
      username: 'meduser',
      email: 'meduser@example.com',
      timezone: 'Europe/London',
      emailRemindersEnabled: true,
      defaultAlarmTime: '07:30',
    });
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('clears every auth key and legacy token key on logout', () => {
    Object.values(AUTH_STORAGE_KEYS).forEach((key) => localStorage.setItem(key, 'value'));
    localStorage.setItem('token', 'legacy-access-token');
    localStorage.setItem('refreshToken', 'legacy-refresh-token');
    clearStoredUser();
    Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
      expect(localStorage.getItem(key)).toBeNull();
    });
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });
});
