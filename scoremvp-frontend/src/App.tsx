// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RegistroEstatisticas from './components/RegistroEstatisticas';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={token ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/registro"
        element={token ? <RegistroEstatisticas /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
