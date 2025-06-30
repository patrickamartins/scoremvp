export type GameCategory = 'sub-13' | 'sub-15';

export interface Player {
  id: string;
  name: string;
  number: number;
}

export interface GameStats {
  id: number;
  player_id: number;
  game_id: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  fouls: number;
  turnovers: number;
  minutes_played: number;
  created_at: string;
  updated_at: string;
}

export interface PlayerGameStats {
  playerId: string;
  stats: GameStats;
}

export interface Game {
  id?: number | string;
  opponent?: string;
  date?: string;
  location?: string;
  name?: string;
  time?: string;
  category?: GameCategory;
  stats?: PlayerGameStats[];
  players?: Player[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GameAction {
  type: 'ADD_STAT' | 'REMOVE_STAT';
  playerId: string;
  statType: keyof GameStats;
  value: number;
  timestamp: number;
}

// Tipos para criação e atualização
export interface GameCreate {
  opponent: string;
  date: string;
  location?: string;
  category?: GameCategory;
  time?: string;
}

export interface GameUpdate {
  opponent?: string;
  date?: string;
  location?: string;
  category?: GameCategory;
  time?: string;
  status?: string;
}

export interface GameStatsCreate {
  player_id: number;
  game_id: number;
  points?: number;
  rebounds?: number;
  assists?: number;
  steals?: number;
  blocks?: number;
  fouls?: number;
  turnovers?: number;
  minutes_played?: number;
  quarter?: number;
  two_attempts?: number;
  two_made?: number;
  three_attempts?: number;
  three_made?: number;
  free_throw_attempts?: number;
  free_throw_made?: number;
  interference?: number;
}

export interface GameStatsUpdate {
  points?: number;
  rebounds?: number;
  assists?: number;
  steals?: number;
  blocks?: number;
  fouls?: number;
  turnovers?: number;
  minutes_played?: number;
  quarter?: number;
  two_attempts?: number;
  two_made?: number;
  three_attempts?: number;
  three_made?: number;
  free_throw_attempts?: number;
  free_throw_made?: number;
  interference?: number;
} 