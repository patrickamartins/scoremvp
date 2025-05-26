import { useState } from 'react';
import axios from 'axios';

// Adiciona Jakarta Sans globalmente via classe ou style inline
const jakartaFont = { fontFamily: 'Jakarta Sans, sans-serif' };

export function Home() {
  const [form, setForm] = useState({ nome: '', email: '', whatsapp: '' });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/leads', form);
      setSuccess(true);
      setForm({ nome: '', email: '', whatsapp: '' });
    } catch {
      alert('Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen bg-[#0D121F] relative overflow-hidden flex flex-col" style={jakartaFont}>
      {/* BG header-home com opacidade */}
      <div className="absolute inset-0 z-0">
        <img src="/images/header-home.png" alt="header" className="w-full h-full object-cover opacity-15" style={{background: '#0D121F'}} />
        {/* Elipse superior direita */}
        <div style={{position: 'absolute', top: '-20%', right: '-20%', width: '60vw', height: '60vw', border: '36px solid rgba(255,255,255,0.05)', borderRadius: '50%', zIndex: 1}} />
        {/* Elipse inferior esquerda */}
        <div style={{position: 'absolute', bottom: '-25%', left: '-15%', width: '80vw', height: '40vw', border: '36px solid rgba(255,255,255,0.05)', borderRadius: '50%', zIndex: 1}} />
      </div>
      <div className="relative z-10 flex flex-col items-center pt-10 pb-8 px-4 h-full w-full">
        {/* Logo centralizado */}
        <img src="/images/logo-score.png" alt="ScoreMVP Logo" className="w-32 md:w-40 mx-auto mb-10 mt-2" />
        {/* Título e descrição */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-8 drop-shadow">Controle seu jogo!</h1>
        <h2 className="text-lg md:text-2xl text-white text-center max-w-2xl mb-12 font-medium drop-shadow">
          Com o ScoreMVP você registra suas estatísticas de forma simples
          com apenas um clique e ainda pode fazer acompanhamento de
          evolução com gráficos, além de baixar seus dados para um PDF
          e utilizar onde e como quiser.
        </h2>
        {/* Formulário de lead */}
        <h3 className="text-white text-lg md:text-xl font-bold mb-3 text-center">Seja avisado quando fizermos o lançamento</h3>
        {success ? (
          <div className="flex flex-col items-center w-full max-w-2xl mb-10">
            <div className="bg-green-500 text-white font-bold rounded-[10px] px-6 py-4 text-lg text-center shadow-lg mb-4">
              Cadastro realizado com sucesso! Você será avisado no lançamento.<br />
              <span className="text-white font-normal text-base block mt-2">Enquanto isso, siga a gente nas redes sociais: <span className="font-bold">@scoremvp</span></span>
            </div>
            <button
              className="text-green-700 underline font-medium"
              onClick={() => setSuccess(false)}
              type="button"
            >
              Cadastrar outro email
            </button>
          </div>
        ) : (
          <form className="flex flex-row gap-3 w-full max-w-2xl mb-10 justify-center items-center" onSubmit={handleSubmit} style={{maxWidth: 900}}>
            <input
              type="text"
              name="nome"
              placeholder="Seu nome"
              value={form.nome}
              onChange={handleChange}
              className="flex-1 min-w-[160px] rounded-[10px] px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Seu email"
              value={form.email}
              onChange={handleChange}
              className="flex-1 min-w-[180px] rounded-[10px] px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="text"
              name="whatsapp"
              placeholder="Whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              className="flex-1 min-w-[140px] rounded-[10px] px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              className="rounded-[10px] px-8 py-2 bg-green-500 text-white font-bold text-base whitespace-nowrap hover:bg-green-600 transition"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'QUERO SER AVISADO'}
            </button>
          </form>
        )}
      </div>
      {/* Imagem do dashboard exemplo fixa no rodapé, ocupando 100vw */}
      <div className="w-screen h-[500px] rounded-t-[10px] overflow-hidden shadow-xl bg-white/0 backdrop-blur-sm fixed left-0 bottom-0 z-20 flex items-center justify-center">
        <img src="/images/dash-exemplo.png" alt="Dashboard exemplo" className="w-full h-full object-contain rounded-t-[10px] mx-auto" />
      </div>
    </div>
  );
} 