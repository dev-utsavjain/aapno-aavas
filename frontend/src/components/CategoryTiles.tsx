import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import type { ProjectCategory } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";

// Placeholder imagery from existing public assets — swap for real per-category photos when available.
const TILES: { category: ProjectCategory; label: string; blurb: string; image: string }[] = [
  { category: "flat", label: "Flats", blurb: "Ready homes & apartments", image: "/img/interior-living.jpg" },
  { category: "plot", label: "Plots", blurb: "Residential plotted land", image: "/gallery/g3.jpg" },
  { category: "commercial", label: "Commercial", blurb: "Offices, retail & shops", image: "/gallery/g8.jpg" },
  { category: "land", label: "Lands", blurb: "Investment land parcels", image: "/gallery/g11.jpg" },
];

/** Quick "browse by type" nav — editorial full-bleed image tiles linking to filtered listings. */
export function CategoryTiles() {
  return (
    <section className="container-page py-24 md:py-28">
      <Reveal>
        <p className="eyebrow mb-3">Browse by type</p>
        <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] max-w-2xl">
          Find the kind of property you're after.
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TILES.map((t, i) => (
          <Reveal key={t.category} delay={(i % 4) * 0.08}>
            <Link to={`/projects?category=${t.category}`} className="group relative block overflow-hidden border hairline aspect-[4/5]">
              <img
                src={t.image}
                alt={t.label}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h3 className="text-white text-2xl m-0">{t.label}</h3>
                <p className="mt-1 text-sm text-white/80 m-0">{t.blurb}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-saffron">
                  Explore <ArrowRight size={14} weight="bold" className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
