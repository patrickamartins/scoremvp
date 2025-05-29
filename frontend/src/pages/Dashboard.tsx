import { useEffect, useState } from 'react';
import { Card } from "../components/ui/Card";
import { usePageTitle } from "../hooks/usePageTitle";

export default function DashboardPage() {
  usePageTitle("Dashboard");
  // Dados de amostra
  const sampleData = {
    jogos: 12,
    jogadoras: 28,
    pontos: 340,
    assistencias: 120,
    rebotes: 210,
    faltas: 45,
  };
  return (
    <div className="p-8 mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6 text-center">
        <div className="text-4xl font-bold text-blue-600">{sampleData.jogos}</div>
        <div className="text-gray-500 mt-2">Jogos</div>
      </Card>
      <Card className="p-6 text-center">
        <div className="text-4xl font-bold text-green-600">{sampleData.jogadoras}</div>
        <div className="text-gray-500 mt-2">Jogadoras</div>
      </Card>
      <Card className="p-6 text-center">
        <div className="text-4xl font-bold text-yellow-600">{sampleData.pontos}</div>
        <div className="text-gray-500 mt-2">Pontos</div>
      </Card>
      <Card className="p-6 text-center">
        <div className="text-4xl font-bold text-purple-600">{sampleData.assistencias}</div>
        <div className="text-gray-500 mt-2">Assistências</div>
      </Card>
      <Card className="p-6 text-center">
        <div className="text-4xl font-bold text-pink-600">{sampleData.rebotes}</div>
        <div className="text-gray-500 mt-2">Rebotes</div>
      </Card>
      <Card className="p-6 text-center">
        <div className="text-4xl font-bold text-red-600">{sampleData.faltas}</div>
        <div className="text-gray-500 mt-2">Faltas</div>
      </Card>
    </div>
  );
} 