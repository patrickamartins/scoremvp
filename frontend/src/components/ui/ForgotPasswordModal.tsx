import React, { useState } from "react";
import { forgotPassword } from "../../services/auth";
import { Input } from "./Input";
import { Button } from "./Button";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ open, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await forgotPassword(email);
      setSuccess("Se o email estiver cadastrado, você receberá um link para redefinir sua senha.");
      setEmail("");
    } catch (err: any) {
      setError("Erro ao enviar email. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Redefinir senha</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
              Informe seu email cadastrado
            </label>
            <Input
              id="forgot-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Seu email"
              required
              className="w-full"
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">{success}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enviando..." : "Enviar link de redefinição"}
          </Button>
        </form>
      </div>
    </div>
  );
} 