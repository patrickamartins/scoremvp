import React, { useState, useEffect, useRef } from "react";
import { Card, Input, Label } from "../components/ui";
import { usePageTitle } from "../hooks/usePageTitle";
import { createGame, createEstatistica, getPlayers, getEstatisticasByJogo, updateGame } from "../services/api";
import { toast } from "sonner";

interface Player {
  id: number;
  nome: string;
  numero: number;
  posicao: string;
  categoria?: string;
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

const quartos = [
  { value: 1, label: '1º Quarto' },
  { value: 2, label: '2º Quarto' },
  { value: 3, label: '3º Quarto' },
  { value: 4, label: '4º Quarto' },
  { value: 5, label: 'Prorrogação' },
];

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

  // Novo: controle de quarto
  const [selectedQuarto, setSelectedQuarto] = useState(1);

  // Jogadores
  const [players, setPlayers] = useState<Player[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [playerForm, setPlayerForm] = useState<Player & { categoria?: string }>({
    id: 0,
    nome: "",
    numero: 0,
    posicao: "",
    categoria: categorias[0],
  });
  const [formError, setFormError] = useState("");

  // Estatísticas por quarto
  const [stats, setStats] = useState<Record<number, Record<number, EstatisticasJogadora>>>({});
  const [history, setHistory] = useState<any[]>([]); // Para desfazer

  // Adicionar hooks para dupla verificação
  const [pendingShot, setPendingShot] = useState<{ playerId: number; tipo: 'dois' | 'tres' | 'lance'; timeout: NodeJS.Timeout | null } | null>(null);

  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const nomeInputRef = useRef<HTMLInputElement>(null);

  const [savingPlayer, setSavingPlayer] = useState(false);

  // Adicionar status da partida
  const [gameStatus, setGameStatus] = useState<'PENDENTE' | 'EM_ANDAMENTO' | 'FINALIZADA'>('PENDENTE');

  // Adicionar no início do componente:
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Player[]>([]);

  // Buscar todas as jogadoras para autocomplete ao abrir modal
  useEffect(() => {
    if (showModal) {
      getPlayers().then(({ data }) => {
        setAllPlayers(data.map((p: any) => ({
          ...p,
          posicao: p.posicao || '',
          categoria: p.categoria || categorias[0],
        })));
      });
    }
  }, [showModal]);

  // Filtrar jogadoras por nome ou categoria
  useEffect(() => {
    if (searchTerm.length === 0) {
      setSearchResults([]);
      return;
    }
    const term = searchTerm.toLowerCase();
    setSearchResults(
      allPlayers.filter(
        (p) =>
          p.nome.toLowerCase().includes(term) ||
          (p.categoria && p.categoria.toLowerCase().includes(term))
      )
    );
  }, [searchTerm, allPlayers]);

  // Carregar estatísticas existentes quando um jogo é selecionado
  useEffect(() => {
    if (gameId) {
      setLoadingStats(true);
      getEstatisticasByJogo(gameId).then(({ data }) => {
        const newStats = { ...stats };
        data.forEach((estatistica) => {
          const quarto = estatistica.quarto || 1;
          if (!newStats[quarto]) {
            newStats[quarto] = {};
          }
          newStats[quarto][estatistica.jogadora_id] = {
            dois: { tentativas: 0, acertos: 0 },
            tres: { tentativas: 0, acertos: 0 },
            lance: { tentativas: 0, acertos: 0 },
            rebotes: estatistica.rebotes,
            assistencias: estatistica.assistencias,
            faltas: estatistica.faltas,
            tocos: 0,
            turnovers: 0,
            roubos: estatistica.roubos,
            interferencia: estatistica.interferencia,
          };
        });
        setStats(newStats);
        setLoadingStats(false);
      }).catch(() => {
        toast.error("Erro ao carregar estatísticas do jogo.");
        setLoadingStats(false);
      });
    }
  }, [gameId]);

  // Foco automático no campo nome ao abrir modal
  useEffect(() => {
    if (showModal && nomeInputRef.current) {
      nomeInputRef.current.focus();
    }
  }, [showModal]);

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

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerForm.nome || !playerForm.numero || !playerForm.posicao) {
      setFormError("Preencha todos os campos");
      return;
    }
    if (players.some((p) => p.numero === playerForm.numero)) {
      setFormError("Já existe um jogador com esse número");
      return;
    }
    setSavingPlayer(true);
    try {
      setPlayers((prev) => [...prev, playerForm]);
      setStats((prev) => ({
        ...prev,
        [selectedQuarto]: {
          ...prev[selectedQuarto],
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
        },
      }));
      setPlayerForm({ id: 0, nome: "", numero: 0, posicao: "", categoria: categorias[0] });
      setShowModal(false);
      toast.success("Jogador adicionado com sucesso!");
    } catch (err) {
      toast.error("Erro ao adicionar jogador");
    } finally {
      setSavingPlayer(false);
    }
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
      setGameStatus('PENDENTE');
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

  // Atualizar status para EM_ANDAMENTO ao iniciar estatísticas
  useEffect(() => {
    if (gameSaved && gameStatus === 'PENDENTE' && Object.values(stats[selectedQuarto] || {}).some(s => s.dois.tentativas > 0 || s.tres.tentativas > 0 || s.lance.tentativas > 0 || s.rebotes > 0 || s.assistencias > 0 || s.faltas > 0 || s.tocos > 0 || s.turnovers > 0 || s.roubos > 0 || s.interferencia > 0)) {
      setGameStatus('EM_ANDAMENTO');
    }
  }, [stats, gameSaved, gameStatus, selectedQuarto]);

  // Função para finalizar partida
  const handleFinalizarPartida = async () => {
    if (!gameId) return;
    try {
      await updateGame(gameId, { status: 'FINALIZADA' });
      setGameStatus('FINALIZADA');
      toast.success('Partida finalizada!');
    } catch {
      toast.error('Erro ao finalizar partida.');
    }
  };

  function handleShot(playerId: number, tipo: 'dois' | 'tres' | 'lance') {
    // Salvar estado atual no histórico antes de modificar
    setHistory(prev => [...prev, { stats: JSON.parse(JSON.stringify(stats)) }]);

    // Se já existe um pendingShot para esse jogador e tipo, registrar acerto
    if (pendingShot && pendingShot.playerId === playerId && pendingShot.tipo === tipo) {
      clearTimeout(pendingShot.timeout!);
      setStats((prev) => {
        const quartoStats = { ...prev[selectedQuarto] };
        const playerStats = { ...quartoStats[playerId] };
        return {
          ...prev,
          [selectedQuarto]: {
            ...quartoStats,
            [playerId]: {
              ...playerStats,
              [tipo]: {
                tentativas: (playerStats[tipo]?.tentativas ?? 0) + 1,
                acertos: (playerStats[tipo]?.acertos ?? 0) + 1,
              },
            },
          },
        };
      });
      setPendingShot(null);
      return;
    }

    // Se não, registrar tentativa e aguardar 3s para acerto
    const timeout = setTimeout(() => {
      setStats((prev) => {
        const quartoStats = { ...prev[selectedQuarto] };
        const playerStats = { ...quartoStats[playerId] };
        return {
          ...prev,
          [selectedQuarto]: {
            ...quartoStats,
            [playerId]: {
              ...playerStats,
              [tipo]: {
                tentativas: (playerStats[tipo]?.tentativas ?? 0) + 1,
                acertos: playerStats[tipo]?.acertos ?? 0,
              },
            },
          },
        };
      });
      setPendingShot(null);
    }, 3000);
    setPendingShot({ playerId, tipo, timeout });
  }

  function handleStatButton(playerId: number, stat: keyof EstatisticasJogadora, delta: number) {
    // Salvar estado atual no histórico antes de modificar
    setHistory(prev => [...prev, { stats: JSON.parse(JSON.stringify(stats)) }]);

    setStats((prev) => {
      const quartoStats = { ...prev[selectedQuarto] };
      const playerStats = { ...quartoStats[playerId] };
      // Só incrementa/decrementa se for campo numérico
      const isNumberField = [
        'rebotes', 'assistencias', 'faltas', 'tocos', 'turnovers', 'roubos', 'interferencia'
      ].includes(stat);

      // Atualizar status do jogo para EM_ANDAMENTO se ainda estiver PENDENTE
      if (gameStatus === 'PENDENTE') {
        setGameStatus('EM_ANDAMENTO');
      }

      return {
        ...prev,
        [selectedQuarto]: {
          ...quartoStats,
          [playerId]: {
            ...playerStats,
            [stat]: isNumberField
              ? Math.max(0, Number(playerStats[stat] || 0) + delta)
              : playerStats[stat],
          },
        },
      };
    });
  }

  const handleUndo = () => {
    if (history.length === 0) {
      toast.error("Não há ações para desfazer");
      return;
    }
    const last = history[history.length - 1];
    setStats((prev) => ({
      ...prev,
      [selectedQuarto]: last.stats[selectedQuarto],
    }));
    setHistory((prev) => prev.slice(0, -1));
    toast.success("Ação desfeita com sucesso");
  };

  const handleReset = () => {
    if (Object.values(stats[selectedQuarto] || {}).every(s => 
      s.dois.tentativas === 0 && s.tres.tentativas === 0 && s.lance.tentativas === 0 && 
      s.rebotes === 0 && s.assistencias === 0 && s.faltas === 0 && 
      s.tocos === 0 && s.turnovers === 0 && s.roubos === 0 && s.interferencia === 0
    )) {
      toast.error("Não há estatísticas para zerar");
      return;
    }

    setHistory((prev) => [...prev, { stats: JSON.parse(JSON.stringify(stats)) }]);
    setStats((prev) => {
      const reseted: Record<number, Record<number, EstatisticasJogadora>> = {};
      Object.keys(prev).forEach((quarto) => {
        reseted[Number(quarto)] = {};
        Object.keys(prev[Number(quarto)]).forEach((id) => {
          reseted[Number(quarto)][Number(id)] = {
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
      });
      return reseted;
    });
    toast.success("Estatísticas zeradas com sucesso");
  };

  const handleSaveStats = async () => {
    if (!gameId) {
      toast.error("Salve o jogo antes de enviar as estatísticas!");
      return;
    }
    setSavingGame(true);
    try {
      for (const player of players) {
        const playerStats = stats[selectedQuarto][player.id];
        if (!playerStats) continue;
        await createEstatistica({
          jogadora_id: player.id,
          jogo_id: gameId,
          pontos: Number(playerStats.dois?.acertos || 0) * 2 + Number(playerStats.tres?.acertos || 0) * 3 + Number(playerStats.lance?.acertos || 0) as unknown as number,
          assistencias: playerStats.assistencias,
          rebotes: playerStats.rebotes,
          roubos: playerStats.roubos,
          faltas: playerStats.faltas,
          quarto: selectedQuarto,
          interferencia: playerStats.interferencia,
        });
      }
      toast.success("Estatísticas salvas com sucesso!");
    } catch (err) {
      toast.error("Erro ao salvar estatísticas");
    } finally {
      setSavingGame(false);
    }
  };

  // Retornar foco ao botão de adicionar jogador ao fechar modal
  const addPlayerBtnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!showModal && addPlayerBtnRef.current) {
      addPlayerBtnRef.current.focus();
    }
  }, [showModal]);

  // Função para adicionar jogadora existente
  function handleAddExistingPlayer(player: Player) {
    if (players.some((p) => p.id === player.id)) {
      toast.error("Jogadora já adicionada à partida");
      return;
    }
    setPlayers((prev) => [...prev, player]);
    // Inicializa stats para todos os quartos
    setStats((prev) => {
      const newStats = { ...prev };
      quartos.forEach((q) => {
        if (!newStats[q.value]) newStats[q.value] = {};
        newStats[q.value][player.id] = {
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
      return newStats;
    });
    setSearchTerm("");
    setSearchResults([]);
    toast.success("Jogadora adicionada à partida!");
  }

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
          <div className="md:col-span-1">
            <Label htmlFor="local">Local</Label>
            <Input
              id="local"
              name="local"
              value={gameForm.local}
              onChange={handleGameFormChange}
              placeholder="Local do jogo"
            />
          </div>
          <div className="md:col-span-1">
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

      {/* Dropdown de quarto */}
      {gameSaved && (
        <div className="flex items-center gap-4 mb-4">
          <Label htmlFor="quarto">Quarto</Label>
          <select
            id="quarto"
            name="quarto"
            value={selectedQuarto}
            onChange={e => setSelectedQuarto(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            {quartos.map(q => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Painel de Estatísticas */}
      {gameSaved && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Painel de Estatísticas</h2>
          {loadingPlayers || loadingStats ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
            </div>
          ) : players.length === 0 ? (
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
                {players.map((p) => {
                  const s = stats[selectedQuarto]?.[p.id] || {
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
                  const faltas = s.faltas || 0;
                  return (
                    <tr key={p.id}>
                      <td className="border px-2 py-1">{p.nome}</td>
                      <td className="border px-2 py-1">{p.numero}</td>
                      <td className="border px-2 py-1">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              className={`px-3 py-1.5 rounded font-bold transition-all duration-200 ${
                                pendingShot && pendingShot.playerId === p.id && pendingShot.tipo === 'dois'
                                  ? 'bg-blue-500 text-white scale-105 shadow-lg'
                                  : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                              }`}
                              onClick={() => handleShot(p.id, 'dois')}
                              type="button"
                              title="Clique para registrar tentativa de 2 pontos. Clique novamente em 3 segundos para marcar acerto."
                              aria-label={`Registrar arremesso de 2 pontos para ${p.nome}`}
                            >
                              2PT ({s.dois.tentativas}/{s.dois.acertos})
                            </button>
                            <button
                              className={`px-3 py-1.5 rounded font-bold transition-all duration-200 ${
                                pendingShot && pendingShot.playerId === p.id && pendingShot.tipo === 'tres'
                                  ? 'bg-green-500 text-white scale-105 shadow-lg'
                                  : 'bg-green-100 text-green-900 hover:bg-green-200'
                              }`}
                              onClick={() => handleShot(p.id, 'tres')}
                              type="button"
                              title="Clique para registrar tentativa de 3 pontos. Clique novamente em 3 segundos para marcar acerto."
                              aria-label={`Registrar arremesso de 3 pontos para ${p.nome}`}
                            >
                              3PT ({s.tres.tentativas}/{s.tres.acertos})
                            </button>
                            <button
                              className={`px-3 py-1.5 rounded font-bold transition-all duration-200 ${
                                pendingShot && pendingShot.playerId === p.id && pendingShot.tipo === 'lance'
                                  ? 'bg-yellow-500 text-white scale-105 shadow-lg'
                                  : 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200'
                              }`}
                              onClick={() => handleShot(p.id, 'lance')}
                              type="button"
                              title="Clique para registrar tentativa de lance livre. Clique novamente em 3 segundos para marcar acerto."
                              aria-label={`Registrar lance livre para ${p.nome}`}
                            >
                              LL ({s.lance.tentativas}/{s.lance.acertos})
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded font-bold transition-colors"
                              onClick={() => handleStatButton(p.id, 'assistencias', 1)}
                              type="button"
                              title="Adicionar assistência"
                              aria-label={`Adicionar assistência para ${p.nome}`}
                            >
                              +1
                            </button>
                            <span className="mx-2 font-medium">{s.assistencias}</span>
                            <button
                              className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded font-bold transition-colors"
                              onClick={() => handleStatButton(p.id, 'assistencias', -1)}
                              type="button"
                              title="Remover assistência"
                              aria-label={`Remover assistência de ${p.nome}`}
                            >
                              -1
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="px-3 py-1.5 bg-pink-100 hover:bg-pink-200 text-pink-900 rounded font-bold transition-colors"
                              onClick={() => handleStatButton(p.id, 'rebotes', 1)}
                              type="button"
                              title="Adicionar rebote"
                              aria-label={`Adicionar rebote para ${p.nome}`}
                            >
                              +1
                            </button>
                            <span className="mx-2 font-medium">{s.rebotes}</span>
                            <button
                              className="px-3 py-1.5 bg-pink-100 hover:bg-pink-200 text-pink-900 rounded font-bold transition-colors"
                              onClick={() => handleStatButton(p.id, 'rebotes', -1)}
                              type="button"
                              title="Remover rebote"
                              aria-label={`Remover rebote de ${p.nome}`}
                            >
                              -1
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded font-bold transition-colors"
                              onClick={() => handleStatButton(p.id, 'roubos', 1)}
                              type="button"
                              title="Adicionar roubo de bola"
                              aria-label={`Adicionar roubo de bola para ${p.nome}`}
                            >
                              +1
                            </button>
                            <span className="mx-2 font-medium">{s.roubos}</span>
                            <button
                              className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded font-bold transition-colors"
                              onClick={() => handleStatButton(p.id, 'roubos', -1)}
                              type="button"
                              title="Remover roubo de bola"
                              aria-label={`Remover roubo de bola de ${p.nome}`}
                            >
                              -1
                            </button>
                          </div>
                          <div className={`flex items-center gap-2 ${faltas === 3 ? 'bg-yellow-100' : ''} ${faltas >= 4 ? 'bg-red-100' : ''} p-1 rounded`}>
                            <button
                              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-900 rounded font-bold transition-colors"
                              onClick={() => handleStatButton(p.id, 'faltas', 1)}
                              type="button"
                              title="Adicionar falta"
                              aria-label={`Adicionar falta para ${p.nome}`}
                            >
                              +1
                            </button>
                            <span className="mx-2 font-medium">{faltas}</span>
                            <button
                              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-900 rounded font-bold transition-colors"
                              onClick={() => handleStatButton(p.id, 'faltas', -1)}
                              type="button"
                              title="Remover falta"
                              aria-label={`Remover falta de ${p.nome}`}
                            >
                              -1
                            </button>
                            {faltas === 3 && (
                              <span className="ml-2 text-yellow-700 font-bold flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                3 Faltas
                              </span>
                            )}
                            {faltas === 4 && (
                              <span className="ml-2 text-red-700 font-bold flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                4 Faltas
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded font-bold transition-colors"
                              onClick={() => handleStatButton(p.id, 'tocos', 1)}
                              type="button"
                              title="Adicionar toco"
                              aria-label={`Adicionar toco para ${p.nome}`}
                            >
                              Toco +1
                            </button>
                            <button
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded font-bold transition-colors"
                              onClick={() => handleStatButton(p.id, 'turnovers', 1)}
                              type="button"
                              title="Adicionar turnover"
                              aria-label={`Adicionar turnover para ${p.nome}`}
                            >
                              TO +1
                            </button>
                            <button
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded font-bold transition-colors"
                              onClick={() => handleStatButton(p.id, 'interferencia', 1)}
                              type="button"
                              title="Adicionar interferência"
                              aria-label={`Adicionar interferência para ${p.nome}`}
                            >
                              Interf +1
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
        {loadingPlayers ? (
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
          </div>
        ) : players.length === 0 ? (
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
          ref={addPlayerBtnRef}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg text-3xl z-50"
          onClick={() => setShowModal(true)}
          title="Adicionar Jogador"
          tabIndex={0}
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" tabIndex={-1} onKeyDown={(e) => { if (e.key === 'Escape') setShowModal(false); }}>
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowModal(false)}
              title="Fechar"
              type="button"
              tabIndex={0}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">Adicionar Jogador</h2>
            {/* Busca de jogadoras existentes */}
            <div className="mb-4">
              <Label htmlFor="busca-jogadora">Buscar jogadora existente</Label>
              <Input
                id="busca-jogadora"
                name="busca-jogadora"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Digite nome ou categoria"
                autoComplete="off"
              />
              {searchResults.length > 0 && (
                <ul className="bg-white border border-gray-200 rounded shadow mt-2 max-h-40 overflow-y-auto">
                  {searchResults.map((p) => (
                    <li
                      key={p.id}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                      onClick={() => handleAddExistingPlayer(p)}
                    >
                      {p.nome} <span className="text-xs text-gray-500">({p.categoria || 'Sem categoria'})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Formulário para nova jogadora */}
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={playerForm.nome}
                  onChange={handlePlayerFormChange}
                  placeholder="Nome do jogador"
                  ref={nomeInputRef}
                  tabIndex={0}
                  autoFocus
                  disabled={savingPlayer}
                  required
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
                  tabIndex={0}
                  disabled={savingPlayer}
                  required
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
                  tabIndex={0}
                  disabled={savingPlayer}
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <select
                  id="categoria"
                  name="categoria"
                  value={playerForm.categoria}
                  onChange={handlePlayerFormChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  tabIndex={0}
                  disabled={savingPlayer}
                  required
                >
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold mt-2 flex items-center justify-center disabled:opacity-50"
                disabled={savingPlayer}
                tabIndex={0}
              >
                {savingPlayer ? <span className="loader mr-2"></span> : null}
                {savingPlayer ? 'Adicionando...' : 'Adicionar Jogador'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Exibir cabeçalho não editável após salvar */}
      {gameSaved && (
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <div>
              <span className="font-bold">Adversário:</span> {gameForm.adversario}
            </div>
            <div>
              <span className="font-bold">Categoria:</span> {gameForm.categoria}
            </div>
            <div>
              <span className="font-bold">Data:</span> {gameForm.data}
            </div>
            <div>
              <span className="font-bold">Horário:</span> {gameForm.horario}
            </div>
            <div className="md:col-span-2">
              <span className="font-bold">Local:</span> {gameForm.local}
            </div>
            <div className="md:col-span-2">
              <span className="font-bold">Campeonato:</span> {gameForm.campeonato}
            </div>
            <div className="md:col-span-2">
              <span className="font-bold">Status:</span> {gameStatus === 'PENDENTE' ? 'Pendente' : gameStatus === 'EM_ANDAMENTO' ? 'Em andamento' : 'Partida Finalizada'}
            </div>
          </div>
          {gameStatus !== 'FINALIZADA' && (
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold shadow transition-colors mt-2"
              onClick={handleFinalizarPartida}
            >
              Finalizar Partida
            </button>
          )}
          {gameStatus === 'FINALIZADA' && (
            <div className="text-green-700 font-bold mt-2">Partida Finalizada</div>
          )}
        </Card>
      )}
    </div>
  );
};

// Loader CSS
// Adicione no topo do arquivo ou em um arquivo global de estilos:
// .loader { border: 2px solid #f3f3f3; border-top: 2px solid #2563eb; border-radius: 50%; width: 18px; height: 18px; animation: spin 1s linear infinite; }
// @keyframes spin { 100% { transform: rotate(360deg); } }

export default Painel; 