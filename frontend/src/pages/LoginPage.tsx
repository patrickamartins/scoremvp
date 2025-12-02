import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { login, setAuthToken } from "../services/api";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast } from "sonner";
import { ForgotPasswordModal } from "../components/ui/ForgotPasswordModal";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store";

export default function LoginPage() {
  usePageTitle("Login");
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setUser = useAuthStore(state => state.setUser);

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
        if (remember) {
          localStorage.setItem("remember", "true");
        }
        setAuthToken(response.data.access_token);
        
        // Salvar usuário no store
        if (response.data.user) {
          setUser({
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            role: response.data.user.role,
            plan: response.data.user.plan,
            token: response.data.access_token,
          });
        }
        
        toast.success("Login realizado com sucesso!");
        // Redirecionar baseado no role: player e MVP vão para /perfil, outros para /dashboard
        const userRole = response.data.user?.role;
        const redirectPath = (userRole === 'player' || response.data.user?.plan === 'pro') ? '/perfil' : '/dashboard';
        navigate(redirectPath);
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
    <div className="min-h-screen flex bg-gray-50">
      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
      
      {/* Lado esquerdo: Formulário */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img src="/images/logo-score.png" alt="ScoreMVP" className="h-12" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Controle seus dados, domine seu jogo!
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Faça login para acessar sua quadra digital e acompanhar suas estatísticas.
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                Lembrar de mim
              </label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Esqueci a senha
              </button>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Login"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Ainda não tem uma conta?{" "}
              <Link to="/register" className="text-purple-600 hover:text-purple-700 font-medium">
                Criar Conta
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Lado direito: Ilustração */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-100 to-indigo-100 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mb-6">
            {/* Ilustração placeholder - você pode substituir por uma imagem real */}
            <div className="w-full h-64 bg-white rounded-lg shadow-lg flex items-center justify-center">
              <p className="text-gray-400">Ilustração</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 bg-gray-800 text-white py-4 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex gap-4 mb-2 md:mb-0">
            <Link to="/privacy" className="hover:text-gray-300">Política de Privacidade</Link>
            <span className="text-gray-600">|</span>
            <Link to="/terms" className="hover:text-gray-300">Termos e Condições</Link>
            <span className="text-gray-600">|</span>
            <Link to="/support" className="hover:text-gray-300">Suporte</Link>
            <span className="text-gray-600">|</span>
            <Link to="/features" className="hover:text-gray-300">Funcionalidades</Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">© Copyright ScoreMVP 2025</span>
            <div className="flex gap-3">
              <a href="#" className="hover:text-gray-300">f</a>
              <a href="#" className="hover:text-gray-300">t</a>
              <a href="#" className="hover:text-gray-300">i</a>
              <a href="#" className="hover:text-gray-300">in</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
