import { useEffect, useRef } from "react";
import { SITE } from "@/lib/site";

/**
 * Cloudflare Turnstile widget. Renders only when a site key is configured; otherwise it's a
 * no-op (backend also skips verification when its secret is unset), so local dev works.
 */
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!SITE.turnstileSiteKey) return;

    const ensureScript = () =>
      new Promise<void>((resolve) => {
        if (window.turnstile) return resolve();
        const s = document.createElement("script");
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        s.async = true;
        s.onload = () => resolve();
        document.head.appendChild(s);
      });

    let cancelled = false;
    ensureScript().then(() => {
      if (cancelled || !ref.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE.turnstileSiteKey,
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(""),
        theme: "light",
      });
    });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
    };
  }, [onToken]);

  if (!SITE.turnstileSiteKey) return null;
  return <div ref={ref} className="my-2" />;
}
