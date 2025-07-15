import axios from 'axios';

// Função para determinar a URL base da API
const getBaseUrl = () => {
  // Em produção, sempre usar HTTPS
  if (import.meta.env.PROD) {
    return 'https://scoremvpback-production.up.railway.app/api';
  }
  
  // Em desenvolvimento, usar localhost
  return 'http://localhost:8000/api';
};

// Função para garantir que a URL seja HTTPS se a página estiver em HTTPS
const ensureHttps = (url: string) => {
  // Se estamos em uma página HTTPS, forçar HTTPS na API
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return url.replace('http://', 'https://');
  }
  return url;
};

const api = axios.create({
  baseURL: ensureHttps(getBaseUrl()),
});

// Adiciona o token a todas as requisições
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await api.post('/auth/refresh', {
          refresh_token: refreshToken,
        });

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api; 