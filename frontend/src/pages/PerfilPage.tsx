import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { usePageTitle } from '../hooks/usePageTitle';
import { BoxScoreTable } from '../components/BoxScoreTable';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api, getGameStats, getPlayers as fetchPlayers, getMySubscription, uploadProfilePhoto } from '../services/api';
import { useAuthStore } from '../store';
import { Heart, Briefcase, Target, Calendar, Settings, CreditCard, UserCircle, X, Upload, KeyRound, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { GameStats } from '../types/game';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui';
import { SubscriptionManagementModal } from '../components/SubscriptionManagementModal';

type DashboardGame = {
  id: number;
  opponent: string;
  date: string;
  status: string;
  players?: { id: number; name: string; user_id?: number }[];
};

type Player = {
  id: number;
  name: string;
  number?: number;
  position?: string;
  user_id?: number;
};

type SubscriptionInfo = {
  plan?: string;
  status?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  card_last4?: string;
  card_brand?: string;
  customer_since?: string;
  subscribed_since?: string;
  next_billing?: string;
  last_payment?: string;
  amount?: number;
  can_upgrade_to?: string[];
  can_downgrade_to?: string[];
  has_subscription?: boolean;
};

export default function PerfilPage() {
  usePageTitle("Perfil");
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<DashboardGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [stats, setStats] = useState<GameStats[]>([]);
  const [playersInGame, setPlayersInGame] = useState<Player[]>([]);
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [chartTab, setChartTab] = useState<'points' | 'assists' | 'fouls' | 'rebounds'>('points');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionInfo | null>(null);
  const [teams, setTeams] = useState<{ id: number; name: string; email: string }[]>([]);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    cpf: '',
    favoriteTeam: '',
    playingTeam: '',
    profileImage: user?.profile_image || '',
    newPassword: '',
    confirmPassword: '',
  });
  const [originalProfile, setOriginalProfile] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    favoriteTeam: '',
    playingTeam: '',
    profileImage: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Verificar se há alterações não salvas
  const hasUnsavedChanges = useMemo(() => {
    return (
      profileForm.name !== originalProfile.name ||
      profileForm.phone !== originalProfile.phone ||
      profileForm.favoriteTeam !== originalProfile.favoriteTeam ||
      profileForm.playingTeam !== originalProfile.playingTeam ||
      profileForm.profileImage !== originalProfile.profileImage ||
      profileForm.newPassword !== '' ||
      profileForm.confirmPassword !== ''
    );
  }, [profileForm, originalProfile]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile/me');
        const userData = response.data;
        const profileData = {
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          cpf: userData.cpf || '',
          favoriteTeam: userData.favorite_team || '',
          playingTeam: userData.playing_team || '',
          profileImage: userData.profile_image || '',
        };
        setProfileForm(prev => ({
          ...prev,
          ...profileData,
        }));
        setOriginalProfile(profileData);
        if (user) {
          setUser({ ...user, name: userData.name, email: userData.email, profile_image: userData.profile_image });
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        toast.error('Erro ao carregar dados do perfil.');
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user?.id, setUser]);

  // Fetch teams for dropdown
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await api.get('/profile/teams');
        setTeams(response.data);
      } catch (error) {
        console.error('Erro ao buscar times:', error);
      }
    };
    fetchTeams();
  }, []);

  // Fetch games for the user
  useEffect(() => {
    const fetchGames = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (dateStart) params.append('data_inicio', dateStart);
        if (dateEnd) params.append('data_fim', dateEnd);
        if (searchTerm) params.append('search', searchTerm);

        const response = await api.get(`/games?${params.toString()}`);
        const userPlayerResponse = await fetchPlayers();
        const userPlayer = userPlayerResponse.find(p => p.user_id === user.id);

        if (userPlayer) {
          const filteredGames = response.data.filter((game: DashboardGame) =>
            game.players?.some(p => p.id === userPlayer.id)
          );
          setGames(filteredGames);
        } else {
          setGames([]);
        }
      } catch (error) {
        console.error('Erro ao buscar jogos:', error);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [dateStart, dateEnd, searchTerm, user?.id, user?.role]);

  // Fetch stats for selected game or all games
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) {
        setStats([]);
        setPlayersInGame([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let gameIds: number[] = [];
        if (selectedGame) {
          gameIds = [selectedGame];
        } else {
          gameIds = games.map(g => g.id);
        }

        if (gameIds.length === 0) {
          setStats([]);
          setPlayersInGame([]);
          setLoading(false);
          return;
        }

        const allStats: GameStats[] = [];
        const uniquePlayersInGame = new Map<number, Player>();
        const userPlayerResponse = await fetchPlayers();
        const userPlayer = userPlayerResponse.find(p => p.user_id === user.id);

        for (const gameId of gameIds) {
          try {
            const gameStats = await getGameStats(gameId);
            const gameDetails = await api.get(`/games/${gameId}`);
            const players = gameDetails.data.players || [];

            players.forEach((p: Player) => {
              if (!uniquePlayersInGame.has(p.id)) {
                uniquePlayersInGame.set(p.id, p);
              }
            });

            const playerStats = gameStats.filter((stat: any) => {
              return userPlayer && stat.player_id === userPlayer.id;
            });
            allStats.push(...playerStats);
          } catch (error) {
            console.error(`Erro ao buscar stats do jogo ${gameId}:`, error);
          }
        }

        setStats(allStats);
        setPlayersInGame(Array.from(uniquePlayersInGame.values()));
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedGame, games, user?.id]);

  // Aggregate stats for cards
  const aggregatedStats = useMemo(() => {
    if (!stats.length) return null;

    const total = stats.reduce((acc, stat) => {
      return {
        points: acc.points + (stat.points || 0),
        rebounds: acc.rebounds + (stat.rebounds || (stat.rebo_ofensivo || 0) + (stat.rebo_defensivo || 0)),
        assists: acc.assists + (stat.assists || 0),
        games: acc.games,
        minutes_played: acc.minutes_played + (stat.minutes_played || 0),
      };
    }, { points: 0, rebounds: 0, assists: 0, games: games.length, minutes_played: 0 });

    return total;
  }, [stats, games.length]);

  // Prepare data for evolutionary chart
  const chartData = useMemo(() => {
    if (!stats.length) return [];

    const monthlyData: Record<string, { month: string; points: number; assists: number; fouls: number; rebounds: number }> = {};

    stats.forEach(stat => {
      if (!stat.game?.date) return;

      const date = new Date(stat.game.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthLabel,
          points: 0,
          assists: 0,
          fouls: 0,
          rebounds: 0,
        };
      }

      monthlyData[monthKey].points += stat.points || 0;
      monthlyData[monthKey].assists += stat.assists || 0;
      monthlyData[monthKey].fouls += stat.fouls || stat.fp || 0;
      monthlyData[monthKey].rebounds += stat.rebounds || (stat.rebo_ofensivo || 0) + (stat.rebo_defensivo || 0);
    });

    return Object.values(monthlyData).sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
  }, [stats]);

  // Handle profile form changes
  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle profile image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const response = await uploadProfilePhoto(file);
        setProfileForm(prev => ({ ...prev, profileImage: response.url }));
        if (user) {
          setUser({ ...user, profile_image: response.url });
        }
        toast.success(response.message);
        // A imagem já é salva automaticamente no backend, então atualizamos o originalProfile
        setOriginalProfile(prev => ({ ...prev, profileImage: response.url }));
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        toast.error('Erro ao fazer upload da imagem.');
      }
    }
  };

  // Handle profile save - salva todos os campos
  const handleProfileSave = async () => {
    if (!hasUnsavedChanges) {
      toast.info('Nenhuma alteração para salvar.');
      return;
    }

    setSavingProfile(true);
    try {
      // Validar senha se fornecida
      if (profileForm.newPassword) {
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          toast.error('A nova senha e a confirmação não coincidem.');
          setSavingProfile(false);
          return;
        }
        if (profileForm.newPassword.length < 8) {
          toast.error('A senha deve ter pelo menos 8 caracteres.');
          setSavingProfile(false);
          return;
        }
      }

      // Preparar payload de atualização
      const updatePayload: any = {};
      
      if (profileForm.name !== originalProfile.name) {
        updatePayload.name = profileForm.name;
      }
      if (profileForm.phone !== originalProfile.phone) {
        updatePayload.phone = profileForm.phone || null;
      }
      if (profileForm.favoriteTeam !== originalProfile.favoriteTeam) {
        updatePayload.favorite_team = profileForm.favoriteTeam || null;
      }
      if (profileForm.playingTeam !== originalProfile.playingTeam) {
        updatePayload.playing_team = profileForm.playingTeam || null;
      }
      if (profileForm.newPassword) {
        updatePayload.password = profileForm.newPassword;
      }

      console.log('Enviando atualização do perfil:', updatePayload);

      // Atualizar perfil
      const response = await api.put('/profile/me', updatePayload);
      console.log('Resposta do backend:', response.data);
      
      toast.success('Perfil atualizado com sucesso!');
      
      // Atualizar originalProfile com os novos valores
      const updatedOriginal = {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        cpf: profileForm.cpf,
        favoriteTeam: profileForm.favoriteTeam,
        playingTeam: profileForm.playingTeam,
        profileImage: profileForm.profileImage,
      };
      setOriginalProfile(updatedOriginal);
      
      // Limpar campos de senha após salvar
      setProfileForm(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
      setEditingField(null);
      
      // Refresh user data do backend
      const refreshResponse = await api.get('/profile/me');
      const userData = refreshResponse.data;
      if (user) {
        setUser({ 
          ...user, 
          name: userData.name, 
          email: userData.email, 
          profile_image: userData.profile_image 
        });
      }
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      console.error('Detalhes do erro:', error.response?.data);
      toast.error(`Erro ao salvar perfil: ${error.response?.data?.detail || error.message || 'Erro desconhecido'}`);
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle team link request
  const handleTeamLinkRequest = async (teamId: number) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado.');
      return;
    }
    try {
      const userPlayerResponse = await fetchPlayers();
      const userPlayer = userPlayerResponse.find(p => p.user_id === user.id);

      if (!userPlayer) {
        toast.error('Você não possui um perfil de jogador para vincular a um time.');
        return;
      }

      await api.post('/team-players/link', {
        team_id: teamId,
        player_id: userPlayer.id,
      });
      toast.success('Solicitação de vinculação ao time enviada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao solicitar vínculo ao time:', error);
      toast.error(`Erro ao solicitar vínculo: ${error.response?.data?.detail || error.message}`);
    }
  };

  // Fetch subscription details
  useEffect(() => {
    if (showSubscriptionModal && user?.id) {
      const fetchSubscription = async () => {
        try {
          const details = await getMySubscription();
          setSubscriptionDetails(details);
        } catch (error) {
          console.error('Erro ao buscar detalhes da assinatura:', error);
          toast.error('Erro ao carregar detalhes da assinatura.');
        }
      };
      fetchSubscription();
    }
  }, [showSubscriptionModal, user?.id]);

  if (loading || loadingProfile) {
    return <div className="w-full h-full flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="relative flex h-full">
      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Header com filtro de data e busca */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 sr-only">Perfil</h1>
          <div className="flex items-center gap-4 ml-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar partida..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
              <Input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Heart className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pontos</p>
                <p className="text-2xl font-bold">{aggregatedStats?.points || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Briefcase className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rebotes</p>
                <p className="text-2xl font-bold">{aggregatedStats?.rebounds || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Assistências</p>
                <p className="text-2xl font-bold">{aggregatedStats?.assists || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Jogos</p>
                <p className="text-2xl font-bold">{aggregatedStats?.games || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráfico Evolutivo */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Evolução de Estatísticas</h2>
          <div className="flex gap-4 mb-4">
            <Button
              onClick={() => setChartTab('points')}
              className={`px-4 py-2 rounded-lg ${chartTab === 'points' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              Pontos
            </Button>
            <Button
              onClick={() => setChartTab('assists')}
              className={`px-4 py-2 rounded-lg ${chartTab === 'assists' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              Assistência
            </Button>
            <Button
              onClick={() => setChartTab('fouls')}
              className={`px-4 py-2 rounded-lg ${chartTab === 'fouls' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              Faltas
            </Button>
            <Button
              onClick={() => setChartTab('rebounds')}
              className={`px-4 py-2 rounded-lg ${chartTab === 'rebounds' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              Rebotes
            </Button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={chartTab === 'points' ? 'points' : chartTab === 'assists' ? 'assists' : chartTab === 'fouls' ? 'fouls' : 'rebounds'}
                  stroke="#8884d8"
                  name={chartTab === 'points' ? 'Pontos' : chartTab === 'assists' ? 'Assistências' : chartTab === 'fouls' ? 'Faltas' : 'Rebotes'}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Seleção de Partida e BoxScore */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">BoxScore da Partida</h2>
            <div className="w-64">
              <Select
                value={selectedGame?.toString() || 'all'}
                onValueChange={(value) => setSelectedGame(value === 'all' ? null : Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar Partida" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as partidas</SelectItem>
                  {games.map(game => (
                    <SelectItem key={game.id} value={game.id.toString()}>
                      {new Date(game.date).toLocaleDateString('pt-BR')} - vs {game.opponent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {stats.length > 0 && playersInGame.length > 0 ? (
            <BoxScoreTable gameId={selectedGame} stats={stats} players={playersInGame} />
          ) : (
            <div className="text-center text-gray-500 py-8">Nenhuma estatística encontrada para as partidas selecionadas.</div>
          )}
        </Card>
      </div>

      {/* Modal de Gerenciamento de Assinatura */}
      <SubscriptionManagementModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        subscriptionDetails={subscriptionDetails}
        loading={!subscriptionDetails && showSubscriptionModal}
      />

      {/* Sidebar Direita - Informações do Usuário Editáveis */}
      <div className="w-80 bg-white border-l border-gray-200 p-6 space-y-6 overflow-y-auto">
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 overflow-hidden border-2 border-purple-500">
            {profileForm.profileImage ? (
              <img src={profileForm.profileImage} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserCircle size={40} className="text-gray-400" />
            )}
            <label
              htmlFor="profile-image-upload"
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-blue-700 transition-colors"
            >
              <Upload size={14} />
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                ref={fileInputRef}
              />
            </label>
          </div>
          <h3 className="text-lg font-bold">{profileForm.name || 'Usuário'}</h3>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        <div className="space-y-2">
          {(user?.role === 'player' || user?.plan === 'pro') && (
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => setShowSubscriptionModal(true)}
            >
              <CreditCard size={16} />
              Gerenciar Assinatura
            </Button>
          )}
        </div>

        {/* Informações Pessoais Editáveis */}
        <div className="pt-6 border-t space-y-4">
          <h4 className="font-semibold mb-4">Informações Pessoais</h4>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="sidebar-name" className="text-sm text-gray-600">Nome completo</Label>
              <Input
                id="sidebar-name"
                name="name"
                value={profileForm.name}
                onChange={handleProfileFormChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="sidebar-email" className="text-sm text-gray-600">E-mail</Label>
              <Input
                id="sidebar-email"
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileFormChange}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="sidebar-phone" className="text-sm text-gray-600">Telefone</Label>
              <Input
                id="sidebar-phone"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileFormChange}
                className="mt-1"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <Label htmlFor="sidebar-cpf" className="text-sm text-gray-600">CPF/CNPJ</Label>
              <Input
                id="sidebar-cpf"
                name="cpf"
                value={profileForm.cpf}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="sidebar-favoriteTeam" className="text-sm text-gray-600">Time do coração</Label>
              <Input
                id="sidebar-favoriteTeam"
                name="favoriteTeam"
                value={profileForm.favoriteTeam}
                onChange={handleProfileFormChange}
                className="mt-1"
                placeholder="Ex: Lakers"
              />
            </div>

            <div>
              <Label htmlFor="sidebar-playingTeam" className="text-sm text-gray-600">Time que joga</Label>
              <Select
                value={profileForm.playingTeam || ''}
                onValueChange={(value) => {
                  setProfileForm(prev => ({ ...prev, playingTeam: value }));
                  if (value) {
                    handleTeamLinkRequest(Number(value));
                  }
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecionar Time" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Password Change Fields */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <KeyRound size={16} /> Alterar Senha
              </h3>
              <div>
                <Label htmlFor="sidebar-newPassword" className="text-sm text-gray-600">Nova Senha</Label>
                <Input
                  id="sidebar-newPassword"
                  name="newPassword"
                  type="password"
                  value={profileForm.newPassword}
                  onChange={handleProfileFormChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="sidebar-confirmPassword" className="text-sm text-gray-600">Confirmar Nova Senha</Label>
                <Input
                  id="sidebar-confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={profileForm.confirmPassword}
                  onChange={handleProfileFormChange}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleProfileSave}
              disabled={savingProfile || !hasUnsavedChanges}
              className={`w-full ${
                hasUnsavedChanges 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {savingProfile ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
