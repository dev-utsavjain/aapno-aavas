import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { ArrowRight, ShieldCheck, Handshake, Buildings, Key } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { SITE } from "@/lib/site";
import { Seo } from "@/components/Seo";
import { Reveal } from "@/components/motion/Reveal";
import { ProjectCard } from "@/components/ProjectCard";
import { LeadForm } from "@/components/LeadForm";
import { WhatsAppButton, whatsappDefaultMessage } from "@/components/WhatsAppButton";
import { GrainOverlay } from "@/components/cinematic/GrainOverlay";
import { ScrollCue } from "@/components/cinematic/ScrollCue";
import { MagneticButton } from "@/components/cinematic/MagneticButton";
import { CountUp } from "@/components/cinematic/CountUp";
import { VideoShowcase } from "@/components/cinematic/VideoShowcase";

/** Line-mask reveal for hero headline lines. */
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

export default function Home() {
  const reduced = useReducedMotion();
  const { data } = useQuery({
    queryKey: ["projects", "featured"],
    queryFn: () => api.listProjects({ limit: 6 }),
  });
  const projects = data?.data ?? [];

  return (
    <>
      <Seo title="Premium Residential & Commercial Properties in Jaipur" description="Aapno Aavas — a trusted Jaipur real-estate advisory & channel partner. Explore RERA-registered projects and connect with our advisors." image="/img/hero-poster.jpg" />

      {/* Cinematic hero — video right (desktop) / full-bleed (mobile) */}
      <section className="relative min-h-[92vh] bg-ink text-white overflow-hidden flex items-end md:items-center">
        <div className="absolute inset-0 md:left-[44%]">
          <video
            className="h-full w-full object-cover"
            autoPlay={!reduced}
            muted
            loop
            playsInline
            preload="metadata"
            poster="/img/hero-poster.jpg"
          >
            <source src="/video/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10 md:bg-gradient-to-r md:from-ink md:via-ink/40 md:to-transparent" />
          <GrainOverlay />
        </div>

        <div className="container-page relative z-10 w-full pb-24 pt-40 md:py-28">
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

        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 hidden md:block">
          <ScrollCue />
        </div>
      </section>

      {/* Value props */}
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

      {/* Step Inside — cinematic video band */}
      <VideoShowcase />

      {/* Featured projects */}
      {projects.length > 0 && (
        <section className="container-page py-24 md:py-32">
          <Reveal>
            <div className="flex items-end justify-between gap-4 mb-12">
              <div>
                <p className="eyebrow mb-3">Featured</p>
                <h2 className="text-[clamp(2rem,3.5vw,2.75rem)]">Handpicked projects</h2>
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

      {/* Trust band — animated count-up */}
      <section className="bg-ink text-white">
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

      {/* CTA + lead form */}
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
    </>
  );
}
