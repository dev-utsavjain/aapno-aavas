import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { List, X, WhatsappLogo } from "@phosphor-icons/react";
import { NAV, waLink } from "@/lib/site";
import { cn } from "@/lib/cn";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "bg-surface/95 backdrop-blur-sm border-b hairline" : "bg-transparent",
      )}
    >
      <div className="container-page flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3" aria-label="Aapno Aavas home">
          <img src="/logo.png" alt="Aapno Aavas" className="h-11 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "text-[0.95rem] font-medium tracking-wide transition-colors relative py-1",
                  isActive ? "text-navy" : "text-ink-muted hover:text-navy",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <a href={waLink("Hi Aapno Aavas, I'd like to know more about your properties.")} target="_blank" rel="noopener" className="btn-primary text-sm">
            <WhatsappLogo size={18} weight="fill" /> Enquire
          </a>
        </nav>

        <button
          className="md:hidden text-navy p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={26} /> : <List size={26} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-surface border-t hairline">
          <nav className="container-page flex flex-col py-4">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn("py-3 text-lg font-medium", isActive ? "text-navy" : "text-ink-muted")
                }
              >
                {item.label}
              </NavLink>
            ))}
            <a
              href={waLink("Hi Aapno Aavas, I'd like to know more about your properties.")}
              target="_blank"
              rel="noopener"
              className="btn-primary mt-3 justify-center"
            >
              <WhatsappLogo size={18} weight="fill" /> Enquire on WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
