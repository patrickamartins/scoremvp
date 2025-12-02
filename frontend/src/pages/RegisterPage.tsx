import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Button, Input, Label } from '../components/ui';
import { usePageTitle } from "../hooks/usePageTitle";
import { api, signup } from "../services/api";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const RegisterPage: React.FC = () => {
  usePageTitle("Cadastro");
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    accountType: 'CPF' as 'CPF' | 'CNPJ',
    number: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Função para aplicar máscara de CPF/CNPJ
  const applyMask = (value: string, type: 'CPF' | 'CNPJ'): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    if (type === 'CPF') {
      // CPF: 000.000.000-00 (máximo 11 dígitos)
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
      if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    } else {
      // CNPJ: 00.000.000/0000-00 (máximo 14 dígitos)
      if (numbers.length <= 2) return numbers;
      if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
      if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
      if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await api.get(`/auth/check-email/${encodeURIComponent(email)}`);
      return response.data?.exists || false;
    } catch (error: any) {
      // Se der erro, assumir que não existe para não bloquear o registro
      return false;
    }
  };

  const checkCpfExists = async (cpf: string): Promise<boolean> => {
    try {
      const response = await api.get(`/auth/check-cpf/${encodeURIComponent(cpf)}`);
      return response.data?.exists || false;
    } catch (error: any) {
      // Se der erro, assumir que não existe para não bloquear o registro
      return false;
    }
  };

  const validateForm = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.number) {
      newErrors.number = 'Número é obrigatório';
    } else {
      // Validar tamanho mínimo
      const cleanNumber = formData.number.replace(/\D/g, '');
      if (formData.accountType === 'CPF' && cleanNumber.length !== 11) {
        newErrors.number = 'CPF deve ter 11 dígitos';
      } else if (formData.accountType === 'CNPJ' && cleanNumber.length !== 14) {
        newErrors.number = 'CNPJ deve ter 14 dígitos';
      }
    }
    
    if (!formData.name) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    } else {
      // Verificar se email já existe
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        newErrors.email = 'Este email já está cadastrado. Faça login ou recupere sua senha.';
      }
    }
    
    // Verificar se CPF/CNPJ já existe
    if (formData.number) {
      const cleanNumber = formData.number.replace(/\D/g, '');
      if ((formData.accountType === 'CPF' && cleanNumber.length === 11) || 
          (formData.accountType === 'CNPJ' && cleanNumber.length === 14)) {
        const cpfExists = await checkCpfExists(cleanNumber);
        if (cpfExists) {
          newErrors.number = 'Este CPF/CNPJ já está cadastrado. Faça login ou recupere sua senha.';
        }
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Você precisa aceitar os termos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    // Aplicar máscara se for o campo de número
    if (field === 'number') {
      // Limitar o tamanho baseado no tipo
      const numbers = value.replace(/\D/g, '');
      const maxLength = formData.accountType === 'CPF' ? 11 : 14;
      if (numbers.length > maxLength) {
        value = numbers.slice(0, maxLength);
      }
      value = applyMask(value, formData.accountType);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    const isValid = await validateForm();
    if (!isValid) {
      toast.error("Por favor, corrija os erros no formulário");
      setLoading(false);
      return;
    }
    
    try {
      // Remover máscara do CPF/CNPJ antes de enviar
      const cleanNumber = formData.number.replace(/\D/g, '');
      
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        cpf: cleanNumber, // Enviar CPF/CNPJ limpo
      });
      
      if (response.data) {
        toast.success("Conta criada com sucesso! Redirecionando para escolha de plano...");
        // Salvar dados temporários para o próximo step (incluindo senha para login automático)
        localStorage.setItem('registerData', JSON.stringify({
          userId: response.data.id,
          email: formData.email,
          name: formData.name,
          password: formData.password, // Salvar senha temporariamente para login automático
        }));
        navigate('/register/plan');
      }
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      toast.error(detail || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Lado esquerdo: Formulário */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img src="/images/logo-score.png" alt="ScoreMVP" className="h-12" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Criar Conta</h1>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tipo de conta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Conta
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accountType"
                    value="CPF"
                    checked={formData.accountType === 'CPF'}
                    onChange={(e) => {
                      handleChange('accountType', e.target.value);
                      // Limpar e reaplicar máscara quando trocar o tipo
                      if (formData.number) {
                        const numbers = formData.number.replace(/\D/g, '');
                        handleChange('number', numbers);
                      }
                    }}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">CPF</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accountType"
                    value="CNPJ"
                    checked={formData.accountType === 'CNPJ'}
                    onChange={(e) => {
                      handleChange('accountType', e.target.value);
                      // Limpar e reaplicar máscara quando trocar o tipo
                      if (formData.number) {
                        const numbers = formData.number.replace(/\D/g, '');
                        handleChange('number', numbers);
                      }
                    }}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">CNPJ</span>
                </label>
              </div>
            </div>
            
            {/* Número CPF/CNPJ */}
            <div>
              <Label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
                Número
              </Label>
              <Input
                id="number"
                name="number"
                type="text"
                value={formData.number}
                onChange={(e) => handleChange('number', e.target.value)}
                placeholder={formData.accountType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
                maxLength={formData.accountType === 'CPF' ? 14 : 18}
                className={`w-full bg-gray-50 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.number ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
            </div>
            
            {/* Nome */}
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Seu nome completo"
                className={`w-full bg-gray-50 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            {/* Email */}
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="example@gmail.com"
                className={`w-full bg-gray-50 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            {/* Senha */}
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-gray-50 border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            
            {/* Confirmar Senha */}
            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-gray-50 border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            
            {/* Termos */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-600">
                  Para criar a conta você precisa aceitar os{" "}
                  <Link to="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
                    termos de uso
                  </Link>{" "}
                  e a{" "}
                  <Link to="/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
                    política de privacidade
                  </Link>
                  .
                </span>
              </label>
              {errors.acceptTerms && <p className="text-red-500 text-xs mt-1">{errors.acceptTerms}</p>}
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já possui uma conta?{" "}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Lado direito: Ilustração */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-100 to-indigo-100 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-full h-96 bg-white rounded-lg shadow-lg flex items-center justify-center">
            <p className="text-gray-400">Ilustração</p>
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
};

export default RegisterPage;
