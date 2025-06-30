import React, { useState } from "react";
import { api } from "../services/api";
import { toast } from "sonner";
import { PatternFormat } from 'react-number-format';

export default function Home() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: ''
  });
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Home handleSubmit chamado');
    e.preventDefault();
    
    if (!validateEmail(formData.email)) {
      setEmailError('Email inválido');
      return;
    }
    
    setLoading(true);

    try {
      await api.post('/leads', formData);
      
      // Sucesso - mostrar popup e limpar formulário
      toast.success("🎉 Cadastro realizado com sucesso!", {
        description: "Entraremos em contato em breve através do email ou WhatsApp informado.",
        duration: 5000,
      });
      
      // Limpar formulário
      setFormData({ nome: '', email: '', whatsapp: '' });
      setEmailError('');
      
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error);
      
      // Tratar erros específicos
      let errorMessage = "Erro ao realizar cadastro";
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        
        if (detail.includes("duplicate key value violates unique constraint") && detail.includes("leads_email_key")) {
          errorMessage = "❌ Este email já está cadastrado. Tente com outro email.";
        } else if (detail.includes("UniqueViolation")) {
          errorMessage = "❌ Este email já está cadastrado em nossa base de dados.";
        } else {
          errorMessage = `❌ ${detail}`;
        }
      }
      
      toast.error(errorMessage, {
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'email') {
      setEmailError(validateEmail(value) ? '' : 'Email inválido');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start bg-white" style={{ fontFamily: 'Roboto, sans-serif', minHeight: '100vh' }}>
      {/* Radial background */}
      <img
        src="/images/radial.svg"
        alt="Radial BG"
        className="pointer-events-none select-none absolute z-0"
        style={{
          left: 'calc(50% - 120px)',
          top: '120px',
          width: '900px',
          maxWidth: 'none',
          transform: 'translateX(-50%)',
        }}
        aria-hidden
      />
      <main className="relative z-10 flex flex-col items-center w-full" style={{ maxWidth: 1440, margin: '0 auto' }}>
        <h1 className="mt-24 text-5xl md:text-6xl font-bold text-[#1D2130] text-center mb-6">Controle seu jogo!</h1>
        <h3 className="text-lg md:text-1xl text-[#1D2130] text-center font-normal max-w-2xl mb-12">
          Com o <b>ScoreMVP</b>, você registra suas estatísticas de forma simples, com apenas um clique. Acompanhe sua evolução por meio de gráficos interativos e baixe seus dados em PDF para usar quando e como quiser.
        </h3>
        {/* Formulário */}
        <form
          className="relative flex flex-col md:flex-row items-center bg-white rounded-[8px] shadow-md w-full max-w-[1000px] px-0 py-0 mb-12 border border-[#F4F4F4] md:h-[72px]"
          style={{ boxShadow: '0 4px 32px 0 rgba(0,0,0,0.04)' }}
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col md:flex-row flex-1 items-stretch md:items-center w-full h-full">
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Nome"
              className="w-full md:flex-1 px-6 h-[48px] md:h-[48px] bg-transparent text-[#1D2130] placeholder-[#B0B0B0] font-medium outline-none border-none rounded-t-[8px] md:rounded-t-none md:rounded-l-[8px] text-base"
              style={{ minWidth: 0 }}
              required
            />
            {/* Diagonal divider */}
            <div className="hidden md:block w-[1px] h-10 bg-[#F4F4F4] rotate-12 mx-0" style={{ transform: 'skew(-20deg)' }} />
            <div className="relative w-full md:flex-1">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={`w-full px-6 h-[48px] md:h-[48px] bg-transparent text-[#1D2130] placeholder-[#B0B0B0] font-medium outline-none border-none text-base ${emailError ? 'border-red-500' : ''}`}
                style={{ minWidth: 0 }}
                required
              />
              {emailError && (
                <span className="absolute -bottom-6 left-0 text-red-500 text-sm">{emailError}</span>
              )}
            </div>
            <div className="hidden md:block w-[1px] h-10 bg-[#F4F4F4] rotate-12 mx-0" style={{ transform: 'skew(-20deg)' }} />
            <PatternFormat
              format="(##) #####-####"
              mask="_"
              type="text"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="Whatsapp"
              className="w-full md:flex-1 px-6 h-[48px] md:h-[48px] bg-transparent text-[#1D2130] placeholder-[#B0B0B0] font-medium outline-none border-none rounded-b-[8px] md:rounded-b-none md:rounded-r-[8px] text-base"
              style={{ minWidth: 0 }}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !!emailError}
            className="w-full md:w-auto h-[48px] mt-4 md:mt-0 md:ml-4 md:mr-4 px-8 bg-[#1D2130] text-white font-bold rounded-[8px] transition hover:bg-[#23263a] text-base whitespace-nowrap shadow disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ alignSelf: 'center' }}
          >
            {loading ? "ENVIANDO..." : "QUERO SER AVISADO"}
          </button>
        </form>
        {/* Dashboard image */}
        <img
          src="/images/dashboard.png"
          alt="Dashboard Preview"
          className="w-full max-w-4xl rounded-xl shadow-lg border border-[#F4F4F4]"
          style={{ marginBottom: 48 }}
        />
      </main>
    </div>
  );
} 