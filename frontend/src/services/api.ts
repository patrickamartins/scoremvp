// src/services/api.ts
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { Game, GameCreate, GameUpdate, GameStats, GameStatsCreate, GameStatsUpdate } from '@/types/game';
import { Player, PlayerCreate, PlayerUpdate, PlayerStats } from '@/types/player';

console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  console.log('Axios request:', config.method, config.url, config);
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Apenas rejeita o erro, sem redirecionar para login
    return Promise.reject(error);
  }
);

// —— Auth ————————————————————————————————

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface SignupResponse {
  id: number;
  username: string;
  email: string;
}

/**
 * Faz login usando OAuth2PasswordRequestForm (x-www-form-urlencoded)
 */
export const login = async (form: URLSearchParams) => {
  console.log('Disparando login para /auth/login', form.toString());
  return api.post<LoginResponse>('/auth/login', form, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

/**
 * Cadastra novo usuário
 * Atenção: seu backend usa `/auth/register`
 */
export function signup(payload: {
  username: string;
  email: string;
  password: string;
}): Promise<AxiosResponse<SignupResponse>> {
  return api.post<SignupResponse>('/auth/register', payload);
}

/**
 * Define o header Authorization para futuras requisições
 */
export function setAuthToken(token: string): void {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// —— Players —————————————————————————————

export const getPlayers = async (): Promise<Player[]> => {
  const response = await api.get('/players');
  return response.data;
};

export const getPlayer = async (id: number): Promise<Player> => {
  const response = await api.get(`/players/${id}`);
  return response.data;
};

export const createPlayer = async (player: PlayerCreate): Promise<Player> => {
  const response = await api.post('/players', player);
  return response.data;
};

export const updatePlayer = async (id: number, player: PlayerUpdate): Promise<Player> => {
  const response = await api.put(`/players/${id}`, player);
  return response.data;
};

export const deletePlayer = async (id: number): Promise<void> => {
  await api.delete(`/players/${id}`);
};

// —— Games —————————————————————————————

export const getGames = async (): Promise<Game[]> => {
  const response = await api.get('/games');
  return response.data;
};

export const getGame = async (id: number): Promise<Game> => {
  const response = await api.get(`/games/${id}`);
  return response.data;
};

export const createGame = async (game: GameCreate): Promise<Game> => {
  const response = await api.post('/games', game);
  return response.data;
};

export const updateGame = async (id: number, game: GameUpdate): Promise<Game> => {
  const response = await api.put(`/games/${id}`, game);
  return response.data;
};

export const deleteGame = async (id: number): Promise<void> => {
  await api.delete(`/games/${id}`);
};

// —— Game Stats —————————————————————————————

export const getGameStats = async (gameId: number): Promise<GameStats[]> => {
  const response = await api.get(`/estatisticas/stats/games/${gameId}`);
  return response.data;
};

export const createGameStats = async (gameId: number, stats: GameStatsCreate): Promise<GameStats> => {
  const response = await api.post(`/estatisticas/stats/games/${gameId}`, stats);
  return response.data;
};

export const updateGameStats = async (gameId: number, statsId: number, stats: GameStatsUpdate): Promise<GameStats> => {
  const response = await api.put(`/estatisticas/stats/games/${gameId}/${statsId}`, stats);
  return response.data;
};

export const deleteGameStats = async (gameId: number, statsId: number): Promise<void> => {
  await api.delete(`/estatisticas/stats/games/${gameId}/${statsId}`);
};

// —— Player Stats —————————————————————————————

export const getPlayerStats = async (playerId: number): Promise<PlayerStats[]> => {
  const response = await api.get(`/players/${playerId}/stats`);
  return response.data;
};

export const getPlayerGameStats = async (playerId: number, gameId: number): Promise<PlayerStats> => {
  const response = await api.get(`/players/${playerId}/games/${gameId}/stats`);
  return response.data;
};

export const forgotPassword = async (email: string) => {
  return api.post('/auth/forgot-password', { email });
};

export const resetPassword = async (token: string, newPassword: string) => {
  return api.post('/auth/reset-password', { token, new_password: newPassword });
};

export default api;
