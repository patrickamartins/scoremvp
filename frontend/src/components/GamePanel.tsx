import { useState, useEffect } from "react";
import { getPlayers, createGame, createEstatistica } from "../services/api";
import { Card } from "./ui/Card";

interface Player {
  id: number;
  nome: string;
  numero: number;
  posicao: string;
}

interface EstatisticasJogadora {
  dois: { tentativas: number; acertos: number };
  tres: { tentativas: number; acertos: number };
  lance: { tentativas: number; acertos: number };
  rebotes: number;
  assistencias: number;
  faltas: number;
  tocos: number;
  turnovers: number;
  roubos: number;
  interferencia: number;
}

interface Game {
  id: number;
  opponent: string;
  date: string;
  location: string;
  categoria: string;
  status: string;
  jogadoras?: Player[];
}

interface GamePanelProps {
  game: Game | null;
}

export default function GamePanel({ game }: GamePanelProps) {
  // Formulário do jogo
  const [opponent] = useState(game?.opponent || "");
  const [date] = useState(game?.date ? game.date.split('T')[0] : "");
  const [time] = useState(game?.date ? (game.date.split('T')[1] || "") : "");
  const [location] = useState(game?.location || "");
  const [categoria] = useState(game?.categoria || "");
  const [quarto, setQuarto] = useState<number>(1);

  // Formulário da jogadora
  const [jogadoraId, setJogadoraId] = useState<number | null>(null);
  const [pontos, setPontos] = useState<number>(0);
  const [assistencias, setAssistencias] = useState<number>(0);
  const [rebotes, setRebotes] = useState<number>(0);
  const [roubos, setRoubos] = useState<number>(0);
  const [faltas, setFaltas] = useState<number>(0);

  // Lista de jogadoras
  const [jogadoras, setJogadoras] = useState<Player[]>([]);

  // Estatísticas do jogo
  const [stats, setStats] = useState<{
    total_pontos: number;
    total_assistencias: number;
    total_rebotes: number;
    total_roubos: number;
    total_faltas: number;
  }>({
    total_pontos: 0,
    total_assistencias: 0,
    total_rebotes: 0,
    total_roubos: 0,
    total_faltas: 0
  });

  // Estatísticas locais
  const [localStats, setLocalStats] = useState<{ [id: number]: EstatisticasJogadora }>({});

  useEffect(() => {
    if (game && game.jogadoras) {
      // Inicializa stats para as jogadoras do jogo
      const initialStats: { [id: number]: EstatisticasJogadora } = {};
      game.jogadoras.forEach((p: Player) => {
        initialStats[p.id] = {
          dois: { tentativas: 0, acertos: 0 },
          tres: { tentativas: 0, acertos: 0 },
          lance: { tentativas: 0, acertos: 0 },
          rebotes: 0,
          assistencias: 0,
          faltas: 0,
          tocos: 0,
          turnovers: 0,
          roubos: 0,
          interferencia: 0,
        };
      });
      setLocalStats(initialStats);
    } else {
      // Comportamento antigo: busca todas as jogadoras
      getPlayers().then(res => {
        const players = res.data.map((p: any) => ({
          ...p,
          posicao: p.posicao || 'Não definida'
        }));
        setJogadoras(players);
        const initialStats: { [id: number]: EstatisticasJogadora } = {};
        players.forEach((p: Player) => {
          initialStats[p.id] = {
            dois: { tentativas: 0, acertos: 0 },
            tres: { tentativas: 0, acertos: 0 },
            lance: { tentativas: 0, acertos: 0 },
            rebotes: 0,
            assistencias: 0,
            faltas: 0,
            tocos: 0,
            turnovers: 0,
            roubos: 0,
            interferencia: 0,
          };
        });
        setLocalStats(initialStats);
      }).catch(err => {
        console.error('Erro ao buscar players:', err);
      });
    }
  }, [game]);

  // Carregar jogadoras
  useEffect(() => {
    getPlayers().then(({ data }) => {
      const players = data.map((p: any) => ({
        ...p,
        posicao: p.posicao || 'Não definida'
      }));
      setJogadoras(players);
    });
  }, []);

  // Carregar estatísticas do jogo
  useEffect(() => {
    if (game?.id) {
      getPlayers().then(({ data }) => {
        const players = data.map((p: any) => ({
          ...p,
          posicao: p.posicao || 'Não definida'
        }));
        const total_pontos = players.reduce((total: number, player: Player) => {
          const s = localStats[player.id];
          return total + (s?.dois?.acertos || 0) * 2 + (s?.tres?.acertos || 0) * 3 + (s?.lance?.acertos || 0);
        }, 0);
        const total_assistencias = players.reduce((total: number, player: Player) => {
          const s = localStats[player.id];
          return total + (s?.assistencias || 0);
        }, 0);
        const total_rebotes = players.reduce((total: number, player: Player) => {
          const s = localStats[player.id];
          return total + (s?.rebotes || 0);
        }, 0);
        const total_roubos = players.reduce((total: number, player: Player) => {
          const s = localStats[player.id];
          return total + (s?.roubos || 0);
        }, 0);
        const total_faltas = players.reduce((total: number, player: Player) => {
          const s = localStats[player.id];
          return total + (s?.faltas || 0);
        }, 0);
        setStats({
          total_pontos,
          total_assistencias,
          total_rebotes,
          total_roubos,
          total_faltas
        });
      });
    }
  }, [game, localStats]);

  // Salvar estatísticas
  const handleSave = async () => {
    if (!game?.id || !jogadoraId) return;

    try {
      await createGame({
        opponent,
        date: date + 'T' + (time || '00:00'),
        location,
        categoria
      });

      await createEstatistica({
        jogadora_id: jogadoraId,
        jogo_id: game.id,
        pontos,
        assistencias,
        rebotes,
        roubos,
        faltas,
        quarto,
        dois_tentativas: localStats[jogadoraId]?.dois?.tentativas || 0,
        dois_acertos: localStats[jogadoraId]?.dois?.acertos || 0,
        tres_tentativas: localStats[jogadoraId]?.tres?.tentativas || 0,
        tres_acertos: localStats[jogadoraId]?.tres?.acertos || 0,
        lance_tentativas: localStats[jogadoraId]?.lance?.tentativas || 0,
        lance_acertos: localStats[jogadoraId]?.lance?.acertos || 0,
        interferencia: localStats[jogadoraId]?.interferencia || 0,
      } as any);

      // Limpar formulário
      setJogadoraId(null);
      setPontos(0);
      setAssistencias(0);
      setRebotes(0);
      setRoubos(0);
      setFaltas(0);

      // Recarregar estatísticas
      const { data } = await getPlayers();
      const players = data.map((p: any) => ({
        ...p,
        posicao: p.posicao || 'Não definida'
      }));
      setLocalStats(players.reduce((acc: { [id: number]: EstatisticasJogadora }, player: Player) => {
        acc[player.id] = {
          dois: { tentativas: 0, acertos: 0 },
          tres: { tentativas: 0, acertos: 0 },
          lance: { tentativas: 0, acertos: 0 },
          rebotes: 0,
          assistencias: 0,
          faltas: 0,
          tocos: 0,
          turnovers: 0,
          roubos: 0,
          interferencia: 0,
        };
        return acc;
      }, {}));
    } catch (error) {
      console.error('Erro ao salvar estatísticas:', error);
    }
  };

  return (
    <div className="p-4">
      <Card title="Informações do Jogo">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Adversário</label>
            <input
              type="text"
              value={opponent}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data</label>
            <input
              type="date"
              value={date}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Horário</label>
            <input
              type="time"
              value={time}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Local</label>
            <input
              type="text"
              value={location}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoria</label>
            <input
              type="text"
              value={categoria}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
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
          <h3 className="text-lg font-medium mb-4">Adicionar Estatísticas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Jogadora</label>
              <select
                value={jogadoraId || ""}
                onChange={(e) => setJogadoraId(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Selecione uma jogadora</option>
                {jogadoras.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.numero} - {j.nome} ({j.posicao})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quarto</label>
              <select
                value={quarto}
                onChange={(e) => setQuarto(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value={1}>1º Quarto</option>
                <option value={2}>2º Quarto</option>
                <option value={3}>3º Quarto</option>
                <option value={4}>4º Quarto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pontos</label>
              <input
                type="number"
                min="0"
                value={pontos}
                onChange={(e) => setPontos(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assistências</label>
              <input
                type="number"
                min="0"
                value={assistencias}
                onChange={(e) => setAssistencias(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rebotes</label>
              <input
                type="number"
                min="0"
                value={rebotes}
                onChange={(e) => setRebotes(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Roubos</label>
              <input
                type="number"
                min="0"
                value={roubos}
                onChange={(e) => setRoubos(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Faltas</label>
              <input
                type="number"
                min="0"
                value={faltas}
                onChange={(e) => setFaltas(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleSave}
              disabled={!jogadoraId}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Salvar Estatísticas
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
} 