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
      // Usar diretamente os valores calculados pelo backend (igual ao cronômetro e placar do adversário)
      setAwayScore(scoreboardData.away_score);
      setHomeScore(scoreboardData.home_score); // Já calculado pelo backend
      setTimerTime(scoreboardData.timer_time);
      setTimerRunning(scoreboardData.timer_running);
      setCurrentQuarter(scoreboardData.current_quarter || 1);
      // Usar diretamente os valores calculados pelo backend (igual ao cronômetro e placar do adversário)
      setHomeFouls(scoreboardData.home_fouls || 0); // Já calculado pelo backend
      setAwayFouls(scoreboardData.away_fouls || 0); // Já calculado pelo backend
    } catch (err: any) {
      console.error('Erro ao buscar placar:', err);
    }
  };

  // Carregar dados inicialmente
  useEffect(() => {
    fetchGameData();
    fetchScoreboard();
  }, [link]);

  // Buscar estatísticas atualizadas (apenas para o BoxScore, não para o placar)
  const fetchStats = async () => {
    if (!link) return;

    try {
      const statsResponse = await api.get(`/estatisticas/public/link/${link}`);
      setStats(statsResponse.data);
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  };

  // Atualizar placar em tempo real a cada 500ms (igual ao cronômetro e placar do adversário)
  // O backend já calcula home_score, home_fouls e away_fouls, então usamos diretamente
  useEffect(() => {
    if (!link || loading) return;

    const interval = setInterval(() => {
      fetchScoreboard(); // Busca tudo: cronômetro, placar adversário, placar casa e faltas
    }, 500); // 500ms para atualização em tempo real

    return () => clearInterval(interval);
  }, [link, loading]);

  // Atualizar estatísticas apenas para o BoxScore (menos frequente)
  useEffect(() => {
    if (!link || loading) return;

    const interval = setInterval(() => {
      fetchStats(); // Apenas para o BoxScore, não afeta o placar
    }, 2000); // 2 segundos é suficiente para o BoxScore

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
            quarter={currentQuarter}
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

