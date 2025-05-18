import React from "react";
import '../components/ui';
import { Card } from '../components/ui';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <Card className="flex-1 flex flex-col items-center justify-center">
          <div className="text-lg font-semibold mb-2">EXP Evolution</div>
          {/* Gráfico de linha fake */}
          <div className="w-full h-32 bg-powderblue rounded-lg flex items-center justify-center text-eerieblack/40">[Line Chart]</div>
        </Card>
        <Card className="w-64 flex flex-col items-center justify-center">
          <div className="text-lg font-semibold mb-2">Profile</div>
          <div className="w-16 h-16 rounded-full bg-powderblue mb-2" />
          <div className="font-bold">Usuário</div>
          <div className="text-xs text-eerieblack/60 mb-2">user@email.com</div>
          <button className="text-persimoon text-xs hover:underline">Edit Profile</button>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="font-semibold mb-2">Minhas Notas</div>
          {/* Gráfico de barras fake */}
          <div className="w-full h-24 bg-lion rounded-lg flex items-center justify-center text-eerieblack/40">[Bar Chart]</div>
        </Card>
        <Card>
          <div className="font-semibold mb-2">Conquistas</div>
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-full bg-persimoon" />
            <div className="w-10 h-10 rounded-full bg-powderblue" />
            <div className="w-10 h-10 rounded-full bg-lion" />
          </div>
        </Card>
        <Card>
          <div className="font-semibold mb-2">Média Geral</div>
          <div className="text-3xl font-bold text-persimoon">7.5</div>
          <div className="text-xs text-eerieblack/60">+30% desde o mês passado</div>
        </Card>
      </div>
      <div className="bg-alabaster rounded-xl shadow p-4 mt-8">
        <div className="font-semibold mb-2">Médias e Notas</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-eerieblack/70">
                <th className="px-2 py-1 text-left">Certificação</th>
                <th className="px-2 py-1 text-left">Nota média</th>
                <th className="px-2 py-1 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 py-1">Web design</td>
                <td className="px-2 py-1">7.4</td>
                <td className="px-2 py-1">Cursando</td>
              </tr>
              <tr>
                <td className="px-2 py-1">Front-end básico 1</td>
                <td className="px-2 py-1">7.2</td>
                <td className="px-2 py-1">Cursando</td>
              </tr>
              <tr>
                <td className="px-2 py-1">Front-end básico 2</td>
                <td className="px-2 py-1">7.6</td>
                <td className="px-2 py-1 text-lion">Não iniciada</td>
              </tr>
              <tr>
                <td className="px-2 py-1">Wordpress e componentes</td>
                <td className="px-2 py-1">8.2</td>
                <td className="px-2 py-1 text-lion">Não iniciada</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 