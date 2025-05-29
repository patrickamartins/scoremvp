import React, { useState } from "react";
import { Card, Input, Label } from "../components/ui";
import { usePageTitle } from "../hooks/usePageTitle";

interface Player {
  nome: string;
  numero: string;
  posicao: string;
  categoria: string;
}

const categorias = ["sub-13", "sub-15", "sub-17", "sub-19"];

const Painel: React.FC = () => {
  usePageTitle("Painel");
  const [players, setPlayers] = useState<Player[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [playerForm, setPlayerForm] = useState<Player>({
    nome: "",
    numero: "",
    posicao: "",
    categoria: categorias[0],
  });
  const [formError, setFormError] = useState("");

  const handlePlayerFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPlayerForm((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerForm.nome || !playerForm.numero || !playerForm.posicao || !playerForm.categoria) {
      setFormError("Preencha todos os campos");
      return;
    }
    if (players.some((p) => p.numero === playerForm.numero)) {
      setFormError("Já existe um jogador com esse número");
      return;
    }
    setPlayers((prev) => [...prev, playerForm]);
    setPlayerForm({ nome: "", numero: "", posicao: "", categoria: categorias[0] });
    setShowModal(false);
  };

  return (
    <div className="p-8 mt-16 space-y-8 relative">
      <h1 className="text-3xl font-bold text-eerieblack">Painel da Partida</h1>

      {/* Lista de jogadores cadastrados */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Jogadores da Partida</h2>
        {players.length === 0 ? (
          <div className="text-gray-400">Nenhum jogador cadastrado ainda.</div>
        ) : (
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Nome</th>
                <th className="border px-2 py-1">Número</th>
                <th className="border px-2 py-1">Posição</th>
                <th className="border px-2 py-1">Categoria</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{p.nome}</td>
                  <td className="border px-2 py-1">{p.numero}</td>
                  <td className="border px-2 py-1">{p.posicao}</td>
                  <td className="border px-2 py-1">{p.categoria}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Botão flutuante */}
      <button
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg text-3xl z-50"
        onClick={() => setShowModal(true)}
        title="Adicionar Jogador"
      >
        +
      </button>

      {/* Modal de cadastro de jogador */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowModal(false)}
              title="Fechar"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">Adicionar Jogador</h2>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={playerForm.nome}
                  onChange={handlePlayerFormChange}
                  placeholder="Nome do jogador"
                />
              </div>
              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  name="numero"
                  value={playerForm.numero}
                  onChange={handlePlayerFormChange}
                  placeholder="Número"
                  type="number"
                />
              </div>
              <div>
                <Label htmlFor="posicao">Posição</Label>
                <Input
                  id="posicao"
                  name="posicao"
                  value={playerForm.posicao}
                  onChange={handlePlayerFormChange}
                  placeholder="Posição"
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <select
                  id="categoria"
                  name="categoria"
                  value={playerForm.categoria}
                  onChange={handlePlayerFormChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold mt-2"
              >
                Adicionar Jogador
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Painel; 