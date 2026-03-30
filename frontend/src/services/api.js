import axios from 'axios';

function getRuntimeConfigBaseUrl() {
  if (typeof window === 'undefined') return '';
  return window.__MEDALARM_RUNTIME_CONFIG__?.API_BASE_URL?.trim() || '';
}

function inferApiBaseUrl() {
  if (typeof window === 'undefined') {
    return 'http://localhost:8080/api';
  }

  const { origin, hostname } = window.location;
  const isNativePlatform = !!window.Capacitor?.isNativePlatform?.();
  const isLocalHost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0';

  if (isNativePlatform) {
    return 'https://api.medalarm.app/api';
  }

  if (isLocalHost) {
    return 'http://localhost:8080/api';
  }

  if (hostname === 'medalarm.app' || hostname.endsWith('.medalarm.app')) {
    return 'https://api.medalarm.app/api';
  }

  if (hostname === 'medalarm-frontend.onrender.com') {
    return 'https://medalarm-backend.onrender.com/api';
  }

  return `${origin}/api`;
}

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || getRuntimeConfigBaseUrl() || inferApiBaseUrl();

const STORAGE_KEYS = {
  token: 'token',
  userId: 'userId',
  username: 'username',
  email: 'email',
  refreshToken: 'refreshToken',
  timezone: 'timezone',
  emailRemindersEnabled: 'emailRemindersEnabled',
  defaultAlarmTime: 'defaultAlarmTime',
};

function normalizeTime(value) {
  if (!value) return '08:00';
  return String(value).slice(0, 5);
}

function persistSessionFields(data) {
  if (data.token) localStorage.setItem(STORAGE_KEYS.token, data.token);
  if (data.userId != null) localStorage.setItem(STORAGE_KEYS.userId, String(data.userId));
  if (data.username) localStorage.setItem(STORAGE_KEYS.username, data.username);
  if (Object.prototype.hasOwnProperty.call(data, 'email')) {
    localStorage.setItem(STORAGE_KEYS.email, data.email || '');
  }
  if (data.refreshToken) localStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
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
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

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
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((queueError) => Promise.reject(queueError));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
      if (!refreshToken) {
        isRefreshing = false;
        clearSessionFields();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        persistSessionFields(response.data);
        processQueue(null, response.data.token);
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
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
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
};

export const caregiverAPI = {
  addPatient: (patientUsername) =>
    api.post('/caregivers/patients', { patientUsername }),
  getPatients: () => api.get('/caregivers/patients'),
  getPatientLogs: (patientId) =>
    api.get(`/caregivers/patients/${patientId}/logs`),
};

export { clearSessionFields, persistSessionFields };
export default api;
