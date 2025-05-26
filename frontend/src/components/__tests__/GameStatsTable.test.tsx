import { render, screen, waitFor } from '@testing-library/react';
import GameStatsTable from '../GameStatsTable';
import { api } from '../../services/api';

jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn()
  }
}));

describe('GameStatsTable', () => {
  const mockPlayers = [
    {
      id: 1,
      nome: 'Jogadora 1',
      numero: 10,
      posicao: 'Ala'
    },
    {
      id: 2,
      nome: 'Jogadora 2',
      numero: 11,
      posicao: 'Pivô'
    }
  ];

  const mockStats = [
    {
      id: 1,
      jogadora_id: 1,
      jogo_id: 1,
      quarto: 1,
      pontos: 10,
      assistencias: 5,
      rebotes: 8,
      roubos: 2,
      faltas: 3,
      dois_tentativas: 5,
      dois_acertos: 3,
      tres_tentativas: 2,
      tres_acertos: 1,
      lance_tentativas: 3,
      lance_acertos: 2,
      interferencia: 1
    },
    {
      id: 2,
      jogadora_id: 2,
      jogo_id: 1,
      quarto: 1,
      pontos: 8,
      assistencias: 3,
      rebotes: 6,
      roubos: 1,
      faltas: 2,
      dois_tentativas: 4,
      dois_acertos: 2,
      tres_tentativas: 1,
      tres_acertos: 0,
      lance_tentativas: 2,
      lance_acertos: 1,
      interferencia: 0
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    render(<GameStatsTable gameId={1} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render player stats table when data is loaded', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce({ data: mockPlayers })
      .mockResolvedValueOnce({ data: mockStats });

    render(<GameStatsTable gameId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Estatísticas por Jogadora')).toBeInTheDocument();
      expect(screen.getByText('Jogadora 1')).toBeInTheDocument();
      expect(screen.getByText('Jogadora 2')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // pontos da jogadora 1
      expect(screen.getByText('8')).toBeInTheDocument(); // pontos da jogadora 2
    });

    expect(api.get).toHaveBeenCalledWith('/jogadoras');
    expect(api.get).toHaveBeenCalledWith('/jogos/1/stats/jogadoras');
  });

  it('should render error state when API call fails', async () => {
    const error = new Error('Network error');
    (api.get as jest.Mock).mockRejectedValue(error);

    render(<GameStatsTable gameId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Erro')).toBeInTheDocument();
      expect(screen.getByText('Estatísticas não encontradas')).toBeInTheDocument();
    });
  });

  it('should display correct stats for each player', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce({ data: mockPlayers })
      .mockResolvedValueOnce({ data: mockStats });

    render(<GameStatsTable gameId={1} />);

    await waitFor(() => {
      // Verificar estatísticas da Jogadora 1
      expect(screen.getByText('3/5')).toBeInTheDocument(); // 2PT
      expect(screen.getByText('1/2')).toBeInTheDocument(); // 3PT
      expect(screen.getByText('2/3')).toBeInTheDocument(); // LL
      expect(screen.getByText('5')).toBeInTheDocument(); // AST
      expect(screen.getByText('8')).toBeInTheDocument(); // REB
      expect(screen.getByText('2')).toBeInTheDocument(); // ROUB
      expect(screen.getByText('3')).toBeInTheDocument(); // FAL
      expect(screen.getByText('1')).toBeInTheDocument(); // INT
    });
  });

  it('should handle empty stats data', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce({ data: mockPlayers })
      .mockResolvedValueOnce({ data: [] });

    render(<GameStatsTable gameId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Jogadora 1')).toBeInTheDocument();
      expect(screen.getByText('Jogadora 2')).toBeInTheDocument();
      expect(screen.getAllByText('0')).toHaveLength(14); // Verificar se todos os zeros são exibidos
    });
  });

  it('should handle missing player stats', async () => {
    const incompleteStats = [mockStats[0]]; // Apenas stats da primeira jogadora
    (api.get as jest.Mock)
      .mockResolvedValueOnce({ data: mockPlayers })
      .mockResolvedValueOnce({ data: incompleteStats });

    render(<GameStatsTable gameId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Jogadora 1')).toBeInTheDocument();
      expect(screen.getByText('Jogadora 2')).toBeInTheDocument();
      expect(screen.getAllByText('0')).toHaveLength(7); // Verificar zeros para a jogadora sem stats
    });
  });
}); 