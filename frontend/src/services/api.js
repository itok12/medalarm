import axios from 'axios';

function getRuntimeConfigBaseUrl() {
  if (typeof window === 'undefined') return '';
  return window.__MEDALARM_RUNTIME_CONFIG__?.API_BASE_URL?.trim() || '';
}

function normalizeApiBaseUrl(value) {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return '';

  const withoutTrailingSlash = trimmedValue.replace(/\/+$/, '');
  if (withoutTrailingSlash === '/api' || withoutTrailingSlash.endsWith('/api')) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api`;
}

function inferApiBaseUrl() {
  if (typeof window === 'undefined') {
    return 'http://localhost:8080/api';
  }

  const { hostname } = window.location;
  const isNativePlatform = !!window.Capacitor?.isNativePlatform?.();
  const isLocalHost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0';

  if (isNativePlatform) {
    return process.env.NODE_ENV === 'production'
      ? '/api'
      : 'http://10.0.2.2:8080/api';
  }

  if (isLocalHost) {
    return 'http://localhost:8080/api';
  }

  return '/api';
}

function resolveApiBaseUrl() {
  return normalizeApiBaseUrl(
    getRuntimeConfigBaseUrl() || process.env.REACT_APP_API_BASE_URL || inferApiBaseUrl()
  );
}

const API_BASE_URL = resolveApiBaseUrl();

const STORAGE_KEYS = {
  userId: 'userId',
  username: 'username',
  email: 'email',
  timezone: 'timezone',
  emailRemindersEnabled: 'emailRemindersEnabled',
  defaultAlarmTime: 'defaultAlarmTime',
};

const LEGACY_TOKEN_STORAGE_KEYS = ['token', 'refreshToken'];
let accessToken = null;

function setAccessToken(token) {
  accessToken = token || null;
}

function getAccessToken() {
  return accessToken;
}

function normalizeTime(value) {
  if (!value) return '08:00';
  return String(value).slice(0, 5);
}

function persistSessionFields(data) {
  if (Object.prototype.hasOwnProperty.call(data, 'token')) {
    setAccessToken(data.token);
  }
  if (data.userId != null) localStorage.setItem(STORAGE_KEYS.userId, String(data.userId));
  if (data.username) localStorage.setItem(STORAGE_KEYS.username, data.username);
  if (Object.prototype.hasOwnProperty.call(data, 'email')) {
    localStorage.setItem(STORAGE_KEYS.email, data.email || '');
  }
  if (Object.prototype.hasOwnProperty.call(data, 'timezone')) {
    localStorage.setItem(STORAGE_KEYS.timezone, data.timezone || 'UTC');
  }
  if (Object.prototype.hasOwnProperty.call(data, 'emailRemindersEnabled')) {
    localStorage.setItem(STORAGE_KEYS.emailRemindersEnabled, String(!!data.emailRemindersEnabled));
  }
  if (Object.prototype.hasOwnProperty.call(data, 'defaultAlarmTime')) {
    localStorage.setItem(STORAGE_KEYS.defaultAlarmTime, normalizeTime(data.defaultAlarmTime));
  }
}

function clearSessionFields() {
  setAccessToken(null);
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  LEGACY_TOKEN_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

const api = axios.create({
  baseURL: API_BASE_URL,
  // Render free instances can take tens of seconds to wake up after inactivity.
  timeout: 65000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];
let refreshPromise = null;

const processQueue = (error, token = null) => {
  failedQueue.forEach((promiseHandlers) => {
    if (error) {
      promiseHandlers.reject(error);
    } else {
      promiseHandlers.resolve(token);
    }
  });
  failedQueue = [];
};

const requestTokenRefresh = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh`, {}, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 65000,
        withCredentials: true,
      })
      .then((response) => {
        persistSessionFields(response.data);
        return response;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((queueError) => Promise.reject(queueError));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await requestTokenRefresh();
        processQueue(null, response.data.token);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSessionFields();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  refresh: () => requestTokenRefresh(),
  logout: () => api.post('/auth/logout'),
};

export const medicineAPI = {
  getAll: () => api.get('/medicines'),
  create: (medicine) => api.post('/medicines', medicine),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
};

export const alarmAPI = {
  getAll: () => api.get('/alarms'),
  create: (alarm) => api.post('/alarms', alarm),
  toggle: (alarmId, active) => api.patch(`/alarms/${alarmId}`, { active }),
  generate: (medicineId) => api.post('/alarms/generate', { medicineId }),
  delete: (id) => api.delete(`/alarms/${id}`),
};

export const logAPI = {
  log: (alarmId, status) => api.post('/logs', { alarmId, status }),
  getMine: () => api.get('/logs'),
  exportCSV: () => api.get('/logs/export', { responseType: 'blob' }),
};

export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  deleteMe: (data) => api.delete('/users/me', { data }),
};

export const caregiverAPI = {
  addPatient: (patientUsername) =>
    api.post('/caregivers/patients', { patientUsername }),
  getPatients: () => api.get('/caregivers/patients'),
  getPatientLogs: (patientId) =>
    api.get(`/caregivers/patients/${patientId}/logs`),
};

export { clearSessionFields, getAccessToken, persistSessionFields, setAccessToken };
export default api;
