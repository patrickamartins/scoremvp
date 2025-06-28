import React, { useState, useEffect, useRef } from "react";
import { Card, Input, Label } from "../components/ui";
import { usePageTitle } from "../hooks/usePageTitle";
import { api, createGame, createGameStats, getPlayers, getGameStats, updateGame, createPlayer, getGames, getGame } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Game, GameStats } from "@/types/game";
import { Player } from "@/types/player";

interface Player {
  id: number;
  name: string;
  number: number;
  position: string;
  category?: string;
}

interface PlayerStatistics {
  two: { attempts: number; hits: number };
  three: { attempts: number; hits: number };
  freeThrow: { attempts: number; hits: number };
  rebounds: number;
  assists: number;
  fouls: number;
  blocks: number;
  turnovers: number;
  steals: number;
  interference: number;
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
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<GameStats[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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
  const [showModal, setShowModal] = useState(false);
  const [playerForm, setPlayerForm] = useState<Player & { categoria?: string }>({
    id: 0,
    name: "",
    number: 0,
    position: "",
    categoria: categorias[0],
  });
  const [formError, setFormError] = useState("");

  // Estatísticas por quarto
  const [statistics, setStatistics] = useState<Record<number, Record<number, PlayerStatistics>>>({});
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

  // Adicionar jogos pendentes ao montar o Painel
  const [pendingGames, setPendingGames] = useState<Game[]>([]);
  const [selectingDraft, setSelectingDraft] = useState(false);

  // Buscar todas as jogadoras do banco para autocomplete ao abrir modal
  useEffect(() => {
    if (showModal) {
      getPlayers().then((players) => {
        setAllPlayers(players.map((p: any) => ({
          ...p,
          position: p.position || '',
          categoria: p.categoria || categorias[0],
        })));
      });
    }
  }, [showModal]);

  // Corrigir filtro do autocomplete
  useEffect(() => {
    if (searchTerm.length === 0) {
      setSearchResults([]);
      return;
    }
    const term = searchTerm.toLowerCase();
    setSearchResults(
      allPlayers.filter(
        (p) =>
          (typeof p?.name === 'string' && p.name.toLowerCase().includes(term)) ||
          (typeof p?.categoria === 'string' && p.categoria.toLowerCase().includes(term))
      )
    );
  }, [searchTerm, allPlayers]);

  // Carregar estatísticas existentes quando um jogo é selecionado
  useEffect(() => {
    if (gameId) {
      setLoadingStats(true);
      getGameStats(gameId)
        .then((stats) => {
          const newStats = { ...statistics };
          stats.forEach((estatistica) => {
            const quarto = estatistica.quarter || 1;
            if (!newStats[quarto]) {
              newStats[quarto] = {};
            }
            newStats[quarto][estatistica.player_id] = {
              two: { attempts: 0, hits: 0 },
              three: { attempts: 0, hits: 0 },
              freeThrow: { attempts: 0, hits: 0 },
              rebounds: estatistica.rebounds,
              assists: estatistica.assists,
              fouls: estatistica.fouls,
              blocks: 0,
              turnovers: 0,
              steals: estatistica.steals,
              interference: estatistica.interference,
            };
          });
          setStatistics(newStats);
          setLoadingStats(false);
        })
        .catch((err) => {
          if (err?.response?.status === 404) {
            // Nenhuma estatística ainda, não é erro fatal
            setLoadingStats(false);
          } else {
            // Só logue outros erros
            toast({
              title: "Erro",
              description: "Não foi possível carregar as estatísticas",
              variant: "destructive",
            });
            setLoadingStats(false);
          }
        });
    }
  }, [gameId]);

  // Foco automático no campo nome ao abrir modal
  useEffect(() => {
    if (showModal && nomeInputRef.current) {
      nomeInputRef.current.focus();
    }
  }, [showModal]);

  // Buscar jogadores vinculados ao jogo ao selecionar rascunho ou abrir jogo salvo
  useEffect(() => {
    if (gameId) {
      setLoadingPlayers(true);
      getGame(gameId).then((game) => {
        // Garante que players é sempre um array
        setPlayers(Array.isArray(game.players) ? game.players : []);
      }).finally(() => setLoadingPlayers(false));
    }
  }, [gameId]);

  // Buscar jogos pendentes ao montar o Painel
  useEffect(() => {
    getGames().then((games) => {
      setPendingGames(games.filter(game => game.status === "PENDENTE"));
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesData, playersData] = await Promise.all([
          getGames(),
          getPlayers()
        ]);
        setGames(gamesData);
        setPlayers(playersData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    if (selectedGame) {
      getGameStats(selectedGame.id)
        .then(setStats)
        .catch(error => {
          console.error("Erro ao carregar estatísticas:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar as estatísticas",
            variant: "destructive",
          });
        });
    }
  }, [selectedGame, toast]);

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
    if (!playerForm.name.trim()) {
      setFormError("Nome é obrigatório");
      return;
    }

    setSavingPlayer(true);
    try {
      const newPlayer = await createPlayer({
        name: playerForm.name,
        number: playerForm.number,
        position: playerForm.position,
        category: playerForm.categoria,
      });

      setPlayers((prev) => [...prev, newPlayer]);
      setPlayerForm({
        id: 0,
        name: "",
        number: 0,
        position: "",
        categoria: categorias[0],
      });
      setFormError("");
      setShowModal(false);
      toast({
        title: "Sucesso",
        description: "Jogador adicionado com sucesso!",
      });
    } catch (err: any) {
      if (err?.response?.status === 503) {
        setFormError("Backend indisponível. Tente novamente em instantes.");
      } else if (err?.response?.data?.detail) {
        setFormError(err.response.data.detail);
      } else {
        setFormError("Erro ao adicionar jogador. Verifique sua conexão ou tente novamente.");
      }
    } finally {
      setSavingPlayer(false);
    }
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameForm.adversario.trim()) {
      setGameFormError("Adversário é obrigatório");
      return;
    }

    setSavingGame(true);
    try {
      const newGame = await createGame({
        opponent: gameForm.adversario,
        date: gameForm.data,
        time: gameForm.horario,
        location: gameForm.local,
        category: gameForm.categoria,
        status: "PENDENTE",
      });

      if (newGame && newGame.id) {
        setGameId(newGame.id);
        setGameSaved(true);
        setGameFormError("");  // Limpa qualquer erro anterior
        toast({
          title: "Sucesso",
          description: "Jogo salvo com sucesso!",
        });
      } else {
        throw new Error("Resposta inválida do servidor");
      }
    } catch (err: any) {
      setGameSaved(false);
      if (err?.response?.status === 503) {
        setGameFormError("Backend indisponível. Tente novamente em instantes.");
      } else if (err?.response?.data?.detail) {
        setGameFormError(err.response.data.detail);
      } else {
        setGameFormError("Erro ao salvar o jogo. Verifique sua conexão ou tente novamente.");
      }
      toast({
        title: "Erro",
        description: "Erro ao salvar o jogo",
        variant: "destructive",
      });
    } finally {
      setSavingGame(false);
    }
  };

  // Atualizar status para EM_ANDAMENTO ao iniciar estatísticas
  useEffect(() => {
    if (
      gameSaved &&
      gameStatus === 'PENDENTE' &&
      Object.values(statistics[selectedQuarto] || {}).some((s) => {
        const safe = s || {
          two: { attempts: 0, hits: 0 },
          three: { attempts: 0, hits: 0 },
          freeThrow: { attempts: 0, hits: 0 },
          rebounds: 0,
          assists: 0,
          fouls: 0,
          blocks: 0,
          turnovers: 0,
          steals: 0,
          interference: 0,
        };
        return (
          safe.two.attempts > 0 ||
          safe.three.attempts > 0 ||
          safe.freeThrow.attempts > 0 ||
          safe.rebounds > 0 ||
          safe.assists > 0 ||
          safe.fouls > 0 ||
          safe.blocks > 0 ||
          safe.turnovers > 0 ||
          safe.steals > 0 ||
          safe.interference > 0
        );
      })
    ) {
      setGameStatus('EM_ANDAMENTO');
    }
  }, [statistics, gameSaved, gameStatus, selectedQuarto]);

  // Função para finalizar partida
  const handleFinalizarPartida = async () => {
    if (!gameId) return;
    try {
      await updateGame(gameId, { status: 'FINALIZADA' });
      setGameStatus('FINALIZADA');
      toast({
        title: "Sucesso",
        description: "Partida finalizada!",
      });
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao finalizar partida.",
        variant: "destructive",
      });
    }
  };

  function handleShot(playerId: number, tipo: 'dois' | 'tres' | 'lance') {
    const tipoMap = {
      dois: 'two',
      tres: 'three',
      lance: 'freeThrow',
    } as const;
    const field = tipoMap[tipo];
    setHistory(prev => [...prev, { stats: JSON.parse(JSON.stringify(statistics)) }]);

    // Se já existe um pendingShot para esse jogador e tipo, registrar acerto
    if (pendingShot && pendingShot.playerId === playerId && pendingShot.tipo === tipo) {
      clearTimeout(pendingShot.timeout!);
      setStatistics((prev) => {
        const quartoStats = { ...prev[selectedQuarto] };
        const playerStats = {
          two: { attempts: 0, hits: 0 },
          three: { attempts: 0, hits: 0 },
          freeThrow: { attempts: 0, hits: 0 },
          rebounds: 0,
          assists: 0,
          fouls: 0,
          blocks: 0,
          turnovers: 0,
          steals: 0,
          interference: 0,
          ...quartoStats[playerId],
        };
        return {
          ...prev,
          [selectedQuarto]: {
            ...quartoStats,
            [playerId]: {
              ...playerStats,
              [field]: {
                attempts: (playerStats[field]?.attempts ?? 0) + 1,
                hits: (playerStats[field]?.hits ?? 0) + 1,
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
      setStatistics((prev) => {
        const quartoStats = { ...prev[selectedQuarto] };
        const playerStats = {
          two: { attempts: 0, hits: 0 },
          three: { attempts: 0, hits: 0 },
          freeThrow: { attempts: 0, hits: 0 },
          rebounds: 0,
          assists: 0,
          fouls: 0,
          blocks: 0,
          turnovers: 0,
          steals: 0,
          interference: 0,
          ...quartoStats[playerId],
        };
        return {
          ...prev,
          [selectedQuarto]: {
            ...quartoStats,
            [playerId]: {
              ...playerStats,
              [field]: {
                attempts: (playerStats[field]?.attempts ?? 0) + 1,
                hits: playerStats[field]?.hits ?? 0,
              },
            },
          },
        };
      });
      setPendingShot(null);
    }, 3000);
    setPendingShot({ playerId, tipo, timeout });
  }

  function handleStatButton(playerId: number, stat: keyof PlayerStatistics, delta: number) {
    setHistory(prev => [...prev, { stats: JSON.parse(JSON.stringify(statistics)) }]);

    setStatistics((prev) => {
      const quartoStats = { ...prev[selectedQuarto] };
      const playerStats = {
        two: { attempts: 0, hits: 0 },
        three: { attempts: 0, hits: 0 },
        freeThrow: { attempts: 0, hits: 0 },
        rebounds: 0,
        assists: 0,
        fouls: 0,
        blocks: 0,
        turnovers: 0,
        steals: 0,
        interference: 0,
        ...quartoStats[playerId],
      };
      // Só incrementa/decrementa se for campo numérico
      const isNumberField = [
        'rebounds', 'assists', 'fouls', 'blocks', 'turnovers', 'steals', 'interference'
      ].includes(stat);

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
      toast({
        title: "Erro",
        description: "Não há ações para desfazer",
        variant: "destructive",
      });
      return;
    }
    const last = history[history.length - 1];
    setStatistics((prev) => ({
      ...prev,
      [selectedQuarto]: last.stats[selectedQuarto],
    }));
    setHistory((prev) => prev.slice(0, -1));
    toast({
      title: "Sucesso",
      description: "Ação desfeita com sucesso",
    });
  };

  const handleReset = () => {
    if (
      Object.values(statistics[selectedQuarto] || {}).every((s) => {
        const safe = s || {
          two: { attempts: 0, hits: 0 },
          three: { attempts: 0, hits: 0 },
          freeThrow: { attempts: 0, hits: 0 },
          rebounds: 0,
          assists: 0,
          fouls: 0,
          blocks: 0,
          turnovers: 0,
          steals: 0,
          interference: 0,
        };
        return (
          safe.two.attempts === 0 &&
          safe.three.attempts === 0 &&
          safe.freeThrow.attempts === 0 &&
          safe.rebounds === 0 &&
          safe.assists === 0 &&
          safe.fouls === 0 &&
          safe.blocks === 0 &&
          safe.turnovers === 0 &&
          safe.steals === 0 &&
          safe.interference === 0
        );
      })
    ) {
      toast({
        title: "Erro",
        description: "Não há estatísticas para zerar",
        variant: "destructive",
      });
      return;
    }

    setHistory((prev) => [...prev, { stats: JSON.parse(JSON.stringify(statistics)) }]);
    setStatistics((prev) => {
      const reseted: Record<number, Record<number, PlayerStatistics>> = {};
      Object.keys(prev).forEach((quarto) => {
        reseted[Number(quarto)] = {};
        Object.keys(prev[Number(quarto)]).forEach((id) => {
          reseted[Number(quarto)][Number(id)] = {
            two: { attempts: 0, hits: 0 },
            three: { attempts: 0, hits: 0 },
            freeThrow: { attempts: 0, hits: 0 },
            rebounds: 0,
            assists: 0,
            fouls: 0,
            blocks: 0,
            turnovers: 0,
            steals: 0,
            interference: 0,
          };
        });
      });
      return reseted;
    });
    toast({
      title: "Sucesso",
      description: "Estatísticas zeradas com sucesso",
    });
  };

  const handleSaveStats = async () => {
    if (!gameId) {
      toast({
        title: "Erro",
        description: "Salve o jogo antes de enviar as estatísticas!",
        variant: "destructive",
      });
      return;
    }

    try {
      const statsToSave = Object.entries(statistics[selectedQuarto] || {}).map(([playerId, stats]) => ({
        game_id: gameId,
        player_id: parseInt(playerId),
        points: (stats.two.hits * 2) + (stats.three.hits * 3) + stats.freeThrow.hits,
        rebounds: stats.rebounds,
        assists: stats.assists,
        steals: stats.steals,
        blocks: stats.blocks,
        fouls: stats.fouls,
        quarter: selectedQuarto,
        two_attempts: stats.two.attempts,
        two_made: stats.two.hits,
        three_attempts: stats.three.attempts,
        three_made: stats.three.hits,
        free_throw_attempts: stats.freeThrow.attempts,
        free_throw_made: stats.freeThrow.hits,
        interference: stats.interference,
      }));

      for (const stat of statsToSave) {
        await createGameStats(gameId, stat);
      }
      toast({
        title: "Sucesso",
        description: "Estatísticas salvas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar estatísticas",
        variant: "destructive",
      });
    }
  };

  // Retornar foco ao botão de adicionar jogador ao fechar modal
  const addPlayerBtnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!showModal && addPlayerBtnRef.current) {
      addPlayerBtnRef.current.focus();
    }
  }, [showModal]);

  // Função para adicionar jogadora existente ao jogo atual e backend
  async function handleAddExistingPlayer(player: Player) {
    if (players.some((p) => p.id === player.id)) {
      toast({
        title: "Erro",
        description: "Jogadora já adicionada à partida",
        variant: "destructive",
      });
      return;
    }

    if (!gameId) {
      toast({
        title: "Erro",
        description: "Salve o jogo antes de adicionar jogadoras!",
        variant: "destructive",
      });
      return;
    }

    try {
      // Vincular jogador ao jogo
      const updatedGame = await api.put(`/games/${gameId}`, {
        players: [...players.map(p => p.id), player.id]
      });

      if (updatedGame.data) {
        setPlayers((prev) => [...prev, player]);
        setSearchTerm("");
        setSearchResults([]);
        toast({
          title: "Sucesso",
          description: "Jogadora adicionada à partida!",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao vincular jogadora ao jogo!",
        variant: "destructive",
      });
    }
  }

  // Função para selecionar um rascunho e preencher o formulário
  function handleSelectDraft(game: Game) {
    setSelectedGame(game);
    setGameId(game.id);
    setGameSaved(true);
    setGameStatus(game.status as 'PENDENTE' | 'EM_ANDAMENTO' | 'FINALIZADA');
    setSelectingDraft(false);

    // Carregar jogadores do rascunho
    if (game.players && Array.isArray(game.players)) {
      setPlayers(game.players);
    } else {
      toast({
        title: "Erro",
        description: "Erro ao carregar jogadores do rascunho",
        variant: "destructive",
      });
    }
  }

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(games.find(g => g.id === parseInt(gameId)) || null);
  };

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayer(players.find(p => p.id === parseInt(playerId)) || null);
  };

  const handleCreateStats = async () => {
    if (!selectedGame || !selectedPlayer) {
      toast({
        title: "Erro",
        description: "Selecione um jogo e um jogador",
        variant: "destructive",
      });
      return;
    }

    try {
      await createGameStats(selectedGame.id, [{
        game_id: selectedGame.id,
        player_id: selectedPlayer.id,
        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        fouls: 0,
        quarter: 1,
      }]);
      toast({
        title: "Sucesso",
        description: "Estatísticas criadas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar estatísticas",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
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
                  <th className="border px-2 py-1">Tocos</th>
                  <th className="border px-2 py-1">TO</th>
                  <th className="border px-2 py-1">Interf</th>
                  <th className="border px-2 py-1">Ações</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => {
                  const s = (statistics[selectedQuarto] && statistics[selectedQuarto][p.id]) ? statistics[selectedQuarto][p.id] : {
                    two: { attempts: 0, hits: 0 },
                    three: { attempts: 0, hits: 0 },
                    freeThrow: { attempts: 0, hits: 0 },
                    rebounds: 0,
                    assists: 0,
                    fouls: 0,
                    blocks: 0,
                    turnovers: 0,
                    steals: 0,
                    interference: 0,
                  };
                  const fouls = s.fouls || 0;
                  return (
                    <tr key={p.id}>
                      <td className="border px-2 py-1">{p.name}</td>
                      <td className="border px-2 py-1">{p.number}</td>
                      <td className="border px-2 py-1">
                        <div className="flex flex-col gap-2">
                          <button
                            className={`px-3 py-1.5 rounded font-bold transition-all duration-200 ${
                              pendingShot && pendingShot.playerId === p.id && pendingShot.tipo === 'dois'
                                ? 'bg-blue-500 text-white scale-105 shadow-lg'
                                : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                            }`}
                            onClick={() => handleShot(p.id, 'dois')}
                            type="button"
                            title="Registrar tentativa/acerto de 2 pontos"
                            aria-label={`Registrar arremesso de 2 pontos para ${p.name}`}
                          >
                            2PT ({(s.two?.attempts ?? 0)}/{(s.two?.hits ?? 0)})
                          </button>
                          <button
                            className={`px-3 py-1.5 rounded font-bold transition-all duration-200 ${
                              pendingShot && pendingShot.playerId === p.id && pendingShot.tipo === 'tres'
                                ? 'bg-green-500 text-white scale-105 shadow-lg'
                                : 'bg-green-100 text-green-900 hover:bg-green-200'
                            }`}
                            onClick={() => handleShot(p.id, 'tres')}
                            type="button"
                            title="Registrar tentativa/acerto de 3 pontos"
                            aria-label={`Registrar arremesso de 3 pontos para ${p.name}`}
                          >
                            3PT ({(s.three?.attempts ?? 0)}/{(s.three?.hits ?? 0)})
                          </button>
                          <button
                            className={`px-3 py-1.5 rounded font-bold transition-all duration-200 ${
                              pendingShot && pendingShot.playerId === p.id && pendingShot.tipo === 'lance'
                                ? 'bg-yellow-500 text-white scale-105 shadow-lg'
                                : 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200'
                            }`}
                            onClick={() => handleShot(p.id, 'lance')}
                            type="button"
                            title="Registrar tentativa/acerto de lance livre"
                            aria-label={`Registrar lance livre para ${p.name}`}
                          >
                            LL ({(s.freeThrow?.attempts ?? 0)}/{(s.freeThrow?.hits ?? 0)})
                          </button>
                        </div>
                      </td>
                      <td className="border px-2 py-1">
                        <div className="flex items-center gap-2 justify-center">
                          <button className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded font-bold" onClick={() => handleStatButton(p.id, 'assists', 1)} type="button">+1</button>
                          <span>{s.assists}</span>
                          <button className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded font-bold" onClick={() => handleStatButton(p.id, 'assists', -1)} type="button">-1</button>
                        </div>
                      </td>
                      <td className="border px-2 py-1">
                        <div className="flex items-center gap-2 justify-center">
                          <button className="px-2 py-1 bg-pink-100 hover:bg-pink-200 text-pink-900 rounded font-bold" onClick={() => handleStatButton(p.id, 'rebounds', 1)} type="button">+1</button>
                          <span>{s.rebounds}</span>
                          <button className="px-2 py-1 bg-pink-100 hover:bg-pink-200 text-pink-900 rounded font-bold" onClick={() => handleStatButton(p.id, 'rebounds', -1)} type="button">-1</button>
                        </div>
                      </td>
                      <td className="border px-2 py-1">
                        <div className="flex items-center gap-2 justify-center">
                          <button className="px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded font-bold" onClick={() => handleStatButton(p.id, 'steals', 1)} type="button">+1</button>
                          <span>{s.steals}</span>
                          <button className="px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded font-bold" onClick={() => handleStatButton(p.id, 'steals', -1)} type="button">-1</button>
                        </div>
                      </td>
                      <td className="border px-2 py-1">
                        <div className={`flex items-center gap-2 justify-center ${fouls === 3 ? 'bg-yellow-100' : ''} ${fouls >= 4 ? 'bg-red-100' : ''} p-1 rounded`}>
                          <button className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded font-bold" onClick={() => handleStatButton(p.id, 'fouls', 1)} type="button">+1</button>
                          <span>{fouls}</span>
                          <button className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded font-bold" onClick={() => handleStatButton(p.id, 'fouls', -1)} type="button">-1</button>
                          {fouls === 3 && (<span className="ml-2 text-yellow-700 font-bold">3 Faltas</span>)}
                          {fouls === 4 && (<span className="ml-2 text-red-700 font-bold">4 Faltas</span>)}
                        </div>
                      </td>
                      <td className="border px-2 py-1">
                        <div className="flex items-center gap-2 justify-center">
                          <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded font-bold" onClick={() => handleStatButton(p.id, 'blocks', 1)} type="button">+1</button>
                          <span>{s.blocks}</span>
                          <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded font-bold" onClick={() => handleStatButton(p.id, 'blocks', -1)} type="button">-1</button>
                        </div>
                      </td>
                      <td className="border px-2 py-1">
                        <div className="flex items-center gap-2 justify-center">
                          <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded font-bold" onClick={() => handleStatButton(p.id, 'turnovers', 1)} type="button">+1</button>
                          <span>{s.turnovers}</span>
                          <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded font-bold" onClick={() => handleStatButton(p.id, 'turnovers', -1)} type="button">-1</button>
                        </div>
                      </td>
                      <td className="border px-2 py-1">
                        <div className="flex items-center gap-2 justify-center">
                          <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded font-bold" onClick={() => handleStatButton(p.id, 'interference', 1)} type="button">+1</button>
                          <span>{s.interference}</span>
                          <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded font-bold" onClick={() => handleStatButton(p.id, 'interference', -1)} type="button">-1</button>
                        </div>
                      </td>
                      <td className="border px-2 py-1 text-center">-</td>
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
                      {p.name} <span className="text-xs text-gray-500">({p.categoria || 'Sem categoria'})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Formulário para nova jogadora */}
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={playerForm.name}
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
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  name="number"
                  value={playerForm.number}
                  onChange={handlePlayerFormChange}
                  placeholder="Número"
                  type="number"
                  tabIndex={0}
                  disabled={savingPlayer}
                  required
                />
              </div>
              <div>
                <Label htmlFor="position">Posição</Label>
                <Input
                  id="position"
                  name="position"
                  value={playerForm.position}
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

      {/* Exibir jogos pendentes (rascunhos) */}
      {pendingGames.length > 0 && !gameSaved && !gameId && (
        <div className="mb-6">
          <div className="font-semibold mb-2">Você possui jogos em rascunho:</div>
          <ul className="space-y-2">
            {pendingGames.map((game) => (
              <li key={game.id} className="flex items-center gap-2">
                <span>{game.opponent} - {game.date?.slice(0, 10)} - {game.categoria}</span>
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleSelectDraft(game)}
                >
                  Continuar preenchimento
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Adicionar Estatísticas */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Adicionar Estatísticas</h2>
        <Button onClick={handleCreateStats} disabled={!selectedGame || !selectedPlayer}>
          Adicionar Estatísticas
        </Button>
      </Card>

      {/* Lista de Estatísticas */}
      {selectedGame && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Estatísticas do Jogo</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jogador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pontos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rebotes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assistências
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.map((stat) => (
                  <tr key={stat.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {players.find(p => p.id === stat.player_id)?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{stat.points}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{stat.rebounds}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{stat.assists}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/games/${selectedGame.id}/stats/${stat.id}`)}
                      >
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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