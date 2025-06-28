import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getGame, getPlayers, getGameStats, createGameStats } from "@/services/api";
import { Game, GameStats } from "@/types/game";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface GamePanelProps {
  gameId: number;
}

export function GamePanel({ gameId }: GamePanelProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<GameStats[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gameData, playersData, statsData] = await Promise.all([
          getGame(gameId),
          getPlayers(),
          getGameStats(gameId)
        ]);
        setGame(gameData);
        setPlayers(playersData);
        setStats(statsData);
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
  }, [gameId, toast]);

  const handlePlayerSelect = (playerId: string) => {
    const player = players.find(p => p.id === parseInt(playerId));
    setSelectedPlayer(player || null);
  };

  const handleCreateStats = async () => {
    if (!selectedPlayer) {
      toast({
        title: "Erro",
        description: "Selecione um jogador",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await createGameStats(gameId, {
        player_id: selectedPlayer.id,
        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        fouls: 0,
        turnovers: 0,
        minutes_played: 0,
      });

      setStats(prev => [...prev, response]);
      toast({
        title: "Sucesso",
        description: "Estatísticas criadas com sucesso",
      });
    } catch (error) {
      console.error("Erro ao criar estatísticas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar as estatísticas",
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

  if (!game) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Jogo não encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {game.opponent} - {new Date(game.date).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="player">Jogador</Label>
              <Select onValueChange={handlePlayerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um jogador" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      {player.name} - {player.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleCreateStats} disabled={!selectedPlayer}>
              Adicionar Estatísticas
            </Button>

            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Estatísticas do Jogo</h3>
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
                            onClick={() => navigate(`/games/${gameId}/stats/${stat.id}`)}
                          >
                            Editar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 