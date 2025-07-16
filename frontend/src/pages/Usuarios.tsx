import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Card } from "../components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui";
import debounce from "lodash/debounce";
import { toast } from "sonner";
import api from '../services/api';
import { AuthDebug } from '../components/AuthDebug';

// Remover mockUsers e auto-replacement

const plans = [
  { value: 'free', label: 'Gratuito' },
  { value: 'premium', label: 'Premium' },
  { value: 'pro', label: 'Profissional' },
];

const statuses = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'blocked', label: 'Bloqueado' },
];

const types = [
  { value: 'player', label: 'Atleta' },
  { value: 'coach', label: 'Técnico' },
  { value: 'analyst', label: 'Analista' },
  { value: 'admin', label: 'Administrador' },
];

export default function UsuariosPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string>("");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Função para verificar se a URL da imagem é válida
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url || url === '' || url === 'null' || url === 'undefined') {
      return false;
    }
    // Verificar se é uma URL válida (começa com http ou /)
    return url.startsWith('http') || url.startsWith('/');
  };

  // Buscar usuários reais do backend
  useEffect(() => {
    setLoading(true);
    const params: any = { skip: 0, limit: 100 };
    if (search.trim()) params.name = search.trim();
    
    // Debug: verificar token
    const token = localStorage.getItem('token');
    console.log('🔍 DEBUG - Token no localStorage:', token ? 'Presente' : 'Ausente');
    console.log('🔍 DEBUG - Token completo:', token);
    
    api.get('/users/', { params })
      .then(res => {
        console.log('✅ DEBUG - Usuários carregados:', res.data);
        setUsers(res.data);
        setTotalPages(Math.ceil(res.data.length / itemsPerPage));
      })
      .catch((error) => {
        console.error('❌ DEBUG - Erro ao carregar usuários:', error);
        console.error('❌ DEBUG - Status:', error.response?.status);
        console.error('❌ DEBUG - Mensagem:', error.response?.data);
        setUsers([]);
        setTotalPages(1);
        toast.error('Erro ao carregar usuários do banco.');
      })
      .finally(() => setLoading(false));
  }, [search]);

  // Seleção em massa
  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedUsers(users.map((u) => u.id));
    else setSelectedUsers([]);
  };

  const handleSelectUser = (id: number, checked: boolean) => {
    setSelectedUsers((prev) =>
      checked ? [...prev, id] : prev.filter((uid) => uid !== id)
    );
  };

  const handleDeleteSelected = () => {
    if (selectedUsers.length === 0) return;
    if (
      window.confirm("Tem certeza que deseja deletar os usuários selecionados?")
    ) {
      setUsers((prev) => prev.filter((u) => !selectedUsers.includes(u.id)));
      setSelectedUsers([]);
      toast.success('Usuários excluídos com sucesso!');
    }
  };

  // Busca (mock)
  const handleSearch = debounce((val: string) => setSearch(val), 400);

  // Edição e criação
  const handleEdit = (user: any) => {
    // Mapear campos do backend para o formulário
    setSelectedUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      cpf: user.cpf || '',
      favoriteTeam: user.favorite_team || '',
      playingTeam: user.playing_team || '',
      plan: user.plan || 'free',
      status: user.status || 'active',
      type: user.type || 'player',
      number: user.number !== null && user.number !== undefined ? user.number : '',
      position: user.position || '',
      profile_image: user.profile_image || '',
    });
    setPhoto(null);
    setPhotoPreview(user.profile_image || user.photoUrl || null);
    
    // Debug: log dos dados do usuário para verificar
    console.log('🔍 DEBUG - Dados do usuário carregados:', user);
    console.log('🔍 DEBUG - Form mapeado:', {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      cpf: user.cpf || '',
      favoriteTeam: user.favorite_team || '',
      playingTeam: user.playing_team || '',
      plan: user.plan || 'free',
      status: user.status || 'active',
      type: user.type || 'player',
      number: user.number !== null && user.number !== undefined ? user.number : '',
      position: user.position || '',
      profile_image: user.profile_image || '',
    });
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      favoriteTeam: '',
      playingTeam: '',
      plan: 'free',
      status: 'active',
      type: 'player',
      last_payment_date: '',
      next_payment_date: '',
      card_last4: '',
      card_brand: '',
      photoUrl: '',
    });
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  // Upload de foto
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setPhotoError('O arquivo deve ser uma imagem');
        setPhoto(null);
        setPhotoPreview(null);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setPhotoError('A foto deve ter no máximo 2MB.');
        setPhoto(null);
        setPhotoPreview(null);
        return;
      }
      setPhotoError('');
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhoto(null);
      setPhotoPreview(null);
      setPhotoError('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let userId = selectedUser ? selectedUser.id : null;
      let profile_image = form.profile_image;
      let userResponse;
      
      if (selectedUser) {
        // PUT para editar usuário
        const payload = {
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          cpf: form.cpf || null,
          favorite_team: form.favoriteTeam || null,
          playing_team: form.playingTeam || null,
          plan: form.plan,
          is_active: form.status === 'active',
          type: form.type,
          number: form.number && form.number !== '' && form.number !== '0' ? parseInt(form.number, 10) : null,
          position: form.position || null,
          profile_image: form.profile_image || null,
        };
        
        console.log('🔍 DEBUG - Payload enviado para update:', payload);
        userResponse = await api.put(`/users/${selectedUser.id}`, payload);
        console.log('🔍 DEBUG - Resposta do update:', userResponse.data);
        
        userId = selectedUser.id;
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // POST para criar usuário
        const payload = {
          name: form.name,
          email: form.email,
          password: form.password || 'SenhaForte123!', // ajuste conforme fluxo real
          role: form.type || 'player',
          plan: form.plan || 'free',
          is_active: form.status === 'active',
          phone: form.phone || null,
          cpf: form.cpf || null,
          favorite_team: form.favoriteTeam || null,
          playing_team: form.playingTeam || null,
          profile_image: form.profile_image || null,
          send_activation_email: false,
          number: form.number && form.number !== '' && form.number !== '0' ? parseInt(form.number, 10) : null,
          position: form.position || null,
        };
        
        console.log('🔍 DEBUG - Payload enviado para create:', payload);
        userResponse = await api.post('/users/', payload);
        console.log('🔍 DEBUG - Resposta do create:', userResponse.data);
        
        userId = userResponse.data.id;
        toast.success('Usuário criado com sucesso!');
      }
      
      // Upload da foto, se houver
      if (photo && userId) {
        const formData = new FormData();
        formData.append('file', photo);
        console.log('🔍 DEBUG - Fazendo upload da foto para usuário:', userId);
        const res = await api.post(`/users/${userId}/photo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('🔍 DEBUG - Resposta do upload da foto:', res.data);
        profile_image = res.data.url;
        
        // Atualiza o usuário com a URL persistente
        console.log('🔍 DEBUG - Atualizando usuário com profile_image:', profile_image);
        await api.put(`/users/${userId}`, { profile_image });
      }
      
      // Refazer fetch dos usuários após salvar
      const params: any = { skip: 0, limit: 100 };
      if (search.trim()) params.name = search.trim();
      const res = await api.get('/users/', { params });
      console.log('🔍 DEBUG - Usuários após salvar:', res.data);
      setUsers(res.data);
      setTotalPages(Math.ceil(res.data.length / itemsPerPage));
    } catch (err: any) {
      console.error('❌ DEBUG - Erro ao salvar usuário:', err);
      toast.error(err?.response?.data?.detail || 'Erro ao salvar usuário ou foto.');
    } finally {
      setSaving(false);
      setSelectedUser(null);
      setForm({});
      setPhoto(null);
      setPhotoPreview(null);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      api.delete(`/users/${id}`)
        .then(() => {
          toast.success('Usuário excluído com sucesso!');
          const params: any = { skip: 0, limit: 100 };
          if (search.trim()) params.name = search.trim();
          return api.get('/users/', { params });
        })
        .then(res => {
          setUsers(res.data);
          setTotalPages(Math.ceil(res.data.length / itemsPerPage));
        })
        .catch(() => toast.error('Erro ao excluir usuário.'));
    }
  };

  const paginatedUsers = users.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="p-8 mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#2563eb]">Usuários</h1>
          <Button onClick={handleCreate}>Novo Usuário</Button>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, email ou CPF..."
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleDeleteSelected}
            disabled={selectedUsers.length === 0}
            className="mb-4 bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Deletar Selecionados ({selectedUsers.length})
          </Button>

          {loading ? (
            <div className="text-center text-gray-500">Carregando usuários...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.length === users.length && users.length > 0
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="border px-4 py-2 text-left">Nome</th>
                    <th className="border px-4 py-2 text-left">Email</th>
                    <th className="border px-4 py-2 text-left">CPF/CNPJ</th>
                    <th className="border px-4 py-2 text-left">Time</th>
                    <th className="border px-4 py-2 text-left">Plano</th>
                    <th className="border px-4 py-2 text-left">Status</th>
                    <th className="border px-4 py-2 text-left">Tipo</th>
                    <th className="border px-4 py-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) =>
                            handleSelectUser(user.id, e.target.checked)
                          }
                        />
                      </td>
                      <td className="border px-4 py-2">
                          {isValidImageUrl(user.profile_image) || isValidImageUrl(user.photoUrl) ? (
                            <img
                              src={user.profile_image || user.photoUrl}
                              alt={user.name?.charAt(0) || '?'}
                              className="w-8 h-8 rounded-full object-cover mr-2"
                              onError={(e) => { 
                                console.log('❌ DEBUG - Erro ao carregar imagem:', user.profile_image || user.photoUrl);
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <span className={`inline-block w-8 h-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center text-gray-400 font-bold ${isValidImageUrl(user.profile_image) || isValidImageUrl(user.photoUrl) ? 'hidden' : ''}`}>
                            {user.name?.charAt(0) || '?'}
                          </span>
                          {user.name}
                        </td>
                      <td className="border px-4 py-2">{user.email}</td>
                      <td className="border px-4 py-2">
                          {user.cpf ? (
                            <span className="font-mono text-sm">
                              {user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="border px-4 py-2">
                          {user.playing_team ? (
                            <div>
                              <div className="font-medium">{user.playing_team}</div>
                              {user.favorite_team && (
                                <div className="text-xs text-gray-500">♥ {user.favorite_team}</div>
                              )}
                            </div>
                          ) : user.favorite_team ? (
                            <div className="text-gray-600">♥ {user.favorite_team}</div>
                          ) : (
                            '-'
                          )}
                        </td>
                      <td className="border px-4 py-2">{plans.find(p => p.value === user.plan)?.label}</td>
                      <td className="border px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {statuses.find(s => s.value === user.status)?.label}
                        </span>
                      </td>
                      <td className="border px-4 py-2">{types.find(t => t.value === user.type)?.label}</td>
                      <td className="border px-4 py-2 text-center">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800 px-2 py-1 rounded"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="px-4 py-2">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Próxima
            </Button>
          </div>
        </Card>

        {/* Modal de edição/criação */}
        {form && Object.keys(form).length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay escurecido */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => {
                setForm({});
                setSelectedUser(null);
                setPhoto(null);
                setPhotoPreview(null);
              }}
            />
            <div className="relative z-10 w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8 animate-fade-in">
              {/* Botão de fechar */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold focus:outline-none"
                onClick={() => {
                  setForm({});
                  setSelectedUser(null);
                  setPhoto(null);
                  setPhotoPreview(null);
                }}
                aria-label="Fechar"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-6 text-center">
                {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                onSubmit={e => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <div className="md:col-span-2 flex flex-col items-center mb-2">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-24 h-24 object-cover rounded-full mb-2" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2 text-gray-400">Foto</div>
                  )}
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="block mt-1"
                  />
                  {photoError && <div className="text-red-500 text-xs mt-1">{photoError}</div>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    required
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
                    required
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
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    name="number"
                    type="number"
                    value={form.number || ''}
                    onChange={handleFormChange}
                  />
                </div>
                {/* Agrupar campos em grid para evitar sobreposição de dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Campo de posição usando <select> nativo */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="position">Posição</Label>
                    <select
                      id="position"
                      name="position"
                      value={form.position || ''}
                      onChange={handleFormChange}
                      className="w-full rounded border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione a posição</option>
                      <option value="Armador">Armador</option>
                      <option value="Ala">Ala</option>
                      <option value="Ala-Armador">Ala-Armador</option>
                      <option value="Ala-Pivô">Ala-Pivô</option>
                      <option value="Pivô">Pivô</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF/CNPJ</Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      value={form.cpf}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="favoriteTeam">Time do coração</Label>
                  <Input
                    id="favoriteTeam"
                    name="favoriteTeam"
                    value={form.favoriteTeam}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="playingTeam">Time que joga</Label>
                  <Input
                    id="playingTeam"
                    name="playingTeam"
                    value={form.playingTeam}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan">Plano</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    name="status"
                    value={form.status}
                    onValueChange={(value: any) => setForm((prev: any) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    name="type"
                    value={form.type}
                    onValueChange={(value: any) => setForm((prev: any) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 flex justify-end gap-4 mt-6">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setForm({});
                      setSelectedUser(null);
                      setPhoto(null);
                      setPhotoPreview(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de assinatura */}
        {showSubscriptionModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Detalhes da Assinatura</h2>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Plano Atual</Label>
                  <p className="mt-1 text-gray-900">{plans.find(p => p.value === selectedUser.plan)?.label}</p>
                </div>
                <div>
                  <Label>Última Cobrança</Label>
                  <p className="mt-1 text-gray-900">{selectedUser.last_payment_date || '-'}</p>
                </div>
                <div>
                  <Label>Próxima Cobrança</Label>
                  <p className="mt-1 text-gray-900">{selectedUser.next_payment_date || '-'}</p>
                </div>
                {selectedUser.card_last4 && (
                  <div>
                    <Label>Cartão Cadastrado</Label>
                    <p className="mt-1 text-gray-900">{selectedUser.card_brand} terminando em {selectedUser.card_last4}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowSubscriptionModal(false)}>Fechar</Button>
                {selectedUser.plan !== 'free' && (
                  <Button variant="destructive" onClick={() => { toast.success('Assinatura cancelada (mock)'); setShowSubscriptionModal(false); }}>Cancelar Assinatura</Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 