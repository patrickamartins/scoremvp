// src/services/api.ts
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://scoremvp-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
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

export function updateGame(
  id: number,
  payload: Partial<Omit<Game, 'id'>>
): Promise<AxiosResponse<Game>> {
  return api.put<Game>(`/games/${id}`, payload);
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
  interferencia: number;
  quarto: number;
}

export interface EstatisticasQuarto {
  quarto: number;
  total_pontos: number;
  total_assistencias: number;
  total_rebotes: number;
  total_roubos: number;
  total_faltas: number;
}

export interface EstatisticasResumo {
  total_pontos: number;
  total_assistencias: number;
  total_rebotes: number;
  total_roubos: number;
  total_faltas: number;
  por_quarto: EstatisticasQuarto[];
}

export type EstatisticaCreatePayload = Omit<Estatistica, 'id'>;

export function getEstatisticasByJogo(
  jogoId: number | string
): Promise<AxiosResponse<Estatistica[]>> {
  return api.get<Estatistica[]>(`/estatisticas/jogo/${jogoId}`);
}

export function getEstatisticasResumo(
  jogoId: number | string
): Promise<AxiosResponse<EstatisticasResumo>> {
  return api.get<EstatisticasResumo>(`/estatisticas/jogo/${jogoId}/resumo`);
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
