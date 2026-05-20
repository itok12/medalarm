import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
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

  const startGuestSession = useCallback(() => {
    setAccessToken(null);
    clearStoredUser();
    persistGuest();
    setUser(GUEST_USER);
  }, []);

  useEffect(() => {
    setTelemetryUser(user);
  }, [user]);

  useEffect(() => {
    let ignore = false;

    async function restoreSession() {
      // Guest session: skip the API refresh entirely.
      if (isStoredGuest()) {
        if (!ignore) {
          setUser(GUEST_USER);
          setAuthLoading(false);
        }
        return;
      }

      if (!readStoredUser()) {
        if (!ignore) {
          startGuestSession();
          setAuthLoading(false);
        }
        return;
      }

      try {
        const response = await authAPI.refresh();
        if (ignore) return;

        const nextUser = normalizeSession(response.data);
        setAccessToken(nextUser.token);
        persistUser(nextUser);
        setUser(nextUser);
      } catch (error) {
        if (!ignore) {
          startGuestSession();
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
  }, [startGuestSession]);

  const login = (sessionPayload) => {
    clearStoredGuest();
    const nextUser = normalizeSession(sessionPayload);
    setAccessToken(nextUser.token);
    persistUser(nextUser);
    setUser(nextUser);
  };

  const guestLogin = () => {
    startGuestSession();
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
    startGuestSession();
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
