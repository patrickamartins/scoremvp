import { Router } from 'express';
import { GameStatsController } from '../controllers/GameStatsController';

const router = Router();
const gameStatsController = new GameStatsController();

// Rota para buscar estatísticas gerais do jogo
router.get('/jogos/:gameId/stats', gameStatsController.getGameStats);

// Rota para buscar estatísticas das jogadoras
router.get('/jogos/:gameId/stats/jogadoras', gameStatsController.getPlayerStats);

// Rota para adicionar estatísticas de uma jogadora
router.post('/jogos/:gameId/stats', gameStatsController.addPlayerStats);

export default router; 