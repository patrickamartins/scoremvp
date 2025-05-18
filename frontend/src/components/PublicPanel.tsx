import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getEstatisticasByJogo } from "../services/api";
import type { Estatistica } from "../services/api";

export default function PublicPanel() {
  const { gameId } = useParams<{ gameId: string }>();
  const [stats, setStats] = useState<Estatistica[]>([]);

  useEffect(() => {
    if (gameId) {
      getEstatisticasByJogo(gameId).then((res) => setStats(res.data));
    }
  }, [gameId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Painel Público do Jogo #{gameId}</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-1">Jogadora</th>
            <th className="border p-1">Pontos</th>
            <th className="border p-1">Assistências</th>
            <th className="border p-1">Rebotes</th>
            <th className="border p-1">Roubos</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((e) => (
            <tr key={e.id}>
              <td className="border p-1">{e.jogadora_id}</td>
              <td className="border p-1">{e.pontos}</td>
              <td className="border p-1">{e.assistencias}</td>
              <td className="border p-1">{e.rebotes}</td>
              <td className="border p-1">{e.roubos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
