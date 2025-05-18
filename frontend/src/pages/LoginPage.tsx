import React, { useEffect } from "react";
import { Card, Button, Input, Label } from "../components/ui";
import { Link } from "react-router-dom";

const LoginPage: React.FC = () => {
  useEffect(() => {
    document.title = "ScoreMVP | Seu jogo sob controle";
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-md mx-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-eerieblack text-center">Login</h2>
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
  );
};

export default LoginPage; 