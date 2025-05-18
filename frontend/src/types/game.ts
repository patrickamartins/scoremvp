export type GameCategory = 'sub-13' | 'sub-15';

export interface Player {
  id: string;
  name: string;
  number: number;
}

export interface GameStats {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  fouls: number;
}

export interface PlayerGameStats {
  playerId: string;
  stats: GameStats;
}

export interface Game {
  id: string;
  name: string;
  category: GameCategory;
  location: string;
  date: string;
  time: string;
  players: Player[];
  stats: PlayerGameStats[];
  createdAt: string;
  updatedAt: string;
}

export interface GameAction {
  type: 'ADD_STAT' | 'REMOVE_STAT';
  playerId: string;
  statType: keyof GameStats;
  value: number;
  timestamp: number;
} 