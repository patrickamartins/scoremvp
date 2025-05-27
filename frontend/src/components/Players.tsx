import { useState, useEffect } from "react";
import { getPlayers, createPlayer, deletePlayer } from "../services/api";
import type { Player } from "../services/api";

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState<number>(0);
  const [posicao, setPosicao] = useState("");

  const fetchPlayers = async () => {
    const res = await getPlayers();
    setPlayers(res.data);
  };

  useEffect(() => { fetchPlayers(); }, []);

  const handleAdd = async () => {
    await createPlayer({ nome, numero, posicao });
    setNome(""); setNumero(0); setPosicao("");
    fetchPlayers();
  };

  const handleDelete = async (id: number) => {
    await deletePlayer(id);
    fetchPlayers();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Jogadoras</h2>
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="border p-1 rounded"
        />
        <input
          type="number"
          placeholder="Número"
          value={numero}
          onChange={(e) => setNumero(+e.target.value)}
          className="border p-1 rounded w-20"
        />
        <input
          placeholder="Posição"
          value={posicao}
          onChange={(e) => setPosicao(e.target.value)}
          className="border p-1 rounded"
        />
        <button onClick={handleAdd} className="bg-green-500 text-white px-3 rounded">
          Adicionar
        </button>
      </div>
      <ul>
        {players.map((p) => (
          <li key={p.id} className="flex justify-between mb-2">
            <span>{p.nome} #{p.numero} — {p.posicao}</span>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-red-500"
            >
              🗑
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
