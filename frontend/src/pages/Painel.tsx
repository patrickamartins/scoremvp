import React, { useState, useEffect } from "react";
import { Card, Button, Checkbox } from "../components/ui";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast } from "sonner";
import { getPlayers } from "../services/api";

interface Player {
  id: number;
  nome: string;
  numero: number;
  posicao?: string;
}

const Painel: React.FC = () => {
  usePageTitle("Painel");
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);

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

  const handleSaveSelection = () => {
    if (selectedPlayers.length === 0) {
      toast.error("Selecione pelo menos uma jogadora");
      return;
    }

    localStorage.setItem('selectedPlayers', JSON.stringify(selectedPlayers));
    toast.success("Jogadoras selecionadas com sucesso!");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-eerieblack">Selecionar Jogadoras para o Jogo</h1>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Jogadoras Disponíveis</h2>
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
            <Button onClick={handleSaveSelection}>
              Salvar Seleção
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Painel; 