import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';

// Mock de usuários
const mockUsers = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    cpf: '123.456.789-00',
    favoriteTeam: 'São Paulo',
    playingTeam: 'São Paulo',
    plan: 'premium',
    status: 'active',
    type: 'player',
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 98888-8888',
    cpf: '987.654.321-00',
    favoriteTeam: 'Corinthians',
    playingTeam: 'Corinthians',
    plan: 'pro',
    status: 'active',
    type: 'coach',
  },
];

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

export default function AdministracaoUsuariosPage() {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Simula busca de usuários
  useEffect(() => {
    const filteredUsers = mockUsers.filter(user =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.cpf.includes(search)
    );
    setUsers(filteredUsers);
    setTotalPages(Math.ceil(filteredUsers.length / itemsPerPage));
  }, [search]);

  const handleSearch = debounce((value: string) => {
    setSearch(value);
    setPage(1);
  }, 300);

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setForm(user);
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
    });
  };

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      if (selectedUser) {
        // Editar usuário existente
        setUsers(users.map(u => u.id === selectedUser.id ? { ...form, id: selectedUser.id } : u));
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        const newUser = { ...form, id: Date.now() };
        setUsers([...users, newUser]);
        toast.success('Usuário criado com sucesso!');
      }
      setSaving(false);
      setSelectedUser(null);
    }, 1000);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(users.filter(u => u.id !== id));
      toast.success('Usuário excluído com sucesso!');
    }
  };

  const paginatedUsers = users.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="p-8 mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Administração de Usuários</h1>
          <Button onClick={handleCreate}>Novo Usuário</Button>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, email ou CPF..."
                onChange={e => handleSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-input">
              <thead className="bg-muted">
                <tr>
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
                {paginatedUsers.map(user => (
                  <tr key={user.id}>
                    <td className="border px-4 py-2">{user.name}</td>
                    <td className="border px-4 py-2">{user.email}</td>
                    <td className="border px-4 py-2">{user.cpf}</td>
                    <td className="border px-4 py-2">{user.playingTeam}</td>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
        {form && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <Card className="p-6 max-w-2xl w-full">
              <h2 className="text-xl font-bold mb-4">
                {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>

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
                    onChange={handleFormChange}
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
                  <Label htmlFor="plan">Plano</Label>
                  <Select
                    name="plan"
                    value={form.plan}
                    onValueChange={(value) => setForm(prev => ({ ...prev, plan: value }))}
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
                    onValueChange={(value) => setForm(prev => ({ ...prev, status: value }))}
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
                    onValueChange={(value) => setForm(prev => ({ ...prev, type: value }))}
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
              </div>

              <div className="flex gap-4 mt-8">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setForm(null)}
                >
                  Cancelar
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 