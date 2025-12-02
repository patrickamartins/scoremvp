import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "../components/ui";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast } from "sonner";
import { api } from "../services/api";
import { Check } from "lucide-react";
import PaymentModal from "../components/PaymentModal";
import { useAuthStore } from "../store";

interface Plan {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  priceLabel: string;
  features: string[];
  popular?: boolean;
  icon: string;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Player",
    subtitle: "Starter Plan",
    price: 0,
    priceLabel: "Grátis",
    features: [
      "2 Jogos Cadastrados",
      "Box Score Completo",
      "Suporte Via E-mail",
    ],
    icon: "📊",
  },
  {
    id: "pro",
    name: "MVP",
    subtitle: "For the best results",
    price: 19.90,
    priceLabel: "R$ 19,90",
    features: [
      "Jogos Ilimitados",
      "Dashboard Estatístico + Download em PDF",
      "Vínculo Com Time",
      "Agenda de Jogos",
      "Suporte Via E-mail",
    ],
    popular: true,
    icon: "⭐",
  },
  {
    id: "team",
    name: "Team",
    subtitle: "Most popular",
    price: 199,
    priceLabel: "R$ 199",
    features: [
      "Jogos Ilimitados",
      "Dashboard Estatístico + Download em PDF",
      "Análise Comparativa",
      "Usuários Adicionais",
      "Controle de Jogadores",
      "Agenda de Jogos",
      "Suporte Via WhatsApp",
    ],
    icon: "👥",
  },
];

export default function ChoosePlanPage() {
  usePageTitle("Escolher Plano");
  const navigate = useNavigate();
  const setUser = useAuthStore(state => state.setUser);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [registerData, setRegisterData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Carregar dados do registro
    const data = localStorage.getItem('registerData');
    if (!data) {
      toast.error("Dados de registro não encontrados");
      navigate("/register");
      return;
    }
    setRegisterData(JSON.parse(data));
  }, [navigate]);

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    
    if (planId === "free") {
      // Plano grátis - ir direto para dashboard
      setLoading(true);
      try {
        // Atualizar plano do usuário
        if (registerData?.userId) {
          await api.put(`/users/${registerData.userId}`, { plan: "free" });
        }
        
        // Fazer login automático
        const loginForm = new URLSearchParams();
        loginForm.append('username', registerData.email);
        loginForm.append('password', registerData.password || '');
        
        const loginResponse = await api.post('/auth/login', loginForm, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        if (loginResponse.data?.access_token) {
          localStorage.setItem("token", loginResponse.data.access_token);
          
          // Salvar usuário no store
          if (loginResponse.data.user) {
            setUser({
              id: loginResponse.data.user.id,
              name: loginResponse.data.user.name,
              email: loginResponse.data.user.email,
              role: loginResponse.data.user.role,
              plan: loginResponse.data.user.plan,
              token: loginResponse.data.access_token,
            });
          }
          
          localStorage.removeItem('registerData');
          toast.success("Plano selecionado! Bem-vindo ao ScoreMVP!");
          // Redirecionar player e MVP para /perfil, outros para /dashboard
          const userRole = loginResponse.data.user?.role;
          const userPlan = loginResponse.data.user?.plan;
          const redirectPath = (userRole === 'player' || userPlan === 'pro') ? '/perfil' : '/dashboard';
          navigate(redirectPath);
        }
      } catch (error: any) {
        toast.error("Erro ao processar seleção de plano");
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else {
      // Plano pago - abrir modal de pagamento
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = async () => {
    // Não fechar o modal ainda - aguardar login bem-sucedido
    toast.success("Pagamento aprovado! Fazendo login...");
    
    try {
      // Fazer login automático
      const loginForm = new URLSearchParams();
      loginForm.append('username', registerData.email);
      loginForm.append('password', registerData.password || '');
      
      const loginResponse = await api.post('/auth/login', loginForm, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      if (loginResponse.data?.access_token) {
        localStorage.setItem("token", loginResponse.data.access_token);
        
        // Salvar usuário no store
        if (loginResponse.data.user) {
          setUser({
            id: loginResponse.data.user.id,
            name: loginResponse.data.user.name,
            email: loginResponse.data.user.email,
            role: loginResponse.data.user.role,
            plan: loginResponse.data.user.plan,
            token: loginResponse.data.access_token,
          });
        }
        
        localStorage.removeItem('registerData');
        setShowPaymentModal(false); // Fechar modal apenas após sucesso
        toast.success("Login realizado com sucesso! Redirecionando...");
        // Redirecionar baseado no role: player e MVP vão para /perfil, outros para /dashboard
        const userRole = loginResponse.data.user?.role;
        const redirectPath = (userRole === 'player' || loginResponse.data.user?.plan === 'pro') ? '/perfil' : '/dashboard';
        navigate(redirectPath);
      } else {
        throw new Error("Token de acesso não recebido");
      }
    } catch (error: any) {
      console.error("Erro ao fazer login após pagamento:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Erro desconhecido";
      toast.error(`Erro ao fazer login: ${errorMessage}`);
      // Não fechar o modal se o login falhar - permitir que o usuário tente novamente
    }
  };

  if (!registerData) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            O plano que se adapta à você
          </h1>
          <p className="text-lg text-gray-600">
            Planos mensais com cobrança em cartão de crédito
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative p-8 ${
                plan.popular
                  ? "border-2 border-blue-500 shadow-xl transform scale-105"
                  : "border border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="text-4xl mb-4">{plan.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm">{plan.subtitle}</p>
              </div>

              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {plan.priceLabel}
                </div>
                <p className="text-gray-500 text-sm">
                  {plan.price === 0 ? "For Limited Period" : "Billing Monthly"}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                    : "bg-gray-800 text-white hover:bg-gray-900"
                }`}
                disabled={loading}
              >
                {loading && selectedPlan === plan.id
                  ? "Processando..."
                  : "Get started"}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {showPaymentModal && selectedPlan && (
        <PaymentModal
          planId={selectedPlan}
          userId={registerData.userId}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}

