import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
};

// Medicine API
export const medicineAPI = {
  getAll: (userId) => api.get(`/medicines/user/${userId}`),
  create: (medicine) => api.post('/medicines', medicine),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
};

// Alarm API
export const alarmAPI = {
  getUserAlarms: (userId) => api.get(`/alarms/user/${userId}`),
  create: (alarm) => api.post('/alarms', alarm),
  toggle: (alarmId, active) => api.patch(`/alarms/${alarmId}`, { active }),
  generate: (medicineId) => api.post('/alarms/generate', { medicineId }),
  delete: (id) => api.delete(`/alarms/${id}`),
};

export default api;

