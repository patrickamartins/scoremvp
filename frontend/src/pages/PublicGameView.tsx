import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { GameScoreboard } from '../components/GameScoreboard';
import { BoxScoreTable } from '../components/BoxScoreTable';
import { Card } from '../components/ui/Card';
import { api, getPublicScoreboard } from '../services/api';
import { Game, GameStats } from '../types/game';
import { Player } from '../types/player';

export default function PublicGameView() {
  const { link } = useParams<{ link: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [stats, setStats] = useState<GameStats[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [awayScore, setAwayScore] = useState(0);
  const [homeScore, setHomeScore] = useState(0);
  const [timerTime, setTimerTime] = useState(720);
  const [timerRunning, setTimerRunning] = useState(false);
  const [homeFouls, setHomeFouls] = useState(0);
  const [awayFouls, setAwayFouls] = useState(0);

  // Buscar dados do jogo (apenas uma vez)
  const fetchGameData = async () => {
    if (!link) return;

    try {
      // Buscar jogo por link
      const gameResponse = await api.get(`/games/public/link/${link}`);
      const gameData = gameResponse.data;
      setGame(gameData);
      setPlayers(gameData.players || []);

      // Buscar estatísticas (apenas uma vez, não atualiza automaticamente)
      const statsResponse = await api.get(`/estatisticas/public/link/${link}`);
      setStats(statsResponse.data);
      
      // Calcular faltas acumuladas
      const homeFoulsTotal = statsResponse.data
        .filter((s: any) => s.fp)
        .reduce((sum: number, s: any) => sum + (s.fp || 0), 0);
      setHomeFouls(homeFoulsTotal);

      setError(null);
    } catch (err: any) {
      console.error('Erro ao buscar dados do jogo:', err);
      setError(err.response?.data?.detail || 'Jogo não encontrado');
    } finally {
      setLoading(false);
    }
  };

  // Buscar estado do placar em tempo real
  const fetchScoreboard = async () => {
    if (!link) return;

    try {
      const scoreboardData = await getPublicScoreboard(link);
      setAwayScore(scoreboardData.away_score);
      setHomeScore(scoreboardData.home_score);
      setTimerTime(scoreboardData.timer_time);
      setTimerRunning(scoreboardData.timer_running);
    } catch (err: any) {
      console.error('Erro ao buscar placar:', err);
    }
  };

  // Carregar dados inicialmente
  useEffect(() => {
    fetchGameData();
    fetchScoreboard();
  }, [link]);

  // Buscar estatísticas atualizadas
  const fetchStats = async () => {
    if (!link) return;

    try {
      const statsResponse = await api.get(`/estatisticas/public/link/${link}`);
      setStats(statsResponse.data);
      
      // Calcular faltas acumuladas
      const homeFoulsTotal = statsResponse.data
        .filter((s: any) => s.fp)
        .reduce((sum: number, s: any) => sum + (s.fp || 0), 0);
      setHomeFouls(homeFoulsTotal);
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  };

  // Atualizar placar em tempo real a cada 200ms para sincronização precisa
  useEffect(() => {
    if (!link || loading) return;

    const interval = setInterval(() => {
      fetchScoreboard();
    }, 200); // 200ms para atualização quase em tempo real

    return () => clearInterval(interval);
  }, [link, loading]);

  // Atualizar estatísticas a cada 2 segundos (quando são salvas no painel)
  useEffect(() => {
    if (!link || loading) return;

    const interval = setInterval(() => {
      fetchStats();
    }, 2000); // 2 segundos para atualizar estatísticas

    return () => clearInterval(interval);
  }, [link, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-gray-700">{error || 'Jogo não encontrado'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-2 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 md:mb-6 text-center px-2">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-2">
            {game.opponent} vs CASA
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            {new Date(game.date).toLocaleDateString('pt-BR')} - {game.location || 'Local não informado'}
          </p>
        </div>

        {/* Placar */}
        <div className="mb-6">
          <GameScoreboard
            homeScore={homeScore}
            awayScore={awayScore}
            quarter={1}
            opponentName={game.opponent}
            readOnly={true}
            initialTime={timerTime}
            initialRunning={timerRunning}
            onTimeChange={setTimerTime}
            onRunningChange={setTimerRunning}
            homeFouls={homeFouls}
            awayFouls={awayFouls}
          />
        </div>

        {/* BoxScore - Sem seletor de quarto, apenas consolidado */}
        <BoxScoreTable
          gameId={game.id}
          stats={stats}
          players={players}
          hidePeriodSelector={true}
        />
      </div>
    </div>
  );
}

