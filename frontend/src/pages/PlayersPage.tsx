import React, { useState, useEffect } from "react";
import { Card, Button, Input, Label } from "../components/ui";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast } from "sonner";
import { getPlayers, createPlayer, deletePlayer } from "../services/api";
import type { Player } from "../services/api";

const PlayersPage: React.FC = () => {
  usePageTitle("Jogadores");
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({
    nome: "",
    numero: 0,
    posicao: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPlayers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Usuário não autenticado. Faça login novamente.");
        setLoading(false);
        return;
      }
      const response = await getPlayers();
      setPlayers(response.data);
    } catch (error) {
      setError("Erro ao carregar jogadores");
      toast.error("Erro ao carregar jogadores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleAddPlayer = async () => {
    if (!newPlayer.nome || !newPlayer.numero) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createPlayer({
        nome: newPlayer.nome,
        numero: newPlayer.numero,
        posicao: newPlayer.posicao
      });
      toast.success("Jogador adicionado com sucesso!");
      setNewPlayer({ nome: "", numero: 0, posicao: "" });
      fetchPlayers();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao adicionar jogador");
    }
  };

  const handleRemovePlayer = async (id: number) => {
    try {
      await deletePlayer(id);
      toast.success("Jogador removido com sucesso!");
      fetchPlayers();
    } catch (error) {
      toast.error("Erro ao remover jogador");
    }
  };

  return (
    <div className="p-8 mt-16 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-eerieblack">Gerenciar Jogadores</h1>

        {/* Formulário de Adição */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Adicionar Novo Jogador</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={newPlayer.nome}
                onChange={(e) => setNewPlayer({ ...newPlayer, nome: e.target.value })}
                placeholder="Nome do jogador"
              />
            </div>
            <div>
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                type="number"
                value={newPlayer.numero || ""}
                onChange={(e) => setNewPlayer({ ...newPlayer, numero: parseInt(e.target.value) })}
                placeholder="Número"
              />
            </div>
            <div>
              <Label htmlFor="posicao">Posição</Label>
              <Input
                id="posicao"
                value={newPlayer.posicao}
                onChange={(e) => setNewPlayer({ ...newPlayer, posicao: e.target.value })}
                placeholder="Posição"
              />
            </div>
          </div>
          <Button onClick={handleAddPlayer} className="mt-4">Adicionar Jogador</Button>
        </Card>

        {/* Feedback visual */}
        {loading && <div className="text-center text-gray-500">Carregando jogadores...</div>}
        {error && <div className="text-center text-red-500 mb-4">{error}</div>}

        {/* Lista de Jogadores */}
        {!loading && !error && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Lista de Jogadores</h2>
            <div className="grid gap-4">
              {players.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{player.nome}</p>
                    <p className="text-sm text-gray-600">#{player.numero} - {player.posicao}</p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => handleRemovePlayer(player.id)}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlayersPage; 