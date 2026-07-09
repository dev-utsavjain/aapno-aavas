import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck, Handshake, Buildings, Key } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { Seo } from "@/components/Seo";
import { Reveal } from "@/components/motion/Reveal";
import { ProjectCard } from "@/components/ProjectCard";
import { LeadForm } from "@/components/LeadForm";
import { CountUp } from "@/components/cinematic/CountUp";
import { VideoShowcase } from "@/components/cinematic/VideoShowcase";
import { Hero } from "@/components/Hero";
import { CategoryTiles } from "@/components/CategoryTiles";
import { CategorySection } from "@/components/CategorySection";
import { LocalityChips } from "@/components/LocalityChips";
import { Testimonials } from "@/components/Testimonials";
import { Faq } from "@/components/Faq";

export default function Home() {
  const { data } = useQuery({
    queryKey: ["projects", "featured"],
    queryFn: () => api.listProjects({ limit: 6 }),
  });
  const projects = data?.data ?? [];

  return (
    <>
      <Seo title="Premium Residential & Commercial Properties in Jaipur" description="Aapno Aavas — a trusted Jaipur real-estate advisory & channel partner. Explore RERA-registered projects and connect with our advisors." image="/img/hero-poster.jpg" />

      {/* 1 · Hero — background image slideshow + search bar */}
      <Hero />

      {/* Browse by type — quick category nav */}
      <CategoryTiles />

      {/* 2 · Top Projects (featured-first) */}
      {projects.length > 0 && (
        <section className="container-page py-24 md:py-32">
          <Reveal>
            <div className="flex items-end justify-between gap-4 mb-12">
              <div>
                <p className="eyebrow mb-3">Featured</p>
                <h2 className="text-[clamp(2rem,3.5vw,2.75rem)]">Top projects</h2>
              </div>
              <Link to="/projects" className="hidden sm:inline-flex items-center gap-1.5 text-ink font-medium hover:text-saffron-ink transition-colors">
                View all <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.08}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* 3 · Flats */}
      <CategorySection category="flat" title="Flats & apartments" eyebrow="Residential" muted />

      {/* Step Inside — cinematic video band (kept, woven in) */}
      <VideoShowcase />

      {/* 4 · Plots */}
      <CategorySection category="plot" title="Residential plots" eyebrow="Plotted development" />

      {/* 5 · Commercials */}
      <CategorySection category="commercial" title="Commercial spaces" eyebrow="Offices & retail" muted />

      {/* 6 · Lands */}
      <CategorySection category="land" title="Land parcels" eyebrow="Investment land" />

      {/* Explore by locality */}
      <LocalityChips />

      {/* 7 · About */}
      <section className="bg-ink text-white">
        <div className="container-page py-24 md:py-32 grid gap-12 lg:grid-cols-2 items-center">
          <Reveal>
            <div className="relative overflow-hidden aspect-[4/3]">
              <img src="/img/about.jpg" alt="Aapno Aavas advisors in Jaipur" loading="lazy" className="h-full w-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow !text-saffron mb-3">About us</p>
            <h2 className="text-white text-[clamp(2rem,3.5vw,2.75rem)] max-w-lg">
              A Jaipur advisory that treats your search as its own.
            </h2>
            <p className="mt-5 text-white/80 max-w-md">
              Aapno Aavas is a RERA-first real-estate advisory and channel partner. We are not the
              developer — which means our only job is to guide you honestly, from shortlisting to
              site visits to paperwork, across the city's residential and commercial corridors.
            </p>
            <Link to="/about" className="mt-8 inline-flex items-center gap-1.5 text-saffron font-medium hover:text-white transition-colors">
              More about us <ArrowRight size={16} weight="bold" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 8 · Why choose us */}
      <section className="container-page py-24 md:py-32">
        <Reveal>
          <p className="eyebrow mb-3">Why Aapno Aavas</p>
          <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] max-w-2xl">
            An advisor in your corner — not just a listing site.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "RERA-first", body: "We surface registration details and point you to the official portal to verify before you commit." },
            { icon: Handshake, title: "End-to-end advisory", body: "From shortlisting to site visits to paperwork, one team stays with you through the journey." },
            { icon: Buildings, title: "Curated portfolio", body: "Residential and commercial projects across Jaipur's growth corridors, hand-picked for value." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <f.icon size={32} weight="light" className="text-saffron-ink" />
              <h3 className="text-xl mt-4 mb-2">{f.title}</h3>
              <p className="text-ink-muted m-0">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Trust band — animated count-up (kept) */}
      <section className="bg-navy-deep text-white">
        <div className="container-page py-20 grid gap-10 sm:grid-cols-3 text-center">
          {[
            { v: 500, s: "+", l: "Families advised" },
            { v: 40, s: "+", l: "RERA-registered projects" },
            { v: 12, s: "+", l: "Years across Jaipur" },
          ].map((s) => (
            <Reveal key={s.l}>
              <div className="font-display font-bold text-5xl text-saffron">
                <CountUp value={s.v} suffix={s.s} />
              </div>
              <div className="mt-2 text-white/70 text-sm uppercase tracking-widest">{s.l}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 9 · Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <Faq />

      {/* 10 · Contact — CTA + lead form */}
      <section className="container-page py-24 md:py-32 grid gap-14 lg:grid-cols-[1.2fr_1fr] items-center">
        <Reveal>
          <Key size={36} weight="light" className="text-saffron-ink mb-5" />
          <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] max-w-lg">
            Tell us what you're looking for. We'll find it.
          </h2>
          <p className="mt-5 text-ink-muted max-w-md">
            Share a few details and one of our advisors will call you back with options that fit
            your budget, locality and timeline.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <LeadForm />
        </Reveal>
      </section>
      {/* 11 · Footer is global (components/layout/Footer) */}
    </>
  );
}
