import { Header } from './Header';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Layout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {isAuthenticated && <Header />}
      <main className="w-full h-full min-h-screen min-w-0 p-0 m-0">
        <Outlet />
      </main>
    </div>
  );
} 