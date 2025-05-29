import { useEffect, useState } from 'react';
import { Card } from "../components/ui/Card";
import { usePageTitle } from "../hooks/usePageTitle";

export default function DashboardPage() {
  usePageTitle("Dashboard");
  // Dados zerados
  return (
    <div className="p-8 mt-16 text-center text-gray-400">
      Nenhum dado disponível no momento.
    </div>
  );
} 