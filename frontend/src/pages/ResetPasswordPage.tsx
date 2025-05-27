import React, { useState } from "react";
import { Card, Button, Input } from "../components/ui";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast } from "sonner";
import { resetPassword } from "../services/api";

const ResetPasswordPage: React.FC = () => {
  usePageTitle("Redefinir Senha");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (!token) {
      toast.error("Token inválido");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, newPassword);
      toast.success("Senha redefinida com sucesso!");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao redefinir senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-lg">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-eerieblack text-center">Redefinir Senha</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha"
                  className="rounded-full bg-[#f3f4f6] border border-gray-300 px-4 py-2"
                  required
                />
              </div>
              <div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmar nova senha"
                  className="rounded-full bg-[#f3f4f6] border border-gray-300 px-4 py-2"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Redefinindo..." : "Redefinir Senha"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
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

export default ResetPasswordPage; 