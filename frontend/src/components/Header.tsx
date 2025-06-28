import { Link, useLocation } from 'react-router-dom';

const menu = [
  { label: 'Jogadores', to: '/players' },
  { label: 'Painel', to: '/painel' },
  { label: 'Dashboard', to: '/dashboard' },
];

export function Header() {
  const location = useLocation();
  // Simulação de dados do usuário
  const user = {
    nome: 'Admin',
    email: 'admin@email.com',
    plano: 'Free',
  };
  return (
    <header className="w-full bg-gray-900 text-white flex flex-col sm:flex-row items-center px-4 py-2 shadow-md sticky top-0 z-50 gap-2 sm:gap-0">
      <div className="font-bold text-lg tracking-wide mr-0 sm:mr-8 select-none">Score MVP</div>
      <nav className="flex gap-2 sm:gap-4 flex-1 w-full justify-center sm:justify-start flex-wrap">
        {menu.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`px-2 py-1 rounded hover:bg-gray-700 transition-colors font-semibold text-sm sm:text-base ${location.pathname === item.to ? 'bg-gray-800' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {/* Usuário */}
      <div className="flex flex-col items-end ml-0 sm:ml-auto w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base sm:text-lg">{user.nome}</span>
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded ml-1 whitespace-nowrap">{user.plano}</span>
        </div>
        <span className="text-xs text-gray-300 mt-0.5 break-all">{user.email}</span>
      </div>
    </header>
  );
} 