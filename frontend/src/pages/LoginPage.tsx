import React, { useState } from "react";
import { Card, Button, Input } from "../components/ui";
import { Link, useNavigate } from "react-router-dom";
import { login, setAuthToken } from "../services/api";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast } from "sonner";

export default function LoginPage() {
  usePageTitle("Login");
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('LoginPage handleSubmit chamado');
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const form = new URLSearchParams();
      form.append('username', email);
      form.append('password', password);

      const response = await login(form);
      if (response.data && response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        setAuthToken(response.data.access_token);
        toast.success("Login realizado com sucesso!");
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      const detail = error.response?.data?.detail;
      setError(
        Array.isArray(detail)
          ? detail.map((d: any) => d.msg).join('; ')
          : detail || 'Erro no login'
      );
      toast.error("Erro ao realizar login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-lg">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-eerieblack text-center">Login</h2>
            {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Email"
                />
              </div>
              <div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="Senha"
                  className="rounded-full bg-[#f3f4f6] border border-gray-300 px-4 py-2"
                  required
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="rounded" />
                  Lembrar de mim
                </label>
                <Link to="/forgot-password" className="text-persimoon hover:underline">Esqueceu a senha?</Link>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Novo por aqui?{' '}
                <Link to="/register" className="text-persimoon hover:underline">
                  Crie uma conta
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 