import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Card from "../components/ui/Card";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { addDays, subDays, subMonths, startOfYear } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { usePageTitle } from "../hooks/usePageTitle";
import StatCard from '../components/ui/StatCard';

interface OverviewData {
  total_jogos: number;
  estatisticas_gerais: {
    total_pontos: number;
    total_assistencias: number;
    total_rebotes: number;
    total_roubos: number;
    total_faltas: number;
    media_pontos: number;
    media_assistencias: number;
    media_rebotes: number;
    media_roubos: number;
    media_faltas: number;
  };
  jogadora_mais_pontos: {
    id: number;
    nome: string;
    total_pontos: number;
  } | null;
  ultimos_jogos: Array<{
    id: number;
    opponent: string;
    date: string;
    status: string;
  }>;
}

interface JogadoraStats {
  id: number;
  nome: string;
  total_pontos: number;
  total_assistencias: number;
  total_rebotes: number;
  total_roubos: number;
  total_faltas: number;
  total_jogos?: number;
}

interface JogoStats {
  id: number;
  opponent: string;
  date: string;
  status: string;
  total_pontos: number;
  total_assistencias: number;
  total_rebotes: number;
  total_roubos: number;
  total_faltas: number;
  total_jogadoras: number;
  por_quarto?: Array<{
    quarto: number;
    total_pontos: number;
    total_assistencias: number;
    total_rebotes: number;
    total_roubos: number;
    total_faltas: number;
  }>;
}

interface PreviousStats {
  total_pontos: number;
  total_assistencias: number;
  total_rebotes: number;
  total_roubos: number;
  total_faltas: number;
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [jogadorasStats, setJogadorasStats] = useState<JogadoraStats[]>([]);
  const [jogosStats, setJogosStats] = useState<JogoStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [localFrom, setLocalFrom] = useState(format(dateRange.from, 'yyyy-MM-dd'));
  const [localTo, setLocalTo] = useState(format(dateRange.to, 'yyyy-MM-dd'));
  const [jogos, setJogos] = useState<JogoStats[]>([]);
  const [selectedJogo, setSelectedJogo] = useState<string>('todos');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Geral' | number>('Geral');

  usePageTitle("Dashboard");

  // Buscar lista de jogos para o seletor
  useEffect(() => {
    api.get('/dashboard/public/jogos').then(({ data }: { data: JogoStats[] }) => setJogos(data));
  }, []);

  useEffect(() => {
    // MOCK: dados fake para print
    setOverview({
      total_jogos: 6,
      estatisticas_gerais: {
        total_pontos: 480,
        total_assistencias: 120,
        total_rebotes: 210,
        total_roubos: 35,
        total_faltas: 50,
        media_pontos: 80,
        media_assistencias: 20,
        media_rebotes: 35,
        media_roubos: 5.8,
        media_faltas: 8.3
      },
      jogadora_mais_pontos: {
        id: 1,
        nome: "Maria Jogadora",
        total_pontos: 110
      },
      ultimos_jogos: [
        { id: 1, opponent: "Time A", date: "2024-06-01T10:00:00", status: "FINALIZADO" },
        { id: 2, opponent: "Time B", date: "2024-06-05T15:00:00", status: "FINALIZADO" },
        { id: 3, opponent: "Time C", date: "2024-06-10T18:00:00", status: "FINALIZADO" },
        { id: 4, opponent: "Time D", date: "2024-06-15T18:00:00", status: "FINALIZADO" },
        { id: 5, opponent: "Time E", date: "2024-06-20T18:00:00", status: "FINALIZADO" },
        { id: 6, opponent: "Time F", date: "2024-06-25T18:00:00", status: "FINALIZADO" }
      ]
    });

    setJogadorasStats([
      ...Array.from({ length: 10 }).map((_, i) => ({
        id: i + 1,
        nome: `Jogadora ${i + 1}`,
        total_pontos: Math.round(Math.random() * 100 + 20),
        total_assistencias: Math.round(Math.random() * 30 + 5),
        total_rebotes: Math.round(Math.random() * 50 + 10),
        total_roubos: Math.round(Math.random() * 10 + 2),
        total_faltas: Math.round(Math.random() * 10 + 2),
      }))
    ]);

    setJogosStats([
      ...Array.from({ length: 6 }).map((_, i) => ({
        id: i + 1,
        opponent: `Time ${String.fromCharCode(65 + i)}`,
        date: `2024-06-${String(i + 1).padStart(2, '0')}T18:00:00`,
        status: "FINALIZADO",
        total_pontos: i === 5 ? 60 : 90, // 5 vitórias, 1 derrota
        total_assistencias: Math.round(Math.random() * 20 + 10),
        total_rebotes: Math.round(Math.random() * 40 + 10),
        total_roubos: Math.round(Math.random() * 10 + 2),
        total_faltas: Math.round(Math.random() * 10 + 2),
        total_jogadoras: 10,
        por_quarto: [
          { quarto: 1, total_pontos: 20, total_assistencias: 5, total_rebotes: 10, total_roubos: 2, total_faltas: 2 },
          { quarto: 2, total_pontos: 20, total_assistencias: 5, total_rebotes: 10, total_roubos: 2, total_faltas: 2 },
          { quarto: 3, total_pontos: 25, total_assistencias: 5, total_rebotes: 10, total_roubos: 2, total_faltas: 2 },
          { quarto: 4, total_pontos: i === 5 ? -5 : 25, total_assistencias: 5, total_rebotes: 10, total_roubos: 2, total_faltas: 2 },
        ]
      }))
    ]);

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Dados para o gráfico de linha (evolução dos pontos totais por jogo)
  const lineChartData = jogosStats.map(jogo => ({
    name: format(new Date(jogo.date), 'dd/MM'),
    Pontos: jogo.total_pontos,
    Assistências: jogo.total_assistencias,
    Rebotes: jogo.total_rebotes,
    Roubos: jogo.total_roubos,
    Faltas: jogo.total_faltas,
  }));

  // Dados para o gráfico de barras (totais por jogadora)
  const barChartData = jogadorasStats.map(j => ({
    nome: j.nome,
    Pontos: j.total_pontos,
    Assistências: j.total_assistencias,
    Rebotes: j.total_rebotes,
    Roubos: j.total_roubos,
    Faltas: j.total_faltas,
  }));

  // Filtros rápidos de data
  const quickFilters = [
    {
      label: 'Hoje',
      onClick: () => {
        const today = new Date();
        setLocalFrom(format(today, 'yyyy-MM-dd'));
        setLocalTo(format(today, 'yyyy-MM-dd'));
        setDateRange({ from: today, to: today });
        setActiveQuickFilter('Hoje');
      }
    },
    {
      label: 'Última semana',
      onClick: () => {
        const today = new Date();
        const weekAgo = subDays(today, 6); // 7 dias incluindo hoje
        setLocalFrom(format(weekAgo, 'yyyy-MM-dd'));
        setLocalTo(format(today, 'yyyy-MM-dd'));
        setDateRange({ from: weekAgo, to: today });
        setActiveQuickFilter('Última semana');
      }
    },
    {
      label: 'Últimos 15 dias',
      onClick: () => {
        const today = new Date();
        const daysAgo = subDays(today, 14);
        setLocalFrom(format(daysAgo, 'yyyy-MM-dd'));
        setLocalTo(format(today, 'yyyy-MM-dd'));
        setDateRange({ from: daysAgo, to: today });
        setActiveQuickFilter('Últimos 15 dias');
      }
    },
    {
      label: 'Último mês',
      onClick: () => {
        const today = new Date();
        const monthAgo = subMonths(today, 1);
        setLocalFrom(format(monthAgo, 'yyyy-MM-dd'));
        setLocalTo(format(today, 'yyyy-MM-dd'));
        setDateRange({ from: monthAgo, to: today });
        setActiveQuickFilter('Último mês');
      }
    },
    {
      label: 'Este ano',
      onClick: () => {
        const today = new Date();
        const yearStart = startOfYear(today);
        setLocalFrom(format(yearStart, 'yyyy-MM-dd'));
        setLocalTo(format(today, 'yyyy-MM-dd'));
        setDateRange({ from: yearStart, to: today });
        setActiveQuickFilter('Este ano');
      }
    }
  ];

  const getStatsByQuarter = (_quarto: number): JogadoraStats[] => {
    // Implementação da função
    return [];
  };

  function getPercentChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const percent = ((current - previous) / previous) * 100;
    return `${percent > 0 ? '+' : ''}${Math.round(percent)}%`;
  }

  function getLastGameStats(): JogoStats {
    return jogosStats[0] || {
      total_pontos: 0,
      total_assistencias: 0,
      total_rebotes: 0,
      total_roubos: 0,
      total_faltas: 0,
      total_jogadoras: 0
    };
  }

  function getPreviousQuarterStats(quarto: number): PreviousStats[] {
    const prevStats: PreviousStats[] = [];
    const prevStatsArr = jogosStats.slice(1).map(jogo => jogo.por_quarto?.find(q => q.quarto === quarto));
    let prevAst = 0;
    let prevReb = 0;
    let prevRoubo = 0;
    let prevFalta = 0;

    if (prevStatsArr && prevStatsArr.length > 0) {
      prevAst = prevStatsArr.reduce((a, b) => a + (b?.total_assistencias || 0), 0);
      prevReb = prevStatsArr.reduce((a, b) => a + (b?.total_rebotes || 0), 0);
      prevRoubo = prevStatsArr.reduce((a, b) => a + (b?.total_roubos || 0), 0);
      prevFalta = prevStatsArr.reduce((a, b) => a + (b?.total_faltas || 0), 0);
    }

    prevStats.push({ total_pontos: prevAst, total_assistencias: prevReb, total_rebotes: prevReb, total_roubos: prevRoubo, total_faltas: prevFalta });
    return prevStats;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Filtros rápidos de data */}
      <div className="flex flex-wrap gap-2 mb-2">
        {quickFilters.map(f => (
          <button
            key={f.label}
            className={`px-3 py-1 rounded font-semibold text-sm transition ${activeQuickFilter === f.label ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-blue-600 hover:text-white'}`}
            onClick={f.onClick}
            type="button"
          >
            {f.label}
          </button>
        ))}
      </div>
      {/* Seletor de Jogo e Filtro de Data */}
      <div className="flex items-center gap-4 mb-6">
        <select
          value={selectedJogo}
          onChange={e => setSelectedJogo(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="todos">Todos os jogos</option>
          {jogos.map(jogo => (
            <option key={jogo.id} value={jogo.id}>
              {format(new Date(jogo.date), "dd/MM/yyyy")} - {jogo.opponent}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={localFrom}
          onChange={e => setLocalFrom(e.target.value)}
          className="border rounded px-2 py-1 mr-2"
          disabled={selectedJogo !== 'todos'}
        />
        <input
          type="date"
          value={localTo}
          onChange={e => setLocalTo(e.target.value)}
          className="border rounded px-2 py-1"
          disabled={selectedJogo !== 'todos'}
        />
        <button
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition"
          disabled={selectedJogo !== 'todos'}
          onClick={() => {
            setDateRange({
              from: new Date(localFrom),
              to: new Date(localTo)
            });
          }}
        >Aplicar</button>
      </div>

      {/* Abas para geral/quartos */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-t font-bold border-b-2 ${activeTab === 'Geral' ? 'border-blue-600 bg-white' : 'border-transparent bg-gray-100'}`}
          onClick={() => setActiveTab('Geral')}
        >Geral</button>
        {Array.from(new Set(jogosStats.flatMap(j => (j.por_quarto || []).map(q => q.quarto)))).sort().map(q => (
          <button
            key={q}
            className={`px-4 py-2 rounded-t font-bold border-b-2 ${activeTab === q ? 'border-blue-600 bg-white' : 'border-transparent bg-gray-100'}`}
            onClick={() => setActiveTab(q)}
          >{q}º Quarto</button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Comparação com o último jogo */}
        {(() => {
          const lastGame = getLastGameStats();
          const curr = overview?.estatisticas_gerais;
          const prev: JogoStats = lastGame;
          const percentPontos = getPercentChange(curr?.total_pontos || 0, prev.total_pontos || 0);
          const percentAst = getPercentChange(curr?.total_assistencias || 0, prev.total_assistencias || 0);
          const percentReb = getPercentChange(curr?.total_rebotes || 0, prev.total_rebotes || 0);
          const percentFaltas = getPercentChange(curr?.total_faltas || 0, prev.total_faltas || 0);
          return <>
            <StatCard
              title="Total de Pontos"
              value={curr?.total_pontos || 0}
              percent={percentPontos}
              trend={percentPontos.startsWith('+') ? 'up' : percentPontos.startsWith('-') ? 'down' : undefined}
              color="#2563eb"
              progress={curr?.total_pontos ? Math.min(100, curr.total_pontos) : 0}
            />
            <StatCard
              title="Total de Assistências"
              value={curr?.total_assistencias || 0}
              percent={percentAst}
              trend={percentAst.startsWith('+') ? 'up' : percentAst.startsWith('-') ? 'down' : undefined}
              color="#ef4444"
              progress={curr?.total_assistencias ? Math.min(100, curr.total_assistencias) : 0}
            />
            <StatCard
              title="Total de Rebotes"
              value={curr?.total_rebotes || 0}
              percent={percentReb}
              trend={percentReb.startsWith('+') ? 'up' : percentReb.startsWith('-') ? 'down' : undefined}
              color="#fbbf24"
              progress={curr?.total_rebotes ? Math.min(100, curr.total_rebotes) : 0}
            />
            <StatCard
              title="Total de Faltas"
              value={curr?.total_faltas || 0}
              percent={percentFaltas}
              trend={percentFaltas.startsWith('+') ? 'up' : percentFaltas.startsWith('-') ? 'down' : undefined}
              color="#22c55e"
              progress={curr?.total_faltas ? Math.min(100, curr.total_faltas) : 0}
            />
          </>;
        })()}
      </div>

      {/* Gráfico de Evolução dos Pontos do Time */}
      {jogosStats.length === 0 ? (
        <div className="text-center text-gray-400 py-8">Nenhum jogo encontrado para o filtro selecionado.</div>
      ) : (
        <Card>
          <div className="p-4">
            <div className="font-bold text-lg mb-2">Evolução dos Pontos do Time</div>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Pontos" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Assistências" stroke="#a78bfa" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Rebotes" stroke="#34d399" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Roubos" stroke="#fbbf24" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Faltas" stroke="#f87171" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      )}

      {/* Gráfico de Barras por Jogadora */}
      {jogadorasStats.length === 0 ? (
        <div className="text-center text-gray-400 py-8">Nenhuma jogadora encontrada para o filtro selecionado.</div>
      ) : (
        <Card>
          <div className="p-4">
            <div className="font-bold text-lg mb-2">Comparativo de Estatísticas por Jogadora</div>
            <div className="w-full h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Pontos" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Assistências" fill="#a78bfa" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Rebotes" fill="#34d399" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Roubos" fill="#fbbf24" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Faltas" fill="#f87171" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      )}

      {/* Estatísticas Gerais do Time */}
      <div className="mt-8">
        <div className="font-bold text-lg mb-4">Estatísticas Gerais do Time</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Para cada aba de quarto, comparar com o quarto anterior */}
          {(() => {
            let curr = overview?.estatisticas_gerais;
            let prevAst = 0, prevReb = 0, prevRoubo = 0, prevFalta = 0;
            if (activeTab !== 'Geral' && typeof activeTab === 'number') {
              const prevStatsArr = getPreviousQuarterStats(activeTab);
              if (prevStatsArr.length > 0) {
                prevAst = prevStatsArr.reduce((a, b) => a + (b.total_assistencias || 0), 0);
                prevReb = prevStatsArr.reduce((a, b) => a + (b.total_rebotes || 0), 0);
                prevRoubo = prevStatsArr.reduce((a, b) => a + (b.total_roubos || 0), 0);
                prevFalta = prevStatsArr.reduce((a, b) => a + (b.total_faltas || 0), 0);
              }
            }
            const percentAst = getPercentChange(curr?.total_assistencias || 0, prevAst);
            const percentReb = getPercentChange(curr?.total_rebotes || 0, prevReb);
            const percentRoubo = getPercentChange(curr?.total_roubos || 0, prevRoubo);
            const percentFaltas = getPercentChange(curr?.total_faltas || 0, prevFalta);
            return <>
              <StatCard
                title="Assistências"
                value={curr?.total_assistencias || 0}
                percent={percentAst}
                trend={percentAst.startsWith('+') ? 'up' : percentAst.startsWith('-') ? 'down' : undefined}
                color="#2563eb"
                progress={curr?.total_assistencias ? Math.min(100, curr.total_assistencias * 10) : 0}
              />
              <StatCard
                title="Rebotes"
                value={curr?.total_rebotes || 0}
                percent={percentReb}
                trend={percentReb.startsWith('+') ? 'up' : percentReb.startsWith('-') ? 'down' : undefined}
                color="#fbbf24"
                progress={curr?.total_rebotes ? Math.min(100, curr.total_rebotes * 10) : 0}
              />
              <StatCard
                title="Roubos"
                value={curr?.total_roubos || 0}
                percent={percentRoubo}
                trend={percentRoubo.startsWith('+') ? 'up' : percentRoubo.startsWith('-') ? 'down' : undefined}
                color="#22c55e"
                progress={curr?.total_roubos ? Math.min(100, curr.total_roubos * 10) : 0}
              />
              <StatCard
                title="Faltas"
                value={curr?.total_faltas || 0}
                percent={percentFaltas}
                trend={percentFaltas.startsWith('+') ? 'up' : percentFaltas.startsWith('-') ? 'down' : undefined}
                color="#ef4444"
                progress={curr?.total_faltas ? Math.min(100, curr.total_faltas * 10) : 0}
              />
            </>;
          })()}
        </div>
      </div>

      {/* Estatísticas por Jogadora */}
      <Card>
        <div className="p-4">
          <div className="font-bold text-lg mb-2">Estatísticas por Jogadora</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-1 py-1">Nome</th>
                  <th className="border px-1 py-1">Total PTS</th>
                  <th className="border px-1 py-1">Total AST</th>
                  <th className="border px-1 py-1">Total REB</th>
                  <th className="border px-1 py-1">Total ROUB</th>
                  <th className="border px-1 py-1">Total FALT</th>
                  <th className="border px-1 py-1">Jogos</th>
                </tr>
              </thead>
              <tbody>
                {jogadorasStats.map((jogadora) => (
                  <tr key={jogadora.id}>
                    <td className="border px-1 py-1">{jogadora.nome}</td>
                    <td className="border px-1 py-1">{jogadora.total_pontos}</td>
                    <td className="border px-1 py-1">{jogadora.total_assistencias}</td>
                    <td className="border px-1 py-1">{jogadora.total_rebotes}</td>
                    <td className="border px-1 py-1">{jogadora.total_roubos}</td>
                    <td className="border px-1 py-1">{jogadora.total_faltas}</td>
                    <td className="border px-1 py-1">{jogadora.total_jogos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Estatísticas por Jogo */}
      <Card>
        <div className="p-4">
          <div className="font-bold text-lg mb-2">Estatísticas por Jogo</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-1 py-1">Data</th>
                  <th className="border px-1 py-1">Adversário</th>
                  <th className="border px-1 py-1">Status</th>
                  <th className="border px-1 py-1">PTS</th>
                  <th className="border px-1 py-1">AST</th>
                  <th className="border px-1 py-1">REB</th>
                  <th className="border px-1 py-1">ROUB</th>
                  <th className="border px-1 py-1">FALT</th>
                  <th className="border px-1 py-1">Jogadoras</th>
                </tr>
              </thead>
              <tbody>
                {jogosStats.filter(jogo => jogo.status !== 'PENDENTE').map((jogo) => (
                  <tr key={jogo.id}>
                    <td className="border px-1 py-1">{format(new Date(jogo.date), "dd/MM/yyyy", { locale: ptBR })}</td>
                    <td className="border px-1 py-1">{jogo.opponent}</td>
                    <td className="border px-1 py-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        jogo.status === 'FINALIZADO' ? 'bg-green-100 text-green-800' :
                        jogo.status === 'EM_ANDAMENTO' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {jogo.status}
                      </span>
                    </td>
                    <td className="border px-1 py-1">{jogo.total_pontos}</td>
                    <td className="border px-1 py-1">{jogo.total_assistencias}</td>
                    <td className="border px-1 py-1">{jogo.total_rebotes}</td>
                    <td className="border px-1 py-1">{jogo.total_roubos}</td>
                    <td className="border px-1 py-1">{jogo.total_faltas}</td>
                    <td className="border px-1 py-1">{jogo.total_jogadoras}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Tabela de estatísticas estilo referência */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-xs border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-1 py-1">NO.</th>
              <th className="border px-1 py-1">JOGADOR</th>
              <th className="border px-1 py-1">PTS</th>
              <th className="border px-1 py-1">AQ</th>
              <th className="border px-1 py-1">AC</th>
              <th className="border px-1 py-1">2P</th>
              <th className="border px-1 py-1">2P2TS</th>
              <th className="border px-1 py-1">3P</th>
              <th className="border px-1 py-1">3P3PTS</th>
              <th className="border px-1 py-1">LL</th>
              <th className="border px-1 py-1">PLL</th>
              <th className="border px-1 py-1">REBO</th>
              <th className="border px-1 py-1">REBD</th>
              <th className="border px-1 py-1">TREB</th>
              <th className="border px-1 py-1">ASS</th>
              <th className="border px-1 py-1">ERR</th>
              <th className="border px-1 py-1">RB</th>
              <th className="border px-1 py-1">T</th>
              <th className="border px-1 py-1">TR</th>
              <th className="border px-1 py-1">FP</th>
              <th className="border px-1 py-1">FR</th>
              <th className="border px-1 py-1">+/- PTS</th>
              <th className="border px-1 py-1">EF</th>
            </tr>
          </thead>
          <tbody>
            {(activeTab === 'Geral' ? jogadorasStats : getStatsByQuarter(activeTab as number)).map((j: JogadoraStats, idx: number) => (
              <tr key={j.id || idx}>
                <td className="border px-1 py-1 text-center">{j.id || '-'}</td>
                <td className="border px-1 py-1">{j.nome || '-'}</td>
                <td className="border px-1 py-1 text-center">{j.total_pontos || 0}</td>
                <td className="border px-1 py-1 text-center">-</td>
                <td className="border px-1 py-1 text-center">-</td>
                <td className="border px-1 py-1 text-center">-</td>
                <td className="border px-1 py-1 text-center">-</td>
                <td className="border px-1 py-1 text-center">-</td>
                <td className="border px-1 py-1 text-center">-</td>
                <td className="border px-1 py-1 text-center">-</td>
                <td className="border px-1 py-1 text-center">-</td>
                <td className="border px-1 py-1 text-center">-</td>
                <td className="border px-1 py-1 text-center">-</td>
                <td className="border px-1 py-1 text-center">{j.total_rebotes || 0}</td>
                <td className="border px-1 py-1 text-center">{j.total_assistencias || 0}</td>
                <td className="border px-1 py-1 text-center">-</td>
                <td className="border px-1 py-1 text-center">-</td>
                <td className="border px-1 py-1 text-center">-</td>
                <td className="border px-1 py-1 text-center">-</td>
                <td className="border px-1 py-1 text-center">-</td>
                <td className="border px-1 py-1 text-center">-</td>
                <td className="border px-1 py-1 text-center">-</td>
                <td className="border px-1 py-1 text-center">-</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Estatísticas da equipe */}
      <div className="bg-red-700 text-white font-bold p-2 mt-4 rounded">ESTATÍSTICAS DA EQUIPE:</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs bg-white p-2 rounded shadow mb-4">
        <div>Pontos de Erros: ...</div>
        <div>Pontos no Garrafão: ...</div>
        <div>Pontos de Segunda Chance: ...</div>
        <div>Pontos de Contra Ataque: ...</div>
        <div>Pontos do Banco: ...</div>
        <div>Maior Liderança: ...</div>
        <div>Maior Sequência de Pontos: ...</div>
      </div>

      {/* Legenda */}
      <div className="bg-white p-4 rounded shadow mt-4">
        <div className="font-bold mb-2">Legenda</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div><b>PTS:</b> Pontos</div>
          <div><b>REBO:</b> Rebotes Ofensivos</div>
          <div><b>REBD:</b> Rebotes Defensivos</div>
          <div><b>TREB:</b> Total de Rebotes</div>
          <div><b>ASS:</b> Assistências</div>
          <div><b>ERR:</b> Erros</div>
          <div><b>RB:</b> Roubos de Bola</div>
          <div><b>T:</b> Tocos</div>
          <div><b>TR:</b> Tocos Recebidos</div>
          <div><b>FP:</b> Faltas Pessoais</div>
          <div><b>FR:</b> Faltas Recebidas</div>
          <div><b>+/- PTS:</b> Saldo de Pontos</div>
          <div><b>EF:</b> Eficiência</div>
        </div>
      </div>
    </div>
  );
} 