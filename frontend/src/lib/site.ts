/** Site-wide config + brand constants. Env vars are injected at build time by Vite. */
export const SITE = {
  name: "Aapno Aavas",
  tagline: "Jaipur's Trusted Property Advisory",
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || "919812345678",
  phone: import.meta.env.VITE_PHONE || "+91 98123 45678",
  email: import.meta.env.VITE_EMAIL || "connect@aapnoaavas.com",
  ga4: import.meta.env.VITE_GA4_ID || "",
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITEKEY || "",
  siteURL: import.meta.env.VITE_SITE_URL || "",
  consentPolicyVersion: "2026-07-01",
};

/** Build a WhatsApp deep link with a prefilled message. */
export function waLink(message: string): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Format an Indian price range from rupee amounts (₹45 L – ₹1.2 Cr / On Request). */
export function formatPrice(min: number, max: number): string {
  const fmt = (n: number) => {
    if (n <= 0) return "";
    if (n >= 1e7) return `₹${trimZero(n / 1e7)} Cr`;
    if (n >= 1e5) return `₹${trimZero(n / 1e5)} L`;
    return `₹${n.toLocaleString("en-IN")}`;
  };
  const lo = fmt(min);
  const hi = fmt(max);
  if (!lo && !hi) return "On Request";
  if (lo && hi && lo !== hi) return `${lo} – ${hi}`;
  return lo || hi;
}

function trimZero(n: number): string {
  return parseFloat(n.toFixed(2)).toString();
}

export const STATUS_LABEL: Record<string, string> = {
  upcoming: "Upcoming",
  ongoing: "Under Construction",
  ready: "Ready to Move",
};

/**
 * T&C-mandated disclaimers. Rendered on every project page + listing footer, sourced here as
 * constants so they can't be edited away via the CMS.
 */
export const DISCLAIMERS = {
  notDeveloper:
    "Aapno Aavas operates solely as a real-estate advisory firm / channel partner and is not the developer, builder or promoter of the projects shown. We have no role in their construction or delivery.",
  invitationToOffer:
    "All information here is an “Invitation to Offer” and does not constitute a legally binding offer or agreement. Any sale is governed exclusively by the Agreement for Sale / Allotment Letter executed with the respective developer.",
  rera:
    "Project details, including RERA registration, approvals and timelines, are sourced from the developer / public sources. Buyers must independently verify the current RERA status on the official State RERA Authority website before booking.",
  visuals:
    "All images, videos, 3D renders and walkthroughs are artistic impressions for promotional purposes only and may differ from the actual development.",
  area:
    "Carpet area, super built-up area, floor plans, dimensions and pricing are tentative and indicative, and may vary per final approvals and developer terms.",
};

/** Consent labels — DPDPA data-processing + TRAI/TCCCPR DND override. Both mandatory. */
export const CONSENT = {
  dataProcessing:
    "I consent to Aapno Aavas collecting and processing my personal details in accordance with the Privacy Policy (DPDPA, 2023).",
  telecomDND:
    "I authorise Aapno Aavas and its representatives to contact me by call, SMS, WhatsApp and email regarding this inquiry. This consent overrides my DND/NDNC registration (TRAI/TCCCPR).",
};

export const NAV = [
  { label: "Home", to: "/" },
  { label: "Properties", to: "/projects" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];
