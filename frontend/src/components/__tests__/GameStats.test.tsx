import { render, screen, waitFor } from '@testing-library/react';
import GameStats from '../GameStats';
import { api } from '../../services/api';

jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn()
  }
}));

describe('GameStats', () => {
  const mockStats = {
    total_pontos: 80,
    total_assistencias: 20,
    total_rebotes: 30,
    total_roubos: 10,
    total_faltas: 15,
    por_quarto: [
      {
        quarto: 1,
        total_pontos: 20,
        total_assistencias: 5,
        total_rebotes: 8,
        total_roubos: 2,
        total_faltas: 4
      },
      {
        quarto: 2,
        total_pontos: 18,
        total_assistencias: 4,
        total_rebotes: 7,
        total_roubos: 3,
        total_faltas: 3
      }
    ]
  };

  beforeEach(() => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockStats });
  });

  it('should render loading state initially', () => {
    render(<GameStats gameId={1} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render game stats after loading', async () => {
    render(<GameStats gameId={1} />);

    await waitFor(() => {
      expect(screen.getByText('80')).toBeInTheDocument(); // Total pontos
      expect(screen.getByText('20')).toBeInTheDocument(); // Total assistências
      expect(screen.getByText('30')).toBeInTheDocument(); // Total rebotes
      expect(screen.getByText('10')).toBeInTheDocument(); // Total roubos
      expect(screen.getByText('15')).toBeInTheDocument(); // Total faltas
    });

    // Verificar estatísticas por quarto
    expect(screen.getByText('1º')).toBeInTheDocument();
    expect(screen.getByText('2º')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument(); // Pontos 1º quarto
    expect(screen.getByText('18')).toBeInTheDocument(); // Pontos 2º quarto
  });

  it('should handle error state', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('API Error'));
    render(<GameStats gameId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Estatísticas não encontradas')).toBeInTheDocument();
    });
  });
}); 