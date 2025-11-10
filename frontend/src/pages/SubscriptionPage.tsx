import React from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { Card } from '../components/ui/Card';

export default function SubscriptionPage() {
  usePageTitle("Assinaturas");

  return (
    <div className="w-full h-full">
      <div className="w-full">
        <h1 className="text-3xl font-bold text-[#2563eb] mb-6">Assinaturas</h1>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Gerenciar Assinaturas</h2>
          <p className="text-gray-600">
            Esta é a página de assinaturas. Aqui você pode gerenciar os planos e assinaturas dos usuários.
          </p>
        </Card>
      </div>
    </div>
  );
}

