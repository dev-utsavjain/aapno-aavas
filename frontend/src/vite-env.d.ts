/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_PHONE?: string;
  readonly VITE_EMAIL?: string;
  readonly VITE_GA4_ID?: string;
  readonly VITE_TURNSTILE_SITEKEY?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_MAPS_QUERY?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Cloudflare Turnstile global (loaded via script tag)
interface Window {
  turnstile?: {
    render: (el: HTMLElement, opts: Record<string, unknown>) => string;
    reset: (id?: string) => void;
    remove: (id?: string) => void;
  };
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}
