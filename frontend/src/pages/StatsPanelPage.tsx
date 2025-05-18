import React from "react";
import '../components/ui';
import { Card, Button } from '../components/ui';

const stats = [
  { label: "Jogos", value: 12 },
  { label: "Vitórias", value: 8 },
  { label: "Derrotas", value: 4 },
  { label: "Pontos", value: 320 },
  { label: "Assistências", value: 110 },
  { label: "Rebotes", value: 90 },
  { label: "Roubos", value: 25 },
  { label: "Faltas", value: 18 },
];

const StatsPanelPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex flex-col items-center justify-center py-6">
            <div className="text-2xl font-bold text-persimoon mb-1">{stat.value}</div>
            <div className="text-sm text-eerieblack/80">{stat.label}</div>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 mb-8">
        <Button variant="primary">Registrar Novo Jogo</Button>
        <Button variant="secondary">Registrar Estatística</Button>
        <Button variant="danger">Resetar Painel</Button>
      </div>
      <Card className="mt-8">
        <div className="font-semibold mb-2">Últimos Jogos</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-eerieblack/70">
                <th className="px-2 py-1 text-left">Data</th>
                <th className="px-2 py-1 text-left">Adversário</th>
                <th className="px-2 py-1 text-left">Pontos</th>
                <th className="px-2 py-1 text-left">Vitória?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 py-1">2024-05-10</td>
                <td className="px-2 py-1">Time A</td>
                <td className="px-2 py-1">28</td>
                <td className="px-2 py-1 text-persimoon font-bold">Sim</td>
              </tr>
              <tr>
                <td className="px-2 py-1">2024-05-03</td>
                <td className="px-2 py-1">Time B</td>
                <td className="px-2 py-1">22</td>
                <td className="px-2 py-1 text-eerieblack/60">Não</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StatsPanelPage; 