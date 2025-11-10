import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { getPlayers, getGameStats, createGameStats, updateGameStats } from '../services/api';
import { Player, GameStats } from '../types';
import { usePageTitle } from '../hooks/usePageTitle';

export function GameStatsTable() {
  usePageTitle("Tabela de Estatísticas");

  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersData, statsData] = await Promise.all([
          getPlayers(),
          getGameStats(gameId)
        ]);
        setPlayers(playersData);
        onStatsUpdate();
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [gameId, onStatsUpdate, toast]);

  const handleEdit = (stat: GameStats) => {
    setEditingStats({ ...stat });
  };

  const handleSave = async () => {
    if (!editingStats) return;

    try {
      await updateGameStats(gameId, editingStats.id, {
        points: editingStats.points,
        rebounds: editingStats.rebounds,
        assists: editingStats.assists,
        steals: editingStats.steals,
        blocks: editingStats.blocks,
        fouls: editingStats.fouls,
        turnovers: editingStats.turnovers,
        minutes_played: editingStats.minutes_played,
      });

      toast({
        title: "Sucesso",
        description: "Estatísticas atualizadas com sucesso!",
      });

      setEditingStats(null);
      onStatsUpdate();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar estatísticas",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingStats(null);
  };

  const handleInputChange = (field: keyof GameStats, value: number) => {
    if (!editingStats) return;
    setEditingStats((prev) => prev ? { ...prev, [field]: value } : null);
  };

  if (!players.length || !stats.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas do Jogo</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jogador</TableHead>
              <TableHead>Pontos</TableHead>
              <TableHead>2PT (A/M)</TableHead>
              <TableHead>3PT (A/M)</TableHead>
              <TableHead>LL (A/M)</TableHead>
              <TableHead>Rebotes</TableHead>
              <TableHead>Assistências</TableHead>
              <TableHead>Roubos</TableHead>
              <TableHead>Bloqueios</TableHead>
              <TableHead>Faltas</TableHead>
              <TableHead>Perdas</TableHead>
              <TableHead>Minutos</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((stat) => {
              const player = players.find(p => p.id === stat.player_id);
              return (
                <TableRow key={stat.id}>
                  <TableCell>{player?.name}</TableCell>
                  <TableCell>{stat.points}</TableCell>
                  <TableCell>{stat.two_attempts} / {stat.two_made}</TableCell>
                  <TableCell>{stat.three_attempts} / {stat.three_made}</TableCell>
                  <TableCell>{stat.free_throw_attempts} / {stat.free_throw_made}</TableCell>
                  <TableCell>{stat.rebounds}</TableCell>
                  <TableCell>{stat.assists}</TableCell>
                  <TableCell>{stat.steals}</TableCell>
                  <TableCell>{stat.blocks}</TableCell>
                  <TableCell>{stat.fouls}</TableCell>
                  <TableCell>{stat.turnovers}</TableCell>
                  <TableCell>{stat.minutes_played}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEdit(stat)} size="sm">Editar</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 