import React from 'react';
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Dashboard from '../pages/Dashboard'
import Painel from '../pages/Painel'
import { NotFound } from '../pages/NotFound'
import { BaseLayout } from '../components/BaseLayout'
import UsuariosPage from '../pages/Usuarios'
import NotificacoesPage from '../pages/Notificacoes'
import Profile from '../pages/Profile'
import PerfilPage from '../pages/PerfilPage'
import AgendaPage from '../pages/Agenda'
import { PrivateRoute } from '../components/PrivateRoute'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import Unauthorized from '../pages/Unauthorized'
import SubscriptionPage from '../pages/SubscriptionPage'
import PublicGameView from '../pages/PublicGameView'
import GerenciarEmails from '../pages/GerenciarEmails'
import LogoutPage from '../pages/LogoutPage'
import ChoosePlanPage from '../pages/ChoosePlanPage'
import PlayersPage from '../pages/PlayersPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/plan" element={<ChoosePlanPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<Home />} />
      <Route path="/public/game/:link" element={<PublicGameView />} />
      <Route element={<PrivateRoute />}>
        <Route element={<BaseLayout />}>
          <Route path="/painel" element={<Painel />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/notificacoes" element={<NotificacoesPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/configuracoes" element={<Profile />} />
          <Route path="/configuracoes/emails" element={<GerenciarEmails />} />
          <Route path="/assinaturas" element={<SubscriptionPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/jogadores" element={<PlayersPage />} />
                <Route path="/jogadores" element={<PlayersPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
} 