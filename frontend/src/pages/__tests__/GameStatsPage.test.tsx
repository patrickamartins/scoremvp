import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GameStatsPage from '../GameStatsPage';
import { api } from '../../services/api';

jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn()
  }
}));

describe('GameStatsPage', () => {
  const mockGame = {
    id: 1,
    data: '2024-03-20T19:00:00.000Z',
    adversario: 'Time A',
    local: 'Ginásio Municipal',
    placar_casa: 80,
    placar_visitante: 75
  };

  beforeEach(() => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockGame });
  });

  it('should render loading state initially', () => {
    render(
      <MemoryRouter initialEntries={['/jogos/1/stats']}>
        <Routes>
          <Route path="/jogos/:id/stats" element={<GameStatsPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render game info after loading', async () => {
    render(
      <MemoryRouter initialEntries={['/jogos/1/stats']}>
        <Routes>
          <Route path="/jogos/:id/stats" element={<GameStatsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Time A vs Casa')).toBeInTheDocument();
      expect(screen.getByText('20/03/2024 - Ginásio Municipal')).toBeInTheDocument();
      expect(screen.getByText('80 x 75')).toBeInTheDocument();
    });
  });

  it('should handle error state', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('API Error'));
    render(
      <MemoryRouter initialEntries={['/jogos/1/stats']}>
        <Routes>
          <Route path="/jogos/:id/stats" element={<GameStatsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Jogo não encontrado')).toBeInTheDocument();
    });
  });

  it('should render game stats components', async () => {
    render(
      <MemoryRouter initialEntries={['/jogos/1/stats']}>
        <Routes>
          <Route path="/jogos/:id/stats" element={<GameStatsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Estatísticas do Jogo')).toBeInTheDocument();
      expect(screen.getByText('Estatísticas por Jogadora')).toBeInTheDocument();
      expect(screen.getByText('Adicionar Estatísticas')).toBeInTheDocument();
    });
  });
}); 