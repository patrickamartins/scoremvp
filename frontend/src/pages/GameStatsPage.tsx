import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import GameStats from '../components/GameStats';
import GameStatsTable from '../components/GameStatsTable';
import GameStatsForm from '../components/GameStatsForm';

interface Game {
  id: number;
  data: string;
  adversario: string;
  local: string;
  placar_casa: number;
  placar_visitante: number;
}

export default function GameStatsPage() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (id) {
      api.get(`/jogos/${id}`).then(({ data }) => {
        setGame(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleStatsSubmit = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Jogo não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {game.adversario} vs Casa
        </h1>
        <p className="text-gray-600">
          {new Date(game.data).toLocaleDateString()} - {game.local}
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-2">
          {game.placar_casa} x {game.placar_visitante}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GameStats key={refreshKey} gameId={game.id} />
          <div className="mt-8">
            <GameStatsTable key={refreshKey} gameId={game.id} />
          </div>
        </div>
        <div>
          <GameStatsForm gameId={game.id} onSubmit={handleStatsSubmit} />
        </div>
      </div>
    </div>
  );
} 