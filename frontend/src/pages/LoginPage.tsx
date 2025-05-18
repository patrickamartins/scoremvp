import React, { useEffect, useState } from "react";
import { Card, Button, Input, Label } from "../components/ui";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "ScoreMVP | Seu jogo sob controle";
  }, []);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600">
      <div className="flex w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Lado esquerdo: mensagem */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-purple-700 to-indigo-700 text-white p-10">
          <h2 className="text-3xl font-bold mb-4 text-center">Bem-vindo ao ScoreMVP</h2>
          <p className="text-lg text-center">Faça seu login para controlar seu jogo.</p>
        </div>
        {/* Lado direito: formulário */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-eerieblack text-center">Entrar</h2>
              {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username">Usuário</Label>
                  <Input 
                    id="username" 
                    name="username" 
                    type="text" 
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                    placeholder="Seu usuário" 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required 
                  />
                </div>
                <Button type="submit" className="w-full mt-2">Entrar</Button>
              </form>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{" "}
                  <Link to="/register" className="text-primary hover:underline">
                    Registre-se
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