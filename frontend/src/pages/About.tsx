import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, MapPin, ClipboardText, Handshake, ChatCircleDots } from "@phosphor-icons/react";
import { Seo } from "@/components/Seo";
import { Reveal } from "@/components/motion/Reveal";
import { WhatsAppButton, whatsappDefaultMessage } from "@/components/WhatsAppButton";

export default function About() {
  const steps = [
    {
      icon: ChatCircleDots,
      title: "Understand the brief",
      body:
        "We start with a conversation — budget, preferred localities, possession timeline, and whether it's a home to live in or an investment. No forms fired at you before we know what you want.",
    },
    {
      icon: ClipboardText,
      title: "Shortlist & verify",
      body:
        "We match you to RERA-registered projects that fit, then walk you through registration numbers, approvals and the developer's track record before a single site visit is booked.",
    },
    {
      icon: MapPin,
      title: "Visit with us",
      body:
        "We accompany you on site visits across Jaipur, compare options honestly, and flag the trade-offs — connectivity, construction stage, pricing versus the corridor's average.",
    },
    {
      icon: Handshake,
      title: "Close & hand over",
      body:
        "From negotiating the payment plan to coordinating paperwork and registration with the developer, one advisor stays with you until the keys are in your hand.",
    },
  ];

  return (
    <>
      <Seo
        title="About Aapno Aavas"
        description="Aapno Aavas is a Jaipur real-estate advisory firm and channel partner — RERA-first guidance and end-to-end support across the city's residential and commercial corridors."
      />

      {/* Hero band */}
      <section className="bg-navy-deep text-surface">
        <div className="container-page pt-32 pb-20">
          <Reveal>
            <p className="eyebrow text-saffron mb-4">Who we are</p>
            <h1 className="text-surface text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold max-w-3xl">
              About Aapno Aavas
            </h1>
            <p className="mt-6 text-lg text-surface/80 max-w-2xl">
              A Jaipur property advisory built on one idea — that buyers deserve someone who works
              for their interests, reads the fine print, and stays through the whole journey.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Story: asymmetric 2-col */}
      <section className="container-page py-24 md:py-32">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20 items-center">
          <Reveal>
            <p className="eyebrow mb-3">Our story</p>
            <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] max-w-lg">
              Advisors first. Channel partners second.
            </h2>
            <div className="mt-6 space-y-5 text-ink-muted max-w-xl">
              <p className="m-0">
                Aapno Aavas began with families who had been passed between call centres and pushy
                sales desks, never quite sure who was on their side. We do the opposite — we advise.
                As a registered channel partner we work with Jaipur's credible developers, but our
                loyalty sits with the person buying the home.
              </p>
              <p className="m-0">
                That means we lead with RERA. Every project we put in front of you comes with its
                registration details and a pointer to the official state authority so you can verify
                for yourself. We'd rather you check than take our word for it.
              </p>
              <p className="m-0">
                From Mansarovar to the Ajmer Road belt, Vaishali Nagar to the ring-road corridors,
                we know where Jaipur is growing and where value still hides — and we say so plainly.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative">
              <img
                src="/img/about.jpg"
                alt="Aapno Aavas advisors reviewing a Jaipur property portfolio"
                className="w-full aspect-[4/5] object-cover rounded-sm hairline"
              />
              <div className="absolute -bottom-6 -left-6 hidden md:block bg-surface hairline rounded-sm px-6 py-5 max-w-[15rem]">
                <ShieldCheck size={28} weight="light" className="text-saffron-ink" />
                <p className="mt-2 text-sm text-ink m-0 font-medium">
                  RERA details surfaced on every project, before you ever visit.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How we work */}
      <section className="bg-sand">
        <div className="container-page py-24 md:py-32">
          <Reveal>
            <p className="eyebrow mb-3">How we work</p>
            <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] max-w-2xl">
              A four-step process, and a person you can call at every one of them.
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-x-10 gap-y-14 md:grid-cols-2">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={(i % 2) * 0.08}>
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-4xl font-bold text-saffron leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="flex items-center gap-3">
                      <s.icon size={26} weight="light" className="text-navy" />
                      <h3 className="text-xl m-0">{s.title}</h3>
                    </div>
                    <p className="mt-3 text-ink-muted m-0 max-w-md">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Values / why us band */}
      <section className="container-page py-24 md:py-32">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 items-start">
          <Reveal>
            <p className="eyebrow mb-3">Why buyers stay with us</p>
            <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] max-w-md">
              What you can expect from an Aapno Aavas advisor.
            </h2>
            <img
              src="/img/interior-living.jpg"
              alt="Furnished living room in a Jaipur residence"
              className="mt-10 w-full aspect-[16/10] object-cover rounded-sm hairline"
            />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-y-10 sm:grid-cols-2 sm:gap-x-10">
              {[
                {
                  title: "Straight answers",
                  body:
                    "If a project isn't right for you, we'll tell you — even if it means the deal doesn't happen. Trust is the only thing that brings referrals.",
                },
                {
                  title: "Jaipur, in depth",
                  body:
                    "We advise on this one city, so we know its micro-markets, upcoming infrastructure and which corridors are worth the wait.",
                },
                {
                  title: "One point of contact",
                  body:
                    "No handoffs between departments. The advisor who understands your brief is the one who walks you to registration.",
                },
                {
                  title: "Documented, not verbal",
                  body:
                    "Pricing, area, timelines and RERA status shared in writing, sourced from the developer and public records — so nothing rests on a phone promise.",
                },
              ].map((v) => (
                <div key={v.title}>
                  <h3 className="text-lg mb-2">{v.title}</h3>
                  <p className="text-ink-muted m-0">{v.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-navy-deep text-surface">
        <div className="container-page py-24 md:py-28 text-center">
          <Reveal>
            <h2 className="text-surface text-[clamp(2rem,4vw,3rem)] max-w-2xl mx-auto">
              Let's find the right address for you in Jaipur.
            </h2>
            <p className="mt-5 text-surface/80 max-w-xl mx-auto">
              Browse the projects we're currently advising on, or start a conversation on WhatsApp
              and tell us what you're after.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link to="/projects" className="btn-primary">
                Explore Properties <ArrowRight size={18} weight="bold" />
              </Link>
              <WhatsAppButton
                message={whatsappDefaultMessage()}
                className="!bg-surface !text-navy-deep hover:!bg-surface/90"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
