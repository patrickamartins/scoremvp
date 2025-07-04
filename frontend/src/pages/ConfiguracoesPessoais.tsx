import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui';
import { toast } from 'sonner';

const plans = [
  { value: 'free', label: 'Gratuito' },
  { value: 'premium', label: 'Premium' },
  { value: 'pro', label: 'Profissional' },
];

export default function ConfiguracoesPessoaisPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    favoriteTeam: '',
    playingTeam: '',
    plan: '',
    avatar: '',
    profileImage: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token'); // Assumindo que o token está no localStorage
        const response = await fetch('http://localhost:8000/api/profile/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('A resposta da rede não foi ok.');
        }

        const user = await response.json();

        console.log('Dados do perfil recebidos da API (com fetch):', user);

        try {
          setForm(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            cpf: user.cpf || '',
            favoriteTeam: user.favorite_team || '',
            playingTeam: user.playing_team || '',
            plan: user.plan || 'free',
            avatar: user.profile_image || '',
          }));
          setAvatarPreview(user.profile_image || '');
        } catch (stateError) {
          console.error('Erro ao atualizar o estado do componente:', stateError);
          toast.error('Erro ao processar dados do perfil.');
        }

      } catch (error) {
        console.error('Erro ao buscar perfil na API:', error);
        toast.error('Erro ao carregar dados do perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      setForm(prev => ({ ...prev, profileImage: file as any }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('favorite_team', form.favoriteTeam);
      formData.append('playing_team', form.playingTeam);
      
      if (form.profileImage) {
        formData.append('profile_image', form.profileImage);
      }
      
      await fetch('http://localhost:8000/api/profile/me', {
        method: 'PUT',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      favoriteTeam: '',
      playingTeam: '',
      plan: 'free',
      avatar: '',
      profileImage: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setAvatarPreview('');
  };

  const handleCancelAccount = () => {
    if (window.confirm('Tem certeza que deseja cancelar sua conta? Esta ação não pode ser desfeita.')) {
      toast.success('Conta cancelada com sucesso!');
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-8 mt-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">Configurações Pessoais</h1>
        
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <img
                src={avatarPreview || 'https://github.com/shadcn.png'}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
              <label
                htmlFor="avatar"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">{form.name}</h2>
              <p className="text-muted-foreground">{form.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleFormChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleFormChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleFormChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF/CNPJ</Label>
              <Input
                id="cpf"
                name="cpf"
                value={form.cpf}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="favoriteTeam">Time do coração</Label>
              <Input
                id="favoriteTeam"
                name="favoriteTeam"
                value={form.favoriteTeam}
                onChange={handleFormChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="playingTeam">Time que joga</Label>
              <Input
                id="playingTeam"
                name="playingTeam"
                value={form.playingTeam}
                onChange={handleFormChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Plano atual</Label>
              <Select
                name="plan"
                value={form.plan}
                onValueChange={(value: any) => setForm((prev: any) => ({ ...prev, plan: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleCancelAccount}>
              Cancelar conta
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
} 