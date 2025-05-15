import React, { useState, useEffect } from 'react';
import API from './api';

interface Jogadora {
  id: number;
  nome: string;
}

interface Jogo {
  id: number;
  data: string;
  adversario: string;
}

const RegistroEstatisticas: React.FC = () => {
  const [jogadoras, setJogadoras] = useState<Jogadora[]>([]);
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [idJogadora, setIdJogadora] = useState<number>(0);
  const [idJogo, setIdJogo] = useState<number>(0);
  const [tipo, setTipo] = useState<string>('');

  // Carrega jogadoras e jogos
  useEffect(() => {
    (async () => {
      try {
        const [r1, r2] = await Promise.all([
          API.get<Jogadora[]>('/jogadoras'),
          API.get<Jogo[]>('/jogos')
        ]);
        setJogadoras(r1.data);
        setJogos(r2.data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post('/estatistica', {
        id_jogadora: idJogadora,
        id_jogo: idJogo,
        tipo: tipo.trim()
      });
      alert('Estatística registrada com sucesso!');
      setTipo('');
      setIdJogadora(0);
      setIdJogo(0);
    } catch (err) {
      console.error('Erro ao registrar estatística:', err);
      alert('Falha ao registrar estatística.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded">
      <h1 className="text-2xl mb-6">Registrar Estatística</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Jogadora</label>
          <select
            className="w-full border p-2 rounded"
            value={idJogadora}
            onChange={e => setIdJogadora(Number(e.target.value))}
            required
          >
            <option value={0}>-- Selecione --</option>
            {jogadoras.map(j => (
              <option key={j.id} value={j.id}>{j.nome}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Jogo</label>
          <select
            className="w-full border p-2 rounded"
            value={idJogo}
            onChange={e => setIdJogo(Number(e.target.value))}
            required
          >
            <option value={0}>-- Selecione --</option>
            {jogos.map(j => (
              <option key={j.id} value={j.id}>
                {j.data} — {j.adversario}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block mb-1">Tipo de Estatística</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            placeholder="Ex.: gol, assistência, bloqueio"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
        >
          Registrar
        </button>
      </form>
    </div>
  );
};

export default RegistroEstatisticas;
