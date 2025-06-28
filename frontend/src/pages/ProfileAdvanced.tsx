import { useEffect, useState, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui';
import { toast } from 'sonner';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getProfile, getStats, getEvents, updateProfile, uploadAvatar, profileSchema } from '../services/profile-service';
import { z } from 'zod';

export default function ProfileAdvanced() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      getProfile().then(setProfile),
      getStats().then(setStats),
      getEvents().then(setEvents),
    ]).finally(() => setLoading(false));
  }, []);

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo e tamanho
    if (!file.type.startsWith('image/')) {
      toast.error('O arquivo deve ser uma imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const avatarUrl = await uploadAvatar(file);
      setProfile((prev: z.infer<typeof profileSchema>) => ({ ...prev, avatar: avatarUrl }));
      toast.success('Avatar atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer upload do avatar');
    } finally {
      setUploadingAvatar(false);
    }
  }

  // Modal de edição (integrado)
  function EditProfileModal() {
    const [form, setForm] = useState(profile);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    if (!form) return null;
    async function handleSave() {
      setSaving(true);
      setError(null);
      try {
        const parsed = profileSchema.parse(form);
        const updated = await updateProfile(parsed);
        setProfile(updated);
        toast.success('Perfil atualizado!');
        setShowEditModal(false);
      } catch (e: any) {
        setError(e.message || 'Erro ao atualizar perfil');
      } finally {
        setSaving(false);
      }
    }
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowEditModal(false)} title="Fechar" type="button">×</button>
          <h2 className="text-xl font-bold mb-4">Editar Perfil</h2>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" value={form.name} onChange={e => setForm((prev: any) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" value={form.email} onChange={e => setForm((prev: any) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" name="phone" value={form.phone} onChange={e => setForm((prev: any) => ({ ...prev, phone: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="plan">Plano</Label>
              <Select name="plan" value={form.plan} onValueChange={value => setForm((prev: any) => ({ ...prev, plan: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bronze">Bronze</SelectItem>
                  <SelectItem value="Prata">Prata</SelectItem>
                  <SelectItem value="Ouro">Ouro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <div className="text-red-500 text-xs">{error}</div>}
            <div className="flex gap-4 mt-4">
              <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancelar</Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-8 mt-16">Carregando...</div>;
  if (!profile || !stats) return <div className="p-8 mt-16 text-red-500">Erro ao carregar dados do perfil.</div>;

  // Dados para gráficos
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const evolutionData = stats.evolution.map((d: any) => ({ name: months[d.month - 1], Pontos: d.points }));
  const barData = months.map((m, i) => ({
    name: m,
    Assistências: stats.assists[i]?.total || 0,
    'Lances Livres': stats.free_throws[i]?.total || 0,
    Rebotes: stats.rebounds[i]?.total || 0,
  }));

  // Eventos para o calendário
  const calendarEvents = events.map(ev => ({ ...ev, date: new Date(ev.date) }));

  return (
    <div className="p-8 mt-16 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Evolução de Pontuação</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Pontos" stroke="#7B61FF" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Minhas Estatísticas no Ano</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Assistências" fill="#7B61FF" />
                <Bar dataKey="Lances Livres" fill="#00C49F" />
                <Bar dataKey="Rebotes" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Médias e Notas</h2>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 text-left">Estatística</th>
                  <th className="px-2 py-1 text-left">Média</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-1">Pontos</td>
                  <td className="px-2 py-1">{(stats.evolution.reduce((a: number, b: any) => a + b.points, 0) / 12).toFixed(1)}</td>
                </tr>
                <tr>
                  <td className="px-2 py-1">Assistências</td>
                  <td className="px-2 py-1">{(stats.assists.reduce((a: number, b: any) => a + b.total, 0) / 12).toFixed(1)}</td>
                </tr>
                <tr>
                  <td className="px-2 py-1">Lances Livres</td>
                  <td className="px-2 py-1">{(stats.free_throws.reduce((a: number, b: any) => a + b.total, 0) / 12).toFixed(1)}</td>
                </tr>
                <tr>
                  <td className="px-2 py-1">Rebotes</td>
                  <td className="px-2 py-1">{(stats.rebounds.reduce((a: number, b: any) => a + b.total, 0) / 12).toFixed(1)}</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
        {/* Card lateral com perfil e progresso */}
        <div className="space-y-8">
          <Card className="p-6 flex flex-col items-center">
            <div className="relative group">
              <img 
                src={profile.avatar || 'https://ui-avatars.com/api/?name=' + profile.name} 
                alt="avatar" 
                className="w-20 h-20 rounded-full mb-2 object-cover cursor-pointer transition-opacity group-hover:opacity-75" 
                onClick={() => fileInputRef.current?.click()}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">Alterar foto</span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </div>
            <div className="font-bold text-lg mb-1">{profile.name}</div>
            <div className="text-sm text-gray-500 mb-1">{profile.email}</div>
            <div className="text-sm text-gray-500 mb-1">{profile.phone}</div>
            <div className="text-xs font-semibold text-purple-700 mb-2">{profile.plan}</div>
            <Button className="w-full" onClick={() => setShowEditModal(true)}>Editar perfil</Button>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Nível atual</h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-orange-500">{profile.level}</span>
              <span className="text-xs text-gray-400">Progresso de nível</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div className="bg-orange-400 h-3 rounded-full" style={{ width: profile.progress + '%' }}></div>
            </div>
            <div className="text-xs text-gray-500">Ganhe mais {profile.nextLevelExp - profile.currentExp} pontos para alcançar {profile.nextLevel}</div>
            <div className="text-xs text-gray-400 mt-2">{profile.currentExp} / {profile.nextLevelExp}</div>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Convocações e Eventos</h2>
            <Calendar
              tileContent={({ date }) => {
                const ev = calendarEvents.find(e => e.date.toDateString() === date.toDateString());
                if (!ev) return null;
                let color = ev.status === 'accepted' ? 'bg-green-400' : ev.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400';
                return <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${color}`}></div>;
              }}
            />
            <div className="mt-2 text-xs">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span> Aceito
              <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mx-2"></span> Pendente
              <span className="inline-block w-2 h-2 bg-red-400 rounded-full mx-2"></span> Rejeitado
            </div>
          </Card>
        </div>
      </div>
      {showEditModal && <EditProfileModal />}
    </div>
  );
} 