import axios from 'axios';

// Set EXPO_PUBLIC_API_URL in .env for real device testing
// Real device cannot reach localhost — use your machine's LAN IP e.g. http://192.168.1.x:8000/api/v1
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // TODO: attach auth token
  return config;
});

export default api;
