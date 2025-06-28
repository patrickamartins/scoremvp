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
    name: "",
    number: 0,
    position: ""
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
      setPlayers(response);
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
    if (!newPlayer.name || !newPlayer.number) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createPlayer({
        name: newPlayer.name,
        number: newPlayer.number,
        position: newPlayer.position || ""
      });
      toast.success("Jogador adicionado com sucesso!");
      setNewPlayer({ name: "", number: 0, position: "" });
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

        {/* Feedback visual */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading && players.length === 0 ? (
          <div className="text-center py-4">Carregando...</div>
        ) : (
          <ul>
            {players.map((p) => (
              <li key={p.id} className="flex justify-between mb-2 p-2 hover:bg-gray-50 rounded">
                <span>{p.name} #{p.number} — {p.position}</span>
                <button
                  onClick={() => handleRemovePlayer(p.id)}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  disabled={loading}
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PlayersPage; 