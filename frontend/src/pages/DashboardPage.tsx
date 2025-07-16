import React, { useState } from "react";
import '../components/ui';
import { Card } from '../components/ui';
import { usePageTitle } from "../hooks/usePageTitle";
import { getGames, deleteGame } from '../services/api';
import { Button } from '../components/ui/Button';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const mockComparativo = [
  { name: 'Jogo 1', Morena: 10, Maria: 8, Marina: 7 },
  { name: 'Jogo 2', Morena: 12, Maria: 9, Marina: 8 },
  { name: 'Jogo 3', Morena: 15, Maria: 11, Marina: 10 },
];

const mockEvolucao = [
  { data: '01/01', pontos: 8, media: 7.5, tendencia: 'ascendente' },
  { data: '08/01', pontos: 9, media: 7.8, tendencia: 'ascendente' },
  { data: '15/01', pontos: 11, media: 8.2, tendencia: 'ascendente' },
  { data: '22/01', pontos: 10, media: 8.0, tendencia: 'estavel' },
  { data: '29/01', pontos: 12, media: 8.3, tendencia: 'ascendente' },
  { data: '05/02', pontos: 14, media: 8.7, tendencia: 'ascendente' },
  { data: '12/02', pontos: 13, media: 8.5, tendencia: 'estavel' },
  { data: '19/02', pontos: 15, media: 8.9, tendencia: 'ascendente' },
  { data: '26/02', pontos: 16, media: 9.1, tendencia: 'ascendente' },
  { data: '05/03', pontos: 18, media: 9.4, tendencia: 'ascendente' },
  { data: '12/03', pontos: 17, media: 9.2, tendencia: 'estavel' },
  { data: '19/03', pontos: 19, media: 9.6, tendencia: 'ascendente' },
  { data: '26/03', pontos: 20, media: 9.8, tendencia: 'ascendente' },
];

const exportOptions = [
  { key: 'resumo', label: 'Resumo do jogo' },
  { key: 'q1', label: '1º quarto (boxscore)' },
  { key: 'q2', label: '2º quarto (boxscore)' },
  { key: 'q3', label: '3º quarto (boxscore)' },
  { key: 'q4', label: '4º quarto (boxscore)' },
  { key: 'highlights', label: 'Highlights Cards' },
  { key: 'comparativo', label: 'Gráfico comparativo' },
  { key: 'evolutivo', label: 'Gráfico evolutivo' },
];

const DashboardPage: React.FC = () => {
  usePageTitle("Dashboard");
  const [tab, setTab] = useState<'comparativo' | 'evolucao'>('comparativo');
  const [deleting, setDeleting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExport, setSelectedExport] = useState<string[]>(['resumo']);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Deletar todos os jogos cadastrados
  const handleDeleteAllGames = async () => {
    if (!window.confirm('Tem certeza que deseja deletar TODOS os jogos cadastrados? Essa ação não pode ser desfeita.')) return;
    setDeleting(true);
    try {
      const games = await getGames();
      for (const game of games) {
        await deleteGame(game.id);
      }
      alert('Todos os jogos foram deletados!');
    } catch (err) {
      alert('Erro ao deletar jogos.');
    } finally {
      setDeleting(false);
    }
  };

  // Handler para exportação (mock)
  const handleExportPDF = async () => {
    setShowExportModal(false);
    alert('Exportação em PDF mockada! Seções selecionadas: ' + selectedExport.join(', '));
    // Aqui virá a lógica real de exportação usando jsPDF/html2canvas
  };

  const handleToggleExport = (key: string) => {
    setSelectedExport(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Custom tooltip para o gráfico evolutivo
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`Data: ${label}`}</p>
          <p className="text-blue-600">{`Pontos: ${data.pontos}`}</p>
          <p className="text-green-600">{`Média: ${data.media}`}</p>
          <p className="text-gray-600">{`Tendência: ${data.tendencia}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <Card className="flex-1 flex flex-col items-center justify-center">
          <div className="text-lg font-semibold mb-2">EXP Evolution</div>
          {/* Gráfico de linha fake */}
          <div className="w-full h-32 bg-powderblue rounded-lg flex items-center justify-center text-eerieblack/40">[Line Chart]</div>
        </Card>
        <Card className="w-64 flex flex-col items-center justify-center">
          <div className="text-lg font-semibold mb-2">Profile</div>
          <div className="w-16 h-16 rounded-full bg-powderblue mb-2" />
          <div className="font-bold">Usuário</div>
          <div className="text-xs text-eerieblack/60 mb-2">user@email.com</div>
          <button className="text-persimoon text-xs hover:underline">Edit Profile</button>
        </Card>
      </div>

      {/* Botão Exportar PDF */}
      <div className="mb-4 flex items-center gap-4">
        <Button onClick={() => setShowExportModal(true)} className="bg-blue-700 text-white">
          Exportar PDF
        </Button>
        <Button onClick={handleDeleteAllGames} disabled={deleting} className="bg-red-600 text-white">
          {deleting ? 'Deletando...' : 'Deletar TODOS os jogos cadastrados'}
        </Button>
      </div>

      {/* Modal de seleção de exportação */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowExportModal(false)} />
          <div className="relative z-10 w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-center">Exportar PDF - Selecione o que deseja exportar</h2>
            <form className="space-y-2 mb-6">
              {exportOptions.map(opt => (
                <label key={opt.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedExport.includes(opt.key)}
                    onChange={() => handleToggleExport(opt.key)}
                  />
                  {opt.label}
                </label>
              ))}
            </form>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExportModal(false)}>Cancelar</Button>
              <Button onClick={handleExportPDF} className="bg-blue-700 text-white">Exportar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs para gráficos */}
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded-t ${tab === 'comparativo' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setTab('comparativo')}
          >
            Comparação
          </button>
          <button
            className={`px-4 py-2 rounded-t ${tab === 'evolucao' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setTab('evolucao')}
          >
            Evolução
          </button>
        </div>
        <div className="bg-white rounded-b shadow p-4">
          {tab === 'comparativo' ? (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">Comparação de Performance entre Jogadoras</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockComparativo}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Morena" stroke="#2563eb" strokeWidth={2} />
                  <Line type="monotone" dataKey="Maria" stroke="#f59e42" strokeWidth={2} />
                  <Line type="monotone" dataKey="Marina" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">Evolução da Performance ao Longo do Tempo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockEvolucao}>
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="pontos" 
                    stroke="#2563eb" 
                    fill="#2563eb" 
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="media" 
                    stroke="#f59e42" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center text-sm text-gray-600">
                <p><strong>Linha azul:</strong> Pontos por jogo</p>
                <p><strong>Linha laranja tracejada:</strong> Média móvel</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restante do dashboard (sem filtros por jogadora/categoria) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="font-semibold mb-2">Minhas Notas</div>
          {/* Gráfico de barras fake */}
          <div className="w-full h-24 bg-lion rounded-lg flex items-center justify-center text-eerieblack/40">[Bar Chart]</div>
        </Card>
        <Card>
          <div className="font-semibold mb-2">Conquistas</div>
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-full bg-persimoon" />
            <div className="w-10 h-10 rounded-full bg-powderblue" />
            <div className="w-10 h-10 rounded-full bg-lion" />
          </div>
        </Card>
        <Card>
          <div className="font-semibold mb-2">Média Geral</div>
          <div className="text-3xl font-bold text-persimoon">7.5</div>
          <div className="text-xs text-eerieblack/60">+30% desde o mês passado</div>
        </Card>
      </div>
      <div className="bg-alabaster rounded-xl shadow p-4 mt-8">
        <div className="font-semibold mb-2">Médias e Notas</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-eerieblack/70">
                <th className="px-2 py-1 text-left">Certificação</th>
                <th className="px-2 py-1 text-left">Nota média</th>
                <th className="px-2 py-1 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 py-1">Web design</td>
                <td className="px-2 py-1">7.4</td>
                <td className="px-2 py-1">Cursando</td>
              </tr>
              <tr>
                <td className="px-2 py-1">Front-end básico 1</td>
                <td className="px-2 py-1">7.2</td>
                <td className="px-2 py-1">Cursando</td>
              </tr>
              <tr>
                <td className="px-2 py-1">Front-end básico 2</td>
                <td className="px-2 py-1">7.6</td>
                <td className="px-2 py-1 text-lion">Não iniciada</td>
              </tr>
              <tr>
                <td className="px-2 py-1">Wordpress e componentes</td>
                <td className="px-2 py-1">8.2</td>
                <td className="px-2 py-1 text-lion">Não iniciada</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 