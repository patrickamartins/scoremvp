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

import LoginPage from './pages/LoginPage';
import PlayersPage from './pages/PlayersPage';
import Games from './components/Games';
import PublicPanel from './components/PublicPanel';
import { setAuthToken } from './services/api';
import Header from './components/Header';
import { Dashboard } from './pages/Dashboard';
import Painel from './pages/Painel';

declare global {
  interface Window {
    gtmInjected?: boolean;
  }
}

if (typeof window !== "undefined" && !window.gtmInjected) {
  window.gtmInjected = true;
  const script = document.createElement("script");
  script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-M4FG7VQJ');`;
  document.head.appendChild(script);
}

function App() {
  // 1) Estado para guardar o token
  const [token] = useState<string | null>(
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
          path="/"
          element={
            token ? <Navigate to="/players" replace /> : <LoginPage />
          }
        />
        <Route
          path="/login"
          element={
            token ? <Navigate to="/players" replace /> : <LoginPage />
          }
        />
        <Route
          path="/players"
          element={token ? <PlayersPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/games"
          element={token ? <Games /> : <Navigate to="/login" replace />}
        />
        <Route path="/public/:gameId" element={<PublicPanel />} />
        <Route
          path="/painel"
          element={token ? <Painel /> : <Navigate to="/login" replace />}
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
