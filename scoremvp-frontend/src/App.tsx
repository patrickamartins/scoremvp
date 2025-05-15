import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RegistroEstatisticas from './components/RegistroEstatisticas';

const App: React.FC = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/registro" element={<RegistroEstatisticas />} />
    <Route path="*" element={<Navigate to="/login" />} />
  </Routes>
);

export default App;
