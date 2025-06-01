import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '../services/api';

const planos = [
  { value: 'free', label: 'Free' },
  { value: 'player', label: 'Player' },
  { value: 'team', label: 'Team' },
];

export default function Profile() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    team: '',
    favoriteTeam: '',
    document: '',
    profileImage: '',
    password: '',
    confirmPassword: '',
    plan: 'free',
  });
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Histórico de notificações lidas (mock, pode ser global/localStorage)
  const [readNotifications, setReadNotifications] = useState<any[]>(() => {
    const saved = localStorage.getItem('readNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  const isTeam = false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'file' ? (e.target as any).files[0] : value,
    }));
    setIsEditing(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, profileImage: file }));
      setProfileImagePreview(URL.createObjectURL(file));
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error('ID do usuário não encontrado. Faça login novamente.');
      return;
    }
    try {
      setIsSaving(true);
      
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('team', form.team);
      formData.append('favoriteTeam', form.favoriteTeam);
      formData.append('document', form.document);
      formData.append('plan', form.plan);
      
      if (form.profileImage instanceof File) {
        formData.append('profileImage', form.profileImage);
      }
      
      if (form.password) {
        formData.append('password', form.password);
      }

      const response = await api.put(`/users/${user.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        updateUser(response.data);
        setIsEditing(false);
        toast.success('Alterações salvas com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      toast.error('Erro ao salvar alterações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      team: '',
      favoriteTeam: '',
      document: '',
      profileImage: '',
      password: '',
      confirmPassword: '',
      plan: 'free',
    });
    setProfileImagePreview('');
    setIsEditing(false);
  };

  const handleCancelAccount = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancelAccount = () => {
    setShowCancelModal(false);
    toast.success('Conta cancelada!');
    // Aqui você pode chamar o backend para cancelar a conta
  };

  const handleUpgradePlan = () => {
    toast.info('Redirecionando para página de planos...');
    // Redirecionar para página de planos/pagamento
  };

  const canSave = isEditing && (
    form.name !== user?.name ||
    form.email !== user?.email ||
    form.phone !== user?.phone ||
    form.team !== user?.team ||
    form.favoriteTeam !== user?.favoriteTeam ||
    form.profileImage !== user?.profileImage ||
    (form.password && form.password === form.confirmPassword)
  );

  // Proteção: só renderiza o formulário se user?.id existir
  if (!user?.id) {
    return <div>Usuário não autenticado. Faça login novamente.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8 mt-16 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Configurações da Conta</h2>
      <form className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32">
            <img
              src={profileImagePreview || '/avatar-placeholder.png'}
              alt="Foto de perfil"
              className="w-32 h-32 rounded-full object-cover border"
            />
            <input
              type="file"
              accept="image/*"
              name="profileImage"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
            />
            <button
              type="button"
              className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 shadow hover:bg-blue-700"
              onClick={() => fileInputRef.current?.click()}
            >
              Trocar
            </button>
          </div>
          <div className="flex-1 space-y-2">
            <label className="block text-sm font-medium text-gray-700">Nome completo</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            <label className="block text-sm font-medium text-gray-700 mt-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            <label className="block text-sm font-medium text-gray-700 mt-2">Telefone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Time que joga</label>
            <input
              type="text"
              name="team"
              value={form.team}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Time do coração</label>
            <input
              type="text"
              name="favoriteTeam"
              value={form.favoriteTeam}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Plano atual</label>
            <div className="flex items-center gap-2">
              <span className="font-semibold capitalize">{planos.find(p => p.value === form.plan)?.label || 'Free'}</span>
              <button
                type="button"
                className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleUpgradePlan}
              >
                Fazer upgrade de plano
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{isTeam ? 'CNPJ' : 'CPF'}</label>
            <input
              type="text"
              name="document"
              value={form.document}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nova senha</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar nova senha</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              autoComplete="new-password"
            />
            {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
              <span className="text-xs text-red-500">As senhas não coincidem.</span>
            )}
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button
            type="button"
            className={`px-6 py-2 rounded font-bold text-white ${canSave ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            onClick={handleSave}
            disabled={!canSave || isSaving || !user?.id}
          >
            {isSaving ? 'Salvando...' : 'Salvar alterações'}
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded font-bold border border-gray-300 bg-white hover:bg-gray-100"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="ml-auto px-6 py-2 rounded font-bold border border-red-500 text-red-600 bg-white hover:bg-red-50"
            onClick={handleCancelAccount}
            disabled={isSaving}
          >
            Cancelar conta
          </button>
        </div>
      </form>
      <div className="mt-12">
        <h3 className="text-lg font-bold mb-2">Histórico de Notificações Lidas</h3>
        {readNotifications.length === 0 ? (
          <div className="text-gray-500">Nenhuma notificação lida ainda.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {readNotifications.map((n, idx) => (
              <li key={n.id || idx} className="py-2">
                <span className="font-semibold text-primary">{n.text}</span>
                {n.url && <a href={n.url} className="ml-2 text-primary underline" target="_blank" rel="noopener noreferrer">Acessar</a>}
                <span className="block text-xs text-muted-foreground">{n.timestamp}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Modal de confirmação de cancelamento de conta */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" tabIndex={-1} onKeyDown={(e) => { if (e.key === 'Escape') setShowCancelModal(false); }}>
          <div className="bg-white p-8 rounded shadow max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowCancelModal(false)}
              title="Fechar"
              type="button"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4">Tem certeza que deseja cancelar sua conta?</h3>
            <p className="mb-6">Esta ação é irreversível. Todos os seus dados serão removidos do sistema.</p>
            <div className="flex gap-4">
              <button
                className="px-6 py-2 rounded font-bold bg-red-600 text-white hover:bg-red-700"
                onClick={handleConfirmCancelAccount}
              >
                Confirmar cancelamento
              </button>
              <button
                className="px-6 py-2 rounded font-bold border border-gray-300 bg-white hover:bg-gray-100"
                onClick={() => setShowCancelModal(false)}
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 