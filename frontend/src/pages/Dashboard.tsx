import { useEffect, useState, useMemo } from 'react';
import { Card } from "../components/ui/Card";
import { usePageTitle } from "../hooks/usePageTitle";
import { DateFilterDropdown } from "../components/ui/DateFilterDropdown";
import { HighlightPlayerCard } from "../components/ui/HighlightPlayerCard";
import { PlayersStatsTable } from "../components/ui/PlayersStatsTable";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line } from 'recharts';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const categorias = [
  { label: 'Todas', value: '' },
  { label: 'sub-13', value: 'sub-13' },
  { label: 'sub-15', value: 'sub-15' },
  { label: 'sub-17', value: 'sub-17' },
  { label: 'sub-19', value: 'sub-19' },
];

export default function DashboardPage() {
  usePageTitle("Dashboard");

  const [overview, setOverview] = useState<any>(null);
  const [playersStats, setPlayersStats] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<any>({ preset: 'this_year' });
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerFilter, setPlayerFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [allPlayers, setAllPlayers] = useState<any[]>([]);

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
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/dashboard/public/jogos`, { params });
        if (!ignore) setGames(res.data);
      } catch (e: any) {
        if (!ignore) {
          setGames([]);
          setError('Erro ao carregar lista de jogos. Tente novamente.');
        }
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
      setError(null);
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
      } catch (e: any) {
        if (!ignore) {
          setOverview(null);
          setPlayersStats([]);
          setError('Erro ao carregar dados do dashboard. Tente novamente.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line
  }, [dateFilter, selectedGame]);

  // Buscar todas as jogadoras para o filtro
  useEffect(() => {
    axios.get(`${API_URL}/dashboard/public/jogadoras`).then(({ data }) => {
      setAllPlayers(data);
    });
  }, []);

  // Sugestões de jogos para autocomplete
  const filteredGames = useMemo(() => {
    if (!search) return games;
    return games.filter((g: any) =>
      g.opponent.toLowerCase().includes(search.toLowerCase()) ||
      (g.location && g.location.toLowerCase().includes(search.toLowerCase()))
    );
  }, [games, search]);

  // Filtrar playersStats conforme filtros
  const filteredPlayersStats = useMemo(() => {
    let filtered = playersStats;
    if (playerFilter) {
      filtered = filtered.filter((p: any) => String(p.id) === playerFilter);
    }
    if (categoryFilter) {
      filtered = filtered.filter((p: any) => p.category === categoryFilter);
    }
    return filtered;
  }, [playersStats, playerFilter, categoryFilter]);

  // Destaques (exemplo: maior pontuadora, reboteira, assistente, aproveitamento)
  const highlights = overview && filteredPlayersStats.length > 0 ? [
    {
      title: "PONTOS",
      value: Math.max(...filteredPlayersStats.map(p => p.total_pontos || 0)),
      playerName: filteredPlayersStats.reduce((a, b) => (a.total_pontos > b.total_pontos ? a : b), filteredPlayersStats[0])?.nome || '-',
      playerImage: `/images/players/${filteredPlayersStats.reduce((a, b) => (a.total_pontos > b.total_pontos ? a : b), filteredPlayersStats[0])?.nome?.toLowerCase().replace(/ /g, '-') || 'default'}.jpg`,
      legend: "AACB Brasília Basquete",
    },
    {
      title: "TOTAL DE REBOTES",
      value: Math.max(...filteredPlayersStats.map(p => p.total_rebotes || 0)),
      playerName: filteredPlayersStats.reduce((a, b) => (a.total_rebotes > b.total_rebotes ? a : b), filteredPlayersStats[0])?.nome || '-',
      playerImage: `/images/players/${filteredPlayersStats.reduce((a, b) => (a.total_rebotes > b.total_rebotes ? a : b), filteredPlayersStats[0])?.nome?.toLowerCase().replace(/ /g, '-') || 'default'}.jpg`,
      legend: "AACB Brasília Basquete",
    },
    {
      title: "ASSISTÊNCIAS",
      value: Math.max(...filteredPlayersStats.map(p => p.total_assistencias || 0)),
      playerName: filteredPlayersStats.reduce((a, b) => (a.total_assistencias > b.total_assistencias ? a : b), filteredPlayersStats[0])?.nome || '-',
      playerImage: `/images/players/${filteredPlayersStats.reduce((a, b) => (a.total_assistencias > b.total_assistencias ? a : b), filteredPlayersStats[0])?.nome?.toLowerCase().replace(/ /g, '-') || 'default'}.jpg`,
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
  const playersChart = filteredPlayersStats.map((p) => ({
    name: p.name,
    Pontos: p.total_pontos,
    Rebotes: p.total_rebotes,
    Assistências: p.total_assistencias,
  }));

  // Dados para a tabela
  const playersTable = filteredPlayersStats.map((p, idx) => ({
    no: p.number,
    name: p.name,
    pos: p.position,
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

  // Dados para gráfico de linha (evolução por jogo)
  const playerEvolutionData = useMemo(() => {
    if (!playerFilter || !games.length) return [];
    // Buscar estatísticas da jogadora por jogo
    return games
      .map((game: any) => {
        const stats = playersStats.find((p: any) => String(p.id) === playerFilter && p.jogo_id === game.id);
        return {
          jogo: `${game.opponent} (${new Date(game.date).toLocaleDateString()})`,
          pontos: stats ? stats.total_pontos : 0,
        };
      })
      .filter((d) => d.pontos > 0);
  }, [playerFilter, games, playersStats]);

  // Dados para gráfico radar (desempenho individual)
  const playerRadarData = useMemo(() => {
    if (!playerFilter) return [];
    const player = playersStats.find((p: any) => String(p.id) === playerFilter);
    if (!player) return [];
    return [
      { stat: 'Pontos', valor: player.total_pontos || 0 },
      { stat: 'Rebotes', valor: player.total_rebotes || 0 },
      { stat: 'Assistências', valor: player.total_assistencias || 0 },
      { stat: 'Roubos', valor: player.total_roubos || 0 },
      { stat: 'Faltas', valor: player.total_faltas || 0 },
    ];
  }, [playerFilter, playersStats]);

  return (
    <div className="p-4 md:p-8 mt-16">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="flex-1 md:max-w-xs">
          <DateFilterDropdown value={dateFilter} onChange={(v) => { setDateFilter(v); setSelectedGame(null); }} />
        </div>
        <div className="flex-1 md:max-w-md relative">
          <input
            type="text"
            className="w-full border rounded px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            placeholder="Buscar jogo pelo adversário ou local..."
            value={search}
            onChange={e => { setSearch(e.target.value); setSearchFocused(true); }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            aria-label="Buscar jogo pelo adversário ou local"
          />
          {searchFocused && filteredGames.length > 0 && (
            <div className="absolute left-0 right-0 bg-white border rounded shadow-lg z-10 max-h-60 overflow-y-auto mt-1" role="listbox" aria-label="Sugestões de jogos">
              {filteredGames.map((game: any) => (
                <div
                  key={game.id}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                  onClick={() => {
                    setSelectedGame(game);
                    setSearch(`${game.opponent} (${new Date(game.date).toLocaleDateString()})`);
                    setSearchFocused(false);
                  }}
                  tabIndex={0}
                  role="option"
                  aria-selected={selectedGame?.id === game.id}
                  onKeyDown={e => { if (e.key === 'Enter') { setSelectedGame(game); setSearch(`${game.opponent} (${new Date(game.date).toLocaleDateString()})`); setSearchFocused(false); } }}
                >
                  <span className="font-semibold">{game.opponent}</span>
                  <span className="ml-2 text-xs text-gray-500">{new Date(game.date).toLocaleDateString()}</span>
                  <span className="ml-2 text-xs text-gray-400">{game.location}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Filtro de Jogadora */}
        <div className="flex-1 md:max-w-xs">
          <input
            type="text"
            className="w-full border rounded px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            placeholder="Filtrar por jogadora..."
            value={playerFilter ? (allPlayers.find(p => String(p.id) === playerFilter)?.nome || '') : ''}
            onChange={e => {
              const nome = e.target.value.toLowerCase();
              const found = allPlayers.find(p => p.nome.toLowerCase().includes(nome));
              setPlayerFilter(found ? String(found.id) : '');
            }}
            list="players-list"
            aria-label="Filtrar por jogadora"
          />
          <datalist id="players-list">
            {allPlayers.map((p) => (
              <option key={p.id} value={p.nome} />
            ))}
          </datalist>
        </div>
        {/* Filtro de Categoria */}
        <div className="flex-1 md:max-w-xs">
          <select
            className="w-full border rounded px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            aria-label="Filtrar por categoria"
          >
            {categorias.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback de erro */}
      {error && (
        <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Skeletons durante carregamento */}
      {loading ? (
        <>
          {/* Skeleton dos cards de destaque */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
          {/* Skeleton do gráfico */}
          <div className="bg-gray-200 h-64 rounded-lg mb-8 animate-pulse"></div>
          {/* Skeleton da tabela */}
          <div className="bg-gray-200 h-48 rounded-lg animate-pulse"></div>
        </>
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
                    {selectedGame.location} &bull; {selectedGame.category || '-'}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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
          {playerFilter && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Gráfico de linha: evolução dos pontos */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Evolução dos Pontos por Jogo</h2>
                <div className="w-full h-64 overflow-x-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={playerEvolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <XAxis dataKey="jogo" tick={{ fontSize: 12 }} angle={-20} interval={0} height={60} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="pontos" stroke="#2563eb" strokeWidth={3} dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              {/* Gráfico radar: desempenho individual */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Radar de Desempenho Individual</h2>
                <div className="w-full h-64 overflow-x-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={playerRadarData} outerRadius={90}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="stat" />
                      <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
                      <Radar name="Desempenho" dataKey="valor" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}
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
          {/* Box Score */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Box Score</h2>
            <PlayersStatsTable data={playersTable} />
          </div>
        </>
      )}
    </div>
  );
} 