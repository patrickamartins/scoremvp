import axios from 'axios';

const api = axios.create({
  baseURL: 'https://seu-backend.railway.app/api'  // Adicione /api aqui
});

// Interceptor para adicionar token em todas requisições
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;