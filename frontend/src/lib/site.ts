/** Site-wide config + brand constants. Env vars are injected at build time by Vite. */
export const SITE = {
  name: "Aapno Aavas",
  tagline: "Jaipur's Trusted Property Advisory",
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || "918875106106",
  phone: import.meta.env.VITE_PHONE || "+91 88751 06106",
  email: import.meta.env.VITE_EMAIL || "connect@aapnoaavas.com",
  ga4: import.meta.env.VITE_GA4_ID || "",
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITEKEY || "",
  siteURL: import.meta.env.VITE_SITE_URL || "",
  consentPolicyVersion: "2026-07-01",
};

/**
 * Defaults for the admin-editable contact settings (GET /api/v1/settings). The live values are
 * merged over these by useSettings(), so the site renders correctly even before anything is saved.
 */
export const SETTINGS_DEFAULTS = {
  whatsapp_number: SITE.whatsappNumber,
  phone: SITE.phone,
  email: SITE.email,
  address: "Jaipur, Rajasthan",
  hours: "Mon–Sat, 9:30 am – 7:30 pm IST",
  map_query: "Jaipur",
  contact_heading: "A real person, on the other end.",
  contact_intro:
    "Tell us your budget, preferred locality and timeline. An advisor will get back to you with a shortlist worth your time — no call-centre run-around.",
};
export type SettingsKey = keyof typeof SETTINGS_DEFAULTS;

/** Build a WhatsApp deep link with a prefilled message. Pass a number to override the default. */
export function waLink(message: string, number: string = SITE.whatsappNumber): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
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

/** Popular Jaipur localities surfaced as quick-filter chips (link to /projects?q=<name>). */
export const POPULAR_LOCALITIES = [
  "Vaishali Nagar",
  "Mansarovar",
  "Jagatpura",
  "C-Scheme",
  "Tonk Road",
  "Ajmer Road",
  "Malviya Nagar",
  "Jhotwara",
  "Bapu Nagar",
  "Vidhyadhar Nagar",
  "Sanganer",
  "Ring Road",
];

/** Buyer-advisory FAQ shown on the home page. Static for now (can move to the CMS later). */
export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Do you charge buyers any fee?",
    a: "No. Our advisory service is free for buyers — we help you shortlist, verify and negotiate at no cost to you. We work as a channel partner with the developers.",
  },
  {
    q: "Are the projects RERA-registered and verified?",
    a: "We surface each project's RERA registration number and a link to the official State RERA portal. We strongly recommend you verify the current status there before booking — the number is on every project page.",
  },
  {
    q: "How will an advisor contact me after I enquire?",
    a: "An advisor calls or messages you (phone / WhatsApp) about your enquiry. When you submit the form you consent to this contact, and it overrides DND/NDNC as required — your consent is logged with a timestamp for compliance.",
  },
  {
    q: "Can you help with site visits and paperwork?",
    a: "Yes. We accompany you on site visits across Jaipur, compare options honestly, and stay with you through negotiation, payment plan and registration with the developer.",
  },
  {
    q: "Should I invest in a plot or a flat?",
    a: "It depends on your goal. Plots and land tend to appreciate and offer flexibility but no rental yield or immediate use; flats give you a ready home or rental income. We'll walk you through the trade-offs for your budget and timeline.",
  },
  {
    q: "Which areas of Jaipur do you cover?",
    a: "Residential, commercial, plot and land options across Jaipur's growth corridors — Mansarovar, Vaishali Nagar, Jagatpura, Ajmer Road, Tonk Road, the Ring Road belt and more.",
  },
];
