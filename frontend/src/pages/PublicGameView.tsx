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
  const [selectedQuarto, setSelectedQuarto] = useState(1);
  const [timerTime, setTimerTime] = useState(720);
  const [timerRunning, setTimerRunning] = useState(false);

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
      setSelectedQuarto(scoreboardData.current_quarter);
    } catch (err: any) {
      console.error('Erro ao buscar placar:', err);
    }
  };

  // Carregar dados inicialmente
  useEffect(() => {
    fetchGameData();
    fetchScoreboard();
  }, [link]);

  // Atualizar placar em tempo real a cada 2 segundos
  useEffect(() => {
    if (!link || loading) return;

    const interval = setInterval(() => {
      fetchScoreboard();
    }, 2000); // 2 segundos para atualização em tempo real

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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {game.opponent} vs CASA
          </h1>
          <p className="text-gray-600">
            {new Date(game.date).toLocaleDateString('pt-BR')} - {game.location || 'Local não informado'}
          </p>
        </div>

        {/* Placar */}
        <div className="mb-6">
          <GameScoreboard
            homeScore={homeScore}
            awayScore={awayScore}
            quarter={selectedQuarto}
            opponentName={game.opponent}
            readOnly={true}
            initialTime={timerTime}
            initialRunning={timerRunning}
            onTimeChange={setTimerTime}
            onRunningChange={setTimerRunning}
          />
        </div>

        {/* Seletor de Quarto */}
        <div className="mb-4 flex items-center gap-4">
          <label className="font-medium text-gray-700">Período:</label>
          <select
            value={selectedQuarto}
            onChange={(e) => setSelectedQuarto(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value={1}>1º Quarto</option>
            <option value={2}>2º Quarto</option>
            <option value={3}>3º Quarto</option>
            <option value={4}>4º Quarto</option>
          </select>
        </div>

        {/* BoxScore */}
        <BoxScoreTable
          gameId={game.id}
          stats={stats.filter(s => !selectedQuarto || s.quarter === selectedQuarto)}
          players={players}
        />
      </div>
    </div>
  );
}

