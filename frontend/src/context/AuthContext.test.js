/* eslint-disable testing-library/no-unnecessary-act --
   This test renders with react-dom directly (no Testing Library), so act() is required. */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from './AuthContext';
import { authAPI } from '../services/api';
import { persistUser } from '../utils/authSession';

jest.mock('../services/api', () => ({
  authAPI: { refresh: jest.fn() },
  setAccessToken: jest.fn(),
}));
jest.mock('../services/telemetry', () => ({ setTelemetryUser: jest.fn() }));

const STORED_USER = {
  userId: 42,
  username: 'maria',
  email: 'maria@example.com',
  timezone: 'Europe/London',
  emailRemindersEnabled: false,
  defaultAlarmTime: '08:00',
};

let latest;
function Probe() {
  latest = useAuth();
  return null;
}

async function renderAuth() {
  const container = document.createElement('div');
  const root = createRoot(container);
  await act(async () => {
    root.render(<AuthProvider><Probe /></AuthProvider>);
  });
  // Let the background refresh promise settle.
  await act(async () => {});
  return root;
}

beforeAll(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
});

beforeEach(() => {
  localStorage.clear();
  authAPI.refresh.mockReset();
  latest = null;
});

describe('AuthProvider session restore', () => {
  it('keeps a signed-in user signed in when the refresh fails offline', async () => {
    persistUser(STORED_USER);
    authAPI.refresh.mockRejectedValue(new Error('Network Error'));

    await renderAuth();

    expect(latest.user.guest).toBeUndefined();
    expect(latest.user.userId).toBe(42);
    expect(latest.user.sessionExpired).toBeUndefined();
    expect(localStorage.getItem('medalarm-guest')).toBeNull();
  });

  it('flags an expired session instead of switching to guest', async () => {
    persistUser(STORED_USER);
    authAPI.refresh.mockRejectedValue({ response: { status: 401 } });

    await renderAuth();

    expect(latest.user.userId).toBe(42);
    expect(latest.user.sessionExpired).toBe(true);
  });

  it('refreshes a signed-in user when the server is reachable', async () => {
    persistUser(STORED_USER);
    authAPI.refresh.mockResolvedValue({ data: { ...STORED_USER, token: 'access', username: 'maria2' } });

    await renderAuth();

    expect(latest.user.username).toBe('maria2');
    expect(latest.user.sessionExpired).toBeUndefined();
  });

  it('opens a first-time visitor in guest mode', async () => {
    authAPI.refresh.mockRejectedValue({ response: { status: 401 } });

    await renderAuth();

    expect(latest.user.guest).toBe(true);
    expect(localStorage.getItem('medalarm-guest')).toBe('true');
  });

  it('does not call the server for a returning guest', async () => {
    localStorage.setItem('medalarm-guest', 'true');

    await renderAuth();

    expect(latest.user.guest).toBe(true);
    expect(authAPI.refresh).not.toHaveBeenCalled();
  });

  it('falls back to guest mode on logout', async () => {
    persistUser(STORED_USER);
    authAPI.refresh.mockRejectedValue(new Error('Network Error'));
    await renderAuth();

    await act(async () => {
      latest.logout();
    });

    expect(latest.user.guest).toBe(true);
    expect(localStorage.getItem('userId')).toBeNull();
  });
});
