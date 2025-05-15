// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RegistroEstatisticas from './components/RegistroEstatisticas';

const App: React.FC = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/register" element={<RegistroEstatisticas />} />
    {/* redireciona tudo para /login */}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default App;
