import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getGame,
  getPlayers,
} from '../services/api';

interface Player {
  id: number;
  name: string;
}

interface Estatistica {
  id: number;
  player_id: number;
  game_id: number;
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
}

interface GameInfo {
  id: number;
  opponent: string;
  date: string;
  location?: string;
}

export default function GameDetail() {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<GameInfo | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<Estatistica[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [action, setAction] = useState<'points' | 'assists' | 'rebounds' | 'steals'>('points');

  const fetchData = async () => {
    if (!gameId) return;
    try {
      const resGame = await getGame(parseInt(gameId));
      setGame(resGame);
      const resPlayers = await getPlayers();
      setPlayers(resPlayers);
      if (resPlayers.length > 0) {
        setSelectedPlayer(resPlayers[0].id.toString());
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [gameId]);

  const handleAdd = async () => {
    if (!gameId || !selectedPlayer) return;
    try {
      const data = {
        player_id: parseInt(selectedPlayer),
        game_id: parseInt(gameId),
        points: action === 'points' ? 1 : 0,
        assists: action === 'assists' ? 1 : 0,
        rebounds: action === 'rebounds' ? 1 : 0,
        steals: action === 'steals' ? 1 : 0,
      };
      fetchData();
    } catch (error) {
      console.error('Erro ao adicionar estatística:', error);
    }
  };

  const handleUndo = async () => {
    if (!gameId) return;
    try {
      fetchData();
    } catch (error) {
      console.error('Erro ao desfazer:', error);
    }
  };

  if (!game) return <p>Carregando...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Jogo: {game.opponent}</h1>
      <p>Data: {new Date(game.date).toLocaleString()}</p>
      <p>Local: {game.location}</p>

      <div className="mt-4 mb-4">
        <h2 className="text-xl font-semibold">Registrar estatística</h2>
        <div className="flex items-center space-x-2 mt-2">
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as 'points' | 'assists' | 'rebounds' | 'steals')}
            className="border px-2 py-1 rounded"
          >
            <option value="points">Ponto</option>
            <option value="assists">Assistência</option>
            <option value="rebounds">Rebote</option>
            <option value="steals">Roubo</option>
          </select>
          <button onClick={handleAdd} className="px-4 py-2 bg-blue-500 text-white rounded">
            Adicionar
          </button>
          <button onClick={handleUndo} className="px-4 py-2 bg-red-500 text-white rounded">
            Desfazer último
          </button>
        </div>
      </div>

      <h2 className="text-xl font-semibold">Estatísticas</h2>
      <ul className="list-disc ml-6 mt-2">
        {stats.map(stat => (
          <li key={stat.id}>
            Jogadora ID {stat.player_id}:
            {stat.points ? ` +${stat.points} ponto` : ''}
            {stat.assists ? ` +${stat.assists} assistência` : ''}
            {stat.rebounds ? ` +${stat.rebounds} rebote` : ''}
            {stat.steals ? ` +${stat.steals} roubo` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
