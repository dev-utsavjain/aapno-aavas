import { Phone, EnvelopeSimple, MapPin } from "@phosphor-icons/react";
import { SITE } from "@/lib/site";
import { Seo } from "@/components/Seo";
import { Reveal } from "@/components/motion/Reveal";
import { LeadForm } from "@/components/LeadForm";
import { WhatsAppButton, whatsappDefaultMessage } from "@/components/WhatsAppButton";

export default function Contact() {
  return (
    <>
      <Seo
        title="Contact Aapno Aavas"
        description="Speak with a Jaipur property advisor at Aapno Aavas — call, email or WhatsApp us, or send your requirement and we'll call you back with options that fit."
      />

      {/* Header band */}
      <section className="bg-navy-deep text-surface">
        <div className="container-page pt-32 pb-20">
          <Reveal>
            <p className="eyebrow text-saffron mb-4">Talk to an advisor</p>
            <h1 className="text-surface text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold max-w-3xl">
              Contact Aapno Aavas
            </h1>
            <p className="mt-6 text-lg text-surface/80 max-w-2xl">
              Tell us your budget, preferred locality and timeline. An advisor will get back to you
              with a shortlist worth your time — no call-centre run-around.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Two-column: details + form */}
      <section className="container-page py-24 md:py-32">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          {/* Left: details */}
          <Reveal>
            <p className="eyebrow mb-3">Reach us</p>
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] max-w-md">
              A real person, on the other end.
            </h2>

            <div className="mt-10 space-y-8">
              <div className="flex items-start gap-4">
                <Phone size={24} weight="light" className="text-saffron-ink mt-1 shrink-0" />
                <div>
                  <p className="eyebrow mb-1 text-ink-muted">Phone</p>
                  <a href={`tel:${SITE.phone.replace(/\s+/g, "")}`} className="text-lg text-navy font-medium hover:text-saffron-ink transition-colors">
                    {SITE.phone}
                  </a>
                  <p className="mt-1 text-sm text-ink-muted m-0">Mon–Sat, 9:30 am – 7:30 pm IST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <EnvelopeSimple size={24} weight="light" className="text-saffron-ink mt-1 shrink-0" />
                <div>
                  <p className="eyebrow mb-1 text-ink-muted">Email</p>
                  <a href={`mailto:${SITE.email}`} className="text-lg text-navy font-medium hover:text-saffron-ink transition-colors">
                    {SITE.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin size={24} weight="light" className="text-saffron-ink mt-1 shrink-0" />
                <div>
                  <p className="eyebrow mb-1 text-ink-muted">Office</p>
                  <p className="text-lg text-ink m-0">Jaipur, Rajasthan</p>
                  <p className="mt-1 text-sm text-ink-muted m-0">Site visits arranged across the city</p>
                </div>
              </div>

              <div className="pt-2">
                <WhatsAppButton message={whatsappDefaultMessage()} />
              </div>
            </div>

            {/* Map */}
            <div className="mt-12 overflow-hidden rounded-sm hairline">
              <iframe
                title="Aapno Aavas — Jaipur, Rajasthan"
                src="https://www.google.com/maps?q=Jaipur&output=embed"
                className="w-full h-72 border-0 block"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>

          {/* Right: lead form */}
          <Reveal delay={0.1}>
            <div className="bg-surface hairline rounded-sm p-8 md:p-10">
              <p className="eyebrow mb-3">Send your requirement</p>
              <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] mb-6">
                We'll call you back.
              </h2>
              <LeadForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
