import { useState, useEffect } from "react";
import { getPlayers, createGame, createEstatistica } from "../services/api";

interface Player {
  id: number;
  nome: string;
  numero: number;
  posicao?: string;
}

interface EstatisticasJogadora {
  dois: number;
  tres: number;
  lance: number;
  rebotes: number;
  assistencias: number;
  faltas: number;
  tocos: number;
  turnovers: number;
  roubos: number;
}

type Acao = {
  playerId: number;
  stat: keyof EstatisticasJogadora;
  valor: number;
};

const ESTATS: { key: keyof EstatisticasJogadora; label: string; color: string }[] = [
  { key: "dois", label: "+2", color: "bg-blue-600" },
  { key: "tres", label: "+3", color: "bg-indigo-700" },
  { key: "lance", label: "LANCE", color: "bg-yellow-500" },
  { key: "rebotes", label: "REBOTE", color: "bg-green-600" },
  { key: "assistencias", label: "ASSIST", color: "bg-cyan-600" },
  { key: "faltas", label: "FALTA", color: "bg-red-600" },
  { key: "tocos", label: "TOCO", color: "bg-purple-700" },
  { key: "turnovers", label: "TURN", color: "bg-gray-700" },
  { key: "roubos", label: "ROUBO", color: "bg-pink-600" },
];

export default function GamePanel() {
  // Formulário do jogo
  const [opponent, setOpponent] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [categoria, setCategoria] = useState("");
  const [quarto, setQuarto] = useState<number>(1);

  // Jogadoras
  const [players, setPlayers] = useState<Player[]>([]);
  // Estatísticas locais
  const [stats, setStats] = useState<{ [id: number]: EstatisticasJogadora }>({});
  // Histórico para desfazer
  const [history, setHistory] = useState<Acao[]>([]);

  useEffect(() => {
    console.log('Executando useEffect do painel');
    getPlayers().then(res => {
      console.log('Players recebidos:', res.data);
      setPlayers(res.data);
      // Inicializa stats se necessário
      const initialStats: { [id: number]: EstatisticasJogadora } = {};
      res.data.forEach((p: Player) => {
        initialStats[p.id] = {
          dois: 0,
          tres: 0,
          lance: 0,
          rebotes: 0,
          assistencias: 0,
          faltas: 0,
          tocos: 0,
          turnovers: 0,
          roubos: 0,
        };
      });
      setStats(initialStats);
    }).catch(err => {
      console.error('Erro ao buscar players:', err);
    });
  }, []);

  function addStat(playerId: number, stat: keyof EstatisticasJogadora) {
    setStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [stat]: prev[playerId][stat] + 1,
      },
    }));
    setHistory(prev => [{ playerId, stat, valor: 1 }, ...prev.slice(0, 4)]); // até 5 ações
  }

  function undoAction() {
    if (history.length === 0) return;
    const [last, ...rest] = history;
    setStats(prev => ({
      ...prev,
      [last.playerId]: {
        ...prev[last.playerId],
        [last.stat]: Math.max(0, prev[last.playerId][last.stat] - last.valor),
      },
    }));
    setHistory(rest);
  }

  function resetStats() {
    setStats(prev => {
      const novo = { ...prev };
      Object.keys(novo).forEach(id => {
        novo[Number(id)] = {
          dois: 0,
          tres: 0,
          lance: 0,
          rebotes: 0,
          assistencias: 0,
          faltas: 0,
          tocos: 0,
          turnovers: 0,
          roubos: 0,
        };
      });
      return novo;
    });
    setHistory([]);
  }

  async function saveStats() {
    if (!opponent || !date) {
      alert("Preencha o adversário e a data do jogo.");
      return;
    }
    try {
      // 1. Criar o jogo
      const gamePayload = {
        opponent,
        date: date + 'T' + (time || '00:00'),
        location
      };
      console.log('Payload do jogo:', gamePayload);
      const gameRes = await createGame(gamePayload);
      const jogo_id = gameRes.data.id;

      // 2. Criar estatísticas para cada jogadora
      const estatisticasPromises = players.map(player => {
        const s = stats[player.id];
        // Só envia se houver alguma estatística
        const total = (s?.dois || 0) + (s?.tres || 0) + (s?.lance || 0) + (s?.assistencias || 0) + (s?.rebotes || 0) + (s?.roubos || 0) + (s?.faltas || 0) + (s?.tocos || 0) + (s?.turnovers || 0);
        if (!total) return null;
        return createEstatistica({
          jogadora_id: player.id,
          jogo_id,
          pontos: (s?.dois || 0) * 2 + (s?.tres || 0) * 3 + (s?.lance || 0),
          assistencias: s?.assistencias || 0,
          rebotes: s?.rebotes || 0,
          roubos: s?.roubos || 0,
          faltas: s?.faltas || 0,
          quarto: quarto,
        });
      }).filter(Boolean);
      await Promise.all(estatisticasPromises);
      alert("Jogo e estatísticas salvos com sucesso!");
      resetStats();
    } catch (err) {
      alert("Erro ao salvar jogo/estatísticas. Veja o console.");
      console.error(err);
    }
  }

  return (
    <>
      <div className="p-2 md:p-6">
        {/* Formulário do jogo + botões de ação lado a lado */}
        <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4 mb-4 md:mb-8 bg-white p-2 md:p-4 rounded shadow">
          <form className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 flex-1">
            <input
              className="border p-2 rounded text-sm"
              placeholder="Adversário"
              value={opponent}
              onChange={e => setOpponent(e.target.value)}
            />
            <input
              className="border p-2 rounded text-sm"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
            <input
              className="border p-2 rounded text-sm"
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
            <input
              className="border p-2 rounded text-sm"
              placeholder="Local"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
            <input
              className="border p-2 rounded text-sm"
              placeholder="Categoria"
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
            />
          </form>
          <div className="flex items-center gap-2 mt-2 mb-4">
            <label className="font-semibold text-sm">Quarto:</label>
            <select
              className="border rounded px-2 py-1"
              value={quarto}
              onChange={e => setQuarto(Number(e.target.value))}
            >
              <option value={1}>1º Quarto</option>
              <option value={2}>2º Quarto</option>
              <option value={3}>3º Quarto</option>
              <option value={4}>4º Quarto</option>
            </select>
          </div>
          {/* Botões de ação ao lado do formulário */}
          <div className="flex flex-row gap-2 md:gap-4 mt-2 md:mt-0">
            <button onClick={saveStats} className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded font-bold shadow">Salvar</button>
            <button onClick={resetStats} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold shadow">Zerar estatísticas</button>
            <button onClick={undoAction} className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded font-bold shadow">Desfazer</button>
          </div>
        </div>
        {/* Tabela de estatísticas */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-1">
            <thead className="sticky top-0 z-10 bg-gray-100">
              <tr>
                <th className="px-2 py-2 text-xs md:text-sm font-bold text-gray-700 text-center border-b">#</th>
                <th className="px-2 py-2 text-xs md:text-sm font-bold text-gray-700 text-center border-b">Nome</th>
                {ESTATS.map(stat => (
                  <th key={stat.key} className="px-2 py-2 text-xs md:text-sm font-bold text-gray-700 text-center border-b">
                    {stat.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="bg-white even:bg-gray-50 hover:bg-yellow-50">
                  <td className="text-center font-bold text-xs md:text-sm text-gray-700 align-middle border-b">{player.numero}</td>
                  <td className="text-left font-semibold text-xs md:text-sm text-gray-900 align-middle border-b">{player.nome}</td>
                  {ESTATS.map(stat => (
                    <td key={stat.key} className="text-center border-b">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => addStat(player.id, stat.key)}
                          className={`w-16 h-10 md:w-20 md:h-12 rounded font-bold text-xs md:text-base text-white shadow ${stat.color} hover:scale-105 transition-transform uppercase`}
                          type="button"
                        >
                          {stat.label}
                        </button>
                        <span className="block text-xs md:text-sm font-mono text-gray-800">
                          {stats[player.id]?.[stat.key] || 0}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
} 