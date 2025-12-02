import React, { useState, useEffect } from "react";
import { X, CreditCard, AlertCircle } from "lucide-react";
import { Button, Input, Label } from "./ui";
import { api } from "../services/api";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface PaymentModalProps {
  planId: string;
  userId: number;
  onSuccess: () => void;
  onClose: () => void;
}

const PLAN_NAMES: Record<string, string> = {
  pro: "MVP",
  team: "Team",
};

const PLAN_PRICES: Record<string, string> = {
  pro: "R$ 19,90",
  team: "R$ 199",
};

// Componente interno que usa hooks do Stripe
function PaymentForm({ planId, userId, onSuccess, onClose }: PaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [cep, setCep] = useState("");

  useEffect(() => {
    // Buscar dados do usuário se necessário
    const registerData = localStorage.getItem('registerData');
    if (registerData) {
      const data = JSON.parse(registerData);
      setEmail(data.email || "");
      setName(data.name || "");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError("Elemento de cartão não encontrado");
      setLoading(false);
      return;
    }

    try {
      // 1. Criar Payment Intent no backend
      const setupResponse = await api.post("/stripe/create-payment-intent", {
        plan_id: planId,
        user_id: userId,
      });

      const { client_secret, customer_id } = setupResponse.data;

      if (!client_secret) {
        throw new Error("Client secret não retornado");
      }

      // 2. Criar Payment Method e anexar ao customer ANTES de confirmar
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: name,
          email: email,
          address: {
            postal_code: cep.replace(/\D/g, ''), // Remover formatação do CEP
            country: "BR",
          },
        },
      });

      if (pmError) {
        setError(pmError.message || "Erro ao criar método de pagamento");
        setLoading(false);
        return;
      }

      if (!paymentMethod) {
        setError("Erro ao criar método de pagamento");
        setLoading(false);
        return;
      }

      // 3. Anexar payment method ao customer
      try {
        await api.post("/stripe/attach-payment-method", {
          payment_method_id: paymentMethod.id,
          customer_id: customer_id,
        });
      } catch (attachError: any) {
        // Se já estiver anexado, continuar
        if (!attachError.response?.data?.detail?.includes("already")) {
          throw attachError;
        }
      }

      // 4. Confirmar pagamento com payment method já anexado
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        client_secret,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (confirmError) {
        setError(confirmError.message || "Erro ao processar pagamento");
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        // 5. Criar subscription no backend
        try {
          await api.post("/stripe/create-subscription", {
            plan_id: planId,
            user_id: userId,
            payment_intent_id: paymentIntent.id,
          });

          toast.success("Pagamento processado com sucesso!");
          // Chamar onSuccess apenas após tudo estar completo
          onSuccess();
        } catch (subError: any) {
          // Se a subscription falhar, mas o pagamento foi bem-sucedido, ainda chamar onSuccess
          // pois o pagamento já foi processado
          const subErrorMessage = subError.response?.data?.detail || subError.message;
          console.warn(`Subscription creation warning: ${subErrorMessage}`);
          toast.success("Pagamento processado! Finalizando assinatura...");
          onSuccess();
        }
      } else {
        setError("Pagamento não foi processado corretamente");
        setLoading(false);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || "Erro ao processar pagamento";
      setError(errorMessage);
      
      // Mensagens de erro específicas
      if (errorMessage.includes("card_declined")) {
        setError("Cartão recusado. Verifique os dados ou entre em contato com o banco emissor.");
      } else if (errorMessage.includes("insufficient_funds")) {
        setError("Saldo insuficiente. Verifique o saldo do cartão.");
      } else if (errorMessage.includes("expired_card")) {
        setError("Cartão expirado. Use um cartão válido.");
      } else if (errorMessage.includes("incorrect_cvc")) {
        setError("Código de segurança incorreto. Verifique o CVC do cartão.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          className="w-full"
        />
      </div>

      {/* Card Information */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Informações do Cartão
        </Label>
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
              hidePostalCode: true, // Não mostrar campo de CEP no CardElement
            }}
          />
        </div>
      </div>

      {/* Name on Card */}
      <div>
        <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nome no Cartão
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome completo"
          required
          className="w-full"
        />
      </div>

      {/* CEP (Brazilian Postal Code) */}
      <div>
        <Label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-2">
          CEP
        </Label>
        <Input
          id="cep"
          type="text"
          value={cep}
          placeholder="00000-000"
          maxLength={9}
          pattern="[0-9]{5}-[0-9]{3}"
          className="w-full"
          onChange={(e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 5) {
              setCep(value);
            } else if (value.length <= 8) {
              setCep(value.slice(0, 5) + '-' + value.slice(5, 8));
            } else {
              setCep(value.slice(0, 5) + '-' + value.slice(5, 8));
            }
          }}
          required
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-red-800 font-medium mb-1">Erro no pagamento</p>
            <p className="text-red-700 text-sm">{error}</p>
            <div className="mt-3 text-sm text-red-700">
              <p className="font-medium mb-1">Soluções possíveis:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Verifique os dados do cartão</li>
                <li>Tente novamente em alguns instantes</li>
                <li>Entre em contato com o banco emissor</li>
                <li>Use outro método de pagamento</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading || !stripe}
          className="flex-1 bg-gray-900 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            "Processando..."
          ) : (
            <>
              Pagar
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </>
          )}
        </Button>
        <Button
          type="button"
          onClick={onClose}
          variant="outline"
          className="px-6"
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Seu pagamento é processado de forma segura pelo Stripe.
        Não armazenamos dados do seu cartão.
      </p>
    </form>
  );
}

// Componente principal do modal
export default function PaymentModal({
  planId,
  userId,
  onSuccess,
  onClose,
}: PaymentModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Finalizar Assinatura
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Plano {PLAN_NAMES[planId] || planId}
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {PLAN_PRICES[planId] || "R$ 0,00"}
                <span className="text-sm font-normal text-gray-600">/mês</span>
              </p>
            </div>
          </div>

          <Elements stripe={stripePromise}>
            <PaymentForm
              planId={planId}
              userId={userId}
              onSuccess={onSuccess}
              onClose={onClose}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
}
