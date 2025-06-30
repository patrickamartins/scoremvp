import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  Settings, 
  LogOut, 
  UserCircle,
  Calendar as CalendarIcon,
  LucideIcon
} from 'lucide-react';
import { useAuthStore } from '../store';

interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  extraClass?: string;
}

interface AdminLayoutProps {
  children?: React.ReactNode;
  user?: { name: string; email: string; role: string };
}

export function AdminLayout({ user: userProp }: AdminLayoutProps) {
  const storeUser = useAuthStore(state => state.user);
  const user = userProp || storeUser || { name: 'Admin', email: '', role: 'superadmin' };
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  // Lógica de menus por papel
  let mainMenuItems: MenuItem[] = [];
  if (user.role === 'superadmin') {
    mainMenuItems = [
      { path: '/dashboard', label: 'Dashboard Geral', icon: LayoutDashboard },
      { path: '/usuarios', label: 'Usuários', icon: Users },
      { path: '/painel', label: 'Painel', icon: Users },
      { path: '/notificacoes', label: 'Notificações', icon: Bell },
      { path: '/agenda', label: 'Agenda', icon: CalendarIcon },
      { path: '/nossos-jogos', label: 'Nossos Jogos', icon: CalendarIcon },
    ];
  } else if (user.role === 'team_admin') {
    mainMenuItems = [
      { path: '/dashboard', label: 'Dashboard do Time', icon: LayoutDashboard },
      { path: '/jogadoras', label: 'Jogadoras', icon: Users },
      { path: '/painel', label: 'Painel', icon: Users },
      { path: '/notificacoes', label: 'Notificações', icon: Bell },
      { path: '/agenda', label: 'Agenda', icon: CalendarIcon },
      { path: '/nossos-jogos', label: 'Nossos Jogos', icon: CalendarIcon },
    ];
  } else if (user.role === 'scout') {
    mainMenuItems = [
      { path: '/dashboard', label: 'Dashboard de Análise', icon: LayoutDashboard },
      { path: '/registrar-estatisticas', label: 'Registrar Estatísticas', icon: Users },
      { path: '/notificacoes', label: 'Notificações', icon: Bell },
      { path: '/agenda', label: 'Agenda', icon: CalendarIcon },
    ];
  } else if (user.role === 'player') {
    mainMenuItems = [
      { path: '/dashboard', label: 'Meu Dashboard', icon: LayoutDashboard },
      { path: '/estatisticas', label: 'Minhas Estatísticas', icon: Users },
      { path: '/equipe', label: 'Equipe', icon: Users },
      { path: '/historico', label: 'Histórico de Jogos', icon: CalendarIcon },
      { path: '/agenda', label: 'Agenda', icon: CalendarIcon },
    ];
  } else {
    // guest ou não logado
    mainMenuItems = [
      { path: '/dashboard-publico', label: 'Dashboard Público', icon: LayoutDashboard },
      { path: '/jogos', label: 'Jogos', icon: CalendarIcon },
      { path: '/rankings', label: 'Rankings', icon: Users },
    ];
  }

  const bottomMenuItems: MenuItem[] = [
    { path: '/configuracoes', label: 'Configurações', icon: Settings },
    { path: '/logout', label: 'Log Out', icon: LogOut, extraClass: 'text-red-500 hover:bg-red-50' },
  ];

  const isActive = (path: string) => location.pathname === path;

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
    // Aqui pode-se disparar evento global ou salvar no localStorage/histórico
  }

  // Nome do plano por papel
  const planoPorRole: Record<string, string> = {
    superadmin: 'Master',
    team_admin: 'Gestor',
    scout: 'Scout',
    player: 'Atleta',
    guest: 'Visitante',
  };

  return (
    <div className="flex" style={{ fontFamily: 'Jakarta Sans, sans-serif' }}>
      {/* Sidebar Fixo */}
      <aside className="w-64 bg-white flex flex-col justify-between py-8 px-6 border-r border-[#E3E3E3] min-h-screen fixed left-0 top-0 h-full z-40">
        <div>
          <div className="flex flex-col items-center mb-6">
            <img src="/images/logo-score.png" alt="ScoreMVP Logo" className="h-12 w-auto mb-2" />
          </div>
          <div className="text-xs text-[#7B8BB2] font-semibold mb-4">Main Menu</div>
          <nav className="flex flex-col gap-2 mb-6">
            {mainMenuItems.map((item) => {
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
          </nav>
        </div>
        <div className="flex flex-col gap-2 mt-8">
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
      </aside>
      {/* Main content (com padding para sidebar fixa) */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <header className="flex items-center justify-end bg-white h-16 px-8 border-b border-[#E3E3E3] fixed top-0 left-64 right-0 z-30">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="font-semibold text-[#7B8BB2]">{user.name}</span>
              <span className="text-xs text-gray-400">{user.email}</span>
              <span className="text-xs text-blue-600 font-bold capitalize">{planoPorRole[user.role]}</span>
            </div>
            <button className="w-10 h-10 rounded-full border border-[#E3E3E3] overflow-hidden bg-[#F3F3F3] flex items-center justify-center">
              <UserCircle size={24} className="text-[#7B8BB2]" />
            </button>
            {/* Sino de notificações */}
            <div className="relative">
              <button
                className="relative focus:outline-none hover:bg-[#e7edff] p-2 rounded-lg transition-colors"
                onClick={() => setShowNotifications((v: boolean) => !v)}
              >
                <Bell size={22} className="text-[#2563eb]" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E3E3E3] rounded-lg shadow-lg z-50 backdrop-blur-sm" style={{background: 'rgba(255,255,255,0.97)'}}>
                  <div className="p-4 border-b border-[#E3E3E3] flex justify-between items-center">
                    <span className="font-semibold text-[#2563eb]">Notificações</span>
                  </div>
                  <div className="p-4">
                    {notifications.length === 0 ? (
                      <div className="text-center text-[#7B8BB2]">Você não possui nenhuma notificação no momento</div>
                    ) : (
                      <ul className="space-y-2">
                        {notifications.map(n => (
                          <li key={n.id} className="flex items-center gap-2 border-b last:border-b-0 px-2 py-2">
                            <button className="flex-1 text-left" onClick={() => markAsRead(n.id)}>
                              <span className="font-bold text-primary">{n.text}</span>
                              {n.url && <a href={n.url} className="ml-2 text-primary underline" target="_blank" rel="noopener noreferrer">Acessar</a>}
                              <span className="block text-xs text-muted-foreground">{n.timestamp}</span>
                            </button>
                            <span className="text-xs text-primary">Nova</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 bg-white min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 