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
  category: string;
  status: string;
}

export default function GameList() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jogos').then(({ data }) => {
      setGames(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card title="Lista de Jogos">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="border px-4 py-2">Data</th>
                <th className="border px-4 py-2">Horário</th>
                <th className="border px-4 py-2">Adversário</th>
                <th className="border px-4 py-2">Local</th>
                <th className="border px-4 py-2">Categoria</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td className="border px-4 py-2">
                    {format(new Date(game.date), 'dd/MM/yyyy')}
                  </td>
                  <td className="border px-4 py-2">
                    {format(new Date(game.date), 'HH:mm')}
                  </td>
                  <td className="border px-4 py-2">{game.opponent}</td>
                  <td className="border px-4 py-2">{game.location}</td>
                  <td className="border px-4 py-2">{game.category}</td>
                  <td className="border px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      game.status === 'FINALIZADO' ? 'bg-green-100 text-green-800' :
                      game.status === 'EM_ANDAMENTO' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {game.status}
                    </span>
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => window.location.href = `/jogos/${game.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
} 