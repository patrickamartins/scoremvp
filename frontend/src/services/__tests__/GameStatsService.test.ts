import { GameStatsService } from '../GameStatsService';
import { api } from '../api';

jest.mock('../api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

describe('GameStatsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGameStats', () => {
    it('should fetch game stats successfully', async () => {
      const mockGameStats = {
        total_pontos: 80,
        total_assistencias: 20,
        total_rebotes: 30,
        total_roubos: 10,
        total_faltas: 15,
        por_quarto: [
          {
            quarto: 1,
            total_pontos: 20,
            total_assistencias: 5,
            total_rebotes: 8,
            total_roubos: 2,
            total_faltas: 4
          }
        ]
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockGameStats });

      const result = await GameStatsService.getGameStats(1);

      expect(api.get).toHaveBeenCalledWith('/jogos/1/stats');
      expect(result).toEqual(mockGameStats);
    });

    it('should handle errors when fetching game stats', async () => {
      const error = new Error('Network error');
      (api.get as jest.Mock).mockRejectedValue(error);

      await expect(GameStatsService.getGameStats(1)).rejects.toThrow('Network error');
      expect(api.get).toHaveBeenCalledWith('/jogos/1/stats');
    });
  });

  describe('getPlayerStats', () => {
    it('should fetch player stats successfully', async () => {
      const mockPlayerStats = [
        {
          id: 1,
          jogadora_id: 1,
          jogo_id: 1,
          quarto: 1,
          pontos: 10,
          assistencias: 5,
          rebotes: 8,
          roubos: 2,
          faltas: 3,
          dois_tentativas: 5,
          dois_acertos: 3,
          tres_tentativas: 2,
          tres_acertos: 1,
          lance_tentativas: 3,
          lance_acertos: 2,
          interferencia: 1
        }
      ];

      (api.get as jest.Mock).mockResolvedValue({ data: mockPlayerStats });

      const result = await GameStatsService.getPlayerStats(1);

      expect(api.get).toHaveBeenCalledWith('/jogos/1/stats/jogadoras');
      expect(result).toEqual(mockPlayerStats);
    });

    it('should handle errors when fetching player stats', async () => {
      const error = new Error('Network error');
      (api.get as jest.Mock).mockRejectedValue(error);

      await expect(GameStatsService.getPlayerStats(1)).rejects.toThrow('Network error');
      expect(api.get).toHaveBeenCalledWith('/jogos/1/stats/jogadoras');
    });
  });

  describe('addPlayerStats', () => {
    it('should add player stats successfully', async () => {
      const mockNewStats = {
        jogadora_id: 1,
        quarto: 1,
        pontos: 10,
        assistencias: 5,
        rebotes: 8,
        roubos: 2,
        faltas: 3,
        dois_tentativas: 5,
        dois_acertos: 3,
        tres_tentativas: 2,
        tres_acertos: 1,
        lance_tentativas: 3,
        lance_acertos: 2,
        interferencia: 1
      };

      const mockResponse = {
        id: 1,
        ...mockNewStats
      };

      (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await GameStatsService.addPlayerStats(1, mockNewStats);

      expect(api.post).toHaveBeenCalledWith('/jogos/1/stats', mockNewStats);
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when adding player stats', async () => {
      const error = new Error('Network error');
      (api.post as jest.Mock).mockRejectedValue(error);

      const mockNewStats = {
        jogadora_id: 1,
        quarto: 1,
        pontos: 10
      };

      await expect(GameStatsService.addPlayerStats(1, mockNewStats)).rejects.toThrow('Network error');
      expect(api.post).toHaveBeenCalledWith('/jogos/1/stats', mockNewStats);
    });
  });
}); 