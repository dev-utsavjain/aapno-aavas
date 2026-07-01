import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { List, X, WhatsappLogo } from "@phosphor-icons/react";
import { NAV, waLink } from "@/lib/site";
import { cn } from "@/lib/cn";

const TICKER = [
  "RERA-verified projects",
  "Free site visits",
  "End-to-end property advisory",
  "Jaipur's trusted channel partner",
];

function AnnounceBar() {
  const items = [...TICKER, ...TICKER, ...TICKER, ...TICKER];
  return (
    <div className="marquee bg-ink text-white text-[0.7rem] font-medium uppercase tracking-[0.2em] py-2">
      <div className="marquee-track">
        {items.map((t, i) => (
          <span key={i} className="inline-flex items-center">
            {t}
            <span className="mx-5 text-saffron">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <AnnounceBar />
      <div className="bg-white border-b hairline">
        <div className="container-page flex items-center justify-between h-[68px]">
          <Link to="/" className="flex items-center gap-3" aria-label="Aapno Aavas home">
            <img src="/logo.png" alt="Aapno Aavas" className="h-10 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "text-[0.8rem] font-semibold uppercase tracking-[0.14em] py-1.5 border-b-2 transition-colors",
                    isActive
                      ? "text-ink border-saffron"
                      : "text-ink-muted border-transparent hover:text-ink",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <a
              href={waLink("Hi Aapno Aavas, I'd like to know more about your properties.")}
              target="_blank"
              rel="noopener"
              className="btn-primary !py-2.5 !px-5"
            >
              <WhatsappLogo size={16} weight="fill" /> Enquire
            </a>
          </nav>

          <button className="md:hidden text-ink p-2" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X size={26} /> : <List size={26} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden bg-white border-t hairline">
            <nav className="container-page flex flex-col py-3">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "py-3 text-sm font-semibold uppercase tracking-[0.14em]",
                      isActive ? "text-saffron-ink" : "text-ink",
                    )
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
                <WhatsappLogo size={16} weight="fill" /> Enquire on WhatsApp
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
