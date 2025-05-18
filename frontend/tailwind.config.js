/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    colors: {
      alabaster: '#EBEBDF',
      powderblue: '#AAC4E7',
      persimoon: '#EB631B',
      lion: '#C19570',
      eerieblack: '#282119',
      background: '#EBEBDF', // para bg padrão
      foreground: '#222222', // ou a cor que desejar
      // adicione outras cores customizadas aqui se quiser usar como utilitárias
    },
    extend: {
      colors: {
        alabaster: '#EBEBDF',
        powderblue: '#AAC4E7',
        persimoon: '#EB631B',
        lion: '#C19570',
        eerieblack: '#282119',
        background: '#EBEBDF', // para bg padrão
      },
    },
  },
  plugins: [],
};