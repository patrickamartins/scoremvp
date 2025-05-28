import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card } from "./ui/Card";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Game {
  id: number;
  opponent: string;
  date: string;
  location: string;
  categoria: string;
  status: string;
}

interface GameStats {
  total_pontos: number;
  total_assistencias: number;
  total_rebotes: number;
  total_roubos: number;
  total_faltas: number;
  por_quarto: Array<{
    quarto: number;
    total_pontos: number;
    total_assistencias: number;
    total_rebotes: number;
    total_roubos: number;
    total_faltas: number;
  }>;
}

interface GameDetailsProps {
  gameId: number;
}

export default function GameDetails({ gameId }: GameDetailsProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/jogos/${gameId}`),
      api.get(`/jogos/${gameId}/stats`)
    ]).then(([{ data: gameData }, { data: statsData }]) => {
      setGame(gameData);
      setStats(statsData);
      setLoading(false);
    });
  }, [gameId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!game || !stats) {
    return (
      <div className="p-4">
        <Card title="Erro">
          <p className="text-red-600">Jogo não encontrado</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card title="Informações do Jogo">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Adversário</label>
            <p className="mt-1 text-gray-900">{game.opponent}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data</label>
            <p className="mt-1 text-gray-900">
              {format(new Date(game.date), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Horário</label>
            <p className="mt-1 text-gray-900">
              {format(new Date(game.date), 'HH:mm')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Local</label>
            <p className="mt-1 text-gray-900">{game.location}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoria</label>
            <p className="mt-1 text-gray-900">{game.categoria}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <p className="mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                game.status === 'FINALIZADO' ? 'bg-green-100 text-green-800' :
                game.status === 'EM_ANDAMENTO' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {game.status}
              </span>
            </p>
          </div>
        </div>
      </Card>

      <Card title="Estatísticas do Jogo" className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900">Pontos</h3>
            <p className="text-3xl font-bold text-blue-700">{stats.total_pontos}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-900">Assistências</h3>
            <p className="text-3xl font-bold text-green-700">{stats.total_assistencias}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-yellow-900">Rebotes</h3>
            <p className="text-3xl font-bold text-yellow-700">{stats.total_rebotes}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-purple-900">Roubos</h3>
            <p className="text-3xl font-bold text-purple-700">{stats.total_roubos}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-red-900">Faltas</h3>
            <p className="text-3xl font-bold text-red-700">{stats.total_faltas}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-4">Estatísticas por Quarto</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Quarto</th>
                  <th className="border px-4 py-2">Pontos</th>
                  <th className="border px-4 py-2">Assistências</th>
                  <th className="border px-4 py-2">Rebotes</th>
                  <th className="border px-4 py-2">Roubos</th>
                  <th className="border px-4 py-2">Faltas</th>
                </tr>
              </thead>
              <tbody>
                {stats.por_quarto.map((quarto) => (
                  <tr key={quarto.quarto}>
                    <td className="border px-4 py-2 text-center">{quarto.quarto}º</td>
                    <td className="border px-4 py-2 text-center">{quarto.total_pontos}</td>
                    <td className="border px-4 py-2 text-center">{quarto.total_assistencias}</td>
                    <td className="border px-4 py-2 text-center">{quarto.total_rebotes}</td>
                    <td className="border px-4 py-2 text-center">{quarto.total_roubos}</td>
                    <td className="border px-4 py-2 text-center">{quarto.total_faltas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
} 