import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/cn";
import { GrainOverlay } from "@/components/cinematic/GrainOverlay";
import { MagneticButton } from "@/components/cinematic/MagneticButton";
import { WhatsAppButton, whatsappDefaultMessage } from "@/components/WhatsAppButton";
import { HeroSearch } from "@/components/HeroSearch";

// Static fallback slides used until the client uploads `home_hero` banners in the CMS.
const FALLBACK_SLIDES = ["/img/hero.jpg", "/img/interior-living.jpg", "/img/interior-bedroom.jpg"];

/** Line-mask reveal for hero headline lines (mirrors the previous video hero). */
function Line({ children, delay = 0, reduced }: { children: ReactNode; delay?: number; reduced: boolean }) {
  if (reduced) return <span className="block">{children}</span>;
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/**
 * Home hero: full-bleed background image slideshow (CMS `home_hero` banners, with a static
 * fallback) + the brand headline overlay + the property search bar. Replaces the earlier video
 * hero. Autoplay is disabled under prefers-reduced-motion.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const { data: banners } = useQuery({
    queryKey: ["banners", "home_hero"],
    queryFn: () => api.listBanners("home_hero"),
  });

  const slides =
    banners && banners.length > 0 ? banners.map((b) => b.image_url) : FALLBACK_SLIDES;

  // Autoplay plugin kept in a ref so it isn't re-created on every render. Skipped when reduced.
  const autoplay = useRef(
    Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true }),
  );
  const plugins = reduced ? [] : [autoplay.current];
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "start", duration: 32 }, plugins);
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (embla) setSelected(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla, onSelect]);

  return (
    <section className="relative min-h-[72vh] md:min-h-[74vh] bg-ink text-white overflow-hidden flex flex-col">
      {/* Background slideshow */}
      <div className="absolute inset-0" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((src, i) => (
            <div key={i} className="relative flex-[0_0_100%] h-full">
              <img
                src={src}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Scrim + grain sit above the slides but below the content */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/25 md:bg-gradient-to-r md:from-ink md:via-ink/55 md:to-ink/15" />
      <GrainOverlay />

      {/* Foreground content — search filter on top (visible without scrolling), headline below */}
      <div className="container-page relative z-10 w-full flex flex-col pt-8 pb-20 md:pt-10 md:pb-24">
        {/* Search filter — top */}
        <div className="mb-10 md:mb-14">
          <HeroSearch variant="hero" />
        </div>

        <div className="max-w-xl">
          <motion.p
            className="eyebrow !text-saffron mb-5"
            initial={reduced ? undefined : { opacity: 0 }}
            animate={reduced ? undefined : { opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {SITE.tagline}
          </motion.p>
          <h1 className="text-white text-[clamp(2.75rem,6vw,5rem)]">
            <Line reduced={!!reduced}>Find a home</Line>
            <Line reduced={!!reduced} delay={0.08}>that feels</Line>
            <Line reduced={!!reduced} delay={0.16}>
              <span className="text-saffron">like yours.</span>
            </Line>
          </h1>
          <motion.p
            className="mt-6 text-lg text-white/85 max-w-lg"
            initial={reduced ? undefined : { opacity: 0, y: 16 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Curated residential and commercial projects across Jaipur — advised end to end by a
            team that treats your search as its own. <span className="font-deva">आपणों</span> Aavas.
          </motion.p>
          <motion.div
            className="mt-9 flex flex-wrap gap-4"
            initial={reduced ? undefined : { opacity: 0, y: 16 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <MagneticButton>
              <Link to="/projects" className="btn-primary">
                Explore Properties <ArrowRight size={18} weight="bold" />
              </Link>
            </MagneticButton>
            <MagneticButton>
              <WhatsAppButton message={whatsappDefaultMessage()} className="!bg-white !text-ink hover:!bg-white/90" />
            </MagneticButton>
          </motion.div>
        </div>
      </div>

      {/* Slide dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => embla?.scrollTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === selected ? "w-8 bg-saffron" : "w-2 bg-white/50 hover:bg-white/80",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
