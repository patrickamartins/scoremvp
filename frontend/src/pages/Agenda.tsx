import { useState } from 'react';
import { format, isSameDay, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

// Mock de convocações do usuário
const mockConvocacoes = [
  { id: 1, date: new Date(), status: 'pending', opponent: 'Time A', team: 'Time X', hour: '19:00', extra: 'Chegar 30min antes', by: 'Treinador João' },
  { id: 2, date: addDays(new Date(), 2), status: 'accepted', opponent: 'Time B', team: 'Time X', hour: '20:00', extra: '', by: 'Treinador João' },
  { id: 3, date: addDays(new Date(), 5), status: 'rejected', opponent: 'Time C', team: 'Time X', hour: '18:00', extra: 'Levar uniforme branco', by: 'Treinador João' },
];

export default function AgendaPage() {
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedConvoc, setSelectedConvoc] = useState<any | null>(null);
  const [convocacoes, setConvocacoes] = useState(mockConvocacoes);

  // Função para gerar dias do mês
  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = [];
    let current = start;
    while (current <= end) {
      days.push(current);
      current = addDays(current, 1);
    }
    return days;
  };

  const daysInMonth = getDaysInMonth(calendarMonth);

  function getConvocacaoByDay(day: Date) {
    return convocacoes.find(c => isSameDay(c.date, day));
  }

  function handleStatus(id: number, status: 'accepted' | 'rejected') {
    setConvocacoes(convocacoes.map(c => c.id === id ? { ...c, status } : c));
    setSelectedConvoc(null);
  }

  return (
    <div className="max-w-2xl mx-auto p-8 mt-16">
      <h1 className="text-2xl font-bold mb-6 text-[#2563eb]">Agenda</h1>
      <Card className="p-4 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-[#2563eb] text-lg">{format(calendarMonth, 'MMMM yyyy')}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setCalendarMonth(addDays(startOfMonth(calendarMonth), -1))}>{'<'}</Button>
            <Button variant="ghost" size="sm" onClick={() => setCalendarMonth(addDays(endOfMonth(calendarMonth), 1))}>{'>'}</Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs text-center">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <div key={i} className="font-bold text-[#7B8BB2]">{d}</div>)}
          {daysInMonth.map((day, i) => {
            const convoc = getConvocacaoByDay(day);
            let color = 'bg-gray-100 text-gray-500';
            if (convoc) {
              if (convoc.status === 'pending') color = 'bg-yellow-400 text-white font-bold cursor-pointer';
              if (convoc.status === 'accepted') color = 'bg-green-500 text-white font-bold cursor-pointer';
              if (convoc.status === 'rejected') color = 'bg-red-500 text-white font-bold cursor-pointer';
            }
            return (
              <div
                key={i}
                className={`rounded-full w-8 h-8 flex items-center justify-center mx-auto ${color}`}
                title={convoc ? `Jogo: ${convoc.opponent}` : ''}
                onClick={() => convoc && setSelectedConvoc(convoc)}
                style={{ transition: 'background 0.2s' }}
              >
                {format(day, 'd')}
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-xs text-[#7B8BB2]">
          <span className="inline-block mr-4"><span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-1 align-middle"></span>Pendente</span>
          <span className="inline-block mr-4"><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1 align-middle"></span>Aceita</span>
          <span className="inline-block"><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1 align-middle"></span>Recusada</span>
        </div>
      </Card>
      {/* Modal de detalhes da convocação */}
      {selectedConvoc && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded shadow max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-[#2563eb]">Convocação</h2>
            <div className="mb-2"><b>Quem convocou:</b> {selectedConvoc.by}</div>
            <div className="mb-2"><b>Time:</b> {selectedConvoc.team}</div>
            <div className="mb-2"><b>Data:</b> {format(selectedConvoc.date, 'dd/MM/yyyy')}</div>
            <div className="mb-2"><b>Hora:</b> {selectedConvoc.hour}</div>
            <div className="mb-2"><b>Adversário:</b> {selectedConvoc.opponent}</div>
            <div className="mb-4"><b>Informações extras:</b> {selectedConvoc.extra || '-'}</div>
            {selectedConvoc.status === 'pending' && (
              <div className="flex gap-4 mt-4">
                <Button variant="default" onClick={() => handleStatus(selectedConvoc.id, 'accepted')}>Aceitar</Button>
                <Button variant="destructive" onClick={() => handleStatus(selectedConvoc.id, 'rejected')}>Rejeitar</Button>
                <Button variant="outline" onClick={() => setSelectedConvoc(null)}>Fechar</Button>
              </div>
            )}
            {selectedConvoc.status !== 'pending' && (
              <div className="flex gap-4 mt-4">
                <Button variant="outline" onClick={() => setSelectedConvoc(null)}>Fechar</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 