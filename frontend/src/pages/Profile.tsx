import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const planos = [
  { value: 'free', label: 'Free' },
  { value: 'player', label: 'Player' },
  { value: 'team', label: 'Team' },
];

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    team: user?.team || '',
    favoriteTeam: user?.favoriteTeam || '',
    document: user?.document || '',
    profileImage: user?.profileImage || '',
    password: '',
    confirmPassword: '',
    plan: user?.plan || 'free',
  });
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profileImage || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === 'admin';
  const isTeam = user?.role === 'team';

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
    setIsSaving(true);
    // Aqui você faria a chamada para o backend para salvar as alterações
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      toast.success('Alterações salvas com sucesso!');
    }, 1000);
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      team: user?.team || '',
      favoriteTeam: user?.favoriteTeam || '',
      document: user?.document || '',
      profileImage: user?.profileImage || '',
      password: '',
      confirmPassword: '',
      plan: user?.plan || 'free',
    });
    setProfileImagePreview(user?.profileImage || '');
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
            <span className="text-xs text-gray-500">Somente administradores podem alterar este campo.</span>
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
            disabled={!canSave || isSaving}
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
      {/* Modal de confirmação de cancelamento de conta */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded shadow max-w-md w-full">
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