// src/components/RegistroEstatisticas.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const RegistroEstatisticas: React.FC = () => {
  const navigate = useNavigate();
  const [campo1, setCampo1] = useState('');       // exemplo de campo
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await API.post(
        '/estatistica',
        {
          id_jogadora: 1,       // ajuste para o seu ID de jogadora
          id_jogo:    1,       // ajuste para o seu ID de jogo
          tipo:       campo1
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setSuccess('Estatística registrada com sucesso!');
    } catch {
      setError('Erro ao registrar estatística.');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <nav style={{ marginBottom: '1rem' }}>
        {/* Sua barra de navegação existente */}
      </nav>

      {/* BOTÃO IR PARA DASHBOARD */}
      <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary"
        >
          Ir para Dashboard
        </button>
      </div>

      <h2>Registro de Estatísticas</h2>
      {error   && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Campo 1:</label>
          <input
            type="text"
            value={campo1}
            onChange={e => setCampo1(e.target.value)}
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-success">
          Salvar Estatísticas
        </button>
      </form>
    </div>
  );
};

export default RegistroEstatisticas;
