// src/services/api.ts
import axios from 'axios';
import { Game, GameCreate, GameUpdate, GameStats, GameStatsCreate, GameStatsUpdate } from '../types/game';
import { Player, PlayerCreate, PlayerUpdate, PlayerStats } from '../types/player';
import { resolveApiBaseUrl } from '../utils/resolve-api-base-url';

// Resolver a URL dinamicamente - não no top-level para garantir que window.location esteja disponível
let cachedBaseUrl: string | null = null;

function getApiBaseUrl(): string {
  if (!cachedBaseUrl) {
    cachedBaseUrl = resolveApiBaseUrl();
    console.log('[API] Base URL resolvida:', cachedBaseUrl);
    console.log('[API] VITE_API_URL do env:', import.meta.env.VITE_API_URL);
    console.log('[API] import.meta.env:', import.meta.env);
  }
  return cachedBaseUrl;
}

// Criar instância do axios - inicializar com URL padrão, mas será atualizada no interceptor
export const api = axios.create({
  baseURL: '', // Será definido dinamicamente no interceptor
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para definir baseURL dinamicamente antes de cada requisição
api.interceptors.request.use((config) => {
  // Resolver a URL a cada requisição para garantir que está correta
  if (!config.baseURL || config.baseURL === '') {
    config.baseURL = getApiBaseUrl();
  }
  return config;
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
    plan?: string;
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
}): Promise<any> { // Changed AxiosResponse to any as AxiosResponse is not imported
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

export const updateScoreboard = async (id: number, scoreboardData: {
  away_score?: number;
  timer_time?: number;
  timer_running?: boolean;
  current_quarter?: number;
}): Promise<Game> => {
  const response = await api.put(`/games/${id}/scoreboard`, scoreboardData);
  return response.data;
};

export const getPublicScoreboard = async (publicLink: string): Promise<{
  home_score: number;
  away_score: number;
  timer_time: number;
  timer_running: boolean;
  current_quarter: number;
  opponent: string;
  home_fouls: number;
  away_fouls: number;
}> => {
  const response = await api.get(`/games/public/link/${publicLink}/scoreboard`);
  return response.data;
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

// —— Profile ——————————————————————————————

export const getProfile = async () => {
  const response = await api.get('/profile/me');
  return response.data;
};

export const updateProfile = async (data: any) => {
  const response = await api.put('/profile/me', data);
  return response.data;
};

export const uploadProfilePhoto = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/profile/me/upload-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  return api.post('/profile/me/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
};

export const getTeams = async () => {
  const response = await api.get('/profile/teams');
  return response.data;
};

export const requestTeamLink = async (teamId: number) => {
  return api.post('/profile/me/request-team-link', { team_id: teamId });
};

// —— Stripe/Subscription ——————————————————————————————

export const getMySubscription = async () => {
  const response = await api.get('/stripe/my-subscription');
  return response.data;
};

export const cancelSubscription = async () => {
  return api.post('/stripe/cancel-subscription');
};

export const upgradeDowngrade = async (newPlanId: string) => {
  return api.post('/stripe/upgrade-downgrade', { new_plan_id: newPlanId });
};

export default api;
