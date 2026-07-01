import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Analytics } from "@/components/Analytics";
import { useLenis } from "@/hooks/useLenis";

/** Public site shell: header + routed page + footer + consent + smooth scroll + analytics. */
export function Layout() {
  useLenis();
  return (
    <>
      <ScrollToTop />
      <Analytics />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </>
  );
}
