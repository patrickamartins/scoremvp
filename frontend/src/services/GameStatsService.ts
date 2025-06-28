import { api } from './api';

export interface GameStats {
  total_points: number;
  total_assists: number;
  total_rebounds: number;
  total_steals: number;
  total_fouls: number;
  by_quarter: Array<{
    quarter: number;
    total_points: number;
    total_assists: number;
    total_rebounds: number;
    total_steals: number;
    total_fouls: number;
  }>;
}

export interface PlayerStats {
  id: number;
  player_id: number;
  game_id: number;
  quarter: number;
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
  fouls: number;
  two_attempts: number;
  two_hits: number;
  three_attempts: number;
  three_hits: number;
  free_throw_attempts: number;
  free_throw_hits: number;
  interference: number;
}

export interface NewPlayerStats {
  player_id: number;
  quarter: number;
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
  fouls: number;
  two_attempts: number;
  two_hits: number;
  three_attempts: number;
  three_hits: number;
  free_throw_attempts: number;
  free_throw_hits: number;
  interference: number;
}

export const GameStatsService = {
  getGameStats: async (gameId: number): Promise<GameStats> => {
    const { data } = await api.get(`/estatisticas/stats/games/${gameId}`);
    return data;
  },

  getPlayerStats: async (gameId: number): Promise<PlayerStats[]> => {
    const { data } = await api.get(`/estatisticas/stats/games/${gameId}/players`);
    return data;
  },

  addPlayerStats: async (gameId: number, stats: NewPlayerStats): Promise<PlayerStats> => {
    const { data } = await api.post(`/estatisticas/stats/games/${gameId}`, stats);
    return data;
  }
}; 