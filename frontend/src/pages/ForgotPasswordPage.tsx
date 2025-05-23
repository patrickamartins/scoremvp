import React, { useState } from "react";
import { Card, Button, Input } from "../components/ui";
import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast } from "sonner";
import { forgotPassword } from "../services/api";

const ForgotPasswordPage: React.FC = () => {
  usePageTitle("Recuperar Senha");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      toast.success("Email de recuperação enviado com sucesso!");
      setEmail("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao enviar email de recuperação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-lg">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-eerieblack text-center">Recuperar Senha</h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Digite seu email para receber as instruções de recuperação de senha.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu email"
                  className="rounded-full bg-[#f3f4f6] border border-gray-300 px-4 py-2"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Email"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Lembrou sua senha?{' '}
                <Link to="/login" className="text-persimoon hover:underline">
                  Voltar para o login
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 