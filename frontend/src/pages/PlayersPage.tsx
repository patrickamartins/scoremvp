import React, { useState, useEffect } from "react";
import { Card, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast } from "sonner";
import { api } from "../services/api";
import { Plus, Edit, Trash2, Link2, X } from "lucide-react";
// Modal simples sem Dialog component

interface Player {
  id: number;
  name: string;
  number: number | null;
  position: string | null;
  categoria: string | null;
  active: boolean;
  user_id: number | null;
  user_email?: string;
}

export default function PlayersPage() {
  usePageTitle("Gerenciar Jogadores");
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    position: "",
    categoria: "",
    active: true,
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/players/");
      setPlayers(response.data);
    } catch (error: any) {
      toast.error("Erro ao carregar jogadores");
      console.error("Erro ao carregar jogadores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (player?: Player) => {
    if (player) {
      setEditingPlayer(player);
      setFormData({
        name: player.name,
        number: player.number?.toString() || "",
        position: player.position || "",
        categoria: player.categoria || "",
        active: player.active,
      });
    } else {
      setEditingPlayer(null);
      setFormData({
        name: "",
        number: "",
        position: "",
        categoria: "",
        active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlayer(null);
    setFormData({
      name: "",
      number: "",
      position: "",
      categoria: "",
      active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        number: formData.number ? parseInt(formData.number) : null,
        position: formData.position || null,
        categoria: formData.categoria || null,
        active: formData.active,
      };

      if (editingPlayer) {
        await api.put(`/players/${editingPlayer.id}`, payload);
        toast.success("Jogador atualizado com sucesso!");
      } else {
        await api.post("/players/", payload);
        toast.success("Jogador criado com sucesso!");
      }
      
      handleCloseModal();
      fetchPlayers();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao salvar jogador");
      console.error("Erro ao salvar jogador:", error);
    }
  };

  const handleDelete = async (playerId: number) => {
    if (!confirm("Tem certeza que deseja excluir este jogador?")) {
      return;
    }

    try {
      await api.delete(`/players/${playerId}`);
      toast.success("Jogador excluído com sucesso!");
      fetchPlayers();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao excluir jogador");
      console.error("Erro ao excluir jogador:", error);
    }
  };

  const handleLinkPlayer = async () => {
    if (!linkEmail.trim()) {
      toast.error("Por favor, informe o email do jogador");
      return;
    }

    setLinkLoading(true);
    try {
      await api.post("/team-players/link", {
        player_email: linkEmail.trim(),
      });
      toast.success("Solicitação de vínculo enviada ao jogador!");
      setLinkEmail("");
      setShowLinkModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao vincular jogador");
      console.error("Erro ao vincular jogador:", error);
    } finally {
      setLinkLoading(false);
    }
  };

  const handleUnlink = async (playerId: number) => {
    if (!confirm("Tem certeza que deseja desvincular este jogador do time?")) {
      return;
    }

    try {
      await api.delete(`/team-players/unlink/${playerId}`);
      toast.success("Jogador desvinculado com sucesso!");
      fetchPlayers();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao desvincular jogador");
      console.error("Erro ao desvincular jogador:", error);
    }
  };

  if (loading) {
    return <div className="p-6">Carregando jogadores...</div>;
  }

  return (
    <div className="w-full h-full p-2.5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Gerenciar Jogadores</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowLinkModal(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Link2 className="h-4 w-4 mr-2" />
            Vincular Jogador
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Jogador
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Nome</th>
                <th className="text-left p-2">Número</th>
                <th className="text-left p-2">Posição</th>
                <th className="text-left p-2">Categoria</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {players.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-gray-500">
                    Nenhum jogador cadastrado
                  </td>
                </tr>
              ) : (
                players.map((player) => (
                  <tr key={player.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{player.name}</td>
                    <td className="p-2">{player.number || "-"}</td>
                    <td className="p-2">{player.position || "-"}</td>
                    <td className="p-2">{player.categoria || "-"}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        player.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {player.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="p-2">{player.user_email || "-"}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(player)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {player.user_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnlink(player.id)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(player.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de criar/editar jogador */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingPlayer ? "Editar Jogador" : "Novo Jogador"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  type="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="position">Posição</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Ex: Ala, Pivô, Armador"
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Ex: Sub-18, Adulto"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="active">Ativo</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPlayer ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de vincular jogador */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Vincular Jogador ao Time</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="linkEmail">Email do Jogador *</Label>
                <Input
                  id="linkEmail"
                  type="email"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  O jogador receberá uma notificação para aceitar o vínculo ao time.
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowLinkModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleLinkPlayer} disabled={linkLoading}>
                  {linkLoading ? "Enviando..." : "Enviar Solicitação"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
