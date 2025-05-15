import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RegistroEstatisticas from './components/RegistroEstatisticas';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/register" element={<RegistroEstatisticas />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
