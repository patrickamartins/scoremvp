import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Card from './ui/Card';

interface Player {
  id: number;
  nome: string;
  numero: number;
  posicao: string;
}

interface PlayerStats {
  id: number;
  jogadora_id: number;
  jogo_id: number;
  quarto: number;
  pontos: number;
  assistencias: number;
  rebotes: number;
  roubos: number;
  faltas: number;
  dois_tentativas: number;
  dois_acertos: number;
  tres_tentativas: number;
  tres_acertos: number;
  lance_tentativas: number;
  lance_acertos: number;
  interferencia: number;
}

interface GameStatsTableProps {
  gameId: number;
}

export default function GameStatsTable({ gameId }: GameStatsTableProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/jogadoras'),
      api.get(`/jogos/${gameId}/stats/jogadoras`)
    ]).then(([{ data: playersData }, { data: statsData }]) => {
      setPlayers(playersData);
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

  // Agrupar estatísticas por jogadora
  const statsByPlayer = stats.reduce((acc, stat) => {
    if (!acc[stat.jogadora_id]) {
      acc[stat.jogadora_id] = {
        pontos: 0,
        assistencias: 0,
        rebotes: 0,
        roubos: 0,
        faltas: 0,
        dois_tentativas: 0,
        dois_acertos: 0,
        tres_tentativas: 0,
        tres_acertos: 0,
        lance_tentativas: 0,
        lance_acertos: 0,
        interferencia: 0
      };
    }
    acc[stat.jogadora_id].pontos += stat.pontos;
    acc[stat.jogadora_id].assistencias += stat.assistencias;
    acc[stat.jogadora_id].rebotes += stat.rebotes;
    acc[stat.jogadora_id].roubos += stat.roubos;
    acc[stat.jogadora_id].faltas += stat.faltas;
    acc[stat.jogadora_id].dois_tentativas += stat.dois_tentativas;
    acc[stat.jogadora_id].dois_acertos += stat.dois_acertos;
    acc[stat.jogadora_id].tres_tentativas += stat.tres_tentativas;
    acc[stat.jogadora_id].tres_acertos += stat.tres_acertos;
    acc[stat.jogadora_id].lance_tentativas += stat.lance_tentativas;
    acc[stat.jogadora_id].lance_acertos += stat.lance_acertos;
    acc[stat.jogadora_id].interferencia += stat.interferencia;
    return acc;
  }, {} as { [key: number]: Omit<PlayerStats, 'id' | 'jogadora_id' | 'jogo_id' | 'quarto'> });

  return (
    <div className="p-4">
      <Card title="Estatísticas por Jogadora">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="border px-4 py-2">#</th>
                <th className="border px-4 py-2">Nome</th>
                <th className="border px-4 py-2">Posição</th>
                <th className="border px-4 py-2">Pontos</th>
                <th className="border px-4 py-2">2PT</th>
                <th className="border px-4 py-2">3PT</th>
                <th className="border px-4 py-2">LL</th>
                <th className="border px-4 py-2">AST</th>
                <th className="border px-4 py-2">REB</th>
                <th className="border px-4 py-2">ROUB</th>
                <th className="border px-4 py-2">FAL</th>
                <th className="border px-4 py-2">INT</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => {
                const playerStats = statsByPlayer[player.id] || {
                  pontos: 0,
                  assistencias: 0,
                  rebotes: 0,
                  roubos: 0,
                  faltas: 0,
                  dois_tentativas: 0,
                  dois_acertos: 0,
                  tres_tentativas: 0,
                  tres_acertos: 0,
                  lance_tentativas: 0,
                  lance_acertos: 0,
                  interferencia: 0
                };

                return (
                  <tr key={player.id}>
                    <td className="border px-4 py-2 text-center">{player.numero}</td>
                    <td className="border px-4 py-2">{player.nome}</td>
                    <td className="border px-4 py-2">{player.posicao}</td>
                    <td className="border px-4 py-2 text-center">{playerStats.pontos}</td>
                    <td className="border px-4 py-2 text-center">
                      {playerStats.dois_acertos}/{playerStats.dois_tentativas}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {playerStats.tres_acertos}/{playerStats.tres_tentativas}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {playerStats.lance_acertos}/{playerStats.lance_tentativas}
                    </td>
                    <td className="border px-4 py-2 text-center">{playerStats.assistencias}</td>
                    <td className="border px-4 py-2 text-center">{playerStats.rebotes}</td>
                    <td className="border px-4 py-2 text-center">{playerStats.roubos}</td>
                    <td className="border px-4 py-2 text-center">{playerStats.faltas}</td>
                    <td className="border px-4 py-2 text-center">{playerStats.interferencia}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
} 