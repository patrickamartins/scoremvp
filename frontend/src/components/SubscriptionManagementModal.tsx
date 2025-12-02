import React from 'react';
import { X, CreditCard, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface SubscriptionInfo {
  plan?: string;
  status?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  card_last4?: string;
  card_brand?: string;
  customer_since?: string;
  subscribed_since?: string;
  next_billing?: string;
  last_payment?: string;
  amount?: number;
  can_upgrade_to?: string[];
  can_downgrade_to?: string[];
  has_subscription?: boolean;
}

interface SubscriptionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionDetails: SubscriptionInfo | null;
  loading?: boolean;
}

export function SubscriptionManagementModal({
  isOpen,
  onClose,
  subscriptionDetails,
  loading = false,
}: SubscriptionManagementModalProps) {
  if (!isOpen) return null;

  const planNames: Record<string, string> = {
    free: 'Player',
    pro: 'MVP',
    team: 'Team',
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCardBrand = (brand?: string) => {
    if (!brand) return '';
    const brands: Record<string, string> = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      amex: 'American Express',
      discover: 'Discover',
    };
    return brands[brand.toLowerCase()] || brand;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Assinatura</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-8">Carregando informações da assinatura...</div>
          ) : !subscriptionDetails || (subscriptionDetails.has_subscription === false) ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 mb-4">Você não possui uma assinatura ativa.</p>
              <Button onClick={onClose}>Fechar</Button>
            </div>
          ) : (
            <>
              {/* Plano Atual */}
              <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Plano Atual</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {planNames[subscriptionDetails.plan] || subscriptionDetails.plan.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 
                        className={subscriptionDetails.status === 'active' ? 'text-green-600' : 'text-gray-400'} 
                        size={20} 
                      />
                      <span className={`font-semibold ${
                        subscriptionDetails.status === 'active' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {subscriptionDetails.status === 'active' ? 'Ativa' : subscriptionDetails.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Informações da Assinatura */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="text-blue-600" size={20} />
                    <h3 className="font-semibold text-gray-900">Período de Cobrança</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    {subscriptionDetails.last_payment && (
                      <div>
                        <p className="text-gray-600">Última cobrança:</p>
                        <p className="font-medium">{formatDate(subscriptionDetails.last_payment)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600">Próxima cobrança:</p>
                      <p className="font-medium">{formatDate(subscriptionDetails.next_billing || subscriptionDetails.current_period_end)}</p>
                    </div>
                    {subscriptionDetails.amount && (
                      <div>
                        <p className="text-gray-600">Valor:</p>
                        <p className="font-medium text-lg">R$ {subscriptionDetails.amount.toFixed(2).replace('.', ',')}/mês</p>
                      </div>
                    )}
                    {(subscriptionDetails.customer_since || subscriptionDetails.subscribed_since) && (
                      <div>
                        <p className="text-gray-600">Assinante desde:</p>
                        <p className="font-medium">{formatDate(subscriptionDetails.subscribed_since || subscriptionDetails.customer_since)}</p>
                      </div>
                    )}
                  </div>
                </Card>

                {subscriptionDetails.card_last4 && (
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <CreditCard className="text-blue-600" size={20} />
                      <h3 className="font-semibold text-gray-900">Cartão de Crédito</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-600">Cartão:</p>
                        <p className="font-medium">
                          {formatCardBrand(subscriptionDetails.card_brand)} •••• {subscriptionDetails.card_last4}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
                {!subscriptionDetails.card_last4 && (
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <CreditCard className="text-gray-400" size={20} />
                      <h3 className="font-semibold text-gray-900">Cartão de Crédito</h3>
                    </div>
                    <div className="text-sm text-gray-500">
                      Nenhum cartão cadastrado
                    </div>
                  </Card>
                )}
              </div>

              {/* Ações */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                {!subscriptionDetails.card_last4 ? (
                  <Button className="w-full" variant="outline">
                    Adicionar Novo Cartão
                  </Button>
                ) : (
                  <>
                    <Button className="w-full" variant="outline">
                      Alterar Cartão
                    </Button>
                    <Button className="w-full" variant="outline" style={{ color: '#dc2626' }}>
                      Excluir Cartão
                    </Button>
                  </>
                )}
                {subscriptionDetails.can_upgrade_to && subscriptionDetails.can_upgrade_to.length > 0 && (
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Fazer Upgrade para {planNames[subscriptionDetails.can_upgrade_to[0]] || subscriptionDetails.can_upgrade_to[0].toUpperCase()}
                  </Button>
                )}
                {subscriptionDetails.can_downgrade_to && subscriptionDetails.can_downgrade_to.length > 0 && (
                  <Button className="w-full" variant="outline">
                    Fazer Downgrade para {planNames[subscriptionDetails.can_downgrade_to[0]] || subscriptionDetails.can_downgrade_to[0].toUpperCase()}
                  </Button>
                )}
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Cancelar Assinatura
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

