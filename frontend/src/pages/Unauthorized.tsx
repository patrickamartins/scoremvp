import React from 'react';

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Acesso negado</h1>
      <p>Você não tem permissão para acessar esta página.</p>
    </div>
  );
} 