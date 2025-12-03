import { useMemo, useState } from 'react';
import { Card } from "./ui/Card";
import { GameStats } from "../types/game";
import { ChevronUp, ChevronDown } from 'lucide-react';

type BoxScorePlayer = {
  id: number;
  name: string;
  number?: number | string;
  position?: string;
};

interface BoxScoreTableProps {
  gameId?: number | null;
  stats: GameStats[];
  players: BoxScorePlayer[];
  hidePeriodSelector?: boolean;
}

const POS_SIGLAS: Record<string, string> = {
  'Armador': 'ARM',
  'Ala': 'ALA',
  'Ala-Pivô': 'ALP',
  'Ala-Armador': 'AAR',
  'Pivô': 'PIV',
};

type StatGroup = {
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
  minutes_played: number;
};

type SortColumn = {
  key: string;
  direction: 'asc' | 'desc' | null;
};

export function BoxScoreTable({ gameId, stats, players, hidePeriodSelector = false }: BoxScoreTableProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'total' | number>('total');
  const [sortColumn, setSortColumn] = useState<SortColumn>({ key: '', direction: null });

  const mapStat = (stat: any) => ({
    player_id: Number(stat.player_id ?? stat.id),
    points: stat.points ?? stat.total_pontos ?? 0,
    two_attempts: stat.two_attempts ?? stat.p2 ?? 0,
    two_made: stat.two_made ?? stat.p2pts ?? 0,
    three_attempts: stat.three_attempts ?? stat.p3 ?? 0,
    three_made: stat.three_made ?? stat.p3pts ?? 0,
    free_throw_attempts: stat.free_throw_attempts ?? stat.ll ?? 0,
    free_throw_made: stat.free_throw_made ?? stat.pll ?? 0,
    offensive_rebounds: stat.rebo_ofensivo ?? stat.oreb ?? 0,
    defensive_rebounds: stat.rebo_defensivo ?? stat.dreb ?? 0,
    total_rebounds: (stat.rebo_ofensivo ?? stat.oreb ?? 0) + (stat.rebo_defensivo ?? stat.dreb ?? 0),
    assists: stat.assists ?? stat.total_assistencias ?? 0,
    turnovers: stat.turnovers ?? stat.err ?? 0,
    steals: stat.steals ?? stat.rb ?? 0,
    blocks: stat.blocks ?? stat.t ?? 0,
    personal_fouls: stat.fp ?? stat.personal_fouls ?? 0,
    fouls_drawn: stat.faltas_recebidas ?? stat.fr ?? stat.fouls_drawn ?? 0,
    total_fouls: stat.fouls ?? stat.total_faltas ?? stat.total_fouls ?? 0,
    interceptions: stat.interference ?? stat.int ?? 0,
    minutes_played: stat.minutes_played ?? 0,
  });

  const groupedStats = useMemo(() => {
    const emptyStat = (playerId: number): StatGroup => ({
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
      minutes_played: 0,
    });

    const map = new Map<number, StatGroup>();
    players.forEach((player) => {
      const id = Number(player.id);
      map.set(id, emptyStat(id));
    });

    stats.forEach((raw) => {
      const periodValue = raw.quarter ?? raw.quarto ?? 'total';
      if (selectedPeriod !== 'total' && periodValue !== selectedPeriod) return;
      const stat = mapStat(raw);
      const bucket = map.get(stat.player_id) ?? emptyStat(stat.player_id);
      // Somar pontos: se o backend não trouxe points, calcular pelos acertos
      const derivedPoints = (stat.two_made || 0) * 2 + (stat.three_made || 0) * 3 + (stat.free_throw_made || 0);
      const pointsToAdd = typeof stat.points === 'number' && stat.points > 0 ? stat.points : derivedPoints;
      bucket.points += pointsToAdd;
      bucket.two_attempts += stat.two_attempts;
      bucket.two_made += stat.two_made;
      bucket.three_attempts += stat.three_attempts;
      bucket.three_made += stat.three_made;
      bucket.free_throw_attempts += stat.free_throw_attempts;
      bucket.free_throw_made += stat.free_throw_made;
      bucket.offensive_rebounds += stat.offensive_rebounds;
      bucket.defensive_rebounds += stat.defensive_rebounds;
      bucket.total_rebounds += stat.total_rebounds;
      bucket.assists += stat.assists;
      bucket.turnovers += stat.turnovers;
      bucket.steals += stat.steals;
      bucket.blocks += stat.blocks;
      bucket.personal_fouls += stat.personal_fouls;
      bucket.fouls_drawn += stat.fouls_drawn;
      bucket.total_fouls += stat.total_fouls;
      bucket.interceptions += stat.interceptions;
      bucket.minutes_played += stat.minutes_played;
      map.set(stat.player_id, bucket);
    });

    return map;
  }, [stats, players, selectedPeriod]);

  const rows = useMemo(() => {
    return players
      .map((player) => {
        const id = Number(player.id);
        const stat = groupedStats.get(id);
        return {
          player,
          stat,
        };
      })
      .filter(({ stat }) => stat && (
        stat.points > 0 ||
        stat.assists > 0 ||
        stat.total_rebounds > 0 ||
        stat.steals > 0 ||
        stat.blocks > 0 ||
        stat.personal_fouls > 0 ||
        stat.fouls_drawn > 0
      ));
  }, [groupedStats, players]);

  // Ordenar linhas
  const sortedRows = useMemo(() => {
    if (!sortColumn.key || !sortColumn.direction) return rows;

    return [...rows].sort((a, b) => {
      if (!a.stat || !b.stat) return 0;
      
      let aValue: number = 0;
      let bValue: number = 0;

      switch (sortColumn.key) {
        case 'number':
          aValue = Number(a.player.number) || 0;
          bValue = Number(b.player.number) || 0;
          break;
        case 'name':
          return sortColumn.direction === 'asc' 
            ? (a.player.name || '').localeCompare(b.player.name || '')
            : (b.player.name || '').localeCompare(a.player.name || '');
        case 'minutes_played':
          aValue = a.stat.minutes_played || 0;
          bValue = b.stat.minutes_played || 0;
          break;
        case 'points':
          aValue = a.stat.points;
          bValue = b.stat.points;
          break;
        case 'two_p':
          aValue = a.stat.two_attempts > 0 ? (a.stat.two_made / a.stat.two_attempts) * 100 : 0;
          bValue = b.stat.two_attempts > 0 ? (b.stat.two_made / b.stat.two_attempts) * 100 : 0;
          break;
        case 'two_made':
          aValue = a.stat.two_made || 0;
          bValue = b.stat.two_made || 0;
          break;
        case 'three_p':
          aValue = a.stat.three_attempts > 0 ? (a.stat.three_made / a.stat.three_attempts) * 100 : 0;
          bValue = b.stat.three_attempts > 0 ? (b.stat.three_made / b.stat.three_attempts) * 100 : 0;
          break;
        case 'three_made':
          aValue = a.stat.three_made || 0;
          bValue = b.stat.three_made || 0;
          break;
        case 'free_throw':
          aValue = a.stat.free_throw_attempts > 0 ? (a.stat.free_throw_made / a.stat.free_throw_attempts) * 100 : 0;
          bValue = b.stat.free_throw_attempts > 0 ? (b.stat.free_throw_made / b.stat.free_throw_attempts) * 100 : 0;
          break;
        case 'free_throw_made':
          aValue = a.stat.free_throw_made || 0;
          bValue = b.stat.free_throw_made || 0;
          break;
        case 'offensive_rebounds':
          aValue = a.stat.offensive_rebounds || 0;
          bValue = b.stat.offensive_rebounds || 0;
          break;
        case 'defensive_rebounds':
          aValue = a.stat.defensive_rebounds || 0;
          bValue = b.stat.defensive_rebounds || 0;
          break;
        case 'rebounds':
          aValue = a.stat.total_rebounds;
          bValue = b.stat.total_rebounds;
          break;
        case 'assists':
          aValue = a.stat.assists || 0;
          bValue = b.stat.assists || 0;
          break;
        case 'turnovers':
          aValue = a.stat.turnovers;
          bValue = b.stat.turnovers;
          break;
        case 'steals':
          aValue = a.stat.steals || 0;
          bValue = b.stat.steals || 0;
          break;
        case 'blocks':
          aValue = a.stat.blocks || 0;
          bValue = b.stat.blocks || 0;
          break;
        case 'personal_fouls':
          aValue = a.stat.personal_fouls || 0;
          bValue = b.stat.personal_fouls || 0;
          break;
        case 'fouls_drawn':
          aValue = a.stat.fouls_drawn || 0;
          bValue = b.stat.fouls_drawn || 0;
          break;
        case 'total_fouls':
          aValue = (a.stat.personal_fouls || 0) + (a.stat.fouls_drawn || 0);
          bValue = (b.stat.personal_fouls || 0) + (b.stat.fouls_drawn || 0);
          break;
        case 'interceptions':
          aValue = a.stat.interceptions || 0;
          bValue = b.stat.interceptions || 0;
          break;
        case 'efficiency':
          aValue = parseFloat(calcEF(a.stat));
          bValue = parseFloat(calcEF(b.stat));
          break;
        default:
          aValue = (a.stat as any)[sortColumn.key] || 0;
          bValue = (b.stat as any)[sortColumn.key] || 0;
      }

      if (sortColumn.direction === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }, [rows, sortColumn]);

  const hasData = rows.length > 0;

  // Calcular totais de todas as colunas
  const totals = useMemo(() => {
    const total: StatGroup = {
      player_id: 0,
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
      minutes_played: 0,
    };

    rows.forEach(({ stat }) => {
      if (stat) {
        total.points += stat.points;
        total.two_attempts += stat.two_attempts;
        total.two_made += stat.two_made;
        total.three_attempts += stat.three_attempts;
        total.three_made += stat.three_made;
        total.free_throw_attempts += stat.free_throw_attempts;
        total.free_throw_made += stat.free_throw_made;
        total.offensive_rebounds += stat.offensive_rebounds;
        total.defensive_rebounds += stat.defensive_rebounds;
        total.total_rebounds += stat.total_rebounds;
        total.assists += stat.assists;
        total.turnovers += stat.turnovers;
        total.steals += stat.steals;
        total.blocks += stat.blocks;
        total.personal_fouls += stat.personal_fouls;
        total.fouls_drawn += stat.fouls_drawn;
        total.total_fouls += stat.personal_fouls + stat.fouls_drawn;
        total.interceptions += stat.interceptions;
        total.minutes_played += stat.minutes_played;
      }
    });

    return total;
  }, [rows]);

  const calcEF = (s: StatGroup) => {
    // Nova fórmula: (Pontos + Rebotes + Tocos + Roubos + Assistências + Interferencias) - (Arremessos de dois errados + Arremessos de três errados + Lances livres errados + Turnovers)
    const pontos = s.points || 0;
    const rebotes = s.total_rebounds || 0;
    const tocos = s.blocks || 0;
    const roubos = s.steals || 0;
    const assistencias = s.assists || 0;
    const interferencias = s.interceptions || 0;
    
    const dois_errados = (s.two_attempts || 0) - (s.two_made || 0);
    const tres_errados = (s.three_attempts || 0) - (s.three_made || 0);
    const ll_errados = (s.free_throw_attempts || 0) - (s.free_throw_made || 0);
    const turnovers = s.turnovers || 0;
    
    const eficiencia = (pontos + rebotes + tocos + roubos + assistencias + interferencias) - (dois_errados + tres_errados + ll_errados + turnovers);
    return eficiencia.toFixed(1);
  };

  const getPosSigla = (pos?: string) => {
    if (!pos) return '-';
    return POS_SIGLAS[pos] || pos.toUpperCase();
  };

  const formatMinutes = (minutes: number) => {
    // minutes_played pode vir em segundos (float) ou minutos (float)
    // Se for maior que 100, provavelmente está em segundos
    if (minutes > 100) {
      // Está em segundos, converter para minutos:segundos
      const totalSeconds = Math.floor(minutes);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    } else {
      // Está em minutos decimais, converter para minutos:segundos
      const mins = Math.floor(minutes);
      const secs = Math.floor((minutes - mins) * 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const formatPercentage = (made: number, attempts: number) => {
    if (attempts === 0) return '0';
    return Math.round((made / attempts) * 100).toString();
  };

  const handleSort = (columnKey: string) => {
    if (sortColumn.key === columnKey) {
      if (sortColumn.direction === 'asc') {
        setSortColumn({ key: columnKey, direction: 'desc' });
      } else if (sortColumn.direction === 'desc') {
        setSortColumn({ key: '', direction: null });
      }
    } else {
      setSortColumn({ key: columnKey, direction: 'asc' });
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortColumn.key !== columnKey) {
      return (
        <div className="inline-flex flex-col ml-1">
          <ChevronUp size={12} className="text-gray-400 -mb-1" />
          <ChevronDown size={12} className="text-gray-400" />
        </div>
      );
    }
    if (sortColumn.direction === 'asc') {
      return <ChevronUp size={12} className="text-blue-600 ml-1" />;
    }
    if (sortColumn.direction === 'desc') {
      return <ChevronDown size={12} className="text-blue-600 ml-1" />;
    }
    return null;
  };

  if (!hasData) {
    return (
      <Card className="p-6 text-center text-gray-500">
        {gameId ? 'Nenhuma estatística registrada para esta partida.' : 'Selecione uma partida ou registre estatísticas para visualizar o box score.'}
      </Card>
    );
  }

  return (
    <Card>
      {/* Filtro de Períodos com Toggle Switches */}
      {!hidePeriodSelector && (
        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setSelectedPeriod('total')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedPeriod === 'total'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <div className={`w-10 h-5 rounded-full relative transition-colors ${
                selectedPeriod === 'total' ? 'bg-white' : 'bg-gray-400'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  selectedPeriod === 'total' ? 'translate-x-5' : 'translate-x-0'
                }`}></div>
              </div>
              <span className="text-sm font-medium">TODOS OS PERÍODOS</span>
            </button>
            {[1, 2, 3, 4].map((q) => (
              <button
                key={q}
                onClick={() => setSelectedPeriod(q)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedPeriod === q
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <div className={`w-10 h-5 rounded-full relative transition-colors ${
                  selectedPeriod === q ? 'bg-white' : 'bg-gray-400'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    selectedPeriod === q ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </div>
                <span className="text-sm font-medium">{q}° Q</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-b px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h2 className="text-lg font-bold">Box Score</h2>
      </div>
      <div className="p-3 md:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm">
            <thead>
              <tr>
                <th className="text-center">Nº</th>
                <th className="text-center">JOGADOR</th>
                <th className="text-center">POS</th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('minutes_played')}
                >
                  <div className="flex items-center justify-center">
                    MIN
                    <SortIcon columnKey="minutes_played" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('points')}
                >
                  <div className="flex items-center justify-center">
                    PTS
                    <SortIcon columnKey="points" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('two_p')}
                >
                  <div className="flex items-center justify-center">
                    2P%
                    <SortIcon columnKey="two_p" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('two_made')}
                >
                  <div className="flex items-center justify-center">
                    2PTS
                    <SortIcon columnKey="two_made" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('three_p')}
                >
                  <div className="flex items-center justify-center">
                    3P%
                    <SortIcon columnKey="three_p" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('three_made')}
                >
                  <div className="flex items-center justify-center">
                    3PTS
                    <SortIcon columnKey="three_made" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('free_throw')}
                >
                  <div className="flex items-center justify-center">
                    LL%
                    <SortIcon columnKey="free_throw" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('free_throw_made')}
                >
                  <div className="flex items-center justify-center">
                    PLL
                    <SortIcon columnKey="free_throw_made" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('offensive_rebounds')}
                >
                  <div className="flex items-center justify-center">
                    REBO
                    <SortIcon columnKey="offensive_rebounds" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('defensive_rebounds')}
                >
                  <div className="flex items-center justify-center">
                    REBD
                    <SortIcon columnKey="defensive_rebounds" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('rebounds')}
                >
                  <div className="flex items-center justify-center">
                    TREB
                    <SortIcon columnKey="rebounds" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('assists')}
                >
                  <div className="flex items-center justify-center">
                    ASS
                    <SortIcon columnKey="assists" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('turnovers')}
                >
                  <div className="flex items-center justify-center">
                    TO
                    <SortIcon columnKey="turnovers" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('steals')}
                >
                  <div className="flex items-center justify-center">
                    BR
                    <SortIcon columnKey="steals" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('blocks')}
                >
                  <div className="flex items-center justify-center">
                    T
                    <SortIcon columnKey="blocks" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('personal_fouls')}
                >
                  <div className="flex items-center justify-center">
                    FP
                    <SortIcon columnKey="personal_fouls" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('fouls_drawn')}
                >
                  <div className="flex items-center justify-center">
                    FR
                    <SortIcon columnKey="fouls_drawn" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('total_fouls')}
                >
                  <div className="flex items-center justify-center">
                    TF
                    <SortIcon columnKey="total_fouls" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('interceptions')}
                >
                  <div className="flex items-center justify-center">
                    INT
                    <SortIcon columnKey="interceptions" />
                  </div>
                </th>
                <th 
                  className="text-center cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('efficiency')}
                >
                  <div className="flex items-center justify-center">
                    EF
                    <SortIcon columnKey="efficiency" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map(({ player, stat }, idx) => {
                const rowClass = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                return (
                  <tr key={player.id} className={rowClass}>
                    <td className="text-center">{player.number ?? '-'}</td>
                    <td className="text-center min-w-[120px] max-w-[160px] truncate">{player.name ?? '-'}</td>
                    <td className="text-center">{getPosSigla(typeof player.position === 'string' ? player.position : undefined)}</td>
                    <td className="text-center">{stat?.minutes_played ? formatMinutes(stat.minutes_played) : '0:00'}</td>
                    <td className="text-center">{stat?.points ?? 0}</td>
                    <td className="text-center">
                      {stat?.two_attempts ? `${stat.two_made}/${stat.two_attempts} (${formatPercentage(stat.two_made, stat.two_attempts)})` : '0/0 (0)'}
                    </td>
                    <td className="text-center">{stat?.two_made ?? 0}</td>
                    <td className="text-center">
                      {stat?.three_attempts ? `${stat.three_made}/${stat.three_attempts} (${formatPercentage(stat.three_made, stat.three_attempts)})` : '0/0 (0)'}
                    </td>
                    <td className="text-center">{stat?.three_made ?? 0}</td>
                    <td className="text-center">
                      {stat?.free_throw_attempts ? `${stat.free_throw_made}/${stat.free_throw_attempts} (${formatPercentage(stat.free_throw_made, stat.free_throw_attempts)})` : '0/0 (0)'}
                    </td>
                    <td className="text-center">{stat?.free_throw_made ?? 0}</td>
                    <td className="text-center">{stat?.offensive_rebounds ?? 0}</td>
                    <td className="text-center">{stat?.defensive_rebounds ?? 0}</td>
                    <td className="text-center">{stat?.total_rebounds ?? 0}</td>
                    <td className="text-center">{stat?.assists ?? 0}</td>
                    <td className="text-center">{stat?.turnovers ?? 0}</td>
                    <td className="text-center">{stat?.steals ?? 0}</td>
                    <td className="text-center">{stat?.blocks ?? 0}</td>
                    <td className="text-center">{stat?.personal_fouls ?? 0}</td>
                    <td className="text-center">{stat?.fouls_drawn ?? 0}</td>
                    <td className="text-center">{(stat?.personal_fouls ?? 0) + (stat?.fouls_drawn ?? 0)}</td>
                    <td className="text-center">{stat?.interceptions ?? 0}</td>
                    <td className="text-center">{stat ? calcEF(stat) : '0'}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold border-t-2 border-gray-400">
                <td className="text-center" colSpan={2}>TOTAL</td>
                <td className="text-center">-</td>
                <td className="text-center">{formatMinutes(totals.minutes_played)}</td>
                <td className="text-center">{totals.points}</td>
                <td className="text-center">
                  {totals.two_attempts ? `${totals.two_made}/${totals.two_attempts} (${formatPercentage(totals.two_made, totals.two_attempts)})` : '0/0 (0)'}
                </td>
                <td className="text-center">{totals.two_made}</td>
                <td className="text-center">
                  {totals.three_attempts ? `${totals.three_made}/${totals.three_attempts} (${formatPercentage(totals.three_made, totals.three_attempts)})` : '0/0 (0)'}
                </td>
                <td className="text-center">{totals.three_made}</td>
                <td className="text-center">
                  {totals.free_throw_attempts ? `${totals.free_throw_made}/${totals.free_throw_attempts} (${formatPercentage(totals.free_throw_made, totals.free_throw_attempts)})` : '0/0 (0)'}
                </td>
                <td className="text-center">{totals.free_throw_made}</td>
                <td className="text-center">{totals.offensive_rebounds}</td>
                <td className="text-center">{totals.defensive_rebounds}</td>
                <td className="text-center">{totals.total_rebounds}</td>
                <td className="text-center">{totals.assists}</td>
                <td className="text-center">{totals.turnovers}</td>
                <td className="text-center">{totals.steals}</td>
                <td className="text-center">{totals.blocks}</td>
                <td className="text-center">{totals.personal_fouls}</td>
                <td className="text-center">{totals.fouls_drawn}</td>
                <td className="text-center">{totals.total_fouls}</td>
                <td className="text-center">{totals.interceptions}</td>
                <td className="text-center">{calcEF(totals)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded text-xs text-gray-700">
          <strong>Legenda das Siglas:</strong><br />
          <b>Nº</b>: Número do jogador &nbsp;|&nbsp;
          <b>JOGADOR</b>: Nome do Jogador &nbsp;|&nbsp;
          <b>POS</b>: Posição (ARM=Armador, ALA=Ala, ALP=Ala-Pivô, AAR=Ala-Armador, PIV=Pivô) &nbsp;|&nbsp;
          <b>MIN</b>: Minutos jogados &nbsp;|&nbsp;
          <b>PTS</b>: Total de pontos &nbsp;|&nbsp;
          <b>2P%</b>: Aproveitamento de 2 pontos (feitos/tentativas %) &nbsp;|&nbsp;
          <b>2PTS</b>: Cestas de 2 pontos &nbsp;|&nbsp;
          <b>3P%</b>: Aproveitamento de 3 pontos (feitos/tentativas %) &nbsp;|&nbsp;
          <b>3PTS</b>: Cestas de 3 pontos &nbsp;|&nbsp;
          <b>LL%</b>: Aproveitamento de lance livre (feitos/tentativas %) &nbsp;|&nbsp;
          <b>PLL</b>: Lances livres convertidos &nbsp;|&nbsp;
          <b>REBO</b>: Rebotes ofensivos &nbsp;|&nbsp;
          <b>REBD</b>: Rebotes defensivos &nbsp;|&nbsp;
          <b>TREB</b>: Total de rebotes &nbsp;|&nbsp;
          <b>ASS</b>: Assistências &nbsp;|&nbsp;
          <b>TO</b>: Turnovers (erros) &nbsp;|&nbsp;
          <b>BR</b>: Roubos de bola &nbsp;|&nbsp;
          <b>T</b>: Tocos &nbsp;|&nbsp;
          <b>FP</b>: Faltas pessoais &nbsp;|&nbsp;
          <b>FR</b>: Faltas recebidas &nbsp;|&nbsp;
          <b>TF</b>: Total de faltas &nbsp;|&nbsp;
          <b>INT</b>: Interceptações &nbsp;|&nbsp;
          <b>EF</b>: Eficiência
        </div>
      </div>
    </Card>
  );
}
