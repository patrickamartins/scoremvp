import React, { useState, useEffect } from "react";
import { listGames, createGame } from "../services/api";
import type { Game } from "../services/api";

export default function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [opponent, setOpponent] = useState("");
  const [date, setDate] = useState("");

  const fetchGames = async () => {
    const res = await listGames();
    setGames(res.data);
  };

  useEffect(() => { fetchGames(); }, []);

  const handleAdd = async () => {
    await createGame({ opponent, date });
    setOpponent(""); setDate("");
    fetchGames();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Jogos</h2>
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Adversário"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          className="border p-1 rounded"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-1 rounded"
        />
        <button onClick={handleAdd} className="bg-green-500 text-white px-3 rounded">
          Criar Jogo
        </button>
      </div>
      <ul>
        {games.map((g) => (
          <li key={g.id}>
            <strong>{g.opponent}</strong> — {new Date(g.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
