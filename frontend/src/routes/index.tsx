import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Dashboard from '../pages/Dashboard'
import Painel from '../pages/Painel'
import { NotFound } from '../pages/NotFound'
import { AdminLayout } from '../components/AdminLayout'
import UsuariosPage from '../pages/Usuarios'
import NotificacoesPage from '../pages/Notificacoes'
import Profile from '../pages/Profile'
import AgendaPage from '../pages/Agenda'
import { PrivateRoute } from '../components/PrivateRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<PrivateRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/painel" element={<Painel />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/notificacoes" element={<NotificacoesPage />} />
          <Route path="/configuracoes" element={<Profile />} />
          <Route path="/agenda" element={<AgendaPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
} 