import request from 'supertest';
import express from 'express';
import gameStatsRoutes from '../GameStatsRoutes';
import { GameStatsController } from '../../controllers/GameStatsController';

jest.mock('../../controllers/GameStatsController', () => ({
  GameStatsController: jest.fn().mockImplementation(() => ({
    getGameStats: jest.fn(),
    getPlayerStats: jest.fn(),
    addPlayerStats: jest.fn()
  }))
}));

describe('GameStatsRoutes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(gameStatsRoutes);
  });

  describe('GET /jogos/:gameId/stats', () => {
    it('should call getGameStats controller', async () => {
      const mockController = new GameStatsController();
      const mockGetGameStats = mockController.getGameStats as jest.Mock;
      mockGetGameStats.mockImplementation((req, res) => res.json({}));

      await request(app).get('/jogos/1/stats');

      expect(mockGetGameStats).toHaveBeenCalled();
    });
  });

  describe('GET /jogos/:gameId/stats/jogadoras', () => {
    it('should call getPlayerStats controller', async () => {
      const mockController = new GameStatsController();
      const mockGetPlayerStats = mockController.getPlayerStats as jest.Mock;
      mockGetPlayerStats.mockImplementation((req, res) => res.json({}));

      await request(app).get('/jogos/1/stats/jogadoras');

      expect(mockGetPlayerStats).toHaveBeenCalled();
    });
  });

  describe('POST /jogos/:gameId/stats', () => {
    it('should call addPlayerStats controller', async () => {
      const mockController = new GameStatsController();
      const mockAddPlayerStats = mockController.addPlayerStats as jest.Mock;
      mockAddPlayerStats.mockImplementation((req, res) => res.json({}));

      const stats = {
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

      await request(app)
        .post('/jogos/1/stats')
        .send(stats);

      expect(mockAddPlayerStats).toHaveBeenCalled();
    });
  });
}); 