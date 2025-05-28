// src/services/api.ts
import axios from 'axios';
import type { AxiosResponse } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://scoremvp.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Se o token expirou, limpa o localStorage e redireciona para o login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// —— Auth ————————————————————————————————

export interface LoginResponse {
  access_token: string;
  token_type: string;
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

export interface Player {
  id: number;
  nome: string;
  numero: number;
  posicao?: string;
}

type NewPlayer = Omit<Player, 'id'>;
type UpdatePlayerPayload = Partial<NewPlayer>;

export function getPlayers(): Promise<AxiosResponse<Player[]>> {
  return api.get<Player[]>('/players');
}

export function getPlayer(id: number): Promise<AxiosResponse<Player>> {
  return api.get<Player>(`/players/${id}`);
}

export function createPlayer(payload: NewPlayer): Promise<AxiosResponse<Player>> {
  return api.post<Player>('/players', payload);
}

export function updatePlayer(
  id: number,
  payload: UpdatePlayerPayload
): Promise<AxiosResponse<Player>> {
  return api.put<Player>(`/players/${id}`, payload);
}

export function deletePlayer(id: number): Promise<AxiosResponse<void>> {
  return api.delete<void>(`/players/${id}`);
}

// —— Games —————————————————————————————

export interface Game {
  id: number;
  opponent: string;
  date: string;
  time?: string;
  location?: string;
  categoria?: string;
  status?: string;
  jogadoras?: number[];
}

type NewGame = Omit<Game, 'id'>;

export function listGames(): Promise<AxiosResponse<Game[]>> {
  return api.get<Game[]>('/games');
}

export function getGame(id: number | string): Promise<AxiosResponse<Game>> {
  return api.get<Game>(`/games/${id}`);
}

export function createGame(payload: NewGame): Promise<AxiosResponse<Game>> {
  return api.post<Game>('/games/', payload);
}

// —— Estatísticas —————————————————————————————

export interface Estatistica {
  id: number;
  jogadora_id: number;
  jogo_id: number;
  pontos: number;
  assistencias: number;
  rebotes: number;
  roubos: number;
  faltas: number;
  quarto?: number;
}

export type EstatisticaCreatePayload = Omit<Estatistica, 'id'> & {
  quarto?: number;
};

export function getEstatisticasByJogo(
  jogoId: number | string
): Promise<AxiosResponse<Estatistica[]>> {
  return api.get<Estatistica[]>(`/estatisticas/jogo/${jogoId}`);
}

export function createEstatistica(
  payload: Partial<EstatisticaCreatePayload>
): Promise<AxiosResponse<Estatistica>> {
  return api.post<Estatistica>('/estatisticas', payload);
}

export function undoLastEstatistica(
  jogoId: number | string
): Promise<AxiosResponse<void>> {
  return api.delete<void>(`/estatisticas/ultimo/${jogoId}`);
}

export const forgotPassword = async (email: string) => {
  return api.post('/auth/forgot-password', { email });
};

export const resetPassword = async (token: string, newPassword: string) => {
  return api.post('/auth/reset-password', { token, new_password: newPassword });
};
