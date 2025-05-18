import React, { useState, useEffect } from "react";
import { Card, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui';
import type { Game, GameCategory } from '../types/game';
import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";

const PublicDashboardPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      if (!response.ok) throw new Error('Failed to fetch games');
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter(game => 
    selectedCategory === "all" || (game.category ?? "") === selectedCategory
  );

  const stats = {
    totalGames: games.length,
    wins: games.filter(game => {
      const teamPoints = (game.stats ?? []).reduce((acc: any, curr: any) => acc + curr.stats.points, 0);
      return teamPoints > 0;
    }).length,
    losses: games.filter(game => {
      const teamPoints = (game.stats ?? []).reduce((acc: any, curr: any) => acc + curr.stats.points, 0);
      return teamPoints === 0;
    }).length,
  };

  usePageTitle("Dashboard Público");

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-eerieblack">Dashboard</h1>
          <Link to="/game/register">
            <Button>Novo Jogo</Button>
          </Link>
        </div>

        {/* Filtros */}
        <div className="mb-8">
          <Select value={selectedCategory} onValueChange={(value: GameCategory | "all") => setSelectedCategory(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="sub-13">Sub-13</SelectItem>
              <SelectItem value="sub-15">Sub-15</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total de Jogos</h3>
            <p className="text-3xl font-bold text-primary">{stats.totalGames}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Vitórias</h3>
            <p className="text-3xl font-bold text-green-600">{stats.wins}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Derrotas</h3>
            <p className="text-3xl font-bold text-red-600">{stats.losses}</p>
          </Card>
        </div>

        {/* Lista de Jogos */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Jogos</h2>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <div className="space-y-4">
              {filteredGames.map((game) => (
                <div key={game.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">{game.name}</h3>
                    <p className="text-sm text-gray-600">
                      {game.date} - {game.time} | {game.location}
                    </p>
                    <p className="text-sm text-gray-600">Categoria: {game.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {(game.stats ?? []).reduce((acc: any, curr: any) => acc + curr.stats.points, 0)} pontos
                    </p>
                    <Link to={`/game/${game.id}`}>
                      <Button variant="outline" size="sm">Ver Detalhes</Button>
                    </Link>
                  </div>
                </div>
              ))}
              {filteredGames.length === 0 && (
                <p className="text-center text-gray-500">Nenhum jogo encontrado</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PublicDashboardPage; 