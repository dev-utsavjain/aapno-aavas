import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Analytics } from "@/components/Analytics";
import { IntroLoader } from "@/components/cinematic/IntroLoader";
import { CustomCursor } from "@/components/cinematic/CustomCursor";
import { PageTransition } from "@/components/cinematic/PageTransition";
import { useLenis } from "@/hooks/useLenis";

/** Public site shell: header + routed page + footer + consent + smooth scroll + cinematic layer. */
export function Layout() {
  useLenis();
  return (
    <>
      <IntroLoader />
      <CustomCursor />
      <PageTransition />
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
