import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  Settings, 
  LogOut, 
  UserCircle,
  Calendar as CalendarIcon,
  ChevronDown,
  LucideIcon
} from 'lucide-react';
import { useAuthStore } from '../store';
import { api } from '../services/api';

interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  extraClass?: string;
}

interface BaseLayoutProps {
  children?: React.ReactNode;
  user?: { name: string; email: string; role: string; plan?: string };
}

export function BaseLayout({ user: userProp }: BaseLayoutProps) {
  const storeUser = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  const navigate = useNavigate();
  const user = userProp || storeUser || { name: 'Admin', email: '', role: 'superadmin', plan: 'free' };
  const [showNotifications, setShowNotifications] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const location = useLocation();

  // Buscar dados do usuário se não estiver no store
  useEffect(() => {
    if (!storeUser && !userProp) {
      const token = localStorage.getItem('token');
      if (token) {
        api.get('/auth/me')
          .then(response => {
            const userData = response.data;
            setUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              plan: userData.plan,
              token: token,
            });
          })
          .catch(error => {
            console.error('Erro ao buscar dados do usuário:', error);
          });
      }
    }
  }, [storeUser, userProp, setUser]);

  // Menu principal
  const menuItems: MenuItem[] = [
    // Dashboard apenas para superadmin e team_admin
    ...(user.role === 'superadmin' || user.role === 'team_admin' ? [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    // Usuários apenas para superadmin
    ...(user.role === 'superadmin' ? [{ path: '/usuarios', label: 'Usuários', icon: Users }] : []),
    { path: '/painel', label: 'Painel', icon: Users },
    { path: '/notificacoes', label: 'Notificações', icon: Bell },
    { path: '/agenda', label: 'Agenda', icon: CalendarIcon },
  ];

  // Submenu de configurações (apenas para superadmin e team_admin)
  const configSubItems: MenuItem[] = [
    // Assinaturas apenas para superadmin
    ...(user.role === 'superadmin' ? [{ path: '/assinaturas', label: 'Assinaturas', icon: Settings }] : []),
    // Gerenciar Emails apenas para superadmin
    ...(user.role === 'superadmin' ? [{ path: '/configuracoes/emails', label: 'Gerenciar Emails', icon: Settings }] : []),
    // Jogadores apenas para superadmin ou team_admin
    ...(user.role === 'superadmin' || user.role === 'team_admin' ? [{ path: '/jogadores', label: 'Jogadores', icon: Users }] : []),
  ];

  const bottomMenuItems: MenuItem[] = [
    { path: '/logout', label: 'Log Out', icon: LogOut, extraClass: 'text-red-500 hover:bg-red-50' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Abre automaticamente o submenu de Configurações quando estiver em rotas filhas
  useEffect(() => {
    const underSettings = location.pathname.startsWith('/configuracoes') || location.pathname.startsWith('/assinaturas');
    setConfigOpen(underSettings);
  }, [location.pathname]);

  // Simulação de notificações não lidas
  const [notifications, setNotifications] = useState<any[]>([]);
  useEffect(() => {
    // Buscar notificações não lidas (mock)
    setNotifications([
      { id: 1, text: 'Bem-vindo ao ScoreMVP!', url: '', read: false, timestamp: '2024-06-01 10:00' },
      { id: 2, text: 'Novo jogo disponível!', url: '/dashboard', read: false, timestamp: '2024-06-02 12:00' },
    ]);
  }, []);

  function markAsRead(id: number) {
    setNotifications(n => n.filter(notif => notif.id !== id));
  }

  // Nome do plano por valor do plan
  const planoPorPlan: Record<string, string> = {
    free: 'Player',
    pro: 'MVP',
    team: 'Team',
  };

  // Nome do plano por role (fallback)
  const planoPorRole: Record<string, string> = {
    superadmin: 'Master',
    team_admin: 'Gestor',
    scout: 'Scout',
    player: 'Atleta',
    guest: 'Visitante',
  };

  // Determinar o plano a exibir
  const planoExibido = user.plan ? (planoPorPlan[user.plan] || user.plan.toUpperCase()) : planoPorRole[user.role] || 'Visitante';

  return (
    <div className="flex" style={{ fontFamily: 'Jakarta Sans, sans-serif' }}>
      {/* Sidebar Fixo */}
      <aside className="w-64 bg-white flex flex-col justify-between py-8 px-6 border-r border-[#E3E3E3] min-h-screen fixed left-0 top-0 h-full z-40">
        <div>
          <div className="flex flex-col items-center mb-6">
            <img src="/images/logo-score.png" alt="ScoreMVP Logo" className="w-[120px] h-auto" />
          </div>
          <nav className="flex flex-col gap-2 mb-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'text-[#2563eb] bg-[#e7edff] font-bold'
                      : 'text-[#7B8BB2] hover:bg-[#e7edff]'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
            
            {/* Configurações com submenu (apenas para superadmin e team_admin) */}
            {(user.role === 'superadmin' || user.role === 'team_admin') && (
              <div>
                <button
                  onClick={() => setConfigOpen(!configOpen)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors text-[#7B8BB2] hover:bg-[#e7edff]"
                >
                  <div className="flex items-center gap-2">
                    <Settings size={16} />
                    Configurações
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${configOpen ? 'rotate-180' : ''}`} />
                </button>
                {configOpen && (
                  <div className="ml-4 mt-2 space-y-1">
                    {configSubItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                            isActive(item.path)
                              ? 'text-[#2563eb] bg-[#e7edff] font-bold'
                              : 'text-[#7B8BB2] hover:bg-[#e7edff]'
                          }`}
                        >
                          <Icon size={14} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
        {/* Usuário no rodapé da sidebar */}
        <div className="mt-auto pt-6 border-t border-[#E3E3E3]">
          <button
            onClick={() => navigate('/perfil')}
            className="flex items-center gap-3 w-full text-left hover:bg-[#e7edff] rounded-lg p-2 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#F3F3F3] flex items-center justify-center border border-[#E3E3E3] overflow-hidden">
              {user.profile_image ? (
                <img src={user.profile_image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={22} className="text-[#7B8BB2]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#1f2937] truncate">{user.name}</div>
              <div className="text-[11px] text-[#7B8BB2] truncate">{planoExibido}</div>
            </div>
          </button>
          <div className="flex flex-col gap-2 mt-4">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'text-[#2563eb] bg-[#e7edff] font-bold'
                    : (item.extraClass || 'text-[#7B8BB2] hover:bg-[#e7edff]')
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
          </div>
        </div>
      </aside>
      
      {/* Main content (sem header, com respiro 10px) */}
      <div className="flex-1 flex flex-col ml-64">
        <main className="flex-1 bg-white min-h-screen px-2.5 py-2.5">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}


