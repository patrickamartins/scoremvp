import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import PlayersPage from "../pages/PlayersPage";
import Painel from "../pages/Painel";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import Home from "../pages/Home";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/players" element={<PlayersPage />} />
      <Route path="/painel" element={<Painel />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<LoginPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes; 