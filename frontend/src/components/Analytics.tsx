import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE } from "@/lib/site";

/**
 * GA4 loader + SPA pageview tracking. Only active when VITE_GA4_ID is set and cookie consent
 * has been granted (checked via localStorage flag set by CookieConsent).
 */
export function Analytics() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!SITE.ga4) return;
    if (localStorage.getItem("aa_cookie_consent") !== "accepted") return;
    if (window.gtag) return; // already loaded

    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${SITE.ga4}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", SITE.ga4, { send_page_view: false });
  }, []);

  useEffect(() => {
    if (window.gtag && SITE.ga4) {
      window.gtag("event", "page_view", { page_path: pathname });
    }
  }, [pathname]);

  return null;
}
