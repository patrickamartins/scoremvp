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
  const [currentQuarter, setCurrentQuarter] = useState(1);
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
      // As faltas são atualizadas pelo fetchScoreboard que já busca do backend

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
      setCurrentQuarter(scoreboardData.current_quarter || 1);
      // Atualizar faltas do quarto atual
      setHomeFouls(scoreboardData.home_fouls || 0);
      setAwayFouls(scoreboardData.away_fouls || 0);
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
      // As faltas são atualizadas pelo fetchScoreboard que já busca do backend
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  };

  // Calcular placar da casa em tempo real a partir das estatísticas
  const calculatedHomeScore = useMemo(() => {
    let total = 0;
    stats.forEach((stat) => {
      total += (stat.two_made || 0) * 2;
      total += (stat.three_made || 0) * 3;
      total += (stat.free_throw_made || 0);
    });
    return total;
  }, [stats]);

  // Calcular faltas em tempo real a partir das estatísticas do quarto atual
  const calculatedHomeFouls = useMemo(() => {
    let total = 0;
    stats
      .filter((stat) => stat.quarter === currentQuarter)
      .forEach((stat) => {
        total += stat.fp || 0; // faltas pessoais da casa
      });
    return total;
  }, [stats, currentQuarter]);

  const calculatedAwayFouls = useMemo(() => {
    let total = 0;
    stats
      .filter((stat) => stat.quarter === currentQuarter)
      .forEach((stat) => {
        total += stat.fr || 0; // faltas recebidas (faltas do adversário)
      });
    return total;
  }, [stats, currentQuarter]);

  // Atualizar placar em tempo real a cada 500ms para sincronização precisa
  // Mas NÃO atualizar homeScore e faltas aqui, pois vêm do backend que pode estar desatualizado
  useEffect(() => {
    if (!link || loading) return;

    const interval = setInterval(() => {
      fetchScoreboard();
    }, 500); // 500ms para atualização em tempo real (reduzido de 200ms para evitar muitas requisições)

    return () => clearInterval(interval);
  }, [link, loading]);

  // Atualizar estatísticas a cada 500ms para atualizar o placar da casa e faltas em tempo real
  useEffect(() => {
    if (!link || loading) return;

    const interval = setInterval(() => {
      fetchStats();
    }, 500); // 500ms para atualizar estatísticas e recalcular placar da casa e faltas

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
            homeScore={calculatedHomeScore}
            awayScore={awayScore}
            quarter={currentQuarter}
            opponentName={game.opponent}
            readOnly={true}
            initialTime={timerTime}
            initialRunning={timerRunning}
            onTimeChange={setTimerTime}
            onRunningChange={setTimerRunning}
            homeFouls={calculatedHomeFouls}
            awayFouls={calculatedAwayFouls}
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

