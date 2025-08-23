import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Link } from "react-router-dom";
import { login, setAuthToken } from "../services/api";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast } from "sonner";
import { ForgotPasswordModal } from "../components/ui/ForgotPasswordModal";

export default function LoginPage() {
  usePageTitle("Login");
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
      <div className="w-full max-w-4xl flex rounded-2xl shadow-2xl overflow-hidden bg-white">
        {/* Lado esquerdo: mensagem de boas-vindas */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-purple-700 via-purple-500 to-indigo-500 p-10 text-white relative">
          <div className="absolute inset-0 opacity-20 pointer-events-none select-none" style={{background: 'url(/public/images/radial.svg) center/cover no-repeat'}} />
          <div className="relative z-10 text-left">
            <h2 className="text-3xl font-bold mb-4">Bem Vindo, Basqueteiro!</h2>
            <p className="text-lg font-medium">Faça o seu login para começar o controle do seu jogo, ou crie uma nova conta se ainda não for registrado.</p>
          </div>
        </div>
        {/* Lado direito: formulário de login */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Entrar</h2>
          {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="Email"
                className="bg-gray-100 border border-gray-300 px-4 py-2 rounded-full"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Senha"
                className="bg-gray-100 border border-gray-300 px-4 py-2 rounded-full"
                required
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="rounded" />
                Manter conectado
              </label>
              <button type="button" onClick={() => setForgotOpen(true)} className="text-purple-600 hover:underline font-medium bg-transparent border-none p-0 m-0 cursor-pointer">Esqueci a senha?</button>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-700 via-purple-500 to-indigo-500 text-white font-bold py-2 rounded-full shadow-md hover:from-purple-800 hover:to-indigo-600 transition-colors duration-200" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Novo por aqui?{' '}
              <Link to="/register" className="text-purple-600 hover:underline font-medium">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 