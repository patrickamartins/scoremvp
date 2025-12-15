import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Card } from "../components/ui/Card";
import { usePageTitle } from "../hooks/usePageTitle";
import { DateRangePicker } from "../components/ui/DateRangePicker";
import { BoxScoreTable } from "../components/BoxScoreTable";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { api, getGameStats, getPlayers, getGame } from '../services/api';
import { AlertCircle } from 'lucide-react';
import type { GameStats } from '../types/game';

// Remover a constante API_URL hardcoded
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

type DateFilterState = {
  preset: string;
  start: string | null;
  end: string | null;
};

type DashboardGame = {
  id: number;
  opponent: string;
  date: string;
  status: string;
};

type BoxScorePlayer = {
  id: number;
  name?: string;
  number?: number | string;
  position?: string;
};

type AggregatedStat = {
  player_id: number;
  points: number;
  two_attempts: number;
  two_made: number;
  three_attempts: number;
  three_made: number;
  free_throw_attempts: number;
  free_throw_made: number;
  offensive_rebounds: number;
  defensive_rebounds: number;
  total_rebounds: number;
  assists: number;
  turnovers: number;
  steals: number;
  blocks: number;
  personal_fouls: number;
  fouls_drawn: number;
  total_fouls: number;
  interceptions: number;
};

const initAggregatedStat = (playerId: number): AggregatedStat => ({
  player_id: playerId,
  points: 0,
  two_attempts: 0,
  two_made: 0,
  three_attempts: 0,
  three_made: 0,
  free_throw_attempts: 0,
  free_throw_made: 0,
  offensive_rebounds: 0,
  defensive_rebounds: 0,
  total_rebounds: 0,
  assists: 0,
  turnovers: 0,
  steals: 0,
  blocks: 0,
  personal_fouls: 0,
  fouls_drawn: 0,
  total_fouls: 0,
  interceptions: 0,
});

const aggregateStatsList = (list: GameStats[]): Map<number, AggregatedStat> => {
  const map = new Map<number, AggregatedStat>();
  list.forEach((stat) => {
    if (!stat || stat.player_id == null) return;
    const playerId = Number(stat.player_id);
    const entry = map.get(playerId) ?? initAggregatedStat(playerId);
    entry.points += stat.points ?? 0;
    entry.two_attempts += stat.two_attempts ?? 0;
    entry.two_made += stat.two_made ?? 0;
    entry.three_attempts += stat.three_attempts ?? 0;
    entry.three_made += stat.three_made ?? 0;
    entry.free_throw_attempts += stat.free_throw_attempts ?? 0;
    entry.free_throw_made += stat.free_throw_made ?? 0;
    entry.offensive_rebounds += stat.rebo_ofensivo ?? 0;
    entry.defensive_rebounds += stat.rebo_defensivo ?? 0;
    entry.total_rebounds += stat.rebounds ?? 0;
    entry.assists += stat.assists ?? 0;
    entry.turnovers += stat.turnovers ?? 0;
    entry.steals += stat.steals ?? 0;
    entry.blocks += stat.blocks ?? 0;
    entry.personal_fouls += stat.fouls ?? stat.fp ?? 0;
    entry.fouls_drawn += stat.fr ?? 0;
    entry.total_fouls += stat.fouls ?? 0;
    entry.interceptions += stat.interference ?? 0;
    map.set(playerId, entry);
  });
  return map;
};

const aggregatedHasValues = (stat: AggregatedStat) => (
  (stat.points ?? 0) > 0 ||
  (stat.assists ?? 0) > 0 ||
  (stat.total_rebounds ?? 0) > 0 ||
  (stat.steals ?? 0) > 0 ||
  (stat.blocks ?? 0) > 0 ||
  (stat.personal_fouls ?? 0) > 0 ||
  (stat.fouls_drawn ?? 0) > 0
);

const playerLinePalette = ['#2563eb', '#7c3aed', '#10b981', '#f97316', '#ef4444', '#14b8a6', '#ec4899', '#facc15'];

const ISOString = (date: Date) => date.toISOString();
const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};
const endOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

function getPresetRange(preset: string, customStart?: string | null, customEnd?: string | null): { start: string | null; end: string | null } {
  const now = new Date();
  switch (preset) {
    case 'today': {
      return { start: ISOString(startOfDay(now)), end: ISOString(endOfDay(now)) };
    }
    case 'yesterday': {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: ISOString(startOfDay(yesterday)), end: ISOString(endOfDay(yesterday)) };
    }
    case 'last7': {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      return { start: ISOString(startOfDay(start)), end: ISOString(endOfDay(now)) };
    }
    case 'last14': {
      const start = new Date(now);
      start.setDate(start.getDate() - 13);
      return { start: ISOString(startOfDay(start)), end: ISOString(endOfDay(now)) };
    }
    case 'last28': {
      const start = new Date(now);
      start.setDate(start.getDate() - 27);
      return { start: ISOString(startOfDay(start)), end: ISOString(endOfDay(now)) };
    }
    case 'last30': {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      return { start: ISOString(startOfDay(start)), end: ISOString(endOfDay(now)) };
    }
    case 'thisWeek': {
      const start = new Date(now);
      const day = start.getDay(); // 0 domingo
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // segunda
      start.setDate(diff);
      return { start: ISOString(startOfDay(start)), end: ISOString(endOfDay(now)) };
    }
    case 'lastWeek': {
      const start = new Date(now);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1) - 7;
      start.setDate(diff);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start: ISOString(startOfDay(start)), end: ISOString(endOfDay(end)) };
    }
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: ISOString(startOfDay(start)), end: ISOString(endOfDay(end)) };
    }
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: ISOString(startOfDay(start)), end: ISOString(endOfDay(end)) };
    }
    case 'max':
      return { start: null, end: null };
    case 'custom': {
      const start = customStart ? ISOString(startOfDay(new Date(customStart))) : null;
      const end = customEnd ? ISOString(endOfDay(new Date(customEnd))) : null;
      return { start, end };
    }
    default:
      return { start: null, end: null };
  }
}

export default function DashboardPage() {
  usePageTitle("Dashboard");

  const initialRange = getPresetRange('today');

  const [overview, setOverview] = useState<any>(null);
  const [games, setGames] = useState<DashboardGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilterState>({ preset: 'today', start: initialRange.start, end: initialRange.end });
  const [selectedGame, setSelectedGame] = useState<DashboardGame | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const initialGameSetRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'comparativo' | 'evolutivo'>('comparativo');
  const [metric, setMetric] = useState<'Pontos' | 'Assistências' | 'Rebotes' | 'Faltas'>('Pontos');
  // Buscar estatísticas reais do backend para o jogo selecionado
  const [stats, setStats] = useState<GameStats[]>([]);
  const [rangeStats, setRangeStats] = useState<GameStats[]>([]);
  const [selectedGamePlayers, setSelectedGamePlayers] = useState<BoxScorePlayer[]>([]);
  const [playersDirectory, setPlayersDirectory] = useState<Record<number, BoxScorePlayer>>({});

  const handleDateFilterChange = (range: DateFilterState) => {
    const resolved = getPresetRange(range.preset, range.start, range.end);
    setDateFilter({ preset: range.preset, start: resolved.start, end: resolved.end });
    setSelectedGame(null);
    setStats([]);
    initialGameSetRef.current = false;
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchPlayersDirectory() {
      try {
        const players = await getPlayers();
        if (cancelled) return;
        const map: Record<number, BoxScorePlayer> = {};
        players.forEach((player) => {
          map[player.id] = {
            id: player.id,
            name: player.name,
            number: player.number,
            position: player.position,
          };
        });
        setPlayersDirectory(map);
      } catch {
        if (!cancelled) {
          setPlayersDirectory({});
        }
      }
    }

    fetchPlayersDirectory();

    return () => {
      cancelled = true;
    };
  }, []);

  // Buscar lista de jogos do período
  useEffect(() => {
    let ignore = false;
    async function fetchGames() {
      const params: Record<string, string> = {};
      if (dateFilter.start) params.data_inicio = dateFilter.start;
      if (dateFilter.end) params.data_fim = dateFilter.end;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/dashboard/public/jogos', { params });
        if (ignore) return;
        const sorted = [...res.data].sort(
          (a: DashboardGame, b: DashboardGame) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setGames(sorted);
        if (!initialGameSetRef.current && sorted.length > 0) {
          setSelectedGame(sorted[0]);
          initialGameSetRef.current = true;
        }
      } catch (e: any) {
        if (!ignore) {
          setGames([]);
          setError('Erro ao carregar lista de jogos. Tente novamente.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchGames();
    return () => {
      ignore = true;
    };
  }, [dateFilter]);

  useEffect(() => {
    let cancelled = false;

    async function fetchRangeStats() {
      if (!games.length) {
        if (!cancelled) setRangeStats([]);
        return;
      }
      try {
        const responses = await Promise.all(games.map((game) => getGameStats(game.id)));
        if (!cancelled) {
          setRangeStats(responses.flat());
        }
      } catch {
        if (!cancelled) setRangeStats([]);
      }
    }

    fetchRangeStats();

    return () => {
      cancelled = true;
    };
  }, [games]);

  // Buscar dados do dashboard (overview e jogadoras)
  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const rangeParams: Record<string, any> = {};
        if (dateFilter.start) rangeParams.data_inicio = dateFilter.start;
        if (dateFilter.end) rangeParams.data_fim = dateFilter.end;

        if (selectedGame) {
          const params = { ...rangeParams, jogo_id: selectedGame.id };
          const overviewRes = await api.get('/dashboard/public/overview', { params });
          if (!ignore) {
            setOverview(overviewRes.data);
          }
        } else {
          const overviewRes = await api.get('/dashboard/public/overview', { params: rangeParams });
          if (!ignore) {
            setOverview(overviewRes.data);
          }
        }
      } catch (e: any) {
        if (!ignore) {
          setOverview(null);
          setError('Erro ao carregar dados do dashboard. Tente novamente.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line
  }, [dateFilter, selectedGame]);

  // Buscar estatísticas reais do backend para o jogo selecionado
  useEffect(() => {
    if (selectedGame?.id) {
      getGameStats(selectedGame.id)
        .then((data) => setStats(data))
        .catch(() => setStats([]));
    } else {
      setStats([]);
    }
  }, [selectedGame]);

  useEffect(() => {
    let cancelled = false;

    if (!selectedGame?.id) {
      setSelectedGamePlayers([]);
      return;
    }

    async function fetchGamePlayers() {
      try {
        // Buscar jogadores vinculados ao jogo
        const detailed = await getGame(selectedGame.id);
        if (cancelled) return;
        const gamePlayers = Array.isArray(detailed.players)
          ? detailed.players.map((player: any) => ({
              id: player.id,
              name: player.name,
              number: player.number,
              position: player.position,
            }))
          : [];

        // Buscar jogadores que têm estatísticas no jogo (mesmo que não estejam mais vinculados)
        const gameStats = await getGameStats(selectedGame.id);
        if (cancelled) return;
        
        // Extrair jogadores das estatísticas (agora o backend retorna player dentro de cada stat)
        const playersFromStats = new Map<number, BoxScorePlayer>();
        gameStats.forEach((stat: any) => {
          if (stat.player_id && stat.player) {
            const playerId = Number(stat.player_id);
            if (!playersFromStats.has(playerId)) {
              playersFromStats.set(playerId, {
                id: playerId,
                name: stat.player.name || `Jogador ${playerId}`,
                number: stat.player.number,
                position: stat.player.position,
              });
            }
          }
        });

        // Combinar jogadores do jogo com jogadores das estatísticas
        const allPlayersMap = new Map<number, BoxScorePlayer>();
        
        // Adicionar jogadores do jogo
        gamePlayers.forEach((p) => {
          allPlayersMap.set(p.id, p);
        });
        
        // Adicionar jogadores das estatísticas (sobrescreve se já existir, mas mantém dados mais completos)
        playersFromStats.forEach((p, id) => {
          allPlayersMap.set(id, p);
        });

        // Converter para array
        const uniquePlayers = Array.from(allPlayersMap.values());

        if (!cancelled) {
          setSelectedGamePlayers(uniquePlayers);
        }
      } catch (error) {
        console.error('Erro ao buscar jogadores do jogo:', error);
        if (!cancelled) setSelectedGamePlayers([]);
      }
    }

    fetchGamePlayers();

    return () => {
      cancelled = true;
    };
  }, [selectedGame?.id]);

  // Buscar todas as jogadoras para o filtro
  useEffect(() => {
    api.get('/dashboard/public/jogadoras').then(({ data }) => {
      // setPlayersStats(data); // This line is removed
    });
  }, []);

  const filteredGames = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return games;
    return games.filter((game) => {
      const opponent = game.opponent?.toLowerCase() ?? '';
      const dateStr = new Date(game.date).toLocaleDateString('pt-BR');
      return opponent.includes(normalized) || dateStr.toLowerCase().includes(normalized);
    });
  }, [games, searchTerm]);

  const selectedGamePlayersMap = useMemo(() => {
    const map: Record<number, BoxScorePlayer> = {};
    selectedGamePlayers.forEach((player) => {
      map[player.id] = player;
    });
    return map;
  }, [selectedGamePlayers]);

  // Extrair informações dos jogadores diretamente das estatísticas
  const playersFromStatsMap = useMemo(() => {
    const map: Record<number, BoxScorePlayer> = {};
    const allStats = selectedGame ? stats : rangeStats;
    
    // Primeiro, extrair jogadores diretamente das estatísticas (se tiverem campo player)
    allStats.forEach((stat: any) => {
      if (stat.player_id) {
        const playerId = Number(stat.player_id);
        if (!map[playerId]) {
          if (stat.player) {
            // Se a estatística tem informações do jogador, usar diretamente
            map[playerId] = {
              id: playerId,
              name: stat.player.name || `Jogador ${playerId}`,
              number: stat.player.number,
              position: stat.player.position,
            };
          } else if (selectedGame && selectedGamePlayers.length > 0) {
            // Se não tem, tentar encontrar nos jogadores do jogo selecionado
            const gamePlayer = selectedGamePlayers.find(p => p.id === playerId);
            if (gamePlayer) {
              map[playerId] = gamePlayer;
            }
          }
        }
      }
    });
    
    return map;
  }, [stats, rangeStats, selectedGame, selectedGamePlayers]);

  const resolvePlayerInfo = useCallback(
    (playerId: number): BoxScorePlayer => {
      // Prioridade 1: Informações do jogador que vêm diretamente das estatísticas
      if (playersFromStatsMap[playerId]) return playersFromStatsMap[playerId];
      // Prioridade 2: Jogadores do jogo selecionado
      if (selectedGamePlayersMap[playerId]) return selectedGamePlayersMap[playerId];
      // Prioridade 3: Diretório geral de jogadores
      if (playersDirectory[playerId]) return playersDirectory[playerId];
      // Fallback: Nome genérico
      return { id: playerId, name: `Jogador ${playerId}` };
    },
    [playersFromStatsMap, selectedGamePlayersMap, playersDirectory]
  );

  const selectedAggregatedMap = useMemo(() => aggregateStatsList(stats), [stats]);
  const rangeAggregatedMap = useMemo(() => aggregateStatsList(rangeStats), [rangeStats]);

  const aggregatedEntries = useMemo(() => {
    const activeMap = selectedGame ? selectedAggregatedMap : rangeAggregatedMap;
    const allStats = selectedGame ? stats : rangeStats;
    
    // Criar mapa de jogadores das estatísticas para acesso rápido
    const statsPlayersMap = new Map<number, BoxScorePlayer>();
    allStats.forEach((stat: any) => {
      if (stat.player_id && stat.player && !statsPlayersMap.has(stat.player_id)) {
        statsPlayersMap.set(stat.player_id, {
          id: stat.player_id,
          name: stat.player.name || `Jogador ${stat.player_id}`,
          number: stat.player.number,
          position: stat.player.position,
        });
      }
    });
    
    return Array.from(activeMap.values())
      .filter(aggregatedHasValues)
      .map((stat) => {
        // Prioridade 1: Informações do jogador que vêm diretamente das estatísticas
        let playerInfo: BoxScorePlayer;
        if (statsPlayersMap.has(stat.player_id)) {
          playerInfo = statsPlayersMap.get(stat.player_id)!;
        } else {
          // Fallback: usar resolvePlayerInfo
          playerInfo = resolvePlayerInfo(stat.player_id);
        }
        
        return {
          player: {
            id: playerInfo.id,
            name: playerInfo.name ?? `Jogador ${stat.player_id}`,
            number: playerInfo.number,
            position: playerInfo.position,
          },
          stat,
        };
      })
      .sort((a, b) => (b.stat.points ?? 0) - (a.stat.points ?? 0));
  }, [selectedGame, selectedAggregatedMap, rangeAggregatedMap, resolvePlayerInfo, stats, rangeStats]);

  const comparativeChartData = useMemo(
    () =>
      aggregatedEntries.map(({ player, stat }) => ({
        name: player.name ?? `Jogador ${player.id}`,
        Pontos: stat.points ?? 0,
        Assistências: stat.assists ?? 0,
        Rebotes: stat.total_rebounds ?? 0,
        Faltas: stat.total_fouls ?? stat.personal_fouls ?? 0,
      })),
    [aggregatedEntries]
  );

  const playerLines = useMemo(
    () =>
      aggregatedEntries.map(({ player }, index) => ({
        id: player.id,
        key: `player_${player.id}`,
        label: player.name ?? `Jogador ${player.id}`,
        color: playerLinePalette[index % playerLinePalette.length],
      })),
    [aggregatedEntries]
  );

  const playerLinesMap = useMemo(() => {
    const map = new Map<number, { key: string; label: string; color: string }>();
    playerLines.forEach((line) => {
      map.set(line.id, { key: line.key, label: line.label, color: line.color });
    });
    return map;
  }, [playerLines]);

  const metricValue = useCallback(
    (stat: GameStats) => {
      switch (metric) {
        case 'Assistências':
          return stat.assists ?? 0;
        case 'Rebotes':
          if (typeof stat.rebounds === 'number') return stat.rebounds;
          return (stat.rebo_ofensivo ?? 0) + (stat.rebo_defensivo ?? 0);
        case 'Faltas':
          return stat.fouls ?? stat.fp ?? 0;
        case 'Pontos':
        default:
          return stat.points ?? 0;
      }
    },
    [metric]
  );

  const evolutiveData = useMemo(() => {
    if (!playerLines.length) return [] as Array<Record<string, number | string>>;

    const ensureDefaults = (row: Record<string, number | string>) => {
      playerLines.forEach((line) => {
        if (row[line.key] == null) {
          row[line.key] = 0;
        }
      });
    };

    if (selectedGame) {
      const periods = Array.from(
        new Set(
          stats
            .map((stat) => {
              const quarter = stat.quarter ?? (stat as any).quarto ?? 0;
              return Number.isFinite(quarter) ? Number(quarter) : 0;
            })
        )
      )
        .filter((quarter) => quarter > 0)
        .sort((a, b) => a - b);

      const effectivePeriods = periods.length > 0 ? periods : [0];

      return effectivePeriods.map((period) => {
        const label = period === 0 ? 'Partida' : `Q${period}`;
        const row: Record<string, number | string> = { label };

        stats.forEach((stat) => {
          const quarter = stat.quarter ?? (stat as any).quarto ?? 0;
          if ((period === 0 && quarter !== 0) || (period !== 0 && quarter !== period)) return;
          const playerEntry = playerLinesMap.get(Number(stat.player_id));
          if (!playerEntry) return;
          const key = playerEntry.key;
          row[key] = (Number(row[key] ?? 0) + metricValue(stat)) as number;
        });

        ensureDefaults(row);
        return row;
      });
    }

    const gameMeta = new Map<number, { label: string; sortValue: number }>();
    games.forEach((game) => {
      const dateObj = new Date(game.date);
      const sortValue = dateObj.getTime();
      const label = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      gameMeta.set(game.id, { label, sortValue });
    });

    const grouped = new Map<number, Record<string, number | string>>();

    rangeStats.forEach((stat) => {
      const gameInfo = gameMeta.get(Number(stat.game_id));
      if (!gameInfo) return;
      const playerEntry = playerLinesMap.get(Number(stat.player_id));
      if (!playerEntry) return;
      const existing = grouped.get(gameInfo.sortValue) ?? { label: gameInfo.label, sort: gameInfo.sortValue };
      const key = playerEntry.key;
      existing[key] = (Number(existing[key] ?? 0) + metricValue(stat)) as number;
      grouped.set(gameInfo.sortValue, existing);
    });

    return Array.from(grouped.values())
      .sort((a, b) => (Number(a.sort) || 0) - (Number(b.sort) || 0))
      .map((row) => {
        const clone: Record<string, number | string> = { ...row };
        delete clone.sort;
        ensureDefaults(clone);
        return clone;
      });
  }, [playerLines, playerLinesMap, selectedGame, stats, games, rangeStats, metricValue]);

  // Jogadores usados no BoxScore:
  // - Quando há jogo selecionado: usa diretamente os jogadores vinculados ao jogo (mesmo modelo da página pública)
  // - Quando não há jogo selecionado (visão geral): cai no comportamento agregado anterior
  const boxScorePlayers = useMemo(() => {
    // Caso principal: jogo selecionado → usar exatamente os jogadores do jogo
    if (selectedGame && selectedGamePlayers.length > 0) {
      return selectedGamePlayers;
    }

    // Visão geral (sem jogo selecionado): manter comportamento agregado
    const playersMap = new Map<number, BoxScorePlayer>();

    aggregatedEntries.forEach(({ player }) => {
      if (!playersMap.has(player.id)) {
        playersMap.set(player.id, {
          id: player.id,
          name: player.name || `Jogador ${player.id}`,
          number: player.number,
          position: player.position,
        });
      }
    });

    return Array.from(playersMap.values());
  }, [selectedGame, selectedGamePlayers, aggregatedEntries]);

  const boxScoreStats = selectedGame ? stats : rangeStats;

  return (
    <div className="w-full h-full">
      <div className="grid gap-6 md:grid-cols-[280px,1fr]">
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Período do jogo</h3>
            <DateRangePicker value={dateFilter} onChange={handleDateFilterChange} />
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Partidas</h3>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por adversário ou data"
              className="w-full border border-[#E3E3E3] rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] outline-none"
            />
            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedGame(null)}
                className={`w-full text-left px-3 py-2 rounded border text-sm transition-colors ${
                  !selectedGame ? 'bg-[#2563eb] text-white border-transparent shadow' : 'bg-white text-[#0F172A] border-[#E3E3E3] hover:bg-[#EFF2FF]'
                }`}
              >
                Visão geral
              </button>
              {filteredGames.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma partida encontrada no período.</p>
              ) : (
                filteredGames.map((game) => {
                  const isSelected = selectedGame?.id === game.id;
                  return (
                    <button
                      key={game.id}
                      onClick={() => setSelectedGame(game)}
                      className={`w-full text-left px-3 py-2 rounded border text-sm transition-colors ${
                        isSelected ? 'bg-[#2563eb] text-white border-transparent shadow' : 'bg-white text-[#0F172A] border-[#E3E3E3] hover:bg-[#EFF2FF]'
                      }`}
                    >
                      <div className="text-xs uppercase tracking-wide text-[#7B8BB2]">{new Date(game.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div className="font-semibold">{game.opponent}</div>
                      <div className="text-[11px] text-[#94A3B8]">
                        {game.status === 'FINALIZADA'
                          ? 'Finalizado'
                          : game.status === 'EM_ANDAMENTO'
                            ? 'Em andamento'
                            : 'Pendente'}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>
        </div>
        <div>
          {error && (
            <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-3 rounded mb-6" role="alert">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
                ))}
              </div>
              <div className="bg-gray-200 h-64 rounded-lg mb-8 animate-pulse"></div>
              <div className="bg-gray-200 h-48 rounded-lg animate-pulse"></div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-[#2563eb]">{overview?.total_jogos ?? '-'}</div>
                  <div className="text-xs text-[#7B8BB2] mt-1">Jogos</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-[#2563eb]">{overview?.estatisticas_gerais?.total_pontos ?? '-'}</div>
                  <div className="text-xs text-[#7B8BB2] mt-1">Pontos</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-[#2563eb]">{overview?.total_campeonatos ?? '-'}</div>
                  <div className="text-xs text-[#7B8BB2] mt-1">Campeonatos</div>
                </Card>
              </div>

              <div className="w-full bg-white rounded shadow p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div className="inline-flex bg-[#F1F4FF] rounded-md p-1 self-start">
                    <button onClick={() => setActiveTab('comparativo')} className={`px-3 py-1 text-sm rounded ${activeTab === 'comparativo' ? 'bg-white shadow font-semibold text-[#2563eb]' : 'text-[#7B8BB2]'}`}>Comparativo</button>
                    <button onClick={() => setActiveTab('evolutivo')} className={`px-3 py-1 text-sm rounded ${activeTab === 'evolutivo' ? 'bg-white shadow font-semibold text-[#2563eb]' : 'text-[#7B8BB2]'}`}>Evolutivo</button>
                  </div>
                  <div className="inline-flex bg-[#F7F7FA] rounded-md p-1 self-start">
                    {(['Pontos', 'Assistências', 'Rebotes', 'Faltas'] as const).map((m) => (
                      <button key={m} onClick={() => setMetric(m)} className={`px-3 py-1 text-xs rounded ${metric === m ? 'bg-[#2563eb] text-white' : 'text-[#7B8BB2]'}`}>{m}</button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  {activeTab === 'comparativo' ? (
                    <BarChart data={comparativeChartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      {metric === 'Pontos' && <Bar dataKey="Pontos" fill="#2563eb" />}
                      {metric === 'Assistências' && <Bar dataKey="Assistências" fill="#7c3aed" />}
                      {metric === 'Rebotes' && <Bar dataKey="Rebotes" fill="#10b981" />}
                      {metric === 'Faltas' && <Bar dataKey="Faltas" fill="#ef4444" />}
                    </BarChart>
                  ) : (
                    <LineChart data={evolutiveData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      {playerLines.map((line) => (
                        <Line
                          key={line.key}
                          type="monotone"
                          dataKey={line.key}
                          name={line.label}
                          stroke={line.color}
                          strokeWidth={2}
                          dot
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4 text-center">
                  <span className="text-gray-500">BOX</span><span className="text-[#2563eb]">SCORE</span>
                </h2>
                <BoxScoreTable
                  gameId={selectedGame?.id ?? null}
                  stats={boxScoreStats}
                  players={boxScorePlayers}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
