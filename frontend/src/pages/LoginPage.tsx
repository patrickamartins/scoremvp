import React, { useEffect } from "react";
import { Card, Button, Input, Label } from "../components/ui";
import { Link } from "react-router-dom";

const LoginPage: React.FC = () => {
  useEffect(() => {
    document.title = "ScoreMVP | Seu jogo sob controle";
  }, []);

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
              <form className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" name="password" type="password" required />
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