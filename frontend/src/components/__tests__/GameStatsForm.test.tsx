import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GameStatsForm from '../GameStatsForm';
import { api } from '../../services/api';

jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

describe('GameStatsForm', () => {
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
      numero: 15,
      posicao: 'Pivô'
    }
  ];

  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockPlayers });
    (api.post as jest.Mock).mockResolvedValue({ data: {} });
    mockOnSubmit.mockClear();
  });

  it('should render loading state initially', () => {
    render(<GameStatsForm gameId={1} onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render form after loading', async () => {
    render(<GameStatsForm gameId={1} onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Jogadora')).toBeInTheDocument();
      expect(screen.getByLabelText('Quarto')).toBeInTheDocument();
      expect(screen.getByLabelText('Pontos')).toBeInTheDocument();
      expect(screen.getByLabelText('Assistências')).toBeInTheDocument();
      expect(screen.getByLabelText('Rebotes')).toBeInTheDocument();
      expect(screen.getByLabelText('Roubos')).toBeInTheDocument();
      expect(screen.getByLabelText('Faltas')).toBeInTheDocument();
      expect(screen.getByLabelText('2PT Tentativas')).toBeInTheDocument();
      expect(screen.getByLabelText('2PT Acertos')).toBeInTheDocument();
      expect(screen.getByLabelText('3PT Tentativas')).toBeInTheDocument();
      expect(screen.getByLabelText('3PT Acertos')).toBeInTheDocument();
      expect(screen.getByLabelText('LL Tentativas')).toBeInTheDocument();
      expect(screen.getByLabelText('LL Acertos')).toBeInTheDocument();
      expect(screen.getByLabelText('Interferência')).toBeInTheDocument();
    });
  });

  it('should submit form with correct data', async () => {
    render(<GameStatsForm gameId={1} onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Jogadora')).toBeInTheDocument();
    });

    // Preencher formulário
    fireEvent.change(screen.getByLabelText('Jogadora'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Quarto'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Pontos'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Assistências'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Rebotes'), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText('Roubos'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Faltas'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('2PT Tentativas'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('2PT Acertos'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('3PT Tentativas'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('3PT Acertos'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('LL Tentativas'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('LL Acertos'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Interferência'), { target: { value: '1' } });

    // Submeter formulário
    fireEvent.click(screen.getByText('Salvar Estatísticas'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/jogos/1/stats', {
        jogadora_id: 1,
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
      });
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should handle error on submit', async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error('API Error'));
    render(<GameStatsForm gameId={1} onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Jogadora')).toBeInTheDocument();
    });

    // Preencher formulário
    fireEvent.change(screen.getByLabelText('Jogadora'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Quarto'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Pontos'), { target: { value: '10' } });

    // Submeter formulário
    fireEvent.click(screen.getByText('Salvar Estatísticas'));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('should validate 2PT acertos <= tentativas', async () => {
    render(<GameStatsForm gameId={1} onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByLabelText('2PT Tentativas')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('2PT Tentativas'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('2PT Acertos'), { target: { value: '6' } });

    expect(screen.getByLabelText('2PT Acertos')).toHaveAttribute('max', '5');
  });

  it('should validate 3PT acertos <= tentativas', async () => {
    render(<GameStatsForm gameId={1} onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByLabelText('3PT Tentativas')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('3PT Tentativas'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('3PT Acertos'), { target: { value: '4' } });

    expect(screen.getByLabelText('3PT Acertos')).toHaveAttribute('max', '3');
  });

  it('should validate LL acertos <= tentativas', async () => {
    render(<GameStatsForm gameId={1} onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByLabelText('LL Tentativas')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('LL Tentativas'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('LL Acertos'), { target: { value: '5' } });

    expect(screen.getByLabelText('LL Acertos')).toHaveAttribute('max', '4');
  });
}); 