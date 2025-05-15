// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import API from '../api';

interface Jogo {
  id: number;
  nome: string;
}

interface Totais {
  [tipo: string]: number;
}

interface Destaque {
  tipo: string;
  jogadora: string;
  quantidade: number;
}

const Dashboard: React.FC = () => {
  const [jogos, setJogos]               = useState<Jogo[]>([]);
  const [jogoSelecionado, setJogo]      = useState<number | ''>('');
  const [totais, setTotais]             = useState<Totais>({});
  const [destaques, setDestaques]       = useState<Destaque[]>([]);
  const token = localStorage.getItem('token') || '';

  // lista jogos no dropdown
  useEffect(() => {
    API.get('/jogos', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setJogos(res.data))
      .catch(err => console.error('Erro ao listar jogos:', err));
  }, [token]);

  // busca dados do dashboard para o jogo selecionado
  useEffect(() => {
    if (!jogoSelecionado) return;
    API.get(`/dashboard?jogo_id=${jogoSelecionado}`)
      .then(res => {
        setTotais(res.data.totais);
        setDestaques(res.data.destaques);
      })
      .catch(err => console.error('Erro ao buscar dashboard:', err));
  }, [jogoSelecionado]);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Dashboard do Jogo</h1>

      <div style={{ margin: '1rem 0' }}>
        <label>Selecione o jogo:</label>
        <select
          className="form-control"
          value={jogoSelecionado}
          onChange={e => {
            const v = Number(e.target.value);
            setJogo(isNaN(v) ? '' : v);
          }}
        >
          <option value="">-- Selecione um jogo --</option>
          {jogos.map(j => (
            <option key={j.id} value={j.id}>
              {j.nome}
            </option>
          ))}
        </select>
      </div>

      {!jogoSelecionado && (
        <p style={{ color: '#666' }}>
          Selecione um jogo acima para carregar os dados.
        </p>
      )}

      {jogoSelecionado && (
        <>
          <h2>Totais por Tipo</h2>
          <ul>
            {Object.entries(totais).map(([tipo, qt]) => (
              <li key={tipo}>
                {tipo}: {qt}
              </li>
            ))}
          </ul>

          <h2>Destaques</h2>
          <ul>
            {destaques.map(d => (
              <li key={d.tipo}>
                {d.tipo}: {d.jogadora} ({d.quantidade})
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Dashboard;
