import { Request, Response } from 'express';
import { prisma } from '../database';

export class GameStatsController {
  async getGameStats(req: Request, res: Response) {
    try {
      const { gameId } = req.params;

      // Buscar todas as estatísticas do jogo
      const stats = await prisma.gameStats.findMany({
        where: {
          jogo_id: Number(gameId)
        }
      });

      // Calcular totais
      const total_pontos = stats.reduce((acc, curr) => acc + curr.pontos, 0);
      const total_assistencias = stats.reduce((acc, curr) => acc + curr.assistencias, 0);
      const total_rebotes = stats.reduce((acc, curr) => acc + curr.rebotes, 0);
      const total_roubos = stats.reduce((acc, curr) => acc + curr.roubos, 0);
      const total_faltas = stats.reduce((acc, curr) => acc + curr.faltas, 0);

      // Agrupar por quarto
      const por_quarto = [1, 2, 3, 4].map(quarto => {
        const quartoStats = stats.filter(stat => stat.quarto === quarto);
        return {
          quarto,
          total_pontos: quartoStats.reduce((acc, curr) => acc + curr.pontos, 0),
          total_assistencias: quartoStats.reduce((acc, curr) => acc + curr.assistencias, 0),
          total_rebotes: quartoStats.reduce((acc, curr) => acc + curr.rebotes, 0),
          total_roubos: quartoStats.reduce((acc, curr) => acc + curr.roubos, 0),
          total_faltas: quartoStats.reduce((acc, curr) => acc + curr.faltas, 0)
        };
      });

      return res.json({
        total_pontos,
        total_assistencias,
        total_rebotes,
        total_roubos,
        total_faltas,
        por_quarto
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas do jogo:', error);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas do jogo' });
    }
  }

  async getPlayerStats(req: Request, res: Response) {
    try {
      const { gameId } = req.params;

      const stats = await prisma.gameStats.findMany({
        where: {
          jogo_id: Number(gameId)
        },
        include: {
          jogadora: true
        }
      });

      return res.json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas das jogadoras:', error);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas das jogadoras' });
    }
  }

  async addPlayerStats(req: Request, res: Response) {
    try {
      const { gameId } = req.params;
      const {
        jogadora_id,
        quarto,
        pontos,
        assistencias,
        rebotes,
        roubos,
        faltas,
        dois_tentativas,
        dois_acertos,
        tres_tentativas,
        tres_acertos,
        lance_tentativas,
        lance_acertos,
        interferencia
      } = req.body;

      const stats = await prisma.gameStats.create({
        data: {
          jogo_id: Number(gameId),
          jogadora_id: Number(jogadora_id),
          quarto: Number(quarto),
          pontos: Number(pontos),
          assistencias: Number(assistencias),
          rebotes: Number(rebotes),
          roubos: Number(roubos),
          faltas: Number(faltas),
          dois_tentativas: Number(dois_tentativas),
          dois_acertos: Number(dois_acertos),
          tres_tentativas: Number(tres_tentativas),
          tres_acertos: Number(tres_acertos),
          lance_tentativas: Number(lance_tentativas),
          lance_acertos: Number(lance_acertos),
          interferencia: Number(interferencia)
        }
      });

      return res.status(201).json(stats);
    } catch (error) {
      console.error('Erro ao adicionar estatísticas:', error);
      return res.status(500).json({ error: 'Erro ao adicionar estatísticas' });
    }
  }
} 