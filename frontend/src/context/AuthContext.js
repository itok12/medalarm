import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  clearStoredGuest,
  clearStoredUser,
  isStoredGuest,
  normalizeSession,
  normalizeTime,
  persistGuest,
  persistUser,
  readStoredUser,
} from '../utils/authSession';
import { authAPI, setAccessToken } from '../services/api';
import { setTelemetryUser } from '../services/telemetry';

const AuthContext = createContext(null);

const GUEST_USER = { guest: true, userId: 'guest-local', username: 'Guest' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    setTelemetryUser(user);
  }, [user]);

  useEffect(() => {
    let ignore = false;

    async function restoreSession() {
      const alreadyGuest = isStoredGuest();
      const storedUser = alreadyGuest ? null : readStoredUser();

      if (storedUser) {
        // Returning signed-in user: show their cached data (and keep their
        // reminders) straight away, then refresh the session in the background.
        // A failed refresh must never downgrade them to an empty guest account.
        setUser(storedUser);
        setAuthLoading(false);

        try {
          const response = await authAPI.refresh();
          if (ignore) return;
          const nextUser = normalizeSession(response.data);
          setAccessToken(nextUser.token);
          persistUser(nextUser);
          setUser(nextUser);
        } catch (error) {
          if (ignore) return;
          const status = error.response?.status;
          if (status === 401 || status === 403) {
            setUser((prev) => (prev ? { ...prev, sessionExpired: true } : prev));
          }
          // Network errors: stay signed in on cached data; later API calls retry.
        }
        return;
      }

      // No account on this device: open straight into guest mode.
      persistGuest();
      setUser(GUEST_USER);
      setAuthLoading(false);

      if (alreadyGuest) return;

      // First visit: a refresh cookie (web) may still hold a real session.
      try {
        const response = await authAPI.refresh();
        if (ignore) return;
        const nextUser = normalizeSession(response.data);
        setAccessToken(nextUser.token);
        persistUser(nextUser);
        clearStoredGuest();
        setUser(nextUser);
      } catch {
        // No valid session; guest mode is already active.
      }
    }

    restoreSession();
    return () => { ignore = true; };
  }, []);

  const login = (sessionPayload) => {
    clearStoredGuest();
    const nextUser = normalizeSession(sessionPayload);
    setAccessToken(nextUser.token);
    persistUser(nextUser);
    setUser(nextUser);
  };

  const guestLogin = () => {
    persistGuest();
    setUser(GUEST_USER);
  };

  const updateUserFromProfile = (profilePayload) => {
    setUser((prev) => {
      if (!prev || prev.guest) return prev;
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
    // Fall back to on-device guest mode rather than a user-less shell.
    persistGuest();
    setUser(GUEST_USER);
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, guestLogin, logout, updateUserFromProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
