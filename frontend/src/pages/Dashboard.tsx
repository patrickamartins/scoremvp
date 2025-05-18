import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Card from "../components/ui/Card";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { addDays } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

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
  numero: number;
  posicao: string;
  media_pontos: number;
  media_assistencias: number;
  media_rebotes: number;
  media_roubos: number;
  media_faltas: number;
  total_jogos: number;
  total_pontos: number;
  total_assistencias: number;
  total_rebotes: number;
  total_roubos: number;
  total_faltas: number;
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

export function Dashboard() {
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
  const [jogos, setJogos] = useState<JogoStats[]>([]);
  const [selectedJogo, setSelectedJogo] = useState<string>('todos');

  // Buscar lista de jogos para o seletor
  useEffect(() => {
    api.get('/dashboard/public/jogos').then(res => setJogos(res.data));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let params;
        if (selectedJogo !== 'todos') {
          const jogo = jogos.find(j => String(j.id) === selectedJogo);
          if (jogo) {
            // Filtra por data exata do jogo selecionado
            const data = new Date(jogo.date);
            params = {
              data_inicio: data.toISOString(),
              data_fim: data.toISOString(),
            };
          } else {
            params = {
              data_inicio: dateRange.from.toISOString(),
              data_fim: dateRange.to.toISOString(),
            };
          }
        } else {
          params = {
            data_inicio: dateRange.from.toISOString(),
            data_fim: dateRange.to.toISOString(),
          };
        }

        const [overviewRes, jogadorasRes, jogosRes] = await Promise.all([
          api.get('/dashboard/public/overview', { params }),
          api.get('/dashboard/public/jogadoras', { params }),
          api.get('/dashboard/public/jogos', { params })
        ]);

        setOverview(overviewRes.data);
        setJogadorasStats(jogadorasRes.data);
        setJogosStats(jogosRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, selectedJogo, jogos]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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

  return (
    <div className="container mx-auto p-6 space-y-8">
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
          value={format(dateRange.from, 'yyyy-MM-dd')}
          onChange={e => setDateRange(r => ({ ...r, from: new Date(e.target.value) }))}
          className="border rounded px-2 py-1 mr-2"
          disabled={selectedJogo !== 'todos'}
        />
        <input
          type="date"
          value={format(dateRange.to, 'yyyy-MM-dd')}
          onChange={e => setDateRange(r => ({ ...r, to: new Date(e.target.value) }))}
          className="border rounded px-2 py-1"
          disabled={selectedJogo !== 'todos'}
        />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-4">
            <div className="font-bold text-lg mb-2">Total de Jogos</div>
            <p className="text-3xl font-bold">{overview?.total_jogos || 0}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="font-bold text-lg mb-2">Total de Pontos</div>
            <p className="text-3xl font-bold">{overview?.estatisticas_gerais.total_pontos || 0}</p>
            <p className="text-sm text-gray-500">
              Média: {overview?.estatisticas_gerais.media_pontos.toFixed(1) || 0} por jogo
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="font-bold text-lg mb-2">Maior Pontuadora</div>
            {overview?.jogadora_mais_pontos ? (
              <>
                <p className="text-xl font-semibold">{overview.jogadora_mais_pontos.nome}</p>
                <p className="text-2xl font-bold text-primary">{overview.jogadora_mais_pontos.total_pontos} pontos</p>
              </>
            ) : (
              <p className="text-gray-500">Nenhuma jogadora registrada</p>
            )}
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="font-bold text-lg mb-2">Último Jogo</div>
            {overview?.ultimos_jogos[0] ? (
              <>
                <p className="text-xl font-semibold">{overview.ultimos_jogos[0].opponent}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(overview.ultimos_jogos[0].date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </>
            ) : (
              <p className="text-gray-500">Nenhum jogo registrado</p>
            )}
          </div>
        </Card>
      </div>

      {/* Gráfico de Evolução dos Pontos do Time */}
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

      {/* Gráfico de Barras por Jogadora */}
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

      {/* Estatísticas Gerais do Time */}
      <Card>
        <div className="p-4">
          <div className="font-bold text-lg mb-2">Estatísticas Gerais do Time</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Assistências</p>
              <p className="text-2xl font-bold">{overview?.estatisticas_gerais.total_assistencias || 0}</p>
              <p className="text-xs text-gray-500">
                Média: {overview?.estatisticas_gerais.media_assistencias.toFixed(1) || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Rebotes</p>
              <p className="text-2xl font-bold">{overview?.estatisticas_gerais.total_rebotes || 0}</p>
              <p className="text-xs text-gray-500">
                Média: {overview?.estatisticas_gerais.media_rebotes.toFixed(1) || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Roubos</p>
              <p className="text-2xl font-bold">{overview?.estatisticas_gerais.total_roubos || 0}</p>
              <p className="text-xs text-gray-500">
                Média: {overview?.estatisticas_gerais.media_roubos.toFixed(1) || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Faltas</p>
              <p className="text-2xl font-bold">{overview?.estatisticas_gerais.total_faltas || 0}</p>
              <p className="text-xs text-gray-500">
                Média: {overview?.estatisticas_gerais.media_faltas.toFixed(1) || 0}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Estatísticas por Jogadora */}
      <Card>
        <div className="p-4">
          <div className="font-bold text-lg mb-2">Estatísticas por Jogadora</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Número</th>
                  <th>Posição</th>
                  <th>Total PTS</th>
                  <th>Total AST</th>
                  <th>Total REB</th>
                  <th>Total ROUB</th>
                  <th>Total FALT</th>
                  <th>Jogos</th>
                </tr>
              </thead>
              <tbody>
                {jogadorasStats.map((jogadora) => (
                  <tr key={jogadora.id}>
                    <td>{jogadora.nome}</td>
                    <td>{jogadora.numero}</td>
                    <td>{jogadora.posicao}</td>
                    <td>{jogadora.total_pontos}</td>
                    <td>{jogadora.total_assistencias}</td>
                    <td>{jogadora.total_rebotes}</td>
                    <td>{jogadora.total_roubos}</td>
                    <td>{jogadora.total_faltas}</td>
                    <td>{jogadora.total_jogos}</td>
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
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Adversário</th>
                  <th>Status</th>
                  <th>PTS</th>
                  <th>AST</th>
                  <th>REB</th>
                  <th>ROUB</th>
                  <th>FALT</th>
                  <th>Jogadoras</th>
                </tr>
              </thead>
              <tbody>
                {jogosStats.map((jogo) => (
                  <>
                    <tr key={jogo.id}>
                      <td>{format(new Date(jogo.date), "dd/MM/yyyy", { locale: ptBR })}</td>
                      <td>{jogo.opponent}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          jogo.status === 'FINALIZADO' ? 'bg-green-100 text-green-800' :
                          jogo.status === 'EM_ANDAMENTO' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {jogo.status}
                        </span>
                      </td>
                      <td>{jogo.total_pontos}</td>
                      <td>{jogo.total_assistencias}</td>
                      <td>{jogo.total_rebotes}</td>
                      <td>{jogo.total_roubos}</td>
                      <td>{jogo.total_faltas}</td>
                      <td>{jogo.total_jogadoras}</td>
                    </tr>
                    {jogo.por_quarto && jogo.por_quarto.length > 0 && (
                      <tr>
                        <td colSpan={9}>
                          <div className="mt-2 mb-2">
                            <div className="font-semibold text-xs mb-1">Totais por Quarto</div>
                            <table className="min-w-full text-xs border">
                              <thead>
                                <tr>
                                  <th>Quarto</th>
                                  <th>PTS</th>
                                  <th>AST</th>
                                  <th>REB</th>
                                  <th>ROUB</th>
                                  <th>FALT</th>
                                </tr>
                              </thead>
                              <tbody>
                                {jogo.por_quarto.map((q) => (
                                  <tr key={q.quarto}>
                                    <td>{q.quarto}º</td>
                                    <td>{q.total_pontos}</td>
                                    <td>{q.total_assistencias}</td>
                                    <td>{q.total_rebotes}</td>
                                    <td>{q.total_roubos}</td>
                                    <td>{q.total_faltas}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
} 