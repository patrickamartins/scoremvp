import { useState, useEffect, useRef } from "react";
import { getPlayers, createGame, createEstatistica } from "../services/api";

interface Player {
  id: number;
  nome: string;
  numero: number;
  posicao?: string;
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

type Acao = {
  playerId: number;
  stat: keyof EstatisticasJogadora;
  valor: number;
  tipo: 'tentativa' | 'acerto';
};

const ESTATS: { key: keyof EstatisticasJogadora; label: string; color: string; pontos: number }[] = [
  { key: "dois", label: "+2", color: "bg-blue-600", pontos: 2 },
  { key: "tres", label: "+3", color: "bg-indigo-700", pontos: 3 },
  { key: "lance", label: "LANCE", color: "bg-yellow-500", pontos: 1 },
  { key: "rebotes", label: "REBOTE", color: "bg-green-600", pontos: 0 },
  { key: "assistencias", label: "ASSIST", color: "bg-cyan-600", pontos: 0 },
  { key: "faltas", label: "FALTA", color: "bg-red-600", pontos: 0 },
  { key: "tocos", label: "TOCO", color: "bg-purple-700", pontos: 0 },
  { key: "turnovers", label: "TURN", color: "bg-gray-700", pontos: 0 },
  { key: "roubos", label: "ROUBO", color: "bg-pink-600", pontos: 0 },
  { key: "interferencia", label: "INTERF", color: "bg-orange-600", pontos: 0 },
];

const ARREMESSOS: (keyof EstatisticasJogadora)[] = ["dois", "tres", "lance"];

interface GamePanelProps {
  game?: any;
}

export default function GamePanel({ game }: GamePanelProps) {
  // Formulário do jogo
  const [opponent, setOpponent] = useState(game?.opponent || "");
  const [date, setDate] = useState(game?.date ? game.date.split('T')[0] : "");
  const [time, setTime] = useState(game?.date ? (game.date.split('T')[1] || "") : "");
  const [location, setLocation] = useState(game?.location || "");
  const [categoria, setCategoria] = useState(game?.categoria || "");
  const [quarto, setQuarto] = useState<number>(1);

  // Jogadoras
  const [players, setPlayers] = useState<Player[]>(game?.jogadoras || []);
  // Estatísticas locais
  const [stats, setStats] = useState<{ [id: number]: EstatisticasJogadora }>({});
  // Histórico para desfazer
  const [history, setHistory] = useState<Acao[]>([]);

  // Estado para controlar o botão que está aguardando confirmação
  const [waitingButton, setWaitingButton] = useState<{ playerId: number; stat: keyof EstatisticasJogadora } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (game && game.jogadoras) {
      setPlayers(game.jogadoras);
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
      setStats(initialStats);
    } else {
      // Comportamento antigo: busca todas as jogadoras
      getPlayers().then(res => {
        setPlayers(res.data);
        const initialStats: { [id: number]: EstatisticasJogadora } = {};
        res.data.forEach((p: Player) => {
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
        setStats(initialStats);
      }).catch(err => {
        console.error('Erro ao buscar players:', err);
      });
    }
    // eslint-disable-next-line
  }, [game]);

  function handleStatClick(playerId: number, stat: keyof EstatisticasJogadora) {
    // Se o botão já está aguardando confirmação
    if (waitingButton && waitingButton.playerId === playerId && waitingButton.stat === stat) {
      // Registra o acerto
      setStats(prev => {
        const newStats = { ...prev };
        const currentStat = newStats[playerId][stat] as { tentativas: number; acertos: number };
        newStats[playerId] = {
          ...newStats[playerId],
          [stat]: {
            ...currentStat,
            acertos: currentStat.acertos + 1
          }
        };
        return newStats;
      });
      setHistory(prev => [{ playerId, stat, valor: 1, tipo: 'acerto' }, ...prev.slice(0, 4)]);
      setWaitingButton(null);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      // Registra a tentativa
      setStats(prev => {
        const newStats = { ...prev };
        const currentStat = newStats[playerId][stat] as { tentativas: number; acertos: number };
        newStats[playerId] = {
          ...newStats[playerId],
          [stat]: {
            ...currentStat,
            tentativas: currentStat.tentativas + 1
          }
        };
        return newStats;
      });
      setHistory(prev => [{ playerId, stat, valor: 1, tipo: 'tentativa' }, ...prev.slice(0, 4)]);
      setWaitingButton({ playerId, stat });

      // Limpa o timeout anterior se existir
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Define um novo timeout
      timeoutRef.current = setTimeout(() => {
        setWaitingButton(null);
      }, 3000);
    }
  }

  function undoAction() {
    if (history.length === 0) return;
    const [last, ...rest] = history;
    setStats(prev => {
      const newStats = { ...prev };
      const currentStat = newStats[last.playerId][last.stat] as { tentativas: number; acertos: number };
      if (last.tipo === 'tentativa') {
        newStats[last.playerId] = {
          ...newStats[last.playerId],
          [last.stat]: {
            ...currentStat,
            tentativas: Math.max(0, currentStat.tentativas - 1)
          }
        };
      } else {
        newStats[last.playerId] = {
          ...newStats[last.playerId],
          [last.stat]: {
            ...currentStat,
            acertos: Math.max(0, currentStat.acertos - 1)
          }
        };
      }
      return newStats;
    });
    setHistory(rest);
  }

  function resetStats() {
    setStats(prev => {
      const novo = { ...prev };
      Object.keys(novo).forEach(id => {
        novo[Number(id)] = {
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
        location,
        categoria
      };
      console.log('Payload do jogo:', gamePayload);
      
      const gameRes = await createGame(gamePayload);
      if (!gameRes.data?.id) {
        throw new Error('Erro ao criar jogo: ID não retornado');
      }
      const jogo_id = gameRes.data.id;

      // 2. Criar estatísticas para cada jogadora
      const estatisticasPromises = players.map(player => {
        const s = stats[player.id];
        // Só envia se houver alguma estatística
        const total = (s?.dois?.tentativas || 0) + (s?.tres?.tentativas || 0) + (s?.lance?.tentativas || 0) + 
                     (s?.assistencias || 0) + (s?.rebotes || 0) + (s?.roubos || 0) + 
                     (s?.faltas || 0) + (s?.tocos || 0) + (s?.turnovers || 0) + (s?.interferencia || 0);
        
        if (!total) return null;

        const estatisticaPayload = {
          jogadora_id: player.id,
          jogo_id,
          pontos: (s?.dois?.acertos || 0) * 2 + (s?.tres?.acertos || 0) * 3 + (s?.lance?.acertos || 0),
          assistencias: s?.assistencias || 0,
          rebotes: s?.rebotes || 0,
          roubos: s?.roubos || 0,
          faltas: s?.faltas || 0,
          quarto: quarto,
          dois_tentativas: s?.dois?.tentativas || 0,
          dois_acertos: s?.dois?.acertos || 0,
          tres_tentativas: s?.tres?.tentativas || 0,
          tres_acertos: s?.tres?.acertos || 0,
          lance_tentativas: s?.lance?.tentativas || 0,
          lance_acertos: s?.lance?.acertos || 0,
          interferencia: s?.interferencia || 0,
        };

        console.log('Payload da estatística:', estatisticaPayload);
        return createEstatistica(estatisticaPayload);
      }).filter(Boolean);

      if (estatisticasPromises.length === 0) {
        throw new Error('Nenhuma estatística para salvar');
      }

      await Promise.all(estatisticasPromises);
      alert("Jogo e estatísticas salvos com sucesso!");
      resetStats();
    } catch (error: any) {
      console.error('Erro detalhado:', error);
      if (error.response) {
        console.error('Resposta do servidor:', error.response.data);
        alert(`Erro ao salvar: ${error.response.data.detail || 'Erro desconhecido'}`);
      } else if (error.request) {
        console.error('Sem resposta do servidor:', error.request);
        alert('Erro de conexão com o servidor. Verifique sua conexão.');
      } else {
        console.error('Erro:', error.message);
        alert(`Erro: ${error.message}`);
      }
    }
  }

  return (
    <>
      <div className="p-2 md:p-6">
        {/* Botões de ação e seletor de quarto centralizados */}
        <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4 mb-4 md:mb-8 bg-white p-2 md:p-4 rounded shadow justify-center items-center">
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
          {/* Botões de ação ao lado do seletor */}
          <div className="flex flex-row gap-2 md:gap-4 mt-2 md:mt-0">
            <button onClick={saveStats} className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded font-bold shadow">Salvar</button>
            <button onClick={resetStats} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold shadow">Zerar estatísticas</button>
            <button onClick={undoAction} className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded font-bold shadow">Desfazer</button>
          </div>
        </div>
        {/* Tabela de estatísticas */}
        <div className="w-full max-w-full overflow-x-auto md:overflow-x-visible">
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
              {players.map((player) => {
                const faltas = stats[player.id]?.faltas || 0;
                let alertClass = '';
                if (faltas === 3) alertClass = 'bg-yellow-200';
                if (faltas >= 4) alertClass = 'bg-red-300';
                return (
                  <tr key={player.id} className="bg-white even:bg-gray-50 hover:bg-yellow-50">
                    <td className="text-center font-bold text-xs md:text-sm text-gray-700 align-middle border-b">{player.numero}</td>
                    <td className={`text-left font-semibold text-xs md:text-sm text-gray-900 align-middle border-b transition-colors duration-200 ${alertClass}`}>
                      {player.nome}
                      {faltas === 3 && <span className="ml-1 text-yellow-700" title="3 faltas">⚠️</span>}
                      {faltas >= 4 && <span className="ml-1 text-red-700" title="4 ou mais faltas">⛔</span>}
                    </td>
                    {ESTATS.map(stat => {
                      const isArremesso = ARREMESSOS.includes(stat.key);
                      const isWaiting = isArremesso && waitingButton?.playerId === player.id && waitingButton?.stat === stat.key;
                      const statValue = stats[player.id]?.[stat.key];
                      let displayValue;
                      if (isArremesso) {
                        displayValue = typeof statValue === 'object' ? `${statValue.tentativas}/${statValue.acertos}` : statValue;
                      } else {
                        displayValue = statValue ?? 0;
                      }
                      return (
                        <td key={stat.key} className="text-center border-b">
                          <button
                            onClick={() => {
                              if (isArremesso) {
                                handleStatClick(player.id, stat.key);
                              } else {
                                // Incrementa +1 para stats simples
                                setStats(prev => ({
                                  ...prev,
                                  [player.id]: {
                                    ...prev[player.id],
                                    [stat.key]: (prev[player.id]?.[stat.key] || 0) + 1
                                  }
                                }));
                              }
                            }}
                            className={`w-full min-w-[48px] py-2 px-2 text-white font-bold rounded transition-all duration-200 ${
                              stat.color
                            } ${
                              isWaiting ? 'ring-2 ring-offset-2 ring-white animate-pulse' : ''
                            }`}
                            style={{fontSize: '0.95rem'}}
                          >
                            {displayValue}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
} 