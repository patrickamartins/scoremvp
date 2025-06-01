import { useEffect, useState, useMemo } from 'react';
import { Card } from "../components/ui/Card";
import { usePageTitle } from "../hooks/usePageTitle";
import { DateFilterDropdown } from "../components/ui/DateFilterDropdown";
import { HighlightPlayerCard } from "../components/ui/HighlightPlayerCard";
import { PlayersStatsTable } from "../components/ui/PlayersStatsTable";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function DashboardPage() {
  usePageTitle("Dashboard");

  const [overview, setOverview] = useState<any>(null);
  const [playersStats, setPlayersStats] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<any>({ preset: 'today' });
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // Buscar lista de jogos do período
  useEffect(() => {
    let ignore = false;
    async function fetchGames() {
      let params: any = {};
      if (dateFilter.preset === 'custom') {
        if (dateFilter.start) params.data_inicio = dateFilter.start;
        if (dateFilter.end) params.data_fim = dateFilter.end;
      }
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/dashboard/public/jogos`, { params });
        if (!ignore) setGames(res.data);
      } catch {
        if (!ignore) setGames([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchGames();
    return () => { ignore = true; };
  }, [dateFilter]);

  // Buscar dados do dashboard (overview e jogadoras)
  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      setLoading(true);
      try {
        if (selectedGame) {
          // Buscar dados de um jogo específico
          const [overviewRes, playersRes] = await Promise.all([
            axios.get(`${API_URL}/dashboard/public/overview`, { params: { jogo_id: selectedGame.id } }),
            axios.get(`${API_URL}/dashboard/public/jogadoras`, { params: { jogo_id: selectedGame.id } }),
          ]);
          if (!ignore) {
            setOverview(overviewRes.data);
            setPlayersStats(playersRes.data);
          }
        } else {
          // Buscar dados gerais do período
          let params: any = {};
          if (dateFilter.preset === 'custom') {
            if (dateFilter.start) params.data_inicio = dateFilter.start;
            if (dateFilter.end) params.data_fim = dateFilter.end;
          }
          const [overviewRes, playersRes] = await Promise.all([
            axios.get(`${API_URL}/dashboard/public/overview`, { params }),
            axios.get(`${API_URL}/dashboard/public/jogadoras`, { params }),
          ]);
          if (!ignore) {
            setOverview(overviewRes.data);
            setPlayersStats(playersRes.data);
          }
        }
      } catch {
        if (!ignore) {
          setOverview(null);
          setPlayersStats([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line
  }, [dateFilter, selectedGame]);

  // Sugestões de jogos para autocomplete
  const filteredGames = useMemo(() => {
    if (!search) return games;
    return games.filter((g: any) =>
      g.opponent.toLowerCase().includes(search.toLowerCase()) ||
      (g.location && g.location.toLowerCase().includes(search.toLowerCase()))
    );
  }, [games, search]);

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
      value: '—',
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
  }));

  // Dados para a tabela
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
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="flex-1 md:max-w-xs">
          <DateFilterDropdown value={dateFilter} onChange={(v) => { setDateFilter(v); setSelectedGame(null); }} />
        </div>
        <div className="flex-1 md:max-w-md relative">
          <input
            type="text"
            className="w-full border rounded px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar jogo pelo adversário ou local..."
            value={search}
            onChange={e => { setSearch(e.target.value); setSearchFocused(true); }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          />
          {searchFocused && filteredGames.length > 0 && (
            <div className="absolute left-0 right-0 bg-white border rounded shadow-lg z-10 max-h-60 overflow-y-auto mt-1">
              {filteredGames.map((game: any) => (
                <div
                  key={game.id}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                  onClick={() => {
                    setSelectedGame(game);
                    setSearch(`${game.opponent} (${new Date(game.date).toLocaleDateString()})`);
                    setSearchFocused(false);
                  }}
                >
                  <span className="font-semibold">{game.opponent}</span>
                  <span className="ml-2 text-xs text-gray-500">{new Date(game.date).toLocaleDateString()}</span>
                  <span className="ml-2 text-xs text-gray-400">{game.location}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {loading ? (
        <div className="text-center py-12 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4" />
          <div className="h-6 bg-gray-100 rounded w-1/2 mx-auto mb-2" />
          <div className="h-6 bg-gray-100 rounded w-1/2 mx-auto mb-2" />
          <div className="h-6 bg-gray-100 rounded w-1/2 mx-auto mb-2" />
          <div className="h-6 bg-gray-100 rounded w-1/2 mx-auto mb-2" />
        </div>
      ) : (
        <>
          {selectedGame && (
            <Card className="p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                <div>
                  <div className="text-lg font-bold mb-1">
                    {selectedGame.opponent} <span className="text-gray-500 font-normal">vs</span> AACB Brasília
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedGame.location} &bull; {selectedGame.categoria || '-'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedGame.campeonato || 'Campeonato não informado'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-700 font-medium">
                    {selectedGame.date ? new Date(selectedGame.date).toLocaleDateString() : '-'}
                    {selectedGame.date ? ' - ' + new Date(selectedGame.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Status: {selectedGame.status}
                  </div>
                </div>
              </div>
            </Card>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        </>
      )}
    </div>
  );
} 