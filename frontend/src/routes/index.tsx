import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import LoginPage from '../pages/LoginPage'
import Dashboard from '../pages/Dashboard'
import PlayersPage from '../pages/PlayersPage'
import Painel from '../pages/Painel'
import { NotFound } from '../pages/NotFound'
import { AdminLayout } from '../components/AdminLayout'
import UsuariosPage from '../pages/Usuarios'
import NotificacoesPage from '../pages/Notificacoes'
import Profile from '../pages/Profile'
import AgendaPage from '../pages/Agenda'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AdminLayout />}>
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
        <Route path="/notificacoes" element={<NotificacoesPage />} />
        <Route path="/configuracoes" element={<Profile />} />
        <Route path="/agenda" element={<AgendaPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
} 