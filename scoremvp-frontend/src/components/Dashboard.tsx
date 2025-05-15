import React, { useEffect, useState } from 'react';
import API from '../api';

interface Jogo {
  id: number;
  data: string;
  local: string;
  horario: string;
  adversario: string;
  categoria: string;
}

const Dashboard: React.FC = () => {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [selectedJogoId, setSelectedJogoId] = useState<number | ''>('');
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Carrega lista de jogos
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get<Jogo[]>('/jogos');
        setJogos(res.data);
      } catch (err) {
        console.error('Erro ao buscar jogos:', err);
      }
    })();
  }, []);

  // Carrega dados do dashboard sempre que mudar o jogo selecionado
  useEffect(() => {
    if (selectedJogoId !== '') {
      (async () => {
        try {
          const res = await API.get<any>(`/dashboard?jogo_id=${selectedJogoId}`);
          setDashboardData(res.data);
        } catch (err) {
          console.error('Erro ao buscar dashboard:', err);
        }
      })();
    }
  }, [selectedJogoId]);

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6">
      <h1 className="text-3xl mb-6">Dashboard de Estatísticas</h1>

      <div className="mb-6">
        <label className="block mb-2">Selecione um Jogo:</label>
        <select
          className="w-full border p-2 rounded"
          value={selectedJogoId}
          onChange={e => setSelectedJogoId(Number(e.target.value))}
        >
          <option value="">-- Escolha --</option>
          {jogos.map(j => (
            <option key={j.id} value={j.id}>
              {j.data} — {j.adversario}
            </option>
          ))}
        </select>
      </div>

      {dashboardData ? (
        <div className="bg-gray-100 p-4 rounded">
          {/* Aqui você pode criar cards/charts com os dados */}
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(dashboardData, null, 2)}
          </pre>
        </div>
      ) : selectedJogoId !== '' ? (
        <p>Carregando dados...</p>
      ) : null}
    </div>
  );
};

export default Dashboard;
