import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card, Input, Label } from "../components/ui";
import { usePageTitle } from "../hooks/usePageTitle";
import { api, createGame, createGameStats, getPlayers, getGameStats, updateGame, createPlayer, getGames, getGame, updateScoreboard } from "../services/api";
import { Button } from '../components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Game, GameStats } from "../types/game";
import { Player } from "../types/player";
import { Trash2, RefreshCw } from 'lucide-react';
import { BoxScoreTable } from '../components/BoxScoreTable';
import { GameScoreboard } from '../components/GameScoreboard';
import { SubstitutionModal } from '../components/SubstitutionModal';

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

const categorias = [
  'Sub-10', 'Sub-12', 'Sub-13', 'Sub-14', 'Sub-15', 'Sub-17', 'Sub-19', 'Sub-23', 'Adulto'
];

const quartos = [
  { value: 1, label: '1º Quarto' },
  { value: 2, label: '2º Quarto' },
  { value: 3, label: '3º Quarto' },
  { value: 4, label: '4º Quarto' },
  { value: 5, label: 'Prorrogação' },
];

const horarios = Array.from({length: 24 * 2}, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

const brandButtonStyle: React.CSSProperties = {
  backgroundColor: '#AC7F5E',
  color: '#FFFFFF',
};

const disabledButtonStyle: React.CSSProperties = {
  backgroundColor: '#D1D5DB',
  color: '#4B5563',
};

const getButtonStyle = (disabled: boolean) =>
  disabled ? disabledButtonStyle : brandButtonStyle;

const brandButtonClass = "rounded text-xs font-semibold px-1 py-0.5 transition-colors hover:opacity-90 disabled:opacity-50";
const brandButtonClassLarge = "rounded text-xs font-semibold px-2 py-1 transition-colors hover:opacity-90 disabled:opacity-50";

// Objeto inicial de estatísticas (definido fora do componente para evitar problemas de dependências)
const initialPlayerStats: PlayerStatistics & { rebo_ofensivo?: number; rebo_defensivo?: number; fr?: number } = {
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
  rebo_ofensivo: 0,
  rebo_defensivo: 0,
  fr: 0,
};

const Painel: React.FC = () => {
  usePageTitle("Painel");
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<GameStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    title: "",
    description: "",
    variant: "default",
  });

  // Formulário do jogo
  const initialGameForm = {
    adversario: "",
    data: "",
    horario: "",
    local: "",
    category: categorias[0],
    campeonato: "",
  };
  const [gameForm, setGameForm] = useState(() => initialGameForm);
  const [gameFormError, setGameFormError] = useState("");
  const [gameSaved, setGameSaved] = useState(false);
  const [gameId, setGameId] = useState<number | null>(null);
  const [savingGame, setSavingGame] = useState(false);

  // Novo: controle de quarto
  const [selectedQuarto, setSelectedQuarto] = useState(1);

  // Jogadores
  const [showModal, setShowModal] = useState(false);
  const [playerForm, setPlayerForm] = useState<Player & { category?: string }>({
    id: 0,
    name: "",
    number: 0,
    position: "",
    category: categorias[0],
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
  const [finishingGame, setFinishingGame] = useState(false);

  // Adicionar status da partida
  const [gameStatus, setGameStatus] = useState<'PENDENTE' | 'EM_ANDAMENTO' | 'FINALIZADA'>('PENDENTE');

  // Adicionar no início do componente:
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Player[]>([]);

  // Adicionar jogos pendentes ao montar o Painel
  const [pendingGames, setPendingGames] = useState<Game[]>([]);
  const [selectingDraft, setSelectingDraft] = useState(false);

  // Estados para modais
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveModalSuccess, setSaveModalSuccess] = useState(false);
  const [saveModalMessage, setSaveModalMessage] = useState("");
  const [showBoxScoreModal, setShowBoxScoreModal] = useState(false);
  const [savingStats, setSavingStats] = useState(false);

  // Estados para o placar
  const [awayScore, setAwayScore] = useState(0);
  const [publicLink, setPublicLink] = useState<string | null>(null);
  const [timerTime, setTimerTime] = useState(720); // 12 minutos em segundos

  // Estados para controle de jogadores em quadra e tempo de jogo
  const [playersOnCourt, setPlayersOnCourt] = useState<number[]>([]); // Array ordenado ao invés de Set
  const [playerMinutes, setPlayerMinutes] = useState<Record<number, Record<number, number>>>({});
  const [lastTickTime, setLastTickTime] = useState<number>(Date.now());
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [playerToSubstitute, setPlayerToSubstitute] = useState<{ player: Player; index: number } | null>(null);

  // Buscar todas as jogadoras do banco para autocomplete ao abrir modal
  useEffect(() => {
    if (showModal) {
      getPlayers().then((players) => {
        setAllPlayers(players.map((p: any) => ({
          ...p,
          position: p.position || '',
          category: p.category || categorias[0],
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
          (typeof p?.category === 'string' && p.category.toLowerCase().includes(term))
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
              two: { attempts: estatistica.two_attempts || 0, hits: estatistica.two_made || 0 },
              three: { attempts: estatistica.three_attempts || 0, hits: estatistica.three_made || 0 },
              freeThrow: { attempts: estatistica.free_throw_attempts || 0, hits: estatistica.free_throw_made || 0 },
              rebounds: estatistica.rebounds,
              assists: estatistica.assists,
              fouls: estatistica.fouls,
              blocks: estatistica.blocks || 0,
              turnovers: estatistica.turnovers || 0,
              steals: estatistica.steals || 0,
              interference: estatistica.interference || 0,
              rebo_ofensivo: estatistica.rebo_ofensivo || 0,
              rebo_defensivo: estatistica.rebo_defensivo || 0,
              fr: estatistica.fr || 0,
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
            setToast({
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
        setToast({
          title: "Erro",
          description: "Não foi possível carregar os dados",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setToast]);

  useEffect(() => {
    if (selectedGame) {
      getGameStats(selectedGame.id)
        .then(setStats)
        .catch(error => {
          console.error("Erro ao carregar estatísticas:", error);
          setToast({
            title: "Erro",
            description: "Não foi possível carregar as estatísticas",
            variant: "destructive",
          });
        });
    }
  }, [selectedGame, setToast]);

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
        category: playerForm.category,
      });

      setPlayers((prev) => [...prev, newPlayer]);
      setPlayerForm({
        id: 0,
        name: "",
        number: 0,
        position: "",
        category: categorias[0],
      });
      setFormError("");
      setShowModal(false);
      setToast({
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
        date: `${gameForm.data}T${gameForm.horario || '00:00'}`,
        time: gameForm.horario,
        location: gameForm.local,
        category: gameForm.category,
        status: "PENDENTE",
      });
      if (newGame && newGame.id) {
        setGameId(newGame.id);
        setGameSaved(true);
        setPublicLink(newGame.public_link || null);
        setGameFormError("");  // Limpa qualquer erro anterior
        setToast({
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
        const detail = err.response.data.detail;
        setGameFormError(
          typeof detail === 'string'
            ? detail
            : Array.isArray(detail)
              ? detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ')
              : JSON.stringify(detail)
        );
      } else {
        setGameFormError("Erro ao salvar o jogo. Verifique sua conexão ou tente novamente.");
      }
      setToast({
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
    if (!gameId || finishingGame) return;
    setFinishingGame(true);
    try {
      // Salvar todas as estatísticas pendentes
      const saved = await persistAllUnsavedStats();
      if (!saved) {
        throw new Error("Falha ao salvar estatísticas antes de encerrar.");
      }
      
      // Atualizar status do jogo
      await updateGame(gameId, { status: 'FINALIZADA' });
      
      setToast({
        title: "Sucesso",
        description: "Partida finalizada e estatísticas salvas!",
      });

      // Resetar apenas o necessário, mantendo dados para possível visualização
      setGameId(null);
      setGameSaved(false);
      setGameForm({ ...initialGameForm });
      setStatistics({});
      setPlayers([]);
      setSelectedGame(null);
      setSelectedPlayer(null);
      setSelectedQuarto(1);
      setGameStatus('PENDENTE');
      setPendingShot(null);
      setStats([]);
      setHistory([]);
      setGameFormError("");
      setSelectingDraft(false);
      setLoadingPlayers(false);
      setLoadingStats(false);

      // Recarregar dados
      const refreshedGames = await getGames();
      setGames(refreshedGames);
      setPendingGames(refreshedGames.filter((game) => game.status === "PENDENTE"));
      const refreshedPlayers = await getPlayers();
      setPlayers(refreshedPlayers);
      setAllPlayers(refreshedPlayers);
    } catch (error) {
      setToast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao finalizar partida.",
        variant: "destructive",
      });
    } finally {
      setFinishingGame(false);
    }
  };

  // Função para remover jogador da partida
  const handleRemovePlayerFromGame = async (playerId: number) => {
    if (!gameId || !window.confirm('Tem certeza que deseja remover este jogador da partida?')) {
      return;
    }

    try {
      const game = await getGame(gameId);
      const updatedPlayers = game.players
        .filter((p: Player) => p.id !== playerId)
        .map((p: Player) => p.id);
      
      await updateGame(gameId, { players: updatedPlayers });
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
      setToast({
        title: "Sucesso",
        description: "Jogador removido da partida!",
      });
    } catch (error) {
      setToast({
        title: "Erro",
        description: "Erro ao remover jogador da partida.",
        variant: "destructive",
      });
    }
  };

  // Função para carregar preview do boxscore
  const handleShowBoxScore = async () => {
    if (!gameId) return;
    try {
      // Recarregar estatísticas do banco para garantir dados atualizados
      const currentStats = await getGameStats(gameId);
      setStats(currentStats);
      setShowBoxScoreModal(true);
    } catch (error) {
      setToast({
        title: "Erro",
        description: "Erro ao carregar boxscore",
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
    }, 3000); // 3 segundos exatos
    setPendingShot({ playerId, tipo, timeout });
  }

  function handleStatButton(playerId: number, stat: keyof PlayerStatistics | 'rebo_ofensivo' | 'rebo_defensivo' | 'fr', delta: number) {
    setHistory(prev => [...prev, { stats: JSON.parse(JSON.stringify(statistics)) }]);

    setStatistics((prev) => {
      const quartoStats = { ...prev[selectedQuarto] };
      const playerStats = {
        ...initialPlayerStats,
        ...quartoStats[playerId],
      };
      // Permitir atualização dos campos extras
      if ([
        'rebounds', 'assists', 'fouls', 'blocks', 'turnovers', 'steals', 'interference',
        'rebo_ofensivo', 'rebo_defensivo', 'fr'
      ].includes(stat)) {
        return {
          ...prev,
          [selectedQuarto]: {
            ...quartoStats,
            [playerId]: {
              ...playerStats,
              [stat]: Math.max(0, Number(playerStats[stat] || 0) + delta),
            },
          },
        };
      }
      // fallback para outros campos
      return prev;
    });
  }

  // Remover funções handleUndo e handleReset e os botões correspondentes do painel de estatísticas.

  // Função utilitária para checar se há alguma estatística diferente de zero em um quarto
  function hasStatsToSaveForQuarter(quarto: number) {
    const statsQ = statistics[quarto] || {};
    return Object.values(statsQ).some((s: any) => {
      if (!s) return false;
      return (
        (s.two?.attempts ?? 0) > 0 || (s.two?.hits ?? 0) > 0 ||
        (s.three?.attempts ?? 0) > 0 || (s.three?.hits ?? 0) > 0 ||
        (s.freeThrow?.attempts ?? 0) > 0 || (s.freeThrow?.hits ?? 0) > 0 ||
        (s.rebo_ofensivo ?? 0) > 0 || (s.rebo_defensivo ?? 0) > 0 ||
        (s.rebounds ?? 0) > 0 || (s.assists ?? 0) > 0 || (s.fouls ?? 0) > 0 ||
        (s.blocks ?? 0) > 0 || (s.turnovers ?? 0) > 0 || (s.steals ?? 0) > 0 ||
        (s.interference ?? 0) > 0 || (s.fr ?? 0) > 0
      );
    });
  }

  function hasStatsToSave() {
    return hasStatsToSaveForQuarter(selectedQuarto);
  }

  const handleSaveStats = useCallback(async (
    quarto: number = selectedQuarto,
    { showToast = true, resetAfter = false }: { showToast?: boolean; resetAfter?: boolean } = {},
  ) => {
    if (!gameId) {
      if (showToast) {
        setSaveModalSuccess(false);
        setSaveModalMessage("Salve o jogo antes de enviar as estatísticas!");
        setShowSaveModal(true);
      }
      return false;
    }

    if (!hasStatsToSaveForQuarter(quarto)) {
      if (showToast) {
        setSaveModalSuccess(true);
        setSaveModalMessage("Nenhuma estatística para salvar neste quarto.");
        setShowSaveModal(true);
      }
      return true;
    }

    setSavingStats(true);
    try {
      const statsToSave = Object.entries(statistics[quarto] || {}).map(([playerId, stats]) => {
        const pid = parseInt(playerId);
        const minutesPlayed = (playerMinutes[quarto]?.[pid] || 0) / 60; // Converter segundos para minutos
        
        return {
          game_id: gameId,
          player_id: pid,
          points: (stats.two.hits * 2) + (stats.three.hits * 3) + stats.freeThrow.hits,
          rebounds: (stats.rebo_ofensivo || 0) + (stats.rebo_defensivo || 0),
          assists: stats.assists,
          steals: stats.steals,
          blocks: stats.blocks,
          fp: stats.fouls, // falta pessoal
          fouls: stats.fouls, // total de faltas (mesmo valor de fp por enquanto)
          quarter: quarto,
          two_attempts: stats.two.attempts,
          two_made: stats.two.hits,
          three_attempts: stats.three.attempts,
          three_made: stats.three.hits,
          free_throw_attempts: stats.freeThrow.attempts,
          free_throw_made: stats.freeThrow.hits,
          interference: stats.interference,
          rebo_ofensivo: stats.rebo_ofensivo || 0,
          rebo_defensivo: stats.rebo_defensivo || 0,
          fr: stats.fr || 0,
          turnovers: stats.turnovers || 0,
          minutes_played: parseFloat(minutesPlayed.toFixed(2)), // Arredondar para 2 casas decimais
        };
      });

      for (const stat of statsToSave) {
        await createGameStats(gameId, stat);
      }
      
      // Recarregar estatísticas do banco e MESCLAR com o estado atual (não sobrescrever)
      const savedStats = await getGameStats(gameId);
      const mergedStats = { ...statistics };
      savedStats.forEach((estatistica) => {
        const q = estatistica.quarter || 1;
        if (!mergedStats[q]) {
          mergedStats[q] = {};
        }
        const prevPlayerQStats = mergedStats[q][estatistica.player_id] || initialPlayerStats;
        mergedStats[q][estatistica.player_id] = {
          ...prevPlayerQStats,
          two: {
            attempts: estatistica.two_attempts ?? prevPlayerQStats.two.attempts ?? 0,
            hits: estatistica.two_made ?? prevPlayerQStats.two.hits ?? 0,
          },
          three: {
            attempts: estatistica.three_attempts ?? prevPlayerQStats.three.attempts ?? 0,
            hits: estatistica.three_made ?? prevPlayerQStats.three.hits ?? 0,
          },
          freeThrow: {
            attempts: estatistica.free_throw_attempts ?? prevPlayerQStats.freeThrow.attempts ?? 0,
            hits: estatistica.free_throw_made ?? prevPlayerQStats.freeThrow.hits ?? 0,
          },
          rebounds: estatistica.rebounds ?? prevPlayerQStats.rebounds ?? 0,
          assists: estatistica.assists ?? prevPlayerQStats.assists ?? 0,
          fouls: estatistica.fouls ?? prevPlayerQStats.fouls ?? 0,
          blocks: estatistica.blocks ?? prevPlayerQStats.blocks ?? 0,
          turnovers: estatistica.turnovers ?? prevPlayerQStats.turnovers ?? 0,
          steals: estatistica.steals ?? prevPlayerQStats.steals ?? 0,
          interference: estatistica.interference ?? prevPlayerQStats.interference ?? 0,
          rebo_ofensivo: estatistica.rebo_ofensivo ?? prevPlayerQStats.rebo_ofensivo ?? 0,
          rebo_defensivo: estatistica.rebo_defensivo ?? prevPlayerQStats.rebo_defensivo ?? 0,
          fr: estatistica.fr ?? prevPlayerQStats.fr ?? 0,
        }
      });
      setStatistics(mergedStats);

      if (showToast) {
        setSaveModalSuccess(true);
        setSaveModalMessage("Estatísticas salvas com sucesso!");
        setShowSaveModal(true);
      }
      if (resetAfter) {
        setStatistics((prev) => {
          const newStats = { ...prev };
          newStats[quarto] = {};
          return { ...newStats };
        });
      }
      return true;
    } catch (error) {
      if (showToast) {
        setSaveModalSuccess(false);
        setSaveModalMessage("Erro ao salvar estatísticas. Tente novamente.");
        setShowSaveModal(true);
      }
      return false;
    } finally {
      setSavingStats(false);
    }
  }, [gameId, statistics, playerMinutes, selectedQuarto, hasStatsToSaveForQuarter]);

  const persistAllUnsavedStats = async (): Promise<boolean> => {
    if (!gameId) return false;
    let allSaved = true;
    const quarterKeys = Object.keys(statistics)
      .map((key) => parseInt(key, 10))
      .filter((quarto) => !Number.isNaN(quarto));

    for (const quarto of quarterKeys) {
      if (hasStatsToSaveForQuarter(quarto)) {
        const saved = await handleSaveStats(quarto, { showToast: false, resetAfter: false });
        if (!saved) {
          allSaved = false;
        }
      }
    }

    if (allSaved) {
      setStatistics({});
    }
    return allSaved;
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
      setToast({
        title: "Erro",
        description: "Jogadora já adicionada à partida",
        variant: "destructive",
      });
      return;
    }

    if (!gameId) {
      setToast({
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
        setToast({
          title: "Sucesso",
          description: "Jogadora adicionada à partida!",
        });
      }
    } catch (error) {
      setToast({
        title: "Erro",
        description: "Erro ao vincular jogadora ao jogo!",
        variant: "destructive",
      });
    }
  }

  // Função para selecionar um rascunho e preencher o formulário
  async function handleSelectDraft(game: Game) {
    setSelectedGame(game);
    setGameId(game.id);
    setGameSaved(true);
    setGameStatus(game.status as 'PENDENTE' | 'EM_ANDAMENTO' | 'FINALIZADA');
    setSelectingDraft(false);

      // Carregar dados completos do jogo
      try {
        const fullGame = await getGame(game.id);
        if (fullGame.players && Array.isArray(fullGame.players)) {
          setPlayers(fullGame.players);
        }
        setPublicLink(fullGame.public_link || null);
      
      // Carregar estatísticas do jogo
      setLoadingStats(true);
      const gameStats = await getGameStats(game.id);
      const newStats: Record<number, Record<number, PlayerStatistics>> = {};
      gameStats.forEach((estatistica) => {
        const quarto = estatistica.quarter || 1;
        if (!newStats[quarto]) {
          newStats[quarto] = {};
        }
        newStats[quarto][estatistica.player_id] = {
          two: { attempts: estatistica.two_attempts || 0, hits: estatistica.two_made || 0 },
          three: { attempts: estatistica.three_attempts || 0, hits: estatistica.three_made || 0 },
          freeThrow: { attempts: estatistica.free_throw_attempts || 0, hits: estatistica.free_throw_made || 0 },
          rebounds: estatistica.rebounds,
          assists: estatistica.assists,
          fouls: estatistica.fouls,
          blocks: estatistica.blocks || 0,
          turnovers: estatistica.turnovers || 0,
          steals: estatistica.steals || 0,
          interference: estatistica.interference || 0,
          rebo_ofensivo: estatistica.rebo_ofensivo || 0,
          rebo_defensivo: estatistica.rebo_defensivo || 0,
          fr: estatistica.fr || 0,
        };
      });
      setStatistics(newStats);
      setStats(gameStats);
      setLoadingStats(false);
    } catch (error) {
      setToast({
        title: "Erro",
        description: "Erro ao carregar dados do rascunho",
        variant: "destructive",
      });
      setLoadingStats(false);
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
      setToast({
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
      setToast({
        title: "Sucesso",
        description: "Estatísticas criadas com sucesso!",
      });
    } catch (error) {
      setToast({
        title: "Erro",
        description: "Erro ao criar estatísticas",
        variant: "destructive",
      });
    }
  };

  // Função para deletar um rascunho
  async function handleDeleteDraftGame() {
    if (window.confirm('Tem certeza que deseja deletar este jogo?')) {
      if (gameId) {
        await api.delete(`/games/${gameId}`); // Chame o serviço de deleção do backend
      }
      setGameId(null);
      setGameForm({ adversario: '', data: '', local: '', category: categorias[0], horario: '', campeonato: '' });
      setGameSaved(false);
      setSelectedGame(null);
      setPlayers([]);
      setStatistics({});
    }
  }

  // Calcular pontuação casa em tempo real baseado nas estatísticas
  const homeScore = useMemo(() => {
    let total = 0;
    Object.values(statistics).forEach((quartoStats) => {
      Object.values(quartoStats).forEach((playerStats: any) => {
        total += (playerStats.two?.hits ?? 0) * 2;
        total += (playerStats.three?.hits ?? 0) * 3;
        total += (playerStats.freeThrow?.hits ?? 0);
      });
    });
    return total;
  }, [statistics]);

  // Calcular faltas acumuladas da equipe casa
  const homeFouls = useMemo(() => {
    let total = 0;
    Object.values(statistics).forEach((quartoStats) => {
      Object.values(quartoStats).forEach((playerStats: any) => {
        total += playerStats.fouls ?? 0;
      });
    });
    return total;
  }, [statistics]);

  // Inicializar jogadores em quadra automaticamente (primeiros 5)
  // Os primeiros 5 jogadores adicionados vão para o painel, do 6º em diante vão para o banco
  useEffect(() => {
    if (players.length > 0) {
      // Se não há jogadores em quadra, inicializa com os primeiros 5
      if (playersOnCourt.length === 0) {
        const firstFive = players.slice(0, Math.min(5, players.length)).map(p => p.id);
        setPlayersOnCourt(firstFive);
      } else {
        // Se há jogadores em quadra, apenas adiciona novos jogadores ao banco
        // Mantém os primeiros 5 em quadra, a menos que sejam removidos manualmente
        const currentCourtIds = playersOnCourt;
        const allPlayerIds = players.map(p => p.id);
        
        // Remover jogadores que não existem mais
        const validCourtIds = currentCourtIds.filter(id => allPlayerIds.includes(id));
        
        // Se temos menos de 5 em quadra e há jogadores disponíveis, preencher com os primeiros disponíveis
        if (validCourtIds.length < 5 && players.length > validCourtIds.length) {
          const firstFiveIds = players.slice(0, Math.min(5, players.length)).map(p => p.id);
          const missingIds = firstFiveIds.filter(id => !validCourtIds.includes(id));
          validCourtIds.push(...missingIds.slice(0, 5 - validCourtIds.length));
        }
        
        setPlayersOnCourt(validCourtIds.slice(0, 5));
      }
    }
  }, [players.length]); // Apenas quando o número de jogadores muda

  // Acumular tempo dos jogadores em quadra quando cronômetro está rodando
  useEffect(() => {
    if (!timerIsRunning || playersOnCourt.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = (now - lastTickTime) / 1000;
      
      setPlayerMinutes(prev => {
        const updated = { ...prev };
        if (!updated[selectedQuarto]) {
          updated[selectedQuarto] = {};
        }
        
        playersOnCourt.forEach(playerId => {
          updated[selectedQuarto][playerId] = (updated[selectedQuarto][playerId] || 0) + deltaSeconds;
        });
        
        return updated;
      });
      
      setLastTickTime(now);
    }, 1000); // Atualizar a cada segundo

    return () => clearInterval(interval);
  }, [timerIsRunning, playersOnCourt, selectedQuarto, lastTickTime]);

  // Resetar tempo ao trocar de quarto
  useEffect(() => {
    setLastTickTime(Date.now());
  }, [selectedQuarto]);

  // Callback para mudanças no cronômetro
  const handleTimerStateChange = (isRunning: boolean, time: number) => {
    setTimerIsRunning(isRunning);
    setTimerTime(time);
    setLastTickTime(Date.now());
    
    // Salvar estado do placar no backend
    if (gameId) {
      updateScoreboard(gameId, {
        timer_time: time,
        timer_running: isRunning,
        current_quarter: selectedQuarto,
        away_score: awayScore
      }).catch(err => {
        console.error('Erro ao salvar estado do placar:', err);
      });
    }
  };

  // Salvar estado do placar quando awayScore muda
  useEffect(() => {
    if (gameId && gameSaved) {
      updateScoreboard(gameId, {
        away_score: awayScore,
        timer_time: timerTime,
        timer_running: timerIsRunning,
        current_quarter: selectedQuarto
      }).catch(err => {
        console.error('Erro ao salvar estado do placar:', err);
      });
    }
  }, [awayScore, gameId, gameSaved, timerTime, timerIsRunning, selectedQuarto]);

  // Abrir modal de substituição
  const handleOpenSubstitution = (player: Player, index: number) => {
    setPlayerToSubstitute({ player, index });
    setShowSubstitutionModal(true);
  };

  // Realizar substituição mantendo a posição
  const handleSubstitute = (newPlayerId: number) => {
    if (!playerToSubstitute) return;

    setPlayersOnCourt(prev => {
      const updated = [...prev];
      updated[playerToSubstitute.index] = newPlayerId; // Substitui na mesma posição
      return updated;
    });

    setPlayerToSubstitute(null);
  };

  // Obter jogadores no banco (não em quadra)
  const benchPlayers = useMemo(() => {
    return players.filter(p => !playersOnCourt.includes(p.id));
  }, [players, playersOnCourt]);

  // Obter jogadores em quadra na ordem do array
  const courtPlayers = useMemo(() => {
    return playersOnCourt
      .map(playerId => players.find(p => p.id === playerId))
      .filter((p): p is Player => p !== undefined);
  }, [players, playersOnCourt]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Link Público - exibido quando o jogo está salvo */}
      {gameSaved && publicLink && (
        <Card className="mb-4 p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Link de Visualização Pública</h3>
              <p className="text-sm text-blue-700 mb-2">
                Compartilhe este link para visualização pública do placar e estatísticas
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/public/game/${publicLink}`}
                  className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded text-sm font-mono"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/public/game/${publicLink}`);
                    setToast({
                      title: "Sucesso",
                      description: "Link copiado para a área de transferência!",
                    });
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-sm"
                >
                  Copiar
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Placar - exibido apenas quando o jogo está salvo */}
      {gameSaved && (
        <GameScoreboard
          homeScore={homeScore}
          awayScore={awayScore}
          onAwayScoreChange={setAwayScore}
          quarter={selectedQuarto}
          onTimerStateChange={handleTimerStateChange}
          opponentName={gameForm.adversario || selectedGame?.opponent || "VISITANTE"}
          initialTime={timerTime}
          initialRunning={timerIsRunning}
          onTimeChange={setTimerTime}
          onRunningChange={setTimerIsRunning}
          homeFouls={homeFouls}
          awayFouls={0}
        />
      )}

      {/* Formulário do Jogo */}
      {!gameSaved ? (
        <div className="mb-8">
          <form onSubmit={handleCreateGame} className="grid grid-cols-3 gap-4 mb-4">
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
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                name="category"
                value={gameForm.category}
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
              <select
                name="horario"
                value={gameForm.horario}
                onChange={handleGameFormChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {horarios.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="campeonato">Campeonato</Label>
                <Input
                  id="campeonato"
                  name="campeonato"
                  value={gameForm.campeonato}
                  onChange={handleGameFormChange}
                  placeholder="Nome do campeonato"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold shadow transition-colors disabled:opacity-50"
                disabled={savingGame}
              >
                {savingGame ? "Salvando..." : "Iniciar Partida"}
              </button>
            </div>
            {gameFormError && <div className="text-red-500 text-sm col-span-3">{gameFormError}</div>}
          </form>
        </div>
      ) : null}

          {/* Dropdown de quarto e tabela de estatísticas */}
      {gameSaved && (
        <>
          <div className="flex items-center gap-4 mb-4">
            <Label htmlFor="quarto">PERÍODO DO JOGO</Label>
            <select
              id="quarto"
              name="quarto"
              value={selectedQuarto}
              onChange={async (e) => {
                const novoQuarto = Number(e.target.value) || 1;
                // Salvar estatísticas do quarto atual antes de mudar
                if (hasStatsToSaveForQuarter(selectedQuarto)) {
                  await handleSaveStats(selectedQuarto, { showToast: false, resetAfter: false });
                }
                setSelectedQuarto(novoQuarto);
              }}
              className="rounded-md border border-gray-300 px-3 py-2"
            >
              {quartos.map(q => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </select>
          </div>

          {/* Tabela de Estatísticas */}
          {loadingPlayers || loadingStats ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
            </div>
          ) : players.length === 0 ? (
            <>
              <div className="text-gray-400 mb-8">Adicione jogadoras para começar a registrar estatísticas.</div>
              <div className="flex gap-4 mt-4">
                <button onClick={() => handleSaveStats()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold" disabled={!hasStatsToSave()}>Salvar Estatísticas</button>
              </div>
            </>
          ) : (
            <>
              <div className="overflow-x-auto mb-8" style={{ maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
                <div className="overflow-y-auto flex-1">
                  <table className="min-w-full text-sm border border-gray-300">
                    <thead className="bg-gray-200 sticky top-0 z-10">
                      <tr>
                        <th className="border px-2 py-2 text-center font-bold bg-gray-200">NO.</th>
                        <th className="border px-2 py-2 text-center font-bold bg-gray-200">Jogador</th>
                        <th className="border px-2 py-2 text-center font-bold bg-gray-200">PONTOS</th>
                        <th className="border px-2 py-2 text-center font-bold bg-gray-200">REBOT</th>
                        <th className="border px-2 py-2 text-center font-bold bg-gray-200">FALTA</th>
                        <th className="border px-2 py-2 text-center font-bold bg-gray-200">ASSIST</th>
                        <th className="border px-2 py-2 text-center font-bold bg-gray-200">TOCO</th>
                        <th className="border px-2 py-2 text-center font-bold bg-gray-200">ROUBO</th>
                        <th className="border px-2 py-2 text-center font-bold bg-gray-200">TURN</th>
                        <th className="border px-2 py-2 text-center font-bold bg-gray-200">INTER</th>
                        <th className="border px-2 py-2 text-center font-bold bg-gray-200">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                  {courtPlayers.map((p, idx) => {
                  // Acumular estatísticas de todos os quartos até o quarto selecionado (incluindo o atual)
                  let accumulatedStats = { ...initialPlayerStats };
                  for (let q = 1; q <= selectedQuarto; q++) {
                    if (statistics[q] && statistics[q][p.id]) {
                      const quartoStats = statistics[q][p.id];
                      accumulatedStats = {
                        two: {
                          attempts: (accumulatedStats.two?.attempts ?? 0) + (quartoStats.two?.attempts ?? 0),
                          hits: (accumulatedStats.two?.hits ?? 0) + (quartoStats.two?.hits ?? 0),
                        },
                        three: {
                          attempts: (accumulatedStats.three?.attempts ?? 0) + (quartoStats.three?.attempts ?? 0),
                          hits: (accumulatedStats.three?.hits ?? 0) + (quartoStats.three?.hits ?? 0),
                        },
                        freeThrow: {
                          attempts: (accumulatedStats.freeThrow?.attempts ?? 0) + (quartoStats.freeThrow?.attempts ?? 0),
                          hits: (accumulatedStats.freeThrow?.hits ?? 0) + (quartoStats.freeThrow?.hits ?? 0),
                        },
                        rebounds: (accumulatedStats.rebounds ?? 0) + (quartoStats.rebounds ?? 0),
                        assists: (accumulatedStats.assists ?? 0) + (quartoStats.assists ?? 0),
                        fouls: (accumulatedStats.fouls ?? 0) + (quartoStats.fouls ?? 0),
                        blocks: (accumulatedStats.blocks ?? 0) + (quartoStats.blocks ?? 0),
                        turnovers: (accumulatedStats.turnovers ?? 0) + (quartoStats.turnovers ?? 0),
                        steals: (accumulatedStats.steals ?? 0) + (quartoStats.steals ?? 0),
                        interference: (accumulatedStats.interference ?? 0) + (quartoStats.interference ?? 0),
                        rebo_ofensivo: (accumulatedStats.rebo_ofensivo ?? 0) + (quartoStats.rebo_ofensivo ?? 0),
                        rebo_defensivo: (accumulatedStats.rebo_defensivo ?? 0) + (quartoStats.rebo_defensivo ?? 0),
                        fr: (accumulatedStats.fr ?? 0) + (quartoStats.fr ?? 0),
                      };
                    }
                  }
                  const s = accumulatedStats;
                  const fouls = s.fouls || 0;
                  const fr = s.fr || 0;
                  const rebo_ofensivo = s.rebo_ofensivo || 0;
                  const rebo_defensivo = s.rebo_defensivo || 0;
                  const isEliminado = fouls >= 5;
                  const rowClass = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                  return (
                    <tr key={p.id} className={rowClass}>
                      {/* NO. */}
                      <td className="border px-2 py-2 text-center font-bold">{p.number || '-'}</td>
                      {/* Jogador */}
                      <td className="border px-2 py-2 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                            {p.name?.charAt(0) || '?'}
                          </div>
                          <span className="font-semibold">{p.name}</span>
                        </div>
                      </td>
                      {/* PONTOS: 2PTS, 3PTS, L.L */}
                      <td className="border px-2 py-2 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          <button
                            disabled={isEliminado}
                            style={getButtonStyle(isEliminado)}
                            className={brandButtonClassLarge}
                            onClick={() => handleShot(p.id, 'dois')}
                            type="button"
                          >
                            2PTS ({(s.two?.attempts ?? 0)}/{(s.two?.hits ?? 0)})
                          </button>
                          <button
                            disabled={isEliminado}
                            style={getButtonStyle(isEliminado)}
                            className={brandButtonClassLarge}
                            onClick={() => handleShot(p.id, 'tres')}
                            type="button"
                          >
                            3PTS ({(s.three?.attempts ?? 0)}/{(s.three?.hits ?? 0)})
                          </button>
                          <button
                            disabled={isEliminado}
                            style={getButtonStyle(isEliminado)}
                            className={brandButtonClassLarge}
                            onClick={() => handleShot(p.id, 'lance')}
                            type="button"
                          >
                            L.L ({(s.freeThrow?.attempts ?? 0)}/{(s.freeThrow?.hits ?? 0)})
                          </button>
                        </div>
                      </td>
                      {/* REBOT: OFENSIVO e DEFENSIVO */}
                      <td className="border px-2 py-2 text-center">
                        <div className="flex flex-col gap-2 items-center">
                          <div className="flex flex-col gap-1 items-center">
                            <span className="text-xs font-semibold text-gray-700">OFENSIVO</span>
                            <div className="flex items-center gap-1">
                              <button
                                disabled={isEliminado}
                                style={getButtonStyle(isEliminado)}
                                className={brandButtonClass}
                                onClick={() => handleStatButton(p.id, 'rebo_ofensivo', -1)}
                              >
                                -1
                              </button>
                              <span className="px-2 text-xs font-bold text-gray-800">{rebo_ofensivo}</span>
                              <button
                                disabled={isEliminado}
                                style={getButtonStyle(isEliminado)}
                                className={brandButtonClass}
                                onClick={() => handleStatButton(p.id, 'rebo_ofensivo', 1)}
                              >
                                +1
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 items-center">
                            <span className="text-xs font-semibold text-gray-700">DEFENSIVO</span>
                            <div className="flex items-center gap-1">
                              <button
                                disabled={isEliminado}
                                style={getButtonStyle(isEliminado)}
                                className={brandButtonClass}
                                onClick={() => handleStatButton(p.id, 'rebo_defensivo', -1)}
                              >
                                -1
                              </button>
                              <span className="px-2 text-xs font-bold text-gray-800">{rebo_defensivo}</span>
                              <button
                                disabled={isEliminado}
                                style={getButtonStyle(isEliminado)}
                                className={brandButtonClass}
                                onClick={() => handleStatButton(p.id, 'rebo_defensivo', 1)}
                              >
                                +1
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* FALTA: PESSOAL e RECEBIDA */}
                      <td className="border px-2 py-2 text-center">
                        <div className="flex flex-col gap-2 items-center">
                          <div className={`flex flex-col gap-1 items-center ${fouls === 4 ? 'bg-yellow-100' : ''} ${fouls >= 5 ? 'bg-red-100' : ''} p-1 rounded`}>
                            <span className="text-xs font-semibold text-gray-700">PESSOAL</span>
                            <div className="flex items-center gap-1">
                              <button
                                style={brandButtonStyle}
                                className={brandButtonClass}
                                onClick={() => handleStatButton(p.id, 'fouls', -1)}
                              >
                                -1
                              </button>
                              <span className={`px-2 text-xs font-bold ${fouls === 4 ? 'bg-yellow-200 text-yellow-900' : ''} ${fouls >= 5 ? 'bg-red-200 text-red-900' : 'text-gray-800'}`}>{fouls}</span>
                              <button
                                disabled={isEliminado}
                                style={getButtonStyle(isEliminado)}
                                className={brandButtonClass}
                                onClick={() => handleStatButton(p.id, 'fouls', 1)}
                              >
                                +1
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 items-center">
                            <span className="text-xs font-semibold text-gray-700">RECEBIDA</span>
                            <div className="flex items-center gap-1">
                              <button
                                disabled={isEliminado}
                                style={getButtonStyle(isEliminado)}
                                className={brandButtonClass}
                                onClick={() => handleStatButton(p.id, 'fr', -1)}
                              >
                                -1
                              </button>
                              <span className="px-2 text-xs font-bold text-gray-800">{fr}</span>
                              <button
                                disabled={isEliminado}
                                style={getButtonStyle(isEliminado)}
                                className={brandButtonClass}
                                onClick={() => handleStatButton(p.id, 'fr', 1)}
                              >
                                +1
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* ASSIST */}
                      <td className="border px-2 py-2 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <button
                            disabled={isEliminado}
                            style={getButtonStyle(isEliminado)}
                            className={brandButtonClass}
                            onClick={() => handleStatButton(p.id, 'assists', -1)}
                          >
                            -1
                          </button>
                          <span className="px-2 text-xs font-bold text-gray-800">{s.assists || 0}</span>
                          <button
                            disabled={isEliminado}
                            style={getButtonStyle(isEliminado)}
                            className={brandButtonClass}
                            onClick={() => handleStatButton(p.id, 'assists', 1)}
                          >
                            +1
                          </button>
                        </div>
                      </td>
                      {/* TOCO */}
                      <td className="border px-2 py-2 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <button
                            disabled={isEliminado}
                            style={getButtonStyle(isEliminado)}
                            className={brandButtonClass}
                            onClick={() => handleStatButton(p.id, 'blocks', -1)}
                          >
                            -1
                          </button>
                          <span className="px-2 text-xs font-bold text-gray-800">{s.blocks || 0}</span>
                          <button
                            disabled={isEliminado}
                            style={getButtonStyle(isEliminado)}
                            className={brandButtonClass}
                            onClick={() => handleStatButton(p.id, 'blocks', 1)}
                          >
                            +1
                          </button>
                        </div>
                      </td>
                      {/* ROUBO */}
                      <td className="border px-2 py-2 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <button
                            disabled={isEliminado}
                            style={getButtonStyle(isEliminado)}
                            className={brandButtonClass}
                            onClick={() => handleStatButton(p.id, 'steals', -1)}
                          >
                            -1
                          </button>
                          <span className="px-2 text-xs font-bold text-gray-800">{s.steals || 0}</span>
                          <button
                            disabled={isEliminado}
                            style={getButtonStyle(isEliminado)}
                            className={brandButtonClass}
                            onClick={() => handleStatButton(p.id, 'steals', 1)}
                          >
                            +1
                          </button>
                        </div>
                      </td>
                      {/* TURN */}
                      <td className="border px-2 py-2 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <button
                            disabled={isEliminado}
                            style={getButtonStyle(isEliminado)}
                            className={brandButtonClass}
                            onClick={() => handleStatButton(p.id, 'turnovers', -1)}
                          >
                            -1
                          </button>
                          <span className="px-2 text-xs font-bold text-gray-800">{s.turnovers || 0}</span>
                          <button
                            disabled={isEliminado}
                            style={getButtonStyle(isEliminado)}
                            className={brandButtonClass}
                            onClick={() => handleStatButton(p.id, 'turnovers', 1)}
                          >
                            +1
                          </button>
                        </div>
                      </td>
                      {/* INTER */}
                      <td className="border px-2 py-2 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <button
                            disabled={isEliminado}
                            style={getButtonStyle(isEliminado)}
                            className={brandButtonClass}
                            onClick={() => handleStatButton(p.id, 'interference', -1)}
                          >
                            -1
                          </button>
                          <span className="px-2 text-xs font-bold text-gray-800">{s.interference || 0}</span>
                          <button
                            disabled={isEliminado}
                            style={getButtonStyle(isEliminado)}
                            className={brandButtonClass}
                            onClick={() => handleStatButton(p.id, 'interference', 1)}
                          >
                            +1
                          </button>
                        </div>
                      </td>
                      {/* AÇÕES */}
                      <td className="border px-2 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenSubstitution(p, idx)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Substituir jogador"
                            disabled={benchPlayers.length === 0}
                          >
                            <RefreshCw size={16} />
                          </button>
                          <button
                            onClick={() => handleRemovePlayerFromGame(p.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remover jogador da partida"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                  </tbody>
                </table>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <button 
                  onClick={() => handleSaveStats()} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold disabled:opacity-50" 
                  disabled={!hasStatsToSave() || savingStats}
                >
                  {savingStats ? 'Salvando...' : 'Salvar Estatísticas'}
                </button>
                <button 
                  onClick={handleShowBoxScore} 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold"
                >
                  Preview BoxScore
                </button>
                {gameStatus !== 'FINALIZADA' && (
                  <button
                    onClick={handleFinalizarPartida}
                    disabled={finishingGame}
                    style={brandButtonStyle}
                    className="px-4 py-2 rounded font-bold hover:opacity-90 disabled:opacity-50 transition-colors"
                  >
                    {finishingGame ? 'Encerrando...' : 'Encerrar Partida'}
                  </button>
                )}
                {gameStatus === 'FINALIZADA' && (
                  <span className="px-4 py-2 text-green-700 font-bold">Partida Finalizada</span>
                )}
              </div>
            </>
          )}
        </>
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
                placeholder="Digite nome"
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
                      {p.name} <span className="text-xs text-gray-500">({p.category || 'Sem category'})</span>
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
                <select
                  id="position"
                  name="position"
                  value={playerForm.position}
                  onChange={handlePlayerFormChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  tabIndex={0}
                  disabled={savingPlayer}
                  required
                >
                  <option value="">Selecione a posição</option>
                  <option value="Armador">Armador</option>
                  <option value="Ala">Ala</option>
                  <option value="Ala-Armador">Ala-Armador</option>
                  <option value="Ala-Pivô">Ala-Pivô</option>
                  <option value="Pivô">Pivô</option>
                </select>
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  name="category"
                  value={playerForm.category}
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

      {/* Exibir jogos pendentes (rascunhos) */}
      {pendingGames.length > 0 && !gameSaved && !gameId && (
        <div className="mb-6">
          <div className="font-semibold mb-2">Você possui jogos em rascunho:</div>
          <ul className="space-y-4">
            {pendingGames.map((game) => (
              <li key={game.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">
                      {game.opponent} - {game.date ? new Date(game.date).toLocaleDateString('pt-BR') : ''} - {game.category}
                    </div>
                    {game.public_link && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <div className="text-xs font-semibold text-blue-900 mb-1">Link de Visualização Pública:</div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`${window.location.origin}/public/game/${game.public_link}`}
                            className="flex-1 px-2 py-1 bg-white border border-blue-300 rounded text-xs font-mono"
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/public/game/${game.public_link}`);
                              setToast({
                                title: "Sucesso",
                                description: "Link copiado para a área de transferência!",
                              });
                            }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                          >
                            Copiar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
                    onClick={() => handleSelectDraft(game)}
                  >
                    Continuar preenchimento
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal de confirmação de salvamento */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowSaveModal(false)}
              type="button"
            >
              ×
            </button>
            <div className={`text-center ${saveModalSuccess ? 'text-green-600' : 'text-red-600'}`}>
              <div className="text-4xl mb-4">{saveModalSuccess ? '✓' : '✗'}</div>
              <h2 className="text-xl font-bold mb-2">
                {saveModalSuccess ? 'Sucesso!' : 'Erro!'}
              </h2>
              <p className="text-gray-700">{saveModalMessage}</p>
            </div>
            <button
              onClick={() => setShowSaveModal(false)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Modal de substituição */}
      {showSubstitutionModal && playerToSubstitute && (
        <SubstitutionModal
          onClose={() => {
            setShowSubstitutionModal(false);
            setPlayerToSubstitute(null);
          }}
          onSubstitute={handleSubstitute}
          benchPlayers={benchPlayers}
          currentPlayerName={playerToSubstitute.player.name}
        />
      )}

      {/* Modal de preview do BoxScore */}
      {showBoxScoreModal && gameId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl z-10"
              onClick={() => setShowBoxScoreModal(false)}
              type="button"
            >
              ×
            </button>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Preview BoxScore</h2>
              <BoxScoreTable
                gameId={gameId}
                stats={stats}
                players={players}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Loader CSS
// Adicione no topo do arquivo ou em um arquivo global de estilos:
// .loader { border: 2px solid #f3f3f3; border-top: 2px solid #2563eb; border-radius: 50%; width: 18px; height: 18px; animation: spin 1s linear infinite; }
// @keyframes spin { 100% { transform: rotate(360deg); } }

export default Painel; 