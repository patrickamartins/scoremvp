import { Request, Response } from 'express';
import { GameStatsController } from '../GameStatsController';
import { prisma } from '../../database';

jest.mock('../../database', () => ({
  prisma: {
    gameStats: {
      findMany: jest.fn(),
      create: jest.fn()
    }
  }
}));

describe('GameStatsController', () => {
  let controller: GameStatsController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      json: mockJson,
      status: mockStatus
    };
    controller = new GameStatsController();
  });

  describe('getGameStats', () => {
    it('should return game stats', async () => {
      const mockStats = [
        {
          pontos: 10,
          assistencias: 5,
          rebotes: 8,
          roubos: 2,
          faltas: 3,
          quarto: 1
        },
        {
          pontos: 8,
          assistencias: 3,
          rebotes: 6,
          roubos: 1,
          faltas: 2,
          quarto: 2
        }
      ];

      (prisma.gameStats.findMany as jest.Mock).mockResolvedValue(mockStats);
      mockRequest.params = { gameId: '1' };

      await controller.getGameStats(mockRequest as Request, mockResponse as Response);

      expect(prisma.gameStats.findMany).toHaveBeenCalledWith({
        where: { jogo_id: 1 }
      });
      expect(mockJson).toHaveBeenCalledWith({
        total_pontos: 18,
        total_assistencias: 8,
        total_rebotes: 14,
        total_roubos: 3,
        total_faltas: 5,
        por_quarto: expect.arrayContaining([
          expect.objectContaining({
            quarto: 1,
            total_pontos: 10,
            total_assistencias: 5,
            total_rebotes: 8,
            total_roubos: 2,
            total_faltas: 3
          }),
          expect.objectContaining({
            quarto: 2,
            total_pontos: 8,
            total_assistencias: 3,
            total_rebotes: 6,
            total_roubos: 1,
            total_faltas: 2
          })
        ])
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (prisma.gameStats.findMany as jest.Mock).mockRejectedValue(error);
      mockRequest.params = { gameId: '1' };

      await controller.getGameStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Erro ao buscar estatísticas do jogo' });
    });
  });

  describe('getPlayerStats', () => {
    it('should return player stats', async () => {
      const mockStats = [
        {
          id: 1,
          jogadora_id: 1,
          jogo_id: 1,
          pontos: 10,
          assistencias: 5,
          rebotes: 8,
          roubos: 2,
          faltas: 3,
          quarto: 1,
          dois_tentativas: 5,
          dois_acertos: 3,
          tres_tentativas: 2,
          tres_acertos: 1,
          lance_tentativas: 3,
          lance_acertos: 2,
          interferencia: 1,
          jogadora: {
            id: 1,
            nome: 'Jogadora 1',
            numero: 10,
            posicao: 'Ala'
          }
        }
      ];

      (prisma.gameStats.findMany as jest.Mock).mockResolvedValue(mockStats);
      mockRequest.params = { gameId: '1' };

      await controller.getPlayerStats(mockRequest as Request, mockResponse as Response);

      expect(prisma.gameStats.findMany).toHaveBeenCalledWith({
        where: { jogo_id: 1 },
        include: { jogadora: true }
      });
      expect(mockJson).toHaveBeenCalledWith(mockStats);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (prisma.gameStats.findMany as jest.Mock).mockRejectedValue(error);
      mockRequest.params = { gameId: '1' };

      await controller.getPlayerStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Erro ao buscar estatísticas das jogadoras' });
    });
  });

  describe('addPlayerStats', () => {
    it('should add player stats', async () => {
      const mockStats = {
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
      };

      (prisma.gameStats.create as jest.Mock).mockResolvedValue(mockStats);
      mockRequest.params = { gameId: '1' };
      mockRequest.body = {
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

      await controller.addPlayerStats(mockRequest as Request, mockResponse as Response);

      expect(prisma.gameStats.create).toHaveBeenCalledWith({
        data: {
          jogo_id: 1,
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
        }
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockStats);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (prisma.gameStats.create as jest.Mock).mockRejectedValue(error);
      mockRequest.params = { gameId: '1' };
      mockRequest.body = {
        jogadora_id: 1,
        quarto: 1,
        pontos: 10
      };

      await controller.addPlayerStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Erro ao adicionar estatísticas' });
    });
  });
}); 