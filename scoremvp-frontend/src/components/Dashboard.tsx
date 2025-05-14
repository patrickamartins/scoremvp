import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

interface Jogo {
  id: string;
  nome: string;
}

interface Estatistica {
  timestamp: string;
  valor: number;
}

const Dashboard: React.FC = () => {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [jogoSelecionado, setJogoSelecionado] = useState<string>('');
  const [estatisticas, setEstatisticas] = useState<Estatistica[]>([]);

  // Carrega lista de jogos para o dropdown
  useEffect(() => {
    axios
      .get<Jogo[]>('/jogos')
      .then(res => setJogos(res.data))
      .catch(err => console.error('Erro ao listar jogos:', err));
  }, []);

  // Ao mudar o jogo selecionado, busca as estatísticas
  useEffect(() => {
    if (!jogoSelecionado) return;
    axios
      .get<Estatistica[]>(`/dashboard?jogo_id=${jogoSelecionado}`)
      .then(res => setEstatisticas(res.data))
      .catch(err => console.error('Erro ao buscar dashboard:', err));
  }, [jogoSelecionado]);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Dashboard</h1>

      <div style={{ margin: '1rem 0' }}>
        <label htmlFor="select-jogo">Selecione o jogo:</label>
        <select
          id="select-jogo"
          value={jogoSelecionado}
          onChange={e => setJogoSelecionado(e.target.value)}
          className="form-control"
        >
          <option value="">-- Selecione um jogo --</option>
          {jogos.map(j => (
            <option key={j.id} value={j.id}>
              {j.nome}
            </option>
          ))}
        </select>
      </div>

      {estatisticas.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={estatisticas}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="valor" />
          </LineChart>
        </ResponsiveContainer>
      )}

      {!jogoSelecionado && (
        <p style={{ color: '#666' }}>
          Selecione um jogo acima para carregar os gráficos.
        </p>
      )}
    </div>
  );
};

export default Dashboard;
