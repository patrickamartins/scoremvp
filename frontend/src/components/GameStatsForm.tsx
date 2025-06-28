import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getGame, getPlayer, updateGameStats } from "@/services/api";
import { Game } from "@/types/game";
import { Player, PlayerStats } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface GameStatsFormProps {
  gameId: number;
  statsId: number;
}

export function GameStatsForm({ gameId, statsId }: GameStatsFormProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gameData, statsData] = await Promise.all([
          getGame(gameId),
          api.get<PlayerStats>(`/games/${gameId}/stats/${statsId}`).then(res => res.data)
        ]);
        setGame(gameData);
        setStats(statsData);

        const playerData = await getPlayer(statsData.player_id);
        setPlayer(playerData);
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
  }, [gameId, statsId, toast]);

  const handleInputChange = (field: keyof PlayerStats, value: number) => {
    if (!stats) return;
    setStats(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stats) return;

    try {
      await updateGameStats(gameId, statsId, {
        points: stats.points,
        rebounds: stats.rebounds,
        assists: stats.assists,
        steals: stats.steals,
        blocks: stats.blocks,
        fouls: stats.fouls,
        turnovers: stats.turnovers,
        minutes_played: stats.minutes_played,
      });

      toast({
        title: "Sucesso",
        description: "Estatísticas atualizadas com sucesso",
      });

      navigate(`/games/${gameId}`);
    } catch (error) {
      console.error("Erro ao atualizar estatísticas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as estatísticas",
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

  if (!game || !player || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Dados não encontrados</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Editar Estatísticas - {player.name} vs {game.opponent}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="points">Pontos</Label>
                <Input
                  id="points"
                  type="number"
                  value={stats.points}
                  onChange={(e) => handleInputChange("points", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rebounds">Rebotes</Label>
                <Input
                  id="rebounds"
                  type="number"
                  value={stats.rebounds}
                  onChange={(e) => handleInputChange("rebounds", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assists">Assistências</Label>
                <Input
                  id="assists"
                  type="number"
                  value={stats.assists}
                  onChange={(e) => handleInputChange("assists", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="steals">Roubos</Label>
                <Input
                  id="steals"
                  type="number"
                  value={stats.steals}
                  onChange={(e) => handleInputChange("steals", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blocks">Bloqueios</Label>
                <Input
                  id="blocks"
                  type="number"
                  value={stats.blocks}
                  onChange={(e) => handleInputChange("blocks", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fouls">Faltas</Label>
                <Input
                  id="fouls"
                  type="number"
                  value={stats.fouls}
                  onChange={(e) => handleInputChange("fouls", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="turnovers">Perdas</Label>
                <Input
                  id="turnovers"
                  type="number"
                  value={stats.turnovers}
                  onChange={(e) => handleInputChange("turnovers", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minutes_played">Minutos</Label>
                <Input
                  id="minutes_played"
                  type="number"
                  value={stats.minutes_played}
                  onChange={(e) => handleInputChange("minutes_played", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => navigate(`/games/${gameId}`)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 