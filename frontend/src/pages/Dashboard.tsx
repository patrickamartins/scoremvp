import { useEffect, useState } from 'react';
import { Card } from "../components/ui/Card";
import { usePageTitle } from "../hooks/usePageTitle";
import { DateRangePicker } from "../components/ui/DateRangePicker";
import { HighlightPlayerCard } from "../components/ui/HighlightPlayerCard";
import { PlayersStatsTable } from "../components/ui/PlayersStatsTable";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function DashboardPage() {
  usePageTitle("Dashboard");

  const [overview, setOverview] = useState<any>(null);
  const [playersStats, setPlayersStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<any>({ preset: 'today' });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let params: any = {};
      if (dateFilter.preset === 'custom') {
        if (dateFilter.start) params.data_inicio = dateFilter.start;
        if (dateFilter.end) params.data_fim = dateFilter.end;
      }
      // Para presets, pode-se implementar lógica de datas aqui se necessário
      try {
        const [overviewRes, playersRes] = await Promise.all([
          axios.get(`${API_URL}/dashboard/public/overview`, { params }),
          axios.get(`${API_URL}/dashboard/public/jogadoras`, { params }),
        ]);
        setOverview(overviewRes.data);
        setPlayersStats(playersRes.data);
      } catch (err) {
        setOverview(null);
        setPlayersStats([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [dateFilter]);

  // Destaques (exemplo: maior pontuadora, reboteira, assistente, aproveitamento)
  const highlights = overview && playersStats.length > 0 ? [
    {
      title: "PONTOS",
      value: overview.jogadora_mais_pontos?.total_pontos || 0,
      playerName: overview.jogadora_mais_pontos?.nome || '-',
      playerImage: `/images/players/${overview.jogadora_mais_pontos?.nome?.toLowerCase().replace(/ /g, '-') || 'default'}.jpg`,
      legend: "AACB Brasília Basquete",
    },
    {
      title: "TOTAL DE REBOTES",
      value: Math.max(...playersStats.map(p => p.total_rebotes || 0)),
      playerName: playersStats.reduce((a, b) => (a.total_rebotes > b.total_rebotes ? a : b), playersStats[0])?.nome || '-',
      playerImage: `/images/players/${playersStats.reduce((a, b) => (a.total_rebotes > b.total_rebotes ? a : b), playersStats[0])?.nome?.toLowerCase().replace(/ /g, '-') || 'default'}.jpg`,
      legend: "AACB Brasília Basquete",
    },
    {
      title: "ASSISTÊNCIAS",
      value: Math.max(...playersStats.map(p => p.total_assistencias || 0)),
      playerName: playersStats.reduce((a, b) => (a.total_assistencias > b.total_assistencias ? a : b), playersStats[0])?.nome || '-',
      playerImage: `/images/players/${playersStats.reduce((a, b) => (a.total_assistencias > b.total_assistencias ? a : b), playersStats[0])?.nome?.toLowerCase().replace(/ /g, '-') || 'default'}.jpg`,
      legend: "AACB Brasília Basquete",
    },
    {
      title: "APROVEITAMENTO",
      value: '—', // Não há campo direto, pode ser calculado se disponível
      playerName: '-',
      playerImage: `/images/players/default.jpg`,
      legend: "AACB Brasília Basquete",
    },
  ] : [];

  // Dados para o gráfico
  const playersChart = playersStats.map((p) => ({
    name: p.nome,
    Pontos: p.total_pontos,
    Rebotes: p.total_rebotes,
    Assistências: p.total_assistencias,
    // Aproveitamento: p.aproveitamento || 0, // Se disponível
  }));

  // Dados para a tabela (ajustar conforme estrutura real do backend)
  // Aqui é necessário mapear os campos do backend para o formato esperado pela tabela
  // Exemplo simplificado:
  const playersTable = playersStats.map((p, idx) => ({
    no: p.numero,
    name: p.nome,
    pos: p.posicao,
    min: '-',
    pts: p.total_pontos,
    aq: '-',
    ac: '-',
    p2: '-',
    p2pts: 0,
    p3: '-',
    p3pts: 0,
    ll: '-',
    pll: 0,
    rebo: p.total_rebotes,
    rebd: 0,
    treb: p.total_rebotes,
    ass: p.total_assistencias,
    err: 0,
    rb: 0,
    t: 0,
    tr: 0,
    fp: 0,
    fr: 0,
    plusMinus: 0,
    ef: 0,
  }));

  return (
    <div className="p-8 mt-16">
      <DateRangePicker onChange={setDateFilter} />
      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            {highlights.map((h) => (
              <HighlightPlayerCard key={h.title} {...h} />
            ))}
          </div>
          <div className="w-full bg-white rounded shadow p-6 mb-8">
            <h3 className="font-bold text-lg mb-4">Comparativo das Jogadoras em Quadra</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={playersChart} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Pontos" fill="#2563eb" />
                <Bar dataKey="Rebotes" fill="#f59e42" />
                <Bar dataKey="Assistências" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <PlayersStatsTable data={playersTable} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-blue-600">{overview?.total_jogos ?? '-'}</div>
              <div className="text-gray-500 mt-2">Jogos</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-green-600">{playersStats.length}</div>
              <div className="text-gray-500 mt-2">Jogadoras</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-yellow-600">{overview?.estatisticas_gerais?.total_pontos ?? '-'}</div>
              <div className="text-gray-500 mt-2">Pontos</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-purple-600">{overview?.estatisticas_gerais?.total_assistencias ?? '-'}</div>
              <div className="text-gray-500 mt-2">Assistências</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-pink-600">{overview?.estatisticas_gerais?.total_rebotes ?? '-'}</div>
              <div className="text-gray-500 mt-2">Rebotes</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-red-600">{overview?.estatisticas_gerais?.total_faltas ?? '-'}</div>
              <div className="text-gray-500 mt-2">Faltas</div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
} 