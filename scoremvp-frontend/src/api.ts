// src/api.ts
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,  // e.g. "https://.../api"
  headers: { 'Content-Type': 'application/json' }
});

// opcional: injeta o token automaticamente
API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token && cfg.headers) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

export default API;
