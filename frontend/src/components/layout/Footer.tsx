import { Link } from "react-router-dom";
import { MapPin, Phone, EnvelopeSimple } from "@phosphor-icons/react";
import { NAV, SITE } from "@/lib/site";
import { DISCLAIMERS } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-navy-deep text-surface/80 mt-24">
      <div className="container-page py-16 grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <img src="/logo.png" alt="Aapno Aavas" className="h-12 w-auto mb-5 brightness-0 invert opacity-90" />
          <p className="max-w-sm text-sm leading-relaxed text-surface/70">
            {SITE.tagline}. A trusted real-estate advisory & channel partner for RERA-registered
            residential and commercial projects across Jaipur.
          </p>
        </div>

        <div>
          <h4 className="text-surface font-body font-semibold text-sm uppercase tracking-widest mb-4">
            Explore
          </h4>
          <ul className="space-y-2.5 text-sm">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-saffron transition-colors">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/privacy" className="hover:text-saffron transition-colors">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-saffron transition-colors">Terms &amp; Conditions</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-surface font-body font-semibold text-sm uppercase tracking-widest mb-4">
            Reach Us
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin size={18} className="mt-0.5 text-saffron shrink-0" /> Jaipur, Rajasthan, India
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={18} className="text-saffron shrink-0" />
              <a href={`tel:${SITE.phone}`} className="hover:text-saffron">{SITE.phone}</a>
            </li>
            <li className="flex items-center gap-2.5">
              <EnvelopeSimple size={18} className="text-saffron shrink-0" />
              <a href={`mailto:${SITE.email}`} className="hover:text-saffron">{SITE.email}</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Legal disclaimer band — always present per T&C */}
      <div className="border-t border-white/10">
        <div className="container-page py-6 text-xs leading-relaxed text-surface/50 space-y-2">
          <p>{DISCLAIMERS.notDeveloper}</p>
          <p>{DISCLAIMERS.invitationToOffer}</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-5 text-xs text-surface/50 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <span>RERA-registered projects · Verify status on the State RERA portal.</span>
        </div>
      </div>
    </footer>
  );
}
