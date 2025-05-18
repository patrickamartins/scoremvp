// src/main.tsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './index.css';

import Login from './components/Login';
import Players from './components/Players';
import Games from './components/Games';
import PublicPanel from './components/PublicPanel';
import GamePanel from './components/GamePanel';
import { setAuthToken } from './services/api';
import Header from './components/Header';
import { Dashboard } from './pages/Dashboard';

function App() {
  // 1) Estado para guardar o token
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );

  // 2) Sempre que mudar o token, atualiza o axios e o localStorage
  useEffect(() => {
    if (token) {
      setAuthToken(token);
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  return (
    <BrowserRouter>
      {/* Header só aparece se estiver autenticado */}
      {token && <Header />}
      <Routes>
        <Route
          path="/login"
          element={
            token ? <Navigate to="/players" replace /> : <Login onLogin={setToken} />
          }
        />
        <Route
          path="/players"
          element={token ? <Players /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/games"
          element={token ? <Games /> : <Navigate to="/login" replace />}
        />
        <Route path="/public/:gameId" element={<PublicPanel />} />
        <Route
          path="/painel"
          element={token ? <GamePanel /> : <Navigate to="/login" replace />}
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
