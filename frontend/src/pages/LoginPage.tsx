import React, { useState } from "react";
import { Card, Button, Input } from "../components/ui";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import { usePageTitle } from "../hooks/usePageTitle";

const LoginPage: React.FC = () => {
  usePageTitle("Login");
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login({ username, password });
      const token = res.data.access_token;
      localStorage.setItem('token', token);
      navigate('/players');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        Array.isArray(detail)
          ? detail.map((d: any) => d.msg).join('; ')
          : detail || 'Erro no login'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Lado esquerdo: mensagem e arte */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-[#7b2ff2] to-[#f357a8] text-white p-10 relative">
          <h2 className="text-3xl font-bold mb-4 text-left w-full">ScoreMVP</h2>
          <h3 className="text-2xl font-bold mb-2 w-full">Faça login para controlar o seu jogo</h3>
          <p className="text-base opacity-80 w-full">Ou registre-se para começar a contabilizar sues números.</p>
          {/* Arte decorativa */}
          <svg className="absolute bottom-0 left-0 w-full h-32 opacity-30" viewBox="0 0 400 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,100 Q100,0 200,100 T400,100" stroke="#fff" strokeWidth="2" fill="none" />
          </svg>
        </div>
        {/* Lado direito: formulário */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <Card className="w-full max-w-md shadow-none border-0">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-eerieblack text-center">Login</h2>
              {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                    placeholder="Usuário ou email"
                    className="rounded-full bg-[#f3f4f6] border border-gray-300 px-4 py-2"
                    required
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
                  <Link to="/forgot" className="text-persimoon hover:underline">Esqueceu a senha?</Link>
                </div>
                <Button type="submit" className="w-full mt-2 rounded-full bg-gradient-to-r from-[#7b2ff2] to-[#f357a8] text-white font-bold text-lg shadow-none border-0 hover:opacity-90 transition">Entrar</Button>
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
    </div>
  );
};

export default LoginPage; 