import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui';
import { toast } from 'sonner';
import { getProfile, updateProfile, profileSchema } from '../services/profile-service';
import { z } from 'zod';

type Profile = z.infer<typeof profileSchema>;

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  }

  // Modal de edição
  function EditProfileModal() {
    const [form, setForm] = useState<Profile | null>(profile);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!form) return null;

    async function handleSave() {
      setSaving(true);
      setError(null);
      try {
        const updated = await updateProfile(form);
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
          <button 
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" 
            onClick={() => setShowEditModal(false)} 
            title="Fechar" 
            type="button"
          >
            ×
          </button>
          <h2 className="text-xl font-bold mb-4">Editar Perfil</h2>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input 
                id="name" 
                name="name" 
                value={form.name} 
                onChange={e => setForm(prev => prev ? { ...prev, name: e.target.value } : null)} 
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                name="email" 
                value={form.email} 
                onChange={e => setForm(prev => prev ? { ...prev, email: e.target.value } : null)} 
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={form.phone} 
                onChange={e => setForm(prev => prev ? { ...prev, phone: e.target.value } : null)} 
              />
            </div>
            <div>
              <Label htmlFor="plan">Plano</Label>
              <Select 
                name="plan" 
                value={form.plan} 
                onValueChange={value => setForm(prev => prev ? { ...prev, plan: value as "Bronze" | "Prata" | "Ouro" } : null)}
              >
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
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-8 mt-16">Carregando...</div>;
  if (!profile) return <div className="p-8 mt-16 text-red-500">Erro ao carregar dados do perfil.</div>;

  return (
    <div className="p-8 mt-16">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <img 
              src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}`} 
              alt="avatar" 
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-gray-500">{profile.email}</p>
              <p className="text-gray-500">{profile.phone}</p>
              <p className="text-sm font-semibold text-purple-700">{profile.plan}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold mb-2">Nível atual</h2>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-orange-500">{profile.level}</span>
                <span className="text-xs text-gray-400">Progresso de nível</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-orange-400 h-3 rounded-full" 
                  style={{ width: `${profile.progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                Ganhe mais {profile.nextLevelExp - profile.currentExp} pontos para alcançar {profile.nextLevel}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {profile.currentExp} / {profile.nextLevelExp}
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button className="w-full" onClick={() => setShowEditModal(true)}>
                Editar perfil
              </Button>
            </div>
          </div>
        </Card>
      </div>
      {showEditModal && <EditProfileModal />}
    </div>
  );
} 