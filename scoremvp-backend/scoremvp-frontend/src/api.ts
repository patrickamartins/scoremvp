// src/api.ts
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // ex: "https://.../api"
  headers: { 'Content-Type': 'application/json' },
});

// Se quiser já enviar o Bearer token em todas as requisições:
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
