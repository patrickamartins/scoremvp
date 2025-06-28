import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getGame,
  getEstatisticasByJogo,
  createEstatistica,
  undoLastEstatistica,
} from '../services/api';
import { getPlayers } from '../services/api';

interface Player {
  id: number;
  nome: string;
}

interface Estatistica {
  id: number;
  jogadora_id: number;
  jogo_id: number;
  pontos: number;
  assistencias: number;
  rebotes: number;
  roubos: number;
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
  const [action, setAction] = useState<'pontos' | 'assistencias' | 'rebotes' | 'roubos'>('pontos');

  const fetchData = async () => {
    if (!gameId) return;
    const resGame = await getGame(gameId);
    setGame(resGame.data);
    const resStats = await getEstatisticasByJogo(gameId);
    setStats(resStats.data);
    const resPlayers = await getPlayers();
    setPlayers(resPlayers.data);
    if (resPlayers.data.length > 0) {
      setSelectedPlayer(resPlayers.data[0].id.toString());
    }
  };

  useEffect(() => {
    fetchData();
  }, [gameId]);

  const handleAdd = async () => {
    if (!gameId || !selectedPlayer) return;
    const data = {
      jogadora_id: parseInt(selectedPlayer),
      jogo_id: parseInt(gameId),
      pontos: action === 'pontos' ? 1 : 0,
      assistencias: action === 'assistencias' ? 1 : 0,
      rebotes: action === 'rebotes' ? 1 : 0,
      roubos: action === 'roubos' ? 1 : 0,
    };
    await createEstatistica(data);
    fetchData();
  };

  const handleUndo = async () => {
    if (!gameId) return;
    await undoLastEstatistica(gameId);
    fetchData();
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
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as any)}
            className="border px-2 py-1 rounded"
          >
            <option value="pontos">Ponto</option>
            <option value="assistencias">Assistência</option>
            <option value="rebotes">Rebote</option>
            <option value="roubos">Roubo</option>
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
            Jogadora ID {stat.jogadora_id}:
            {stat.pontos ? ` +${stat.pontos} ponto` : ''}
            {stat.assistencias ? ` +${stat.assistencias} assistência` : ''}
            {stat.rebotes ? ` +${stat.rebotes} rebote` : ''}
            {stat.roubos ? ` +${stat.roubos} roubo` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
