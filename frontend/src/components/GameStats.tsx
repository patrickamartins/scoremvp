import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Card from './ui/Card';

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

interface GameStatsProps {
  gameId: number;
}

export default function GameStats({ gameId }: GameStatsProps) {
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/jogos/${gameId}/stats`).then(({ data }) => {
      setStats(data);
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

  if (!stats) {
    return (
      <div className="p-4">
        <Card title="Erro">
          <p className="text-red-600">Estatísticas não encontradas</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card title="Estatísticas do Jogo">
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