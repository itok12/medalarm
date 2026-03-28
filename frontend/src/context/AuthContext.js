import React, { createContext, useContext, useState } from 'react';
import {
  clearStoredUser,
  normalizeSession,
  normalizeTime,
  persistUser,
  readStoredUser,
} from '../utils/authSession';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());

  const login = (sessionPayload) => {
    const nextUser = normalizeSession(sessionPayload);
    persistUser(nextUser);
    setUser(nextUser);
  };

  const updateUserFromProfile = (profilePayload) => {
    setUser((prev) => {
      if (!prev) return prev;
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
    clearStoredUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserFromProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
