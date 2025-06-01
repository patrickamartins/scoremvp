import React, { useState, useEffect } from "react";
import { Card, Input, Label } from "../components/ui";
import { usePageTitle } from "../hooks/usePageTitle";
import { createGame, createEstatistica, getPlayers } from "../services/api";
import { toast } from "sonner";

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

const categorias = ["sub-13", "sub-15", "sub-17", "sub-19"];

const Painel: React.FC = () => {
  usePageTitle("Painel");
  // Formulário do jogo
  const [gameForm, setGameForm] = useState({
    adversario: "",
    data: "",
    horario: "",
    local: "",
    categoria: categorias[0],
    campeonato: "",
  });
  const [gameFormError, setGameFormError] = useState("");
  const [gameSaved, setGameSaved] = useState(false);
  const [gameId, setGameId] = useState<number | null>(null);
  const [savingGame, setSavingGame] = useState(false);

  // Jogadores
  const [players, setPlayers] = useState<Player[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [playerForm, setPlayerForm] = useState<Player>({
    id: 0,
    nome: "",
    numero: 0,
    posicao: "",
  });
  const [formError, setFormError] = useState("");

  // Estatísticas
  const [stats, setStats] = useState<{ [id: number]: EstatisticasJogadora }>({});
  const [history, setHistory] = useState<any[]>([]); // Para desfazer

  useEffect(() => {
    getPlayers().then(({ data }) => {
      const players = data.map((p: any) => ({
        ...p,
        posicao: p.posicao || 'Não definida'
      }));
      setPlayers(players);
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
      setStats(initialStats);
    });
  }, []);

  const handleGameFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGameForm((prev) => ({ ...prev, [name]: value }));
    setGameFormError("");
  };

  const handlePlayerFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPlayerForm((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerForm.nome || !playerForm.numero || !playerForm.posicao) {
      setFormError("Preencha todos os campos");
      return;
    }
    if (players.some((p) => p.numero === playerForm.numero)) {
      setFormError("Já existe um jogador com esse número");
      return;
    }
    setPlayers((prev) => [...prev, playerForm]);
    setStats((prev) => ({
      ...prev,
      [playerForm.id]: {
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
      },
    }));
    setPlayerForm({ id: 0, nome: "", numero: 0, posicao: "" });
    setShowModal(false);
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameForm.adversario || !gameForm.data || !gameForm.horario || !gameForm.local || !gameForm.categoria) {
      setGameFormError("Preencha todos os campos do jogo");
      return;
    }
    setGameFormError("");
    setSavingGame(true);
    try {
      const payload = {
        opponent: gameForm.adversario,
        date: new Date(gameForm.data + 'T' + (gameForm.horario || '00:00')).toISOString(),
        location: gameForm.local,
        categoria: gameForm.categoria,
        status: 'PENDENTE',
        jogadoras: [],
      };
      const res = await createGame(payload);
      setGameId(res.data.id);
      setGameSaved(true);
      toast.success("Jogo salvo com sucesso!");
    } catch (err: any) {
      setGameSaved(false);
      if (err?.response?.status === 503) {
        setGameFormError("Backend indisponível. Tente novamente em instantes.");
      } else {
        setGameFormError("Erro ao salvar o jogo. Verifique sua conexão ou tente novamente.");
      }
      toast.error("Erro ao salvar o jogo");
    } finally {
      setSavingGame(false);
    }
  };

  // Estatísticas
  const handleStat = (id: number, stat: keyof EstatisticasJogadora, delta: number) => {
    setHistory((prev) => [...prev, { stats: JSON.parse(JSON.stringify(stats)) }]);
    setStats((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [stat]: Math.max(0, (prev[id]?.[stat] || 0) + delta),
      },
    }));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setStats(last.stats);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    setHistory((prev) => [...prev, { stats: JSON.parse(JSON.stringify(stats)) }]);
    setStats((prev) => {
      const reseted: any = {};
      Object.keys(prev).forEach((id) => {
        reseted[id] = {
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
      return reseted;
    });
  };

  const handleSaveStats = async () => {
    if (!gameId) {
      toast.error("Salve o jogo antes de enviar as estatísticas!");
      return;
    }
    try {
      for (const player of players) {
        const playerStats = stats[player.id];
        if (!playerStats) continue;
        await createEstatistica({
          jogadora_id: player.id,
          jogo_id: gameId,
          pontos: Number(playerStats.dois?.acertos || 0) * 2 + Number(playerStats.tres?.acertos || 0) * 3 + Number(playerStats.lance?.acertos || 0) as unknown as number,
          assistencias: playerStats.assistencias,
          rebotes: playerStats.rebotes,
          roubos: playerStats.roubos,
          faltas: playerStats.faltas,
          quarto: 1, // Por enquanto, sempre 1
        });
      }
      toast.success("Estatísticas salvas com sucesso!");
    } catch (err) {
      toast.error("Erro ao salvar estatísticas");
    }
  };

  return (
    <div className="p-8 mt-16 space-y-8 relative">
      <h1 className="text-3xl font-bold text-eerieblack">Painel da Partida</h1>

      {/* Formulário do Jogo */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Informações do Jogo</h2>
        <form onSubmit={handleCreateGame} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="adversario">Adversário</Label>
            <Input
              id="adversario"
              name="adversario"
              value={gameForm.adversario}
              onChange={handleGameFormChange}
              placeholder="Nome do adversário"
            />
          </div>
          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <select
              id="categoria"
              name="categoria"
              value={gameForm.categoria}
              onChange={handleGameFormChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              name="data"
              type="date"
              value={gameForm.data}
              onChange={handleGameFormChange}
            />
          </div>
          <div>
            <Label htmlFor="horario">Horário</Label>
            <Input
              id="horario"
              name="horario"
              type="time"
              value={gameForm.horario}
              onChange={handleGameFormChange}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="local">Local</Label>
            <Input
              id="local"
              name="local"
              value={gameForm.local}
              onChange={handleGameFormChange}
              placeholder="Local do jogo"
            />
          </div>
          <div>
            <Label htmlFor="campeonato">Campeonato</Label>
            <Input
              id="campeonato"
              name="campeonato"
              value={gameForm.campeonato}
              onChange={handleGameFormChange}
              placeholder="Nome do campeonato"
            />
          </div>
          {gameFormError && <div className="text-red-500 text-sm md:col-span-2">{gameFormError}</div>}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold shadow transition-colors mt-2 disabled:opacity-50"
              disabled={savingGame}
            >
              {savingGame ? "Salvando..." : "Salvar Jogo"}
            </button>
          </div>
        </form>
      </Card>

      {/* Painel de Estatísticas */}
      {gameSaved && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Painel de Estatísticas</h2>
          {players.length === 0 ? (
            <div className="text-gray-400">Adicione jogadoras para começar a registrar estatísticas.</div>
          ) : (
            <table className="min-w-full text-sm border mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Nome</th>
                  <th className="border px-2 py-1">Número</th>
                  <th className="border px-2 py-1">Pontos</th>
                  <th className="border px-2 py-1">Assistências</th>
                  <th className="border px-2 py-1">Rebotes</th>
                  <th className="border px-2 py-1">Roubos</th>
                  <th className="border px-2 py-1">Faltas</th>
                  <th className="border px-2 py-1">Ações</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id}>
                    <td className="border px-2 py-1">{p.nome}</td>
                    <td className="border px-2 py-1">{p.numero}</td>
                    <td className="border px-2 py-1">
                      <button className="px-2 py-1 bg-blue-100 rounded mr-1" onClick={() => handleStat(p.id, 'dois', 1)}>+</button>
                      {stats[p.id]?.dois?.acertos || 0}
                      <button className="px-2 py-1 bg-blue-100 rounded ml-1" onClick={() => handleStat(p.id, 'dois', -1)}>-</button>
                    </td>
                    <td className="border px-2 py-1">
                      <button className="px-2 py-1 bg-green-100 rounded mr-1" onClick={() => handleStat(p.id, 'assistencias', 1)}>+</button>
                      {stats[p.id]?.assistencias || 0}
                      <button className="px-2 py-1 bg-green-100 rounded ml-1" onClick={() => handleStat(p.id, 'assistencias', -1)}>-</button>
                    </td>
                    <td className="border px-2 py-1">
                      <button className="px-2 py-1 bg-yellow-100 rounded mr-1" onClick={() => handleStat(p.id, 'rebotes', 1)}>+</button>
                      {stats[p.id]?.rebotes || 0}
                      <button className="px-2 py-1 bg-yellow-100 rounded ml-1" onClick={() => handleStat(p.id, 'rebotes', -1)}>-</button>
                    </td>
                    <td className="border px-2 py-1">
                      <button className="px-2 py-1 bg-purple-100 rounded mr-1" onClick={() => handleStat(p.id, 'roubos', 1)}>+</button>
                      {stats[p.id]?.roubos || 0}
                      <button className="px-2 py-1 bg-purple-100 rounded ml-1" onClick={() => handleStat(p.id, 'roubos', -1)}>-</button>
                    </td>
                    <td className="border px-2 py-1">
                      <button className="px-2 py-1 bg-red-100 rounded mr-1" onClick={() => handleStat(p.id, 'faltas', 1)}>+</button>
                      {stats[p.id]?.faltas || 0}
                      <button className="px-2 py-1 bg-red-100 rounded ml-1" onClick={() => handleStat(p.id, 'faltas', -1)}>-</button>
                    </td>
                    <td className="border px-2 py-1">
                      <button className="px-2 py-1 bg-gray-200 rounded" onClick={handleReset}>Zerar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="flex gap-4 mt-4">
            <button onClick={handleUndo} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-bold">Desfazer</button>
            <button onClick={handleReset} className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded font-bold">Zerar</button>
            <button onClick={handleSaveStats} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold">Salvar Estatísticas</button>
          </div>
        </Card>
      )}

      {/* Lista de jogadores cadastrados */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Jogadores da Partida</h2>
        {players.length === 0 ? (
          <div className="text-gray-400">Nenhum jogador cadastrado ainda.</div>
        ) : (
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Nome</th>
                <th className="border px-2 py-1">Número</th>
                <th className="border px-2 py-1">Posição</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{p.nome}</td>
                  <td className="border px-2 py-1">{p.numero}</td>
                  <td className="border px-2 py-1">{p.posicao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Botão flutuante */}
      {gameSaved && (
        <button
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg text-3xl z-50"
          onClick={() => setShowModal(true)}
          title="Adicionar Jogador"
        >
          +
        </button>
      )}
      {!gameSaved && (
        <div className="fixed bottom-8 right-8 bg-red-100 text-red-700 px-4 py-2 rounded shadow-lg z-50">
          Salve o jogo para liberar o cadastro de jogadores.
        </div>
      )}

      {/* Modal de cadastro de jogador */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowModal(false)}
              title="Fechar"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">Adicionar Jogador</h2>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={playerForm.nome}
                  onChange={handlePlayerFormChange}
                  placeholder="Nome do jogador"
                />
              </div>
              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  name="numero"
                  value={playerForm.numero}
                  onChange={handlePlayerFormChange}
                  placeholder="Número"
                  type="number"
                />
              </div>
              <div>
                <Label htmlFor="posicao">Posição</Label>
                <Input
                  id="posicao"
                  name="posicao"
                  value={playerForm.posicao}
                  onChange={handlePlayerFormChange}
                  placeholder="Posição"
                />
              </div>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold mt-2"
              >
                Adicionar Jogador
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Painel; 