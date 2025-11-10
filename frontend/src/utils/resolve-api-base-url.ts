const PRODUCTION_FALLBACK = 'https://scoremvpback-production.up.railway.app/api';
const LOCAL_FALLBACK = 'http://localhost:8000/api';

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, '');
}

export function resolveApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL ?? '').trim();
  if (envUrl) {
    return trimTrailingSlash(envUrl);
  }

  if (typeof window !== 'undefined' && window.location) {
    const { origin, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return LOCAL_FALLBACK;
    }
    if (origin) {
      return `${trimTrailingSlash(origin)}/api`;
    }
  }

  return PRODUCTION_FALLBACK;
}

