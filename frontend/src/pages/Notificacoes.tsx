import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui';

const publics = [
  { value: 'all', label: 'Todos os usuários' },
  { value: 'player', label: 'Apenas atletas' },
  { value: 'coach', label: 'Apenas técnicos' },
  { value: 'analyst', label: 'Apenas analistas' },
  { value: 'admin', label: 'Apenas admins' },
  { value: 'team', label: 'Apenas times' },
  { value: 'mvp', label: 'Apenas MVP' },
];

// Simula contexto de autenticação
const useAuth = () => ({ user: { id: 1, name: 'Admin', role: 'admin' } });

export default function NotificacoesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [form, setForm] = useState({ text: '', url: '', public: 'all' });
  const [sending, setSending] = useState(false);
  const [log, setLog] = useState<any[]>([]);
  const [myNotifications, setMyNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState<number>(0);

  // Simula busca de notificações do usuário
  useEffect(() => {
    setTimeout(() => {
      setMyNotifications([
        { id: 1, text: 'Bem-vindo ao ScoreMVP!', url: '', read: false, timestamp: '2024-06-01 10:00', },
        { id: 2, text: 'Novo jogo disponível!', url: '/dashboard', read: false, timestamp: '2024-06-02 12:00', },
        { id: 3, text: 'Seu plano foi atualizado.', url: '', read: true, timestamp: '2024-06-03 09:00', },
      ]);
    }, 300);
  }, []);
  useEffect(() => {
    setUnread(myNotifications.filter(n => !n.read).length);
  }, [myNotifications]);

  // Simula log de notificações enviadas (admin)
  useEffect(() => {
    if (isAdmin) {
      setTimeout(() => {
        setLog([
          { id: 1, text: 'Bem-vindo ao ScoreMVP!', url: '', public: 'Todos', sender: 'Admin', timestamp: '2024-06-01 10:00' },
          { id: 2, text: 'Novo jogo disponível!', url: '/dashboard', public: 'Atletas', sender: 'Admin', timestamp: '2024-06-02 12:00' },
        ]);
      }, 300);
    }
  }, [isAdmin]);

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleSend = () => {
    if (!form.text) {
      toast.error('Digite o texto da notificação');
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success('Notificação enviada!');
      setSending(false);
      setForm({ text: '', url: '', public: 'all' });
      // Atualiza log
      setLog(l => [{ id: Date.now(), text: form.text, url: form.url, public: publics.find(p => p.value === form.public)?.label, sender: user.name, timestamp: new Date().toLocaleString() }, ...l]);
    }, 800);
  };
  const markAsRead = (id: number) => {
    setMyNotifications(n => n.map(notif => notif.id === id ? { ...notif, read: true } : notif));
  };

  return (
    <div className="p-8 mt-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">Notificações</h1>
        {/* Indicador de não lidas */}
        <div className="mb-4 flex items-center gap-2">
          <span className="font-semibold">Minhas notificações</span>
          {unread > 0 && <span className="bg-destructive text-destructive-foreground rounded-full px-2 text-xs">{unread} não lida(s)</span>}
        </div>
        <Card className="mb-8">
          <ul>
            {myNotifications.map(n => (
              <li key={n.id} className={`flex items-center gap-2 border-b last:border-b-0 px-4 py-3 ${n.read ? 'bg-muted/50' : 'bg-primary/5'}`}>
                <button className="flex-1 text-left" onClick={() => markAsRead(n.id)}>
                  <span className={n.read ? 'text-muted-foreground' : 'font-bold text-primary'}>{n.text}</span>
                  {n.url && <a href={n.url} className="ml-2 text-primary underline" target="_blank" rel="noopener noreferrer">Acessar</a>}
                  <span className="block text-xs text-muted-foreground">{n.timestamp}</span>
                </button>
                {!n.read && <span className="text-xs text-primary">Nova</span>}
              </li>
            ))}
          </ul>
        </Card>
        {/* Formulário de envio (apenas admin) */}
        {isAdmin && (
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-bold mb-4">Enviar nova notificação</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="text">Texto da notificação</Label>
                <textarea
                  id="text"
                  name="text"
                  value={form.text}
                  onChange={handleFormChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL (opcional)</Label>
                <Input
                  id="url"
                  name="url"
                  value={form.url}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="public">Público-alvo</Label>
                <Select value={form.public} onValueChange={(value) => setForm(prev => ({ ...prev, public: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o público-alvo" />
                  </SelectTrigger>
                  <SelectContent>
                    {publics.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              className="mt-4"
              onClick={handleSend}
              disabled={sending}
            >
              {sending ? 'Enviando...' : 'Enviar Notificação'}
            </Button>
          </Card>
        )}
        {/* Log de notificações enviadas (admin) */}
        {isAdmin && (
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Log de notificações enviadas (últimos 30 dias)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border border-input">
                <thead className="bg-muted">
                  <tr>
                    <th className="border px-2 py-1">Texto</th>
                    <th className="border px-2 py-1">URL</th>
                    <th className="border px-2 py-1">Público-alvo</th>
                    <th className="border px-2 py-1">Enviado por</th>
                    <th className="border px-2 py-1">Data/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {log.map(l => (
                    <tr key={l.id}>
                      <td className="border px-2 py-1">{l.text}</td>
                      <td className="border px-2 py-1">{l.url ? <a href={l.url} className="text-primary underline" target="_blank" rel="noopener noreferrer">{l.url}</a> : '-'}</td>
                      <td className="border px-2 py-1">{l.public}</td>
                      <td className="border px-2 py-1">{l.sender}</td>
                      <td className="border px-2 py-1">{l.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 