import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RegistroEstatisticas from './components/RegistroEstatisticas';

const App: React.FC = () => {
  return (
    <Router>
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/estatisticas" element={<RegistroEstatisticas />} />
  <Route path="/" element={<Navigate to="/login" replace />} />
</Routes>
    </Router>
  );
};

export default App; 