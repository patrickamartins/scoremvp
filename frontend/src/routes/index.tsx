import { createBrowserRouter } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { AdminRoute } from './AdminRoute';
import { Layout } from '../components/Layout';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { ForgotPassword } from '../pages/ForgotPassword';
import { ResetPassword } from '../pages/ResetPassword';
import { Profile } from '../pages/Profile';
import { Users } from '../pages/Users';
import { NotFound } from '../pages/NotFound';
import Dashboard from '../pages/Dashboard';
import Painel from '../pages/Painel';
import { Players } from '../pages/Players';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />
      },
      {
        path: 'reset-password',
        element: <ResetPassword />
      },
      {
        path: 'profile',
        element: <PrivateRoute><Profile /></PrivateRoute>
      },
      {
        path: 'users',
        element: <PrivateRoute><AdminRoute><Users /></AdminRoute></PrivateRoute>
      },
      {
        path: 'dashboard',
        element: <PrivateRoute><Dashboard /></PrivateRoute>
      },
      {
        path: 'painel',
        element: <PrivateRoute><Painel /></PrivateRoute>
      },
      {
        path: 'players',
        element: <PrivateRoute><Players /></PrivateRoute>
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]); 