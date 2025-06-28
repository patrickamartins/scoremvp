import { useState, useEffect } from 'react';
import { api, getPlayers, getGameStats, updateGameStats } from '@/services/api';
import { Card } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '../components/ui/Button';
import { Input } from "@/components/ui/input";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameStats } from "@/types/game";
import { Player } from "@/types/player";
import { useToast } from "@/components/ui/use-toast";

interface GameStatsTableProps {
  gameId: number;
  stats: GameStats[];
  onStatsUpdate: () => void;
}

export function GameStatsTable({ gameId, stats, onStatsUpdate }: GameStatsTableProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingStats, setEditingStats] = useState<GameStats | null>(null);
  const { toast } = useToast();

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
                  <TableCell>
                    {editingStats?.id === stat.id ? (
                      <Input
                        type="number"
                        value={editingStats.points}
                        onChange={(e) => handleInputChange("points", Number(e.target.value))}
                        className="w-20"
                      />
                    ) : (
                      stat.points
                    )}
                  </TableCell>
                  <TableCell>
                    {editingStats?.id === stat.id ? (
                      <Input
                        type="number"
                        value={editingStats.rebounds}
                        onChange={(e) => handleInputChange("rebounds", Number(e.target.value))}
                        className="w-20"
                      />
                    ) : (
                      stat.rebounds
                    )}
                  </TableCell>
                  <TableCell>
                    {editingStats?.id === stat.id ? (
                      <Input
                        type="number"
                        value={editingStats.assists}
                        onChange={(e) => handleInputChange("assists", Number(e.target.value))}
                        className="w-20"
                      />
                    ) : (
                      stat.assists
                    )}
                  </TableCell>
                  <TableCell>
                    {editingStats?.id === stat.id ? (
                      <Input
                        type="number"
                        value={editingStats.steals}
                        onChange={(e) => handleInputChange("steals", Number(e.target.value))}
                        className="w-20"
                      />
                    ) : (
                      stat.steals
                    )}
                  </TableCell>
                  <TableCell>
                    {editingStats?.id === stat.id ? (
                      <Input
                        type="number"
                        value={editingStats.blocks}
                        onChange={(e) => handleInputChange("blocks", Number(e.target.value))}
                        className="w-20"
                      />
                    ) : (
                      stat.blocks
                    )}
                  </TableCell>
                  <TableCell>
                    {editingStats?.id === stat.id ? (
                      <Input
                        type="number"
                        value={editingStats.fouls}
                        onChange={(e) => handleInputChange("fouls", Number(e.target.value))}
                        className="w-20"
                      />
                    ) : (
                      stat.fouls
                    )}
                  </TableCell>
                  <TableCell>
                    {editingStats?.id === stat.id ? (
                      <Input
                        type="number"
                        value={editingStats.turnovers}
                        onChange={(e) => handleInputChange("turnovers", Number(e.target.value))}
                        className="w-20"
                      />
                    ) : (
                      stat.turnovers
                    )}
                  </TableCell>
                  <TableCell>
                    {editingStats?.id === stat.id ? (
                      <Input
                        type="number"
                        value={editingStats.minutes_played}
                        onChange={(e) => handleInputChange("minutes_played", Number(e.target.value))}
                        className="w-20"
                      />
                    ) : (
                      stat.minutes_played
                    )}
                  </TableCell>
                  <TableCell>
                    {editingStats?.id === stat.id ? (
                      <div className="flex space-x-2">
                        <Button onClick={handleSave} size="sm">Salvar</Button>
                        <Button onClick={handleCancel} variant="outline" size="sm">Cancelar</Button>
                      </div>
                    ) : (
                      <Button onClick={() => handleEdit(stat)} size="sm">Editar</Button>
                    )}
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