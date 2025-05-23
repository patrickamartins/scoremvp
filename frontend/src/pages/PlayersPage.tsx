import React, { useState, useEffect } from "react";
import { Card, Button, Input, Label } from '../components/ui';
import { usePageTitle } from "../hooks/usePageTitle";
import { toast } from "sonner";

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
}

const PlayersPage: React.FC = () => {
  usePageTitle("Jogadores");
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({
    name: "",
    number: 0,
    position: ""
  });

  useEffect(() => {
    // Carregar jogadores do localStorage
    const savedPlayers = localStorage.getItem('players');
    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    }
  }, []);

  const handleAddPlayer = () => {
    if (!newPlayer.name || !newPlayer.number || !newPlayer.position) {
      toast.error("Preencha todos os campos");
      return;
    }

    const player: Player = {
      id: Date.now().toString(),
      name: newPlayer.name,
      number: newPlayer.number,
      position: newPlayer.position
    };

    const updatedPlayers = [...players, player];
    setPlayers(updatedPlayers);
    localStorage.setItem('players', JSON.stringify(updatedPlayers));
    setNewPlayer({ name: "", number: 0, position: "" });
    toast.success("Jogador adicionado com sucesso!");
  };

  const handleRemovePlayer = (id: string) => {
    const updatedPlayers = players.filter(player => player.id !== id);
    setPlayers(updatedPlayers);
    localStorage.setItem('players', JSON.stringify(updatedPlayers));
    toast.success("Jogador removido com sucesso!");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-eerieblack">Gerenciar Jogadores</h1>

        {/* Formulário de Adição */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Adicionar Novo Jogador</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={newPlayer.name}
                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                placeholder="Nome do jogador"
              />
            </div>
            <div>
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                type="number"
                value={newPlayer.number || ""}
                onChange={(e) => setNewPlayer({ ...newPlayer, number: parseInt(e.target.value) })}
                placeholder="Número"
              />
            </div>
            <div>
              <Label htmlFor="position">Posição</Label>
              <Input
                id="position"
                value={newPlayer.position}
                onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                placeholder="Posição"
              />
            </div>
          </div>
          <Button onClick={handleAddPlayer} className="mt-4">Adicionar Jogador</Button>
        </Card>

        {/* Lista de Jogadores */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Lista de Jogadores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <div key={player.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{player.name}</h3>
                    <p className="text-sm text-gray-600">#{player.number}</p>
                    <p className="text-sm text-gray-600">{player.position}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemovePlayer(player.id)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PlayersPage; 