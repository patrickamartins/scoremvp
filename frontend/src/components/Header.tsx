import { Link, useLocation } from 'react-router-dom';

const menu = [
  { label: 'Jogadores', to: '/players' },
  { label: 'Painel', to: '/painel' },
  { label: 'Dashboard', to: '/dashboard' },
];

export function Header() {
  const location = useLocation();
  return (
    <header className="w-full bg-gray-900 text-white flex items-center px-4 py-2 shadow-md sticky top-0 z-50">
      <div className="font-bold text-lg tracking-wide mr-8 select-none">Score MVP</div>
      <nav className="flex gap-4 flex-1">
        {menu.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`px-2 py-1 rounded hover:bg-gray-700 transition-colors font-semibold ${location.pathname === item.to ? 'bg-gray-800' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
} 