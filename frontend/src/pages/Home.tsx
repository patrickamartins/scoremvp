import { useState } from 'react';
import axios from 'axios';


// Adiciona Jakarta Sans globalmente via classe ou style inline
const jakartaFont = { fontFamily: 'Jakarta Sans, sans-serif' };

export default function Home() {
  const [form, setForm] = useState({ nome: '', email: '', whatsapp: '' });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const API_URL = import.meta.env.VITE_API_URL;
  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    await axios.post(`${API_URL}/leads/`, form);  // <- use o URL completo
    setSuccess(true);
    setForm({ nome: '', email: '', whatsapp: '' });
  } catch (err) {
    alert('Erro ao enviar. Tente novamente.');
    console.error('Erro ao enviar lead:', err);
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
        <img src="/images/logo-score.png" alt="ScoreMVP Logo" className="w-20 md:w-28 mx-auto mb-6 mt-2" />
        {/* Título e descrição */}
        <h1 className="text-[28px] font-extrabold text-white text-center mb-4 drop-shadow">Controle seu jogo!</h1>
        <h2 className="text-[18px] text-white text-center max-w-xl mb-8 font-medium drop-shadow">
          Com o ScoreMVP você registra suas estatísticas de forma simples
          com apenas um clique e ainda pode fazer acompanhamento de
          evolução com gráficos, além de baixar seus dados para um PDF
          e utilizar onde e como quiser.
        </h2>
        {/* Formulário de lead */}
        <h3 className="text-white text-base md:text-lg font-bold mb-3 text-center">Seja avisado quando fizermos o lançamento</h3>
        <div style={{ marginTop: 25, width: '100%' }} className="flex justify-center w-full">
        {success ? (
          <div className="flex flex-col items-center w-full max-w-md mb-8">
            <div className="bg-green-500 text-white font-bold rounded-[5px] px-6 py-4 text-base text-center shadow-lg mb-4">
              Cadastro realizado com sucesso! Você será avisado no lançamento.<br />
              <span className="text-white font-normal text-sm block mt-2">Enquanto isso, siga a gente nas redes sociais: <span className="font-bold">@scoremvp</span></span>
            </div>
          </div>
        ) : (
          <form className="flex flex-col md:flex-row gap-3 w-full max-w-md mb-8 justify-center items-center" onSubmit={handleSubmit} style={{maxWidth: 400}}>
            <input
              type="text"
              name="nome"
              placeholder="Seu nome"
              value={form.nome}
              onChange={handleChange}
              className="flex-1 min-w-[200px] rounded-[7px] px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-sm"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Seu email"
              value={form.email}
              onChange={handleChange}
              className="flex-1 min-w-[220px] rounded-[7px] px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-sm"
              required
            />
            <input
              type="text"
              name="whatsapp"
              placeholder="Whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              className="flex-1 min-w-[180px] rounded-[7px] px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-sm"
              required
            />
            <button
              type="submit"
              className="rounded-[10px] px-6 py-2 text-white font-bold text-base whitespace-nowrap transition"
              style={{ backgroundColor: 'rgb(208, 87, 41)' }}
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'QUERO SER AVISADO'}
            </button>
          </form>
        )}
        </div>
      </div>
      {/* Imagem do dashboard exemplo fixa no rodapé, ocupando 100vw */}
      <div className="w-full flex justify-center fixed left-0 bottom-0 z-20" style={{margin: 0, padding: 0, height: 'auto'}}>
        <img src="/images/dash-exemplo.png" alt="Dashboard exemplo" className="object-contain" style={{display: 'block', margin: 0, padding: 0, borderRadius: 0, height: 'auto', width: '62.5%'}} />
      </div>
    </div>
  );
} 