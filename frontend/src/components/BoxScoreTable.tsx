import { useState, useEffect } from 'react';
import { getPlayers } from '../services/api';
import { Card } from "./ui/Card";
import { Button } from '../components/ui/Button';
import { GameStats } from "../types/game";
import { Player } from "../types/player";
import { Select } from "./ui/Select";

interface BoxScoreTableProps {
  gameId: number;
  stats: GameStats[];
  onStatsUpdate: () => void;
}

const POS_SIGLAS: Record<string, string> = {
  'Armador': 'ARM',
  'Ala': 'ALA',
  'Ala-Pivô': 'ALP',
  'Ala-Armador': 'AAR',
  'Pivô': 'PIV',
};

export function BoxScoreTable({ gameId, stats, onStatsUpdate }: BoxScoreTableProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'total' | number>('total');

  useEffect(() => {
    if (!gameId) {
      setPlayers([]);
      return;
    }
    const fetchData = async () => {
      try {
        const playersData = await getPlayers();
        setPlayers(playersData);
      } catch (error) {
        console.error("Erro ao carregar jogadores:", error);
      }
    };
    fetchData();
  }, [gameId]);

  // Se não houver jogo selecionado, exibe mensagem amigável
  if (!gameId) {
    return (
      <Card className="p-6 text-center text-gray-500">
        Nenhum jogo cadastrado ou selecionado. Cadastre ou selecione um jogo para visualizar o box score.
      </Card>
    );
  }

  // Debug temporário
  console.log('BoxScoreTable stats:', stats);
  console.log('BoxScoreTable players:', players);

  function getPosSigla(pos: string) {
    return POS_SIGLAS[pos] || pos?.toUpperCase() || '-';
  }

  function getPlayer(playerId: number) {
    return players.find(p => p.id === playerId);
  }

  function calcTREB(stat: GameStats) {
    return stat.rebounds;
  }

  // Novo cálculo de eficiência: percentual de acertos sobre tentativas totais
  function calcEF(s: any) {
    const acertos = (s.two_made || 0) + (s.three_made || 0) + (s.free_throw_made || 0);
    const tentativas = (s.two_attempts || 0) + (s.three_attempts || 0) + (s.free_throw_attempts || 0);
    if (!tentativas) return '0%';
    return ((acertos / tentativas) * 100).toFixed(1) + '%';
  }

  // Função para mapear o objeto de estatística para o formato esperado
  function mapStat(stat: any) {
    return {
      player_id: stat.player_id ?? stat.id,
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
      total_fouls: stat.fouls ?? stat.total_fouls ?? 0,
      interceptions: stat.interference ?? stat.int ?? 0,
    };
  }

  // Agrupa estatísticas por jogadora, somando todos os campos relevantes
  function groupStatsAllPlayers(stats: any[], period: 'total' | number, players: Player[]) {
    // Atualizar StatGroup para os campos padronizados em inglês
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
      // [key: string]: any; // Remover index signature para evitar erro
    };
    const grouped: Record<number, StatGroup> = {};
    players.forEach((p) => {
      grouped[p.id] = {
        player_id: p.id,
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
      };
    });
    stats.forEach((stat) => {
      // Corrigir nome do campo do período: quarter ou quarto
      const statPeriod = stat.quarter ?? stat.quarto;
      if (period !== 'total' && statPeriod !== period) return;
      const s = mapStat(stat);
      const pid = s.player_id;
      if (!grouped[pid]) {
        grouped[pid] = { ...s };
      } else {
        // Somar apenas os campos padronizados em inglês
        grouped[pid].points += s.points;
        grouped[pid].two_attempts += s.two_attempts;
        grouped[pid].two_made += s.two_made;
        grouped[pid].three_attempts += s.three_attempts;
        grouped[pid].three_made += s.three_made;
        grouped[pid].free_throw_attempts += s.free_throw_attempts;
        grouped[pid].free_throw_made += s.free_throw_made;
        grouped[pid].offensive_rebounds += s.offensive_rebounds;
        grouped[pid].defensive_rebounds += s.defensive_rebounds;
        grouped[pid].total_rebounds += s.total_rebounds;
        grouped[pid].assists += s.assists;
        grouped[pid].turnovers += s.turnovers;
        grouped[pid].steals += s.steals;
        grouped[pid].blocks += s.blocks;
        grouped[pid].personal_fouls += s.personal_fouls;
        grouped[pid].fouls_drawn += s.fouls_drawn;
        grouped[pid].total_fouls += s.total_fouls;
        grouped[pid].interceptions += s.interceptions;
      }
    });
    return players.map((p) => grouped[p.id]);
  }

  // Substituir o map direto por agrupamento
  const periods = [
    { value: 'total', label: 'Partida (Total)' },
    { value: 1, label: '1º Quarto' },
    { value: 2, label: '2º Quarto' },
    { value: 3, label: '3º Quarto' },
    { value: 4, label: '4º Quarto' },
  ];

  const groupedStats = groupStatsAllPlayers(stats, selectedPeriod, players);

  // 2. Atualizar renderRow para usar os campos em inglês e ordem correta
  const renderRow = (stat: any, player: any, idx: number) => {
    const s = stat || {};
    const rowClass = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
    return (
      <tr key={player?.id || idx} className={rowClass}>
        <td className="text-center">{player?.number ?? '-'}</td>
        <td className="text-center min-w-[120px] max-w-[160px] truncate">{player?.name ?? player?.nome ?? '-'}</td>
        <td className="text-center">{getPosSigla(player?.position ?? player?.posicao ?? '')}</td>
        <td className="text-center">{s.points ?? 0}</td>
        <td className="text-center">{s.two_attempts ?? 0}</td>
        <td className="text-center">{s.two_made ?? 0}</td>
        <td className="text-center">{s.three_attempts ?? 0}</td>
        <td className="text-center">{s.three_made ?? 0}</td>
        <td className="text-center">{s.free_throw_attempts ?? 0}</td>
        <td className="text-center">{s.free_throw_made ?? 0}</td>
        <td className="text-center">{s.offensive_rebounds ?? 0}</td>
        <td className="text-center">{s.defensive_rebounds ?? 0}</td>
        <td className="text-center">{s.total_rebounds ?? 0}</td>
        <td className="text-center">{s.assists ?? 0}</td>
        <td className="text-center">{s.turnovers ?? 0}</td>
        <td className="text-center">{s.steals ?? 0}</td>
        <td className="text-center">{s.blocks ?? 0}</td>
        <td className="text-center">{s.personal_fouls ?? 0}</td>
        <td className="text-center">{s.fouls_drawn ?? 0}</td>
        <td className="text-center">{(s.personal_fouls ?? 0) + (s.fouls_drawn ?? 0)}</td>
        <td className="text-center">{s.interceptions ?? 0}</td>
        <td className="text-center">{calcEF(s)}</td>
      </tr>
    );
  };

  // 3. Atualizar o cabeçalho da tabela para português e ordem correta
  return (
    <Card>
      <div className="border-b px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h2 className="text-lg font-bold">Box Score</h2>
        <div>
          <label className="mr-2 font-medium text-sm">Período:</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value === 'total' ? 'total' : Number(e.target.value))}
          >
            {periods.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
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
              {players.length > 0
                ? groupedStats.map((stat, idx) => renderRow(stat, players[idx], idx))
                : renderRow({}, {}, 0)}
            </tbody>
          </table>
        </div>
        {/* 4. Atualizar legenda para português */}
        <div className="mt-6 p-4 bg-gray-50 rounded text-xs text-gray-700">
          <strong>Legenda das Siglas:</strong><br />
          <b>Nº</b>: Número do jogador &nbsp;|&nbsp;
          <b>JOGADOR</b>: Nome do Jogador &nbsp;|&nbsp;
          <b>POS</b>: Posição (ARM=Armador, ALA=Ala, ALP=Ala-Pivô, AAR=Ala-Armador, PIV=Pivô) &nbsp;|&nbsp;
          <b>PTS</b>: Total de pontos &nbsp;|&nbsp;
          <b>2P</b>: Tentativas de 2 pontos &nbsp;|&nbsp;
          <b>2PTS</b>: Acertos de 2 pontos &nbsp;|&nbsp;
          <b>3P</b>: Tentativas de 3 pontos &nbsp;|&nbsp;
          <b>3PTS</b>: Acertos de 3 pontos &nbsp;|&nbsp;
          <b>LL</b>: Tentativas de lance livre &nbsp;|&nbsp;
          <b>PLL</b>: Acertos de lance livre &nbsp;|&nbsp;
          <b>REBO</b>: Rebote Ofensivo &nbsp;|&nbsp;
          <b>REBD</b>: Rebote Defensivo &nbsp;|&nbsp;
          <b>TREB</b>: Total de Rebotes &nbsp;|&nbsp;
          <b>ASS</b>: Assistências &nbsp;|&nbsp;
          <b>TURN</b>: Turnovers (erros) &nbsp;|&nbsp;
          <b>RB</b>: Roubos de bola &nbsp;|&nbsp;
          <b>T</b>: Tocos &nbsp;|&nbsp;
          <b>FP</b>: Faltas Pessoais &nbsp;|&nbsp;
          <b>FR</b>: Faltas Recebidas &nbsp;|&nbsp;
          <b>TF</b>: Total de Faltas &nbsp;|&nbsp;
          <b>INT</b>: Interceptações &nbsp;|&nbsp;
          <b>EF</b>: Efetividade (%)
        </div>
      </div>
    </Card>
  );
} 