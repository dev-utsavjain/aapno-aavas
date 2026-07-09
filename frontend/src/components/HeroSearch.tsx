import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlass, MapPin, House, CurrencyInr } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

// Tabs match the familiar portal layout. Inventory is sale-only today, so Rent/PG/NRI carry an
// `intent` param for later and search the same catalogue for now.
// ponytail: wire distinct inventory to intent when rent/PG listings actually exist.
const TABS = [
  { key: "buy", label: "Buy" },
  { key: "rent", label: "Rent" },
  { key: "pg", label: "PG / Co-living" },
  { key: "commercial", label: "Commercial" },
  { key: "luxury", label: "NRI / Luxury", badge: "NEW" },
];

// Category drives the home sections + listing filter (backend `category` column).
const CATEGORIES = [
  { v: "", l: "Property Type" },
  { v: "flat", l: "Flats" },
  { v: "plot", l: "Plots" },
  { v: "commercial", l: "Commercial" },
  { v: "land", l: "Lands" },
];

const BUDGETS = [
  { v: "", l: "Budget Range" },
  { v: "0-5000000", l: "Under ₹50 L" },
  { v: "5000000-10000000", l: "₹50 L – ₹1 Cr" },
  { v: "10000000-20000000", l: "₹1 Cr – ₹2 Cr" },
  { v: "20000000-50000000", l: "₹2 Cr – ₹5 Cr" },
  { v: "50000000-", l: "₹5 Cr+" },
];

/**
 * Property search bar. `variant="page"` (default) renders as a standalone sand section with a
 * heading (Listings page). `variant="hero"` renders just the search card for overlaying on the
 * home hero.
 */
export function HeroSearch({ variant = "page" }: { variant?: "hero" | "page" }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("buy");
  const [locality, setLocality] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");

  function search() {
    const p = new URLSearchParams();
    if (locality.trim()) p.set("q", locality.trim());
    // Commercial tab forces the category; otherwise use the dropdown.
    const cat = tab === "commercial" ? "commercial" : category;
    if (cat) p.set("category", cat);
    if (budget) {
      const [min, max] = budget.split("-");
      if (min && min !== "0") p.set("price_min", min);
      if (max) p.set("price_max", max);
    }
    if (tab !== "buy") p.set("intent", tab);
    navigate(`/projects?${p.toString()}`);
  }

  const selectCls =
    "w-full appearance-none bg-transparent pl-10 pr-4 py-3.5 text-sm text-ink outline-none cursor-pointer";

  const inner = (
    <div className={cn("mx-auto max-w-4xl", variant === "page" && "")}>
      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "relative rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
              tab === t.key
                ? "bg-ink text-white"
                : variant === "hero"
                  ? "bg-white/15 text-white/80 hover:text-white backdrop-blur-sm"
                  : "bg-white/70 text-ink-muted hover:text-ink",
            )}
          >
            {t.label}
            {t.badge && (
              <span className="absolute -top-2 -right-1.5 rounded-xs bg-saffron px-1 py-0.5 text-[0.55rem] leading-none text-white">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search row */}
      <div className="flex flex-col gap-2 rounded-sm bg-white hairline p-2 shadow-sm md:flex-row md:items-stretch">
        <div className="relative flex-1">
          <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-saffron-ink" />
          <input
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Type locality, project or developer"
            className="w-full bg-transparent pl-10 pr-4 py-3.5 text-sm text-ink outline-none placeholder:text-ink-muted"
          />
        </div>

        <div className="relative md:w-48 md:border-l hairline">
          <House size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-saffron-ink pointer-events-none" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
            {CATEGORIES.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>

        <div className="relative md:w-48 md:border-l hairline">
          <CurrencyInr size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-saffron-ink pointer-events-none" />
          <select value={budget} onChange={(e) => setBudget(e.target.value)} className={selectCls}>
            {BUDGETS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>

        <button type="button" onClick={search} className="btn-primary justify-center md:px-8">
          <MagnifyingGlass size={18} weight="bold" /> Search
        </button>
      </div>
    </div>
  );

  if (variant === "hero") {
    return <div className="container-page pb-10 md:pb-12">{inner}</div>;
  }

  return (
    <section className="bg-sand">
      <div className="container-page py-14 md:py-16">
        <h2 className="text-center text-[clamp(1.5rem,3vw,2.25rem)] mb-8">
          Explore Real Estate <span className="text-saffron">in Jaipur</span>
        </h2>
        {inner}
      </div>
    </section>
  );
}
