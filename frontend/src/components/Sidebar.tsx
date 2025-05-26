import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Users,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const { signOut, isAdmin } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      path: '/',
      icon: Home,
      label: 'Início',
      show: true
    },
    {
      path: '/users',
      icon: Users,
      label: 'Usuários',
      show: isAdmin
    },
    {
      path: '/notifications',
      icon: Bell,
      label: 'Notificações',
      show: true
    },
    {
      path: '/profile',
      icon: Settings,
      label: 'Configurações',
      show: true
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            if (!item.show) return null;
            
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.path)
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 ${
                    isActive(item.path)
                      ? 'text-gray-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <button
          onClick={signOut}
          className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
          Sair
        </button>
      </div>
    </div>
  );
} 