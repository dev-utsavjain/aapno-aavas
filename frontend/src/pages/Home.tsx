import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ShieldCheck, Handshake, Buildings, Key } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { SITE } from "@/lib/site";
import { Seo } from "@/components/Seo";
import { Reveal } from "@/components/motion/Reveal";
import { ProjectCard } from "@/components/ProjectCard";
import { LeadForm } from "@/components/LeadForm";
import { WhatsAppButton, whatsappDefaultMessage } from "@/components/WhatsAppButton";

export default function Home() {
  const reduced = useReducedMotion();
  const { data } = useQuery({
    queryKey: ["projects", "featured"],
    queryFn: () => api.listProjects({ limit: 6 }),
  });
  const projects = data?.data ?? [];

  return (
    <>
      <Seo title="Premium Residential & Commercial Properties in Jaipur" description="Aapno Aavas — a trusted Jaipur real-estate advisory & channel partner. Explore RERA-registered projects and connect with our advisors." />

      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden">
        <motion.img
          src="/img/hero.jpg"
          alt="Elegant furnished living room interior in Jaipur"
          className="absolute inset-0 h-full w-full object-cover"
          initial={reduced ? undefined : { scale: 1.08 }}
          animate={reduced ? undefined : { scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/85 via-navy-deep/30 to-transparent" />
        <div className="container-page relative pb-20 pt-32">
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 30 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <p className="eyebrow text-saffron mb-4">{SITE.tagline}</p>
            <h1 className="text-surface text-[clamp(2.75rem,6vw,5rem)] font-bold">
              Find a home that <span className="text-saffron">feels like yours.</span>
            </h1>
            <p className="mt-5 text-lg text-surface/85 max-w-xl">
              Curated residential and commercial projects across Jaipur — advised end to end by a
              team that treats your search as its own. <span className="font-deva">आपणों</span> Aavas.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/projects" className="btn-primary">
                Explore Properties <ArrowRight size={18} weight="bold" />
              </Link>
              <WhatsAppButton message={whatsappDefaultMessage()} className="!bg-surface !text-navy-deep hover:!bg-surface/90" />
            </div>
          </motion.div>
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

      {/* Featured projects */}
      {projects.length > 0 && (
        <section className="container-page pb-24 md:pb-32">
          <Reveal>
            <div className="flex items-end justify-between gap-4 mb-12">
              <div>
                <p className="eyebrow mb-3">Featured</p>
                <h2 className="text-[clamp(2rem,3.5vw,2.75rem)]">Handpicked projects</h2>
              </div>
              <Link to="/projects" className="hidden sm:inline-flex items-center gap-1.5 text-navy font-medium hover:text-saffron-ink transition-colors">
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

      {/* Trust band */}
      <section className="bg-navy-deep text-surface">
        <div className="container-page py-20 grid gap-10 sm:grid-cols-3 text-center">
          {[
            { n: "500+", l: "Families advised" },
            { n: "40+", l: "RERA-registered projects" },
            { n: "12+", l: "Years across Jaipur" },
          ].map((s) => (
            <Reveal key={s.l}>
              <div className="font-display font-bold text-5xl text-saffron">{s.n}</div>
              <div className="mt-2 text-surface/70 text-sm uppercase tracking-widest">{s.l}</div>
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
