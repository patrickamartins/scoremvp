import { api } from './api';

export interface GameStats {
  total_pontos: number;
  total_assistencias: number;
  total_rebotes: number;
  total_roubos: number;
  total_faltas: number;
  por_quarto: Array<{
    quarto: number;
    total_pontos: number;
    total_assistencias: number;
    total_rebotes: number;
    total_roubos: number;
    total_faltas: number;
  }>;
}

export interface PlayerStats {
  id: number;
  jogadora_id: number;
  jogo_id: number;
  quarto: number;
  pontos: number;
  assistencias: number;
  rebotes: number;
  roubos: number;
  faltas: number;
  dois_tentativas: number;
  dois_acertos: number;
  tres_tentativas: number;
  tres_acertos: number;
  lance_tentativas: number;
  lance_acertos: number;
  interferencia: number;
}

export interface NewPlayerStats {
  jogadora_id: number;
  quarto: number;
  pontos: number;
  assistencias: number;
  rebotes: number;
  roubos: number;
  faltas: number;
  dois_tentativas: number;
  dois_acertos: number;
  tres_tentativas: number;
  tres_acertos: number;
  lance_tentativas: number;
  lance_acertos: number;
  interferencia: number;
}

export const GameStatsService = {
  getGameStats: async (gameId: number): Promise<GameStats> => {
    const { data } = await api.get(`/jogos/${gameId}/stats`);
    return data;
  },

  getPlayerStats: async (gameId: number): Promise<PlayerStats[]> => {
    const { data } = await api.get(`/jogos/${gameId}/stats/jogadoras`);
    return data;
  },

  addPlayerStats: async (gameId: number, stats: NewPlayerStats): Promise<PlayerStats> => {
    const { data } = await api.post(`/jogos/${gameId}/stats`, stats);
    return data;
  }
}; 