import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  clearStoredGuest,
  clearStoredUser,
  isStoredGuest,
  normalizeSession,
  normalizeTime,
  persistGuest,
  persistUser,
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
      // Open the app immediately as guest — no spinner wait, no login wall.
      if (!ignore) {
        persistGuest();
        setUser(GUEST_USER);
        setAuthLoading(false);
      }

      // Already a confirmed guest with no prior account — nothing more to do.
      if (isStoredGuest()) return;

      // Try to silently restore a real authenticated session in the background.
      try {
        const response = await authAPI.refresh();
        if (ignore) return;
        const nextUser = normalizeSession(response.data);
        setAccessToken(nextUser.token);
        persistUser(nextUser);
        clearStoredGuest();
        setUser(nextUser);
      } catch {
        // No valid session — guest mode already active.
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
    clearStoredGuest();
    setUser(null);
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
