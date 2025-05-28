import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui';
import { toast } from 'sonner';

// Mock de dados do usuário
const mockUser = {
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '(11) 99999-9999',
  cpf: '123.456.789-00',
  favoriteTeam: 'São Paulo',
  playingTeam: 'São Paulo',
  plan: 'premium',
  avatar: 'https://github.com/shadcn.png',
};

const plans = [
  { value: 'free', label: 'Gratuito' },
  { value: 'premium', label: 'Premium' },
  { value: 'pro', label: 'Profissional' },
];

export default function ConfiguracoesPessoaisPage() {
  const [form, setForm] = useState({
    name: mockUser.name,
    email: mockUser.email,
    phone: mockUser.phone,
    cpf: mockUser.cpf,
    favoriteTeam: mockUser.favoriteTeam,
    playingTeam: mockUser.playingTeam,
    plan: mockUser.plan,
    avatar: mockUser.avatar,
    profileImage: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(mockUser.avatar);

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      toast.success('Configurações salvas com sucesso!');
      setSaving(false);
    }, 1000);
  };

  const handleCancel = () => {
    setForm({
      name: mockUser.name,
      email: mockUser.email,
      phone: mockUser.phone,
      cpf: mockUser.cpf,
      favoriteTeam: mockUser.favoriteTeam,
      playingTeam: mockUser.playingTeam,
      plan: mockUser.plan,
      avatar: mockUser.avatar,
      profileImage: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setAvatarPreview(mockUser.avatar);
  };

  const handleCancelAccount = () => {
    if (window.confirm('Tem certeza que deseja cancelar sua conta? Esta ação não pode ser desfeita.')) {
      toast.success('Conta cancelada com sucesso!');
    }
  };

  return (
    <div className="p-8 mt-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">Configurações Pessoais</h1>
        
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <img
                src={avatarPreview}
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