import { useEffect, useState, useMemo } from 'react';
import { Card } from "../components/ui/Card";
import { usePageTitle } from "../hooks/usePageTitle";
import { DateFilterDropdown } from "../components/ui/DateFilterDropdown";
import { HighlightPlayerCard } from "../components/ui/HighlightPlayerCard";
import { BoxScoreTable } from "../components/BoxScoreTable";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line } from 'recharts';
import { api } from '../services/api';
import { getGameStats } from '../services/api';
import { AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Remover a constante API_URL hardcoded
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
  // Remover filtros de jogadora e categoria
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  // Buscar estatísticas reais do backend para o jogo selecionado
  const [stats, setStats] = useState<GameStats[]>([]);

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
        const res = await api.get('/dashboard/public/jogos', { params });
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
            api.get('/dashboard/public/overview', { params: { jogo_id: selectedGame.id } }),
            api.get('/dashboard/public/jogadoras', { params: { jogo_id: selectedGame.id } }),
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
            api.get('/dashboard/public/overview', { params }),
            api.get('/dashboard/public/jogadoras', { params }),
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
    api.get('/dashboard/public/jogadoras').then(({ data }) => {
      setAllPlayers(data);
    });
  }, []);

  // Buscar estatísticas reais do backend para o jogo selecionado
  useEffect(() => {
    if (selectedGame?.id) {
      getGameStats(selectedGame.id)
        .then((data) => setStats(data))
        .catch(() => setStats([]));
    }
  }, [selectedGame]);

  // Sugestões de jogos para autocomplete
  const filteredGames = useMemo(() => {
    if (!search) return games;
    return games.filter((g: any) =>
      g.opponent.toLowerCase().includes(search.toLowerCase()) ||
      (g.location && g.location.toLowerCase().includes(search.toLowerCase()))
    );
  }, [games, search]);

  // Não filtrar por jogadora nem categoria
  const filteredPlayersStats = playersStats;

  // Destaques (exemplo: maior pontuadora, reboteira, assistente, aproveitamento)
  const highlights = overview && filteredPlayersStats.length > 0 ? [
    (() => {
      const leader = filteredPlayersStats.reduce((a, b) => (a.total_pontos > b.total_pontos ? a : b), filteredPlayersStats[0]);
      return {
        title: "PONTOS",
        value: leader?.total_pontos ?? '-',
        playerName: leader?.name || leader?.nome || '-',
        playerImage: leader?.user?.profile_image || leader?.photoUrl || `/images/players/default.jpg`,
        legend: leader?.name || leader?.nome || '-',
      };
    })(),
    (() => {
      const leader = filteredPlayersStats.reduce((a, b) => (a.total_rebotes > b.total_rebotes ? a : b), filteredPlayersStats[0]);
      return {
        title: "TOTAL DE REBOTES",
        value: leader?.total_rebotes ?? '-',
        playerName: leader?.name || leader?.nome || '-',
        playerImage: leader?.user?.profile_image || leader?.photoUrl || `/images/players/default.jpg`,
        legend: leader?.name || leader?.nome || '-',
      };
    })(),
    (() => {
      const leader = filteredPlayersStats.reduce((a, b) => (a.total_assistencias > b.total_assistencias ? a : b), filteredPlayersStats[0]);
      return {
        title: "ASSISTÊNCIAS",
        value: leader?.total_assistencias ?? '-',
        playerName: leader?.name || leader?.nome || '-',
        playerImage: leader?.user?.profile_image || leader?.photoUrl || `/images/players/default.jpg`,
        legend: leader?.name || leader?.nome || '-',
      };
    })(),
    {
      title: "APROVEITAMENTO",
      value: '—',
      playerName: '-',
      playerImage: `/images/players/default.jpg`,
      legend: '-',
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
  const playersTable = filteredPlayersStats.map((p) => ({
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

  const handleExportPDF = async () => {
    alert('Exportação em PDF mockada! Implemente a lógica real aqui.');
    // Lógica real de exportação usando jsPDF/html2canvas
  };

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
        {/* Remover campos de filtro do layout (inputs e selects relacionados a playerFilter e categoryFilter) */}
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
          <div className="flex justify-end mb-4">
            <button
              onClick={handleExportPDF}
              className="bg-blue-700 text-white px-4 py-2 rounded shadow hover:bg-blue-800 transition"
            >
              Exportar PDF
            </button>
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
          {/* Box Score */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Box Score</h2>
            {/* Passar playersStats se não houver jogo selecionado, stats se houver */}
            <BoxScoreTable
              gameId={selectedGame?.id}
              stats={selectedGame ? stats : playersStats}
              onStatsUpdate={() => {}}
            />
          </div>
        </>
      )}
    </div>
  );
} 