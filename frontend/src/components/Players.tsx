import { useState, useEffect } from "react";
import { getPlayers, createPlayer, deletePlayer } from "../services/api";
import type { Player } from "../services/api";
import { toast } from "react-hot-toast";

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState<number>(0);
  const [posicao, setPosicao] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPlayers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getPlayers();
      setPlayers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erro ao carregar jogadores");
      toast.error(err.response?.data?.detail || "Erro ao carregar jogadores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlayers(); }, []);

  const handleAdd = async () => {
    if (!nome || !numero) {
      toast.error("Nome e número são obrigatórios");
      return;
    }

    setLoading(true);
    try {
      await createPlayer({ nome, numero, posicao });
      toast.success("Jogador adicionado com sucesso!");
      setNome("");
      setNumero(0);
      setPosicao("");
      fetchPlayers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erro ao adicionar jogador");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este jogador?")) {
      return;
    }

    setLoading(true);
    try {
      await deletePlayer(id);
      toast.success("Jogador excluído com sucesso!");
      fetchPlayers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erro ao excluir jogador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Jogadoras</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="border p-1 rounded"
          disabled={loading}
        />
        <input
          type="number"
          placeholder="Número"
          value={numero}
          onChange={(e) => setNumero(+e.target.value)}
          className="border p-1 rounded w-20"
          disabled={loading}
        />
        <input
          placeholder="Posição"
          value={posicao}
          onChange={(e) => setPosicao(e.target.value)}
          className="border p-1 rounded"
          disabled={loading}
        />
        <button 
          onClick={handleAdd} 
          className="bg-green-500 text-white px-3 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Adicionando..." : "Adicionar"}
        </button>
      </div>

      {loading && players.length === 0 ? (
        <div className="text-center py-4">Carregando...</div>
      ) : (
        <ul>
          {players.map((p) => (
            <li key={p.id} className="flex justify-between mb-2 p-2 hover:bg-gray-50 rounded">
              <span>{p.nome} #{p.numero} — {p.posicao}</span>
              <button
                onClick={() => handleDelete(p.id)}
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
  );
}
