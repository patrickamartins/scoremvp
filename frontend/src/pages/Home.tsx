export default function Home() {
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
          onSubmit={e => e.preventDefault()}
        >
          <div className="flex flex-col md:flex-row flex-1 items-stretch md:items-center w-full h-full">
            <input
              type="text"
              placeholder="Nome"
              className="w-full md:flex-1 px-6 h-[48px] md:h-[48px] bg-transparent text-[#1D2130] placeholder-[#B0B0B0] font-medium outline-none border-none rounded-t-[8px] md:rounded-t-none md:rounded-l-[8px] text-base"
              style={{ minWidth: 0 }}
            />
            {/* Diagonal divider */}
            <div className="hidden md:block w-[1px] h-10 bg-[#F4F4F4] rotate-12 mx-0" style={{ transform: 'skew(-20deg)' }} />
            <input
              type="email"
              placeholder="Email"
              className="w-full md:flex-1 px-6 h-[48px] md:h-[48px] bg-transparent text-[#1D2130] placeholder-[#B0B0B0] font-medium outline-none border-none text-base"
              style={{ minWidth: 0 }}
            />
            <div className="hidden md:block w-[1px] h-10 bg-[#F4F4F4] rotate-12 mx-0" style={{ transform: 'skew(-20deg)' }} />
            <input
              type="text"
              placeholder="Whatsapp"
              className="w-full md:flex-1 px-6 h-[48px] md:h-[48px] bg-transparent text-[#1D2130] placeholder-[#B0B0B0] font-medium outline-none border-none rounded-b-[8px] md:rounded-b-none md:rounded-r-[8px] text-base"
              style={{ minWidth: 0 }}
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto h-[48px] mt-4 md:mt-0 md:ml-4 md:mr-4 px-8 bg-[#1D2130] text-white font-bold rounded-[8px] transition hover:bg-[#23263a] text-base whitespace-nowrap shadow"
            style={{ alignSelf: 'center' }}
          >
            QUERO SER AVISADO
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