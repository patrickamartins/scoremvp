import { useState, useCallback } from 'react';
import type { Game, GameAction, PlayerGameStats, GameStats } from '../types/game';

const initialStats: GameStats = {
  points: 0,
  rebounds: 0,
  assists: 0,
  steals: 0,
  blocks: 0,
  fouls: 0,
};

export const useGameStats = () => {
  const [game, setGame] = useState<Game | null>(null);
  const [actions, setActions] = useState<GameAction[]>([]);
  const [stats, setStats] = useState<PlayerGameStats[]>([]);

  const addStat = useCallback((playerId: string, statType: keyof GameStats, value: number = 1) => {
    const action: GameAction = {
      type: 'ADD_STAT',
      playerId,
      statType,
      value,
      timestamp: Date.now(),
    };

    setActions(prev => [...prev, action]);
    setStats(prev => {
      const playerStats = prev.find(p => p.playerId === playerId);
      if (!playerStats) {
        return [...prev, { playerId, stats: { ...initialStats, [statType]: value } }];
      }
      return prev.map(p => {
        if (p.playerId === playerId) {
          return {
            ...p,
            stats: {
              ...p.stats,
              [statType]: (p.stats[statType] || 0) + value,
            },
          };
        }
        return p;
      });
    });
  }, []);

  const undoLastAction = useCallback(() => {
    if (actions.length === 0) return;

    const lastAction = actions[actions.length - 1];
    setActions(prev => prev.slice(0, -1));
    setStats(prev => {
      return prev.map(p => {
        if (p.playerId === lastAction.playerId) {
          return {
            ...p,
            stats: {
              ...p.stats,
              [lastAction.statType]: (p.stats[lastAction.statType] || 0) - lastAction.value,
            },
          };
        }
        return p;
      });
    });
  }, [actions]);

  const resetStats = useCallback(() => {
    setStats(prev => prev.map(p => ({ ...p, stats: { ...initialStats } })));
    setActions([]);
  }, []);

  const saveGame = useCallback(async () => {
    if (!game) return;

    const gameToSave = {
      ...game,
      stats,
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameToSave),
      });

      if (!response.ok) {
        throw new Error('Failed to save game');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving game:', error);
      throw error;
    }
  }, [game, stats]);

  return {
    game,
    setGame,
    stats,
    actions,
    addStat,
    undoLastAction,
    resetStats,
    saveGame,
  };
}; 