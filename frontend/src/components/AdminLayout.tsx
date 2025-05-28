import { ReactNode, useState, useEffect } from 'react';
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
import { api } from '../services/api';
import { format, isSameDay, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from './ui/Button';

interface Notification {
  id: number;
  notification: {
    id: number;
    content: string;
    url?: string;
    target: 'all' | 'players' | 'mvp' | 'team';
    created_at: string;
    created_by: number;
  };
  is_read: boolean;
  created_at: string;
}

interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  extraClass?: string;
}

interface AdminLayoutProps {
  children?: ReactNode;
  user?: { name: string; avatarUrl?: string; email: string; plan?: string; role?: string };
}

export function AdminLayout({ children, user = { name: 'Admin', avatarUrl: '', email: '', plan: 'Free', role: 'admin' } }: AdminLayoutProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  // MOCK: jogos convocados do usuário
  const [invitedGames, setInvitedGames] = useState([
    { id: 1, date: new Date(), opponent: 'Time A', accepted: true },
    { id: 2, date: addDays(new Date(), 2), opponent: 'Time B', accepted: true },
    { id: 3, date: addDays(new Date(), 5), opponent: 'Time C', accepted: false },
  ]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Verifica se é admin ou plano Team
  const isAdminOrTeam = (user?.role ?? '') === 'admin' || (user?.role ?? '') === 'team';

  // Gera os dias do mês atual
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(calendarMonth),
    end: endOfMonth(calendarMonth),
  });

  // Função para renderizar o calendário
  function Calendar() {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-[#2563eb] flex items-center gap-2"><CalendarIcon size={18}/> Calendário</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setCalendarMonth(addDays(startOfMonth(calendarMonth), -1))}>{'<'}</Button>
            <span className="text-xs font-semibold">{format(calendarMonth, 'MMMM yyyy', { locale: ptBR })}</span>
            <Button variant="ghost" size="sm" onClick={() => setCalendarMonth(addDays(endOfMonth(calendarMonth), 1))}>{'>'}</Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs text-center">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <div key={i} className="font-bold text-[#7B8BB2]">{d}</div>)}
          {daysInMonth.map((day, i) => {
            const game = invitedGames.find(g => isSameDay(g.date, day) && g.accepted);
            return (
              <div key={i} className={`rounded-full w-7 h-7 flex items-center justify-center mx-auto ${game ? 'bg-blue-600 text-white font-bold cursor-pointer' : 'bg-gray-100 text-gray-500'}`}
                title={game ? `Jogo: ${game.opponent}` : ''}
              >
                {format(day, 'd')}
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-xs text-[#7B8BB2]">
          {invitedGames.filter(g => g.accepted && g.date.getMonth() === calendarMonth.getMonth()).length === 0
            ? 'Nenhum jogo convocado para este mês.'
            : 'Clique nos dias em azul para ver detalhes do jogo.'}
        </div>
      </div>
    );
  }

  const mainMenuItems: MenuItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/painel', label: 'Painel', icon: Users },
    { path: '/usuarios', label: 'Usuários', icon: Users },
    { path: '/notificacoes', label: 'Notificações', icon: Bell },
    { path: '/agenda', label: 'Agenda', icon: CalendarIcon },
    ...(isAdminOrTeam ? [{ path: '/nossos-jogos', label: 'Nossos Jogos', icon: CalendarIcon }] : []),
  ];
  const bottomMenuItems: MenuItem[] = [
    { path: '/configuracoes', label: 'Configurações', icon: Settings },
    { path: '/logout', label: 'Log Out', icon: LogOut, extraClass: 'text-red-500 hover:bg-red-50' },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      loadNotifications();
      loadUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications/me');
      setNotifications(response.data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/me/unread/count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Erro ao carregar contagem de notificações:', error);
    }
  };

  const handleReadAll = async () => {
    try {
      await Promise.all(
        notifications
          .filter(n => !n.is_read)
          .map(n => api.post(`/notifications/${n.id}/read`))
      );
      loadNotifications();
      loadUnreadCount();
      setShowNotifications(false);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const handleNotificationClick = async (notificationId: number) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="flex" style={{ fontFamily: 'Jakarta Sans, sans-serif' }}>
      {/* Sidebar Fixo */}
      <aside className="w-64 bg-white flex flex-col justify-between py-8 px-6 border-r border-[#E3E3E3] min-h-screen fixed left-0 top-0 h-full z-40">
        <div>
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
              <span className="text-xs text-blue-600 font-bold capitalize">{user.plan || 'Free'}</span>
            </div>
            <button className="w-10 h-10 rounded-full border border-[#E3E3E3] overflow-hidden bg-[#F3F3F3] flex items-center justify-center">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={24} className="text-[#7B8BB2]" />
              )}
            </button>
            {/* Sino de notificações */}
            <div className="relative">
              <button
                className="relative focus:outline-none hover:bg-[#e7edff] p-2 rounded-lg transition-colors"
                onClick={() => setShowNotifications(v => !v)}
              >
                <Bell size={22} className="text-[#2563eb]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E3E3E3] rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-[#E3E3E3] flex justify-between items-center">
                    <span className="font-semibold text-[#2563eb]">Notificações</span>
                    {notifications.length > 0 && (
                      <button
                        className="text-xs text-blue-600 hover:underline"
                        onClick={handleReadAll}
                      >
                        Ler todas
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-[#7B8BB2]">você não possui nenhuma notificação no momento</div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          className="flex items-center gap-2 px-4 py-3 border-b border-[#F3F3F3] cursor-pointer hover:bg-[#f7f8fa]"
                          onClick={() => handleNotificationClick(n.id)}
                        >
                          <span className={`w-2 h-2 rounded-full ${n.is_read ? '' : 'bg-blue-500'}`}></span>
                          <div className="flex-1">
                            <span className={`text-[#7B8BB2] ${n.is_read ? '' : 'font-semibold'}`}>
                              {n.notification.content}
                            </span>
                            {n.notification.url && (
                              <a
                                href={n.notification.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm mt-1 block"
                              >
                                {n.notification.url}
                              </a>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(n.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
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