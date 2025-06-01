import { useState, useEffect } from 'react';
import { getEstatisticasResumo } from '../services/api';
import { Card } from "./ui/Card";
import { EstatisticasResumo } from '../services/api';

interface GameStatsProps {
  gameId: number;
}

export default function GameStats({ gameId }: GameStatsProps) {
  const [stats, setStats] = useState<EstatisticasResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await getEstatisticasResumo(gameId);
        setStats(data);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar estatísticas');
        console.error('Erro ao carregar estatísticas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [gameId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <Card className="p-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="p-6">
        <div className="text-red-500">{error || 'Erro ao carregar estatísticas'}</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Estatísticas Gerais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Estatísticas por Quarto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.por_quarto.map((quarto) => (
            <div key={quarto.quarto} className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-3">{quarto.quarto}º Quarto</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pontos:</span>
                  <span className="font-medium">{quarto.total_pontos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Assistências:</span>
                  <span className="font-medium">{quarto.total_assistencias}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rebotes:</span>
                  <span className="font-medium">{quarto.total_rebotes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Roubos:</span>
                  <span className="font-medium">{quarto.total_roubos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Faltas:</span>
                  <span className="font-medium">{quarto.total_faltas}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 