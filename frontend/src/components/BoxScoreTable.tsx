import { useMemo, useState } from 'react';
import { Card } from "./ui/Card";
import { GameStats } from "../types/game";

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
};

const periods = [
  { value: 'total', label: 'Partida (Total)' },
  { value: 1, label: '1º Quarto' },
  { value: 2, label: '2º Quarto' },
  { value: 3, label: '3º Quarto' },
  { value: 4, label: '4º Quarto' },
];

export function BoxScoreTable({ gameId, stats, players }: BoxScoreTableProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'total' | number>('total');

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

  const hasData = rows.length > 0;

  const calcEF = (s: StatGroup) => {
    const acertos = (s.two_made || 0) + (s.three_made || 0) + (s.free_throw_made || 0);
    const tentativas = (s.two_attempts || 0) + (s.three_attempts || 0) + (s.free_throw_attempts || 0);
    if (!tentativas) return '0%';
    return ((acertos / tentativas) * 100).toFixed(1) + '%';
  };

  const getPosSigla = (pos?: string) => {
    if (!pos) return '-';
    return POS_SIGLAS[pos] || pos.toUpperCase();
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
      <div className="border-b px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h2 className="text-lg font-bold">Box Score</h2>
        <div className="flex items-center gap-2 text-sm">
          <label className="font-medium">Período:</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value === 'total' ? 'total' : Number(e.target.value))}
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm">
            <thead>
              <tr>
                <th className="text-center">Nº</th>
                <th className="text-center">JOGADOR</th>
                <th className="text-center">POS</th>
                <th className="text-center">PTS</th>
                <th className="text-center">2P</th>
                <th className="text-center">2PTS</th>
                <th className="text-center">3P</th>
                <th className="text-center">3PTS</th>
                <th className="text-center">LL</th>
                <th className="text-center">PLL</th>
                <th className="text-center">REBO</th>
                <th className="text-center">REBD</th>
                <th className="text-center">TREB</th>
                <th className="text-center">ASS</th>
                <th className="text-center">TURN</th>
                <th className="text-center">RB</th>
                <th className="text-center">T</th>
                <th className="text-center">FP</th>
                <th className="text-center">FR</th>
                <th className="text-center">TF</th>
                <th className="text-center">INT</th>
                <th className="text-center">EF</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ player, stat }, idx) => {
                const rowClass = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                return (
                  <tr key={player.id} className={rowClass}>
                    <td className="text-center">{player.number ?? '-'}</td>
                    <td className="text-center min-w-[120px] max-w-[160px] truncate">{player.name ?? '-'}</td>
                    <td className="text-center">{getPosSigla(typeof player.position === 'string' ? player.position : undefined)}</td>
                    <td className="text-center">{stat?.points ?? 0}</td>
                    <td className="text-center">{stat?.two_attempts ?? 0}</td>
                    <td className="text-center">{stat?.two_made ?? 0}</td>
                    <td className="text-center">{stat?.three_attempts ?? 0}</td>
                    <td className="text-center">{stat?.three_made ?? 0}</td>
                    <td className="text-center">{stat?.free_throw_attempts ?? 0}</td>
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
                    <td className="text-center">{stat ? calcEF(stat) : '0%'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded text-xs text-gray-700">
          <strong>Legenda das Siglas:</strong><br />
          <b>Nº</b>: Número do jogador &nbsp;|&nbsp;
          <b>JOGADOR</b>: Nome do Jogador &nbsp;|&nbsp;
          <b>POS</b>: Posição (ARM=Armador, ALA=Ala, ALP=Ala-Pivô, AAR=Ala-Armador, PIV=Pivô) &nbsp;|&nbsp;
          <b>PTS</b>: Total de pontos &nbsp;|&nbsp;
          <b>2P</b>: Tentativas de 2 pontos &nbsp;|&nbsp;
          <b>2PTS</b>: Cestas de 2 pontos &nbsp;|&nbsp;
          <b>3P</b>: Tentativas de 3 pontos &nbsp;|&nbsp;
          <b>3PTS</b>: Cestas de 3 pontos &nbsp;|&nbsp;
          <b>LL</b>: Tentativas de lance livre &nbsp;|&nbsp;
          <b>PLL</b>: Lances livres convertidos &nbsp;|&nbsp;
          <b>REBO</b>: Rebotes ofensivos &nbsp;|&nbsp;
          <b>REBD</b>: Rebotes defensivos &nbsp;|&nbsp;
          <b>TREB</b>: Total de rebotes &nbsp;|&nbsp;
          <b>ASS</b>: Assistências &nbsp;|&nbsp;
          <b>TURN</b>: Turnovers (erros) &nbsp;|&nbsp;
          <b>RB</b>: Roubos de bola &nbsp;|&nbsp;
          <b>T</b>: Tocos &nbsp;|&nbsp;
          <b>FP</b>: Faltas pessoais &nbsp;|&nbsp;
          <b>FR</b>: Faltas recebidas &nbsp;|&nbsp;
          <b>TF</b>: Total de faltas &nbsp;|&nbsp;
          <b>INT</b>: Interceptações &nbsp;|&nbsp;
          <b>EF</b>: Eficiência (%)
        </div>
      </div>
    </Card>
  );
}