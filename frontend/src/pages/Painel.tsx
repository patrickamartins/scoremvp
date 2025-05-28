import React, { useState, useEffect } from "react";
import { Card, Checkbox, Input, Label } from "../components/ui";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast } from "sonner";
import { getPlayers, createGame } from "../services/api";
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
    console.log('Selecionando jogadora:', playerId);
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
    console.log('Botão Criar Jogo clicado');
    if (selectedPlayers.length === 0) {
      toast.error("Selecione pelo menos uma jogadora");
      return;
    }

    if (!gameForm.opponent || !gameForm.date || !gameForm.time || !gameForm.location) {
      toast.error("Preencha todos os campos do jogo");
      return;
    }

    try {
      // Monta a data no formato ISO completo (com segundos) e converte para UTC
      let dateIso = gameForm.date;
      let dateObj;
      if (gameForm.time) {
        // Garante que sempre tenha segundos
        const timeParts = gameForm.time.split(":");
        let hour = timeParts[0] || "00";
        let minute = timeParts[1] || "00";
        // Cria objeto Date local
        dateObj = new Date(`${gameForm.date}T${hour}:${minute}:00`);
      } else {
        dateObj = new Date(`${gameForm.date}T00:00:00`);
      }
      // Converte para string ISO em UTC
      dateIso = dateObj.toISOString();
      const gameData = {
        opponent: gameForm.opponent,
        date: dateIso,
        location: gameForm.location,
        categoria: gameForm.categoria,
        jogadoras: selectedPlayers
      };

      const response = await createGame(gameData);
      toast.success("Jogo criado com sucesso!");
      setGameForm({
        opponent: "",
        date: "",
        time: "",
        location: "",
        categoria: "sub-13"
      });
      setSelectedPlayers([]);
      if (response?.data?.id) {
        navigate(`/painel/jogo/${response.data.id}`);
      }
    } catch (error) {
      console.error('Erro ao criar jogo:', error);
      toast.error("Erro ao criar jogo");
    }
  };

  return (
    <div className="p-8 mt-16 space-y-8">
      <h1 className="text-3xl font-bold text-eerieblack">Novo Jogo</h1>

      {/* Formulário do Jogo */}
      <Card className="p-6">
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
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Selecionar Jogadoras</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <div key={player.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <Checkbox
                  id={String(player.id)}
                  checked={selectedPlayers.includes(player.id)}
                  onChange={() => handlePlayerSelection(player.id)}
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
          <button 
            type="button" 
            onClick={handleSaveGame} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold shadow transition-colors"
          >
            Criar Jogo
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Painel; 