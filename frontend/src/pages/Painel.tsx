import React, { useState, useEffect } from "react";
import { Card, Button, Checkbox, Input, Label } from "../components/ui";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast } from "sonner";
import { getPlayers, createGame } from "../services/api";

interface Player {
  id: number;
  nome: string;
  numero: number;
  posicao?: string;
}

interface GameForm {
  opponent: string;
  date: string;
  time: string;
  location: string;
  categoria: string;
}

const Painel: React.FC = () => {
  usePageTitle("Painel");
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [gameForm, setGameForm] = useState<GameForm>({
    opponent: "",
    date: "",
    time: "",
    location: "",
    categoria: "sub-13"
  });

  useEffect(() => {
    console.log('Painel montado');
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Token não encontrado. Faça login novamente.');
      return;
    }
    getPlayers()
      .then(res => {
        console.log('Jogadoras recebidas:', res.data);
        setPlayers(res.data);
      })
      .catch((err) => {
        console.error('Erro ao buscar jogadoras:', err);
        toast.error("Erro ao carregar jogadoras");
      });
  }, []);

  const handlePlayerSelection = (playerId: number) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  const handleGameFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGameForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveGame = async () => {
    if (selectedPlayers.length === 0) {
      toast.error("Selecione pelo menos uma jogadora");
      return;
    }

    if (!gameForm.opponent || !gameForm.date || !gameForm.time || !gameForm.location) {
      toast.error("Preencha todos os campos do jogo");
      return;
    }

    try {
      const gameData = {
        ...gameForm,
        jogadoras: selectedPlayers
      };

      await createGame(gameData);
      toast.success("Jogo criado com sucesso!");
      
      // Limpar formulário
      setGameForm({
        opponent: "",
        date: "",
        time: "",
        location: "",
        categoria: "sub-13"
      });
      setSelectedPlayers([]);
    } catch (error) {
      console.error('Erro ao criar jogo:', error);
      toast.error("Erro ao criar jogo");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-eerieblack">Novo Jogo</h1>

        {/* Formulário do Jogo */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Informações do Jogo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="opponent">Adversário</Label>
              <Input
                id="opponent"
                name="opponent"
                value={gameForm.opponent}
                onChange={handleGameFormChange}
                placeholder="Nome do adversário"
              />
            </div>
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <select
                id="categoria"
                name="categoria"
                value={gameForm.categoria}
                onChange={handleGameFormChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="sub-13">Sub-13</option>
                <option value="sub-15">Sub-15</option>
                <option value="sub-17">Sub-17</option>
                <option value="sub-19">Sub-19</option>
              </select>
            </div>
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={gameForm.date}
                onChange={handleGameFormChange}
              />
            </div>
            <div>
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={gameForm.time}
                onChange={handleGameFormChange}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                name="location"
                value={gameForm.location}
                onChange={handleGameFormChange}
                placeholder="Local do jogo"
              />
            </div>
          </div>
        </Card>

        {/* Seleção de Jogadoras */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Selecionar Jogadoras</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <div key={player.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    id={String(player.id)}
                    checked={selectedPlayers.includes(player.id)}
                    onCheckedChange={() => handlePlayerSelection(player.id)}
                  />
                  <div>
                    <h3 className="font-semibold">{player.nome}</h3>
                    <p className="text-sm text-gray-600">#{player.numero}</p>
                    <p className="text-sm text-gray-600">{player.posicao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button onClick={handleSaveGame}>
              Criar Jogo
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Painel; 