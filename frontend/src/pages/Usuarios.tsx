import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Input, Label, Button } from '../components/ui';

const tiposUsuario = [
  { value: 'player', label: 'Atleta' },
  { value: 'coach', label: 'Técnico' },
  { value: 'analyst', label: 'Analista' },
  { value: 'admin', label: 'Admin' },
  { value: 'team', label: 'Time' },
];
const planos = [
  { value: 'free', label: 'Grátis' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Time' },
];

function debounce(fn: any, delay: number) {
  let timer: any;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'create'>('edit');
  const [form, setForm] = useState<any>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Simulação de busca e paginação
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // Simula 30 usuários
      let all = Array.from({ length: 30 }).map((_, i) => ({
        id: i + 1,
        name: `Usuário ${i + 1}`,
        email: `user${i + 1}@mail.com`,
        type: tiposUsuario[i % tiposUsuario.length].value,
        plan: planos[i % planos.length].value,
        status: i % 2 === 0 ? 'ativo' : 'inativo',
        lastCharge: '2024-06-01',
        nextCharge: '2024-07-01',
        card: '**** **** **** 1234',
        cardBrand: 'Visa',
        favoriteTeam: `Time do Coração ${i + 1}`,
        team: `Time que Joga ${i + 1}`,
        document: i % 2 === 0 ? `123.456.789-0${i}` : `12.345.678/0001-0${i}`,
      }));
      if (search) {
        all = all.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
      }
      setTotalPages(Math.ceil(all.length / 10));
      setUsers(all.slice((page - 1) * 10, page * 10));
      setLoading(false);
    }, 400);
  }, [search, page]);

  const handleSearch = debounce((val: string) => setSearch(val), 400);

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setForm({ ...user });
    setModalMode('edit');
    setShowModal(true);
  };
  const openCreateModal = () => {
    setForm({ name: '', email: '', type: 'player', plan: 'free', status: 'ativo', favoriteTeam: '', team: '', document: '' });
    setModalMode('create');
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };
  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };
  const handleSave = () => {
    toast.success('Usuário salvo!');
    closeModal();
  };
  const handleCancel = () => closeModal();
  const handleCancelSubscription = () => toast.info('Assinatura cancelada!');
  const handleChangeCard = () => toast.info('Trocar método de pagamento!');

  return (
    <div className="p-8 mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#2563eb]">Usuários</h1>
          <Button onClick={openCreateModal}>Novo Usuário</Button>
        </div>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            onChange={e => handleSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
        {loading ? (
          <div className="text-center text-gray-500">Carregando usuários...</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full text-sm border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-2 py-2">Nome</th>
                  <th className="border px-2 py-2">E-mail</th>
                  <th className="border px-2 py-2">Tipo</th>
                  <th className="border px-2 py-2">Plano</th>
                  <th className="border px-2 py-2">Status</th>
                  <th className="border px-2 py-2">Time do coração</th>
                  <th className="border px-2 py-2">Time que joga</th>
                  <th className="border px-2 py-2">CPF/CNPJ</th>
                  <th className="border px-2 py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-blue-50 cursor-pointer">
                    <td className="border px-2 py-2" onClick={() => openEditModal(u)}>{u.name}</td>
                    <td className="border px-2 py-2" onClick={() => openEditModal(u)}>{u.email}</td>
                    <td className="border px-2 py-2" onClick={() => openEditModal(u)}>{tiposUsuario.find(t => t.value === u.type)?.label}</td>
                    <td className="border px-2 py-2" onClick={() => openEditModal(u)}>{planos.find(p => p.value === u.plan)?.label}</td>
                    <td className="border px-2 py-2" onClick={() => openEditModal(u)}>{u.status}</td>
                    <td className="border px-2 py-2" onClick={() => openEditModal(u)}>{u.favoriteTeam}</td>
                    <td className="border px-2 py-2" onClick={() => openEditModal(u)}>{u.team}</td>
                    <td className="border px-2 py-2" onClick={() => openEditModal(u)}>{u.document}</td>
                    <td className="border px-2 py-2">
                      <Button variant="link" onClick={() => openEditModal(u)}>Editar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Paginação simples */}
            <div className="flex justify-end gap-2 p-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</Button>
              <span className="self-center">Página {page} de {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Próxima</Button>
            </div>
          </div>
        )}
      </div>
      {/* Modal de edição/criação */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded shadow max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">{modalMode === 'edit' ? 'Editar Usuário' : 'Novo Usuário'}</h2>
            <form className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input type="text" name="name" value={form.name} onChange={handleFormChange} />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input type="email" name="email" value={form.email} onChange={handleFormChange} />
              </div>
              <div>
                <Label>Tipo de usuário</Label>
                <select name="type" value={form.type} onChange={handleFormChange} className="w-full border rounded px-3 py-2">
                  {tiposUsuario.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Plano</Label>
                <select name="plan" value={form.plan} onChange={handleFormChange} className="w-full border rounded px-3 py-2">
                  {planos.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select name="status" value={form.status} onChange={handleFormChange} className="w-full border rounded px-3 py-2">
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
              <div>
                <Label>Time do coração</Label>
                <Input type="text" name="favoriteTeam" value={form.favoriteTeam} onChange={handleFormChange} />
              </div>
              <div>
                <Label>Time que joga</Label>
                <Input type="text" name="team" value={form.team} onChange={handleFormChange} />
              </div>
              <div>
                <Label>CPF/CNPJ</Label>
                <Input type="text" name="document" value={form.document} onChange={handleFormChange} />
              </div>
              {modalMode === 'edit' && (
                <>
                  <div className="pt-4 border-t mt-4">
                    <h3 className="font-semibold mb-2">Assinatura</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-gray-500">Plano atual:</span>
                        <div className="font-bold">{planos.find(p => p.value === form.plan)?.label}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Última cobrança:</span>
                        <div>{form.lastCharge}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Próxima cobrança:</span>
                        <div>{form.nextCharge}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Cartão cadastrado:</span>
                        <div>{form.cardBrand} {form.card}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button variant="destructive" size="sm" type="button" onClick={handleCancelSubscription}>Cancelar assinatura</Button>
                      <Button variant="outline" size="sm" type="button" onClick={handleChangeCard}>Trocar método de pagamento</Button>
                    </div>
                  </div>
                </>
              )}
              {modalMode === 'create' && (
                <>
                  <div>
                    <Label>Senha inicial</Label>
                    <Input type="password" name="password" value={form.password || ''} onChange={handleFormChange} />
                  </div>
                </>
              )}
              <div className="flex gap-4 mt-6">
                <Button type="button" onClick={handleSave}>Salvar alterações</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 