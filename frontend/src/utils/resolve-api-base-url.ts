const PRODUCTION_FALLBACK = 'https://scoremvpback-production.up.railway.app/api';
const LOCAL_FALLBACK = 'http://localhost:8000/api';

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, '');
}

export function resolveApiBaseUrl(): string {
  // Debug: verificar o que está disponível
  const envUrl = import.meta.env.VITE_API_URL;
  console.log('[API] import.meta.env.VITE_API_URL:', envUrl);
  console.log('[API] typeof envUrl:', typeof envUrl);
  console.log('[API] envUrl?.trim():', envUrl?.trim());
  
  // Prioridade 1: Variável de ambiente (sempre tem prioridade)
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const trimmedUrl = envUrl.trim();
    console.log('[API] Usando URL da variável de ambiente:', trimmedUrl);
    return trimTrailingSlash(trimmedUrl);
  }

  // Prioridade 2: Detectar ambiente baseado no hostname
  if (typeof window !== 'undefined' && window.location) {
    const { origin, hostname } = window.location;
    console.log('[API] Hostname detectado:', hostname, 'Origin:', origin);
    
    // Se for localhost, usar local
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
      console.log('[API] Ambiente local detectado, usando:', LOCAL_FALLBACK);
      return LOCAL_FALLBACK;
    }
    
    // Se for domínio de produção, usar backend de produção
    if (hostname.includes('scoremvp.com.br') || 
        hostname.includes('railway.app') || 
        hostname.includes('scoremvp.com') ||
        hostname.includes('scoremvp-frontend')) {
      console.log('[API] Ambiente de produção detectado, usando:', PRODUCTION_FALLBACK);
      return PRODUCTION_FALLBACK;
    }
    
    // Para outros domínios, tentar usar a origin + /api
    if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      const apiUrl = `${trimTrailingSlash(origin)}/api`;
      console.log('[API] Usando origin + /api:', apiUrl);
      return apiUrl;
    }
  }

  // Fallback final: produção
  console.log('[API] Usando fallback de produção:', PRODUCTION_FALLBACK);
  return PRODUCTION_FALLBACK;
}

