import { useEffect, useState } from "react";
import { api, getGames, getPlayers, getGameStats } from "@/services/api";
import { Game, GameStats } from "@/types/game";
import { Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { useToast } from "@/components/ui/use-toast";

export function PublicPanel() {
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [stats, setStats] = useState<GameStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  const handleGameSelect = (gameId: string) => {
    const game = games.find(g => g.id === parseInt(gameId));
    setSelectedGame(game || null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Painel Público</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Select onValueChange={handleGameSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um jogo" />
                </SelectTrigger>
                <SelectContent>
                  {games.map((game) => (
                    <SelectItem key={game.id} value={game.id.toString()}>
                      {game.opponent} - {new Date(game.date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedGame && (
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
                          Roubos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bloqueios
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Faltas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Perdas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Minutos
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
                          <td className="px-6 py-4 whitespace-nowrap">{stat.steals}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{stat.blocks}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{stat.fouls}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{stat.turnovers}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{stat.minutes_played}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
