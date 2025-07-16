import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function AuthDebug() {
  const [authStatus, setAuthStatus] = useState<string>('Verificando...');
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    
    if (!storedToken) {
      setAuthStatus('❌ Nenhum token encontrado - Usuário não logado');
      return;
    }

    setAuthStatus('🔍 Token encontrado - Verificando validade...');
    
    // Testar se o token é válido
    api.get('/auth/me')
      .then(response => {
        setUserInfo(response.data);
        setAuthStatus('✅ Usuário autenticado e token válido');
      })
      .catch(error => {
        console.error('Erro ao verificar token:', error);
        if (error.response?.status === 401) {
          setAuthStatus('❌ Token inválido ou expirado');
          localStorage.removeItem('token');
        } else {
          setAuthStatus('❌ Erro ao verificar token');
        }
      });
  };

  const handleLogin = async () => {
    try {
      const form = new URLSearchParams();
      form.append('username', 'admin@scoremvp.com.br');
      form.append('password', 'admin123');
      
      const response = await api.post('/auth/login', form, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        setAuthStatus('✅ Login realizado com sucesso!');
        checkAuthStatus();
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setAuthStatus('❌ Erro no login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserInfo(null);
    setAuthStatus('✅ Logout realizado');
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '15px', 
      border: '1px solid #ccc', 
      borderRadius: '5px',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <h4>🔍 Debug de Autenticação</h4>
      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong> {authStatus}
      </div>
      
      {token && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Token:</strong> {token.substring(0, 20)}...
        </div>
      )}
      
      {userInfo && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Usuário:</strong> {userInfo.name} ({userInfo.email})
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '5px' }}>
        <button 
          onClick={handleLogin}
          style={{ padding: '5px 10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '3px' }}
        >
          Login
        </button>
        <button 
          onClick={handleLogout}
          style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px' }}
        >
          Logout
        </button>
        <button 
          onClick={checkAuthStatus}
          style={{ padding: '5px 10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '3px' }}
        >
          Verificar
        </button>
      </div>
    </div>
  );
} 