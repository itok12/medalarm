import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {"Content-Type": "application/json"},
});

// Medicine API calls
export const medicineAPI = {
  getAll: (userId) => api.get(`/medicines/user/${userId}`),
  create: (medicine) => api.post('/medicines', medicine),
};

// Alarm API calls
export const alarmAPI = {
  getUserAlarms: (userId) => api.get(`/alarms/user/${userId}`),
  create: (alarm) => api.post('/alarms', alarm),
  toggle: (alarmId, active) => api.patch(`/alarms/${alarmId}`, { active }),
  generate: (medicineId) => api.post('/alarms/generate', { medicineId }),
};

export default api;
