import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GameRegisterPage from "./pages/GameRegisterPage";
import { Dashboard } from './pages/Dashboard';
import Painel from './pages/Painel';
import { Home } from './pages/Home';

const App: React.FC = () => {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/game/register" element={<GameRegisterPage />} />
      </Routes>
    </Router>
  );
};

export default App;
