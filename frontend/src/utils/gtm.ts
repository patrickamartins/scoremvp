// Declaração do tipo para o objeto window
declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Inicializa o dataLayer se não existir
window.dataLayer = window.dataLayer || [];

// Função para enviar eventos para o GTM
export const sendToGTM = (event: string, data?: any) => {
  window.dataLayer.push({
    event,
    ...data
  });
};

// Função para inicializar o GTM
export const initGTM = () => {
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  });
};

// Inicializa o GTM quando o arquivo é carregado
initGTM(); 