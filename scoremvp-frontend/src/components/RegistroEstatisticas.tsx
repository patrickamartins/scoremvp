import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegistroEstatisticas: React.FC = () => {
  const navigate = useNavigate();
  const [campo1, setCampo1] = useState<string>('');
  // … outros estados de campos …

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // lógica de envio das estatísticas…
  };

  return (
    <div style={{ padding: '1rem' }}>
      <nav style={{ marginBottom: '1rem' }}>
        {/* Sua barra de navegação existente */}
      </nav>

      {/* BOTÃO IR PARA DASHBOARD sempre visível */}
      <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary"
        >
          Ir para Dashboard
        </button>
      </div>

      <h2>Registro de Estatísticas</h2>
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
        {/* … demais campos … */}
        <button type="submit" className="btn btn-success">
          Salvar Estatísticas
        </button>
      </form>
    </div>
  );
};

export default RegistroEstatisticas;
