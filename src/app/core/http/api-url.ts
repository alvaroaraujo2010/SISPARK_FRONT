import { environment } from '../../../environments/environment';

/** Normaliza pathname para peticiones relativas o absolutas del navegador. */
export function getRequestPathname(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }

  return url.startsWith('/') ? url : `/${url}`;
}

/** Indica si la peticion va al API configurado (mismo prefijo que apiBaseUrl). */
export function isAppApiRequest(url: string): boolean {
  const pathname = getRequestPathname(url);
  const root = environment.apiBaseUrl.replace(/\/$/, '');
  return pathname === root || pathname.startsWith(`${root}/`);
}

export function isAuthLoginRequest(url: string): boolean {
  return getRequestPathname(url).endsWith('/auth/login');
}
