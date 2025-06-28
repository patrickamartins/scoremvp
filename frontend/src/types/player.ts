export interface Player {
  id: number;
  name: string;
  number: number;
  position: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlayerCreate {
  name: string;
  number: number;
  position: string;
  active: boolean;
}

export interface PlayerUpdate {
  name?: string;
  number?: number;
  position?: string;
  active?: boolean;
}

export interface PlayerStats {
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