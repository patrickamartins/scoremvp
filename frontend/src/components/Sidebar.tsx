import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Settings,
  LogOut,
  Bell,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store';

export function Sidebar() {
  const location = useLocation();
  const signOut = () => { window.location.href = '/'; };
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fixedExpanded, setFixedExpanded] = useState(true);
  const user = useAuthStore(state => state.user) || { role: 'guest' };

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
    },
    {
      path: '/usuarios',
      icon: Users,
      label: 'Usuários',
      show: user.role === 'superadmin' // Exemplo de menu exclusivo
    }
  ];

  // Mobile menu
  return (
    <>
      {/* Menu sanduíche para mobile */}
      <div className="md:hidden flex items-center p-2 bg-white border-b border-gray-200 z-50 sticky top-0">
        <button onClick={() => setMobileOpen((v) => !v)} aria-label="Abrir menu" className="p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <MenuIcon className="h-7 w-7 text-gray-700" />
        </button>
      </div>
      {/* Sidebar para desktop e mobile */}
      <div
        className={`
          fixed z-40 top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-200
          ${collapsed && !hovered && fixedExpanded ? 'w-20' : 'w-64'}
          ${!fixedExpanded && collapsed && !hovered ? 'w-20' : ''}
          ${hovered && !fixedExpanded ? 'w-64' : ''}
          hidden md:flex flex-col
        `}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ minHeight: '100vh', maxHeight: '100vh', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className={`font-bold text-lg transition-all ${collapsed && !hovered && !fixedExpanded ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Score</span>
          <button
            className="ml-auto p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expandir menu' : 'Encolher menu'}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => {
              // Superadmin vê todos os menus
              if (user.role !== 'superadmin' && !item.show) return null;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-2 py-3 text-sm font-medium rounded-md transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                    ${collapsed && !hovered && !fixedExpanded ? 'justify-center' : ''}
                  `}
                  title={item.label}
                  tabIndex={0}
                >
                  <Icon
                    className={`h-6 w-6 ${isActive(item.path)
                      ? 'text-gray-500'
                      : 'text-gray-400 group-hover:text-gray-500'} transition-all duration-200`}
                  />
                  <span className={`ml-3 transition-all duration-200 ${collapsed && !hovered && !fixedExpanded ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className={`flex-shrink-0 border-t border-gray-200 p-4 ${collapsed && !hovered && !fixedExpanded ? 'justify-center' : ''}`}>
          <button
            onClick={signOut}
            className={`group flex items-center w-full px-2 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-all duration-200
              ${collapsed && !hovered && !fixedExpanded ? 'justify-center' : ''}`}
            tabIndex={0}
          >
            <LogOut className="h-6 w-6 text-gray-400 group-hover:text-gray-500" />
            <span className={`ml-3 transition-all duration-200 ${collapsed && !hovered && !fixedExpanded ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Sair</span>
          </button>
          <div className={`mt-4 flex items-center gap-2 ${collapsed && !hovered && !fixedExpanded ? 'justify-center' : ''}`}>
            <input
              type="checkbox"
              id="fixar-menu"
              checked={fixedExpanded}
              onChange={() => setFixedExpanded((v) => !v)}
              className="mr-2"
              tabIndex={0}
            />
            <label htmlFor="fixar-menu" className={`text-xs ${collapsed && !hovered && !fixedExpanded ? 'hidden' : ''}`}>Manter expandido</label>
          </div>
        </div>
      </div>
      {/* Sidebar mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-bold text-lg">Score</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Fechar menu" className="p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1 px-2 py-4 flex-1 overflow-y-auto">
              {menuItems.map((item) => {
                if (user.role !== 'superadmin' && !item.show) return null;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-2 py-3 text-sm font-medium rounded-md ${isActive(item.path)
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    onClick={() => setMobileOpen(false)}
                    tabIndex={0}
                  >
                    <Icon className="h-6 w-6 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={signOut}
                className="group flex items-center w-full px-2 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                tabIndex={0}
              >
                <LogOut className="h-6 w-6 text-gray-400 group-hover:text-gray-500 mr-3" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 