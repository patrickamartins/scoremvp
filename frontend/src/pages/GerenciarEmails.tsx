import React, { useState, useEffect } from "react";
import { Card, Button, Input, Label, Checkbox } from "../components/ui";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast } from "sonner";
import { api } from "../services/api";
import { useAuthStore } from "../store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";

interface EmailTemplate {
  id: number;
  template_type: string;
  subject: string;
  html_body: string;
  enabled: boolean;
  send_to_roles: string[];
  created_at: string;
  updated_at: string;
}

const TEMPLATE_TYPES = [
  { value: "account_activation", label: "Ativação de Conta" },
  { value: "welcome", label: "Boas-Vindas" },
  { value: "password_reset", label: "Recuperação de Senha" },
  { value: "agenda_event", label: "Evento na Agenda" },
  { value: "game_finished", label: "Partida Finalizada" },
  { value: "subscription", label: "Assinatura" },
];

const USER_ROLES = [
  { value: "superadmin", label: "Super Admin" },
  { value: "team_admin", label: "Admin do Time" },
  { value: "scout", label: "Scout" },
  { value: "player", label: "Jogador" },
  { value: "guest", label: "Convidado" },
];

export default function GerenciarEmailsPage() {
  usePageTitle("Gerenciar Emails");
  const user = useAuthStore(state => state.user);
  
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    html_body: "",
    enabled: true,
    send_to_roles: [] as string[],
  });

  useEffect(() => {
    if (user?.role !== "superadmin") {
      toast.error("Acesso negado. Apenas administradores podem acessar esta página.");
      return;
    }
    fetchTemplates();
  }, [user]);

  const fetchTemplates = async () => {
    try {
      const response = await api.get("/email-templates");
      setTemplates(response.data);
    } catch (error) {
      toast.error("Erro ao carregar templates de email");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setForm({
      subject: template.subject,
      html_body: template.html_body,
      enabled: template.enabled,
      send_to_roles: template.send_to_roles || [],
    });
  };

  const handleFormChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleToggle = (role: string) => {
    setForm(prev => ({
      ...prev,
      send_to_roles: prev.send_to_roles.includes(role)
        ? prev.send_to_roles.filter(r => r !== role)
        : [...prev.send_to_roles, role]
    }));
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    
    setSaving(true);
    try {
      await api.put(`/email-templates/${selectedTemplate.id}`, form);
      toast.success("Template atualizado com sucesso!");
      fetchTemplates();
      // Atualizar template selecionado
      const updated = templates.find(t => t.id === selectedTemplate.id);
      if (updated) {
        setSelectedTemplate({ ...updated, ...form });
      }
    } catch (error) {
      toast.error("Erro ao salvar template");
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== "superadmin") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Card className="p-8">
          <h2 className="text-xl font-bold text-red-600 mb-4">Acesso Negado</h2>
          <p>Apenas administradores podem acessar esta página.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="w-full h-full p-6">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Templates de Email</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Templates */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Templates Disponíveis</h2>
          <div className="space-y-2">
            {TEMPLATE_TYPES.map((type) => {
              const template = templates.find(t => t.template_type === type.value);
              return (
                <button
                  key={type.value}
                  onClick={() => template && handleSelectTemplate(template)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedTemplate?.template_type === type.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  disabled={!template}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{type.label}</span>
                    {template ? (
                      <span className={`text-xs px-2 py-1 rounded ${
                        template.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {template.enabled ? "Ativo" : "Inativo"}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Não configurado</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Editor de Template */}
        <Card className="p-6">
          {selectedTemplate ? (
            <>
              <h2 className="text-xl font-bold mb-4">
                Editando: {TEMPLATE_TYPES.find(t => t.value === selectedTemplate.template_type)?.label}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Assunto do Email</Label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={(e) => handleFormChange("subject", e.target.value)}
                    placeholder="Ex: Bem-vindo ao ScoreMVP!"
                  />
                </div>

                <div>
                  <Label htmlFor="html_body">Corpo do Email (HTML)</Label>
                  <textarea
                    id="html_body"
                    value={form.html_body}
                    onChange={(e) => handleFormChange("html_body", e.target.value)}
                    className="w-full min-h-[300px] p-3 border rounded-md font-mono text-sm"
                    placeholder="Digite o HTML do email aqui..."
                  />
                </div>

                <div>
                  <Label>Destinatários (por nível de usuário)</Label>
                  <div className="mt-2 space-y-2">
                    {USER_ROLES.map((role) => (
                      <div key={role.value} className="flex items-center gap-2">
                        <Checkbox
                          checked={form.send_to_roles.includes(role.value)}
                          onCheckedChange={() => handleRoleToggle(role.value)}
                        />
                        <Label className="font-normal cursor-pointer" onClick={() => handleRoleToggle(role.value)}>
                          {role.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.enabled}
                    onCheckedChange={(checked) => handleFormChange("enabled", checked)}
                  />
                  <Label className="font-normal cursor-pointer" onClick={() => handleFormChange("enabled", !form.enabled)}>
                    Template ativo (emails serão enviados)
                  </Label>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <p>Selecione um template para editar</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

