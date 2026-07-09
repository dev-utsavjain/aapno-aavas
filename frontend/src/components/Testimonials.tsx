import { useQuery } from "@tanstack/react-query";
import { Star, Quotes } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Home testimonials band. CMS-managed (admin → Testimonials). Renders nothing when there are no
 * active testimonials, so the section never shows empty.
 */
export function Testimonials() {
  const { data } = useQuery({
    queryKey: ["testimonials"],
    queryFn: () => api.listTestimonials(),
  });
  const items = data ?? [];
  if (items.length === 0) return null;

  return (
    <section className="bg-panel">
      <div className="container-page py-24 md:py-32">
        <Reveal>
          <p className="eyebrow mb-3">Testimonials</p>
          <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] max-w-2xl">
            Families who found their place with us.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.id} delay={(i % 3) * 0.08}>
              <figure className="h-full flex flex-col bg-bg border hairline p-7">
                <Quotes size={28} weight="fill" className="text-saffron mb-4" />
                <blockquote className="flex-1 m-0 text-ink leading-relaxed">{t.quote}</blockquote>
                {t.rating > 0 && (
                  <div className="mt-5 flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, s) => (
                      <Star
                        key={s}
                        size={16}
                        weight={s < t.rating ? "fill" : "regular"}
                        className={s < t.rating ? "text-saffron" : "text-sand"}
                      />
                    ))}
                  </div>
                )}
                <figcaption className="mt-5 flex items-center gap-3 not-italic">
                  {t.photo_url ? (
                    <img
                      src={t.photo_url}
                      alt={t.name}
                      loading="lazy"
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <span className="h-11 w-11 rounded-full bg-ink text-white grid place-items-center text-sm font-semibold uppercase">
                      {t.name.trim().charAt(0)}
                    </span>
                  )}
                  <span>
                    <span className="block font-semibold text-ink leading-tight">{t.name}</span>
                    {t.location && (
                      <span className="block text-xs uppercase tracking-[0.14em] text-ink-muted mt-0.5">
                        {t.location}
                      </span>
                    )}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
