import { Header } from './Header';
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="w-full h-full min-h-screen min-w-0 p-0 m-0">
        <Outlet />
      </main>
    </div>
  );
} 