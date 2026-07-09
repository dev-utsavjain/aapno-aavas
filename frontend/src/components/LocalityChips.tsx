import { Link } from "react-router-dom";
import { MapPin } from "@phosphor-icons/react";
import { POPULAR_LOCALITIES } from "@/lib/site";
import { Reveal } from "@/components/motion/Reveal";

/** Popular Jaipur locality pills → the search-filtered listing (?q=<locality>). */
export function LocalityChips() {
  return (
    <section className="bg-panel">
      <div className="container-page py-20 md:py-24">
        <Reveal>
          <p className="eyebrow mb-3">Explore by locality</p>
          <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] max-w-2xl">
            Popular areas across Jaipur.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-10 flex flex-wrap gap-2.5">
            {POPULAR_LOCALITIES.map((loc) => (
              <Link
                key={loc}
                to={`/projects?q=${encodeURIComponent(loc)}`}
                className="inline-flex items-center gap-1.5 rounded-sm border hairline bg-bg px-4 py-2 text-sm text-ink transition-colors hover:border-saffron hover:text-saffron-ink"
              >
                <MapPin size={15} weight="fill" className="text-saffron-ink" />
                {loc}
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
