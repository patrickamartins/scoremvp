import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Card } from "./ui/Card";
import { toast } from 'sonner';

interface Player {
  id: number;
  nome: string;
  numero: number;
  posicao: string;
}

interface GameStatsFormProps {
  gameId: number;
  onSubmit: () => void;
}

export default function GameStatsForm({ gameId, onSubmit }: GameStatsFormProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [quarto, setQuarto] = useState<number>(1);
  const [pontos, setPontos] = useState<number>(0);
  const [assistencias, setAssistencias] = useState<number>(0);
  const [rebotes, setRebotes] = useState<number>(0);
  const [roubos, setRoubos] = useState<number>(0);
  const [faltas, setFaltas] = useState<number>(0);
  const [doisTentativas, setDoisTentativas] = useState<number>(0);
  const [doisAcertos, setDoisAcertos] = useState<number>(0);
  const [tresTentativas, setTresTentativas] = useState<number>(0);
  const [tresAcertos, setTresAcertos] = useState<number>(0);
  const [lanceTentativas, setLanceTentativas] = useState<number>(0);
  const [lanceAcertos, setLanceAcertos] = useState<number>(0);
  const [interferencia, setInterferencia] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const playerSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    api.get('/jogadoras').then(({ data }) => {
      setPlayers(data);
    });
  }, []);

  useEffect(() => {
    if (playerSelectRef.current) {
      playerSelectRef.current.focus();
    }
  }, [players]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!selectedPlayer) {
      setFormError('Selecione uma jogadora.');
      return;
    }
    setSaving(true);
    try {
      await api.post(`/jogos/${gameId}/stats`, {
        jogadora_id: selectedPlayer,
        quarto,
        pontos,
        assistencias,
        rebotes,
        roubos,
        faltas,
        dois_tentativas: doisTentativas,
        dois_acertos: doisAcertos,
        tres_tentativas: tresTentativas,
        tres_acertos: tresAcertos,
        lance_tentativas: lanceTentativas,
        lance_acertos: lanceAcertos,
        interferencia
      });
      // Limpar formulário
      setSelectedPlayer(null);
      setQuarto(1);
      setPontos(0);
      setAssistencias(0);
      setRebotes(0);
      setRoubos(0);
      setFaltas(0);
      setDoisTentativas(0);
      setDoisAcertos(0);
      setTresTentativas(0);
      setTresAcertos(0);
      setLanceTentativas(0);
      setLanceAcertos(0);
      setInterferencia(0);
      toast.success('Estatísticas salvas com sucesso!');
      onSubmit();
    } catch (error) {
      setFormError('Erro ao salvar estatísticas. Tente novamente.');
      toast.error('Erro ao salvar estatísticas.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <Card title="Adicionar Estatísticas">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Jogadora</label>
              <select
                ref={playerSelectRef}
                value={selectedPlayer || ""}
                onChange={(e) => setSelectedPlayer(Number(e.target.value))}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                tabIndex={0}
                disabled={saving}
                autoFocus
              >
                <option value="">Selecione uma jogadora</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.numero} - {player.nome} ({player.posicao})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quarto</label>
              <select
                value={quarto}
                onChange={(e) => setQuarto(Number(e.target.value))}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                tabIndex={0}
                disabled={saving}
              >
                <option value={1}>1º Quarto</option>
                <option value={2}>2º Quarto</option>
                <option value={3}>3º Quarto</option>
                <option value={4}>4º Quarto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pontos</label>
              <input
                type="number"
                min="0"
                value={pontos}
                onChange={(e) => setPontos(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                tabIndex={0}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assistências</label>
              <input
                type="number"
                min="0"
                value={assistencias}
                onChange={(e) => setAssistencias(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                tabIndex={0}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rebotes</label>
              <input
                type="number"
                min="0"
                value={rebotes}
                onChange={(e) => setRebotes(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                tabIndex={0}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Roubos</label>
              <input
                type="number"
                min="0"
                value={roubos}
                onChange={(e) => setRoubos(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                tabIndex={0}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Faltas</label>
              <input
                type="number"
                min="0"
                value={faltas}
                onChange={(e) => setFaltas(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                tabIndex={0}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">2PT Tentativas</label>
              <input
                type="number"
                min="0"
                value={doisTentativas}
                onChange={(e) => setDoisTentativas(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                tabIndex={0}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">2PT Acertos</label>
              <input
                type="number"
                min="0"
                max={doisTentativas}
                value={doisAcertos}
                onChange={(e) => setDoisAcertos(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                tabIndex={0}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">3PT Tentativas</label>
              <input
                type="number"
                min="0"
                value={tresTentativas}
                onChange={(e) => setTresTentativas(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                tabIndex={0}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">3PT Acertos</label>
              <input
                type="number"
                min="0"
                max={tresTentativas}
                value={tresAcertos}
                onChange={(e) => setTresAcertos(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                tabIndex={0}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">LL Tentativas</label>
              <input
                type="number"
                min="0"
                value={lanceTentativas}
                onChange={(e) => setLanceTentativas(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                tabIndex={0}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">LL Acertos</label>
              <input
                type="number"
                min="0"
                max={lanceTentativas}
                value={lanceAcertos}
                onChange={(e) => setLanceAcertos(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                tabIndex={0}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Interferência</label>
              <input
                type="number"
                min="0"
                value={interferencia}
                onChange={(e) => setInterferencia(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                tabIndex={0}
                disabled={saving}
              />
            </div>
          </div>
          {formError && <div className="text-red-500 text-sm">{formError}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold mt-2 flex items-center justify-center disabled:opacity-50"
            disabled={saving}
            tabIndex={0}
          >
            {saving ? <span className="loader mr-2"></span> : null}
            {saving ? 'Salvando...' : 'Salvar Estatísticas'}
          </button>
        </form>
      </Card>
    </div>
  );
}

// Loader CSS
// .loader { border: 2px solid #f3f3f3; border-top: 2px solid #2563eb; border-radius: 50%; width: 18px; height: 18px; animation: spin 1s linear infinite; }
// @keyframes spin { 100% { transform: rotate(360deg); } } 