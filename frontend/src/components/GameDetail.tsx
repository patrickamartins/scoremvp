import os

# 1. Create services directory and api.js with all endpoints
services_dir = '/mnt/data/frontend/src/services'
os.makedirs(services_dir, exist_ok=True)

api_js_path = os.path.join(services_dir, 'api.js')
api_js_content = """import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// Auth
export function signup({ username, email, password }) {
  return api.post('/auth/signup', { username, email, password });
}
export function login({ username, password }) {
  return api.post('/auth/login', { username, password });
}
export function setAuthToken(token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Players
export function getPlayers() {
  return api.get('/players');
}
export function getPlayer(id) {
  return api.get(`/players/${id}`);
}
export function createPlayer({ nome, numero, posicao }) {
  return api.post('/players', { nome, numero, posicao });
}
export function updatePlayer(id, { nome, numero, posicao }) {
  return api.put(`/players/${id}`, { nome, numero, posicao });
}
export function deletePlayer(id) {
  return api.delete(`/players/${id}`);
}

// Games
export function listGames() {
  return api.get('/games');
}
export function getGame(id) {
  return api.get(`/games/${id}`);
}
export function createGame({ opponent, date, location }) {
  return api.post('/games', { opponent, date, location });
}

// Statistics
export function getEstatisticasByJogo(jogoId) {
  return api.get(`/estatisticas/jogo/${jogoId}`);
}
export function createEstatistica({ jogadora_id, jogo_id, pontos = 0, assistencias = 0, rebotes = 0, roubos = 0 }) {
  return api.post('/estatisticas', { jogadora_id, jogo_id, pontos, assistencias, rebotes, roubos });
}
export function undoLastEstatistica(jogoId) {
  return api.delete(`/estatisticas/ultimo/${jogoId}`);
}
"""

# Write api.js
with open(api_js_path, 'w') as f:
    f.write(api_js_content)

# 2. Create GameDetail.tsx component
components_dir = '/mnt/data/frontend/src/components'
os.makedirs(components_dir, exist_ok=True)

game_detail_path = os.path.join(components_dir, 'GameDetail.tsx')
game_detail_content = """import { useEffect, useState } from 'react';
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
"""

with open(game_detail_path, 'w') as f:
    f.write(game_detail_content)

# 3. Update main.tsx to include GameDetail route
main_tsx_path = '/mnt/data/frontend/src/main.tsx'
if os.path.exists(main_tsx_path):
    with open(main_tsx_path, 'r') as f:
        content = f.read()
    # Add import
    if "GameDetail" not in content:
        content = content.replace(
            "import PublicPanel from './components/PublicPanel';",
            "import PublicPanel from './components/PublicPanel';\nimport GameDetail from './components/GameDetail';"
        )
    # Add route
    if 'path="/games/:gameId"' not in content:
        content = content.replace(
            '<Route\n          path="/games"\n          element={token ? <Games /> : <Navigate to="/login" />}\n        />',
            '<Route\n          path="/games"\n          element={token ? <Games /> : <Navigate to="/login" />}\n        />\n        <Route\n          path="/games/:gameId"\n          element={token ? <GameDetail /> : <Navigate to="/login" />}\n        />'
        )
    with open(main_tsx_path, 'w') as f:
        f.write(content)

# Return path of GameDetail
game_detail_path
