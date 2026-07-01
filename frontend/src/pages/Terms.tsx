import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SITE, DISCLAIMERS } from "@/lib/site";
import { Seo } from "@/components/Seo";
import { Reveal } from "@/components/motion/Reveal";

export default function Terms() {
  const { data, isLoading } = useQuery({
    queryKey: ["page", "terms"],
    queryFn: () => api.getPage("terms"),
    retry: false,
  });

  const seo = (
    <Seo
      title="Terms & Conditions"
      description="The terms governing your use of the Aapno Aavas website and advisory services, including RERA verification, disclaimers and telecom consent."
    />
  );

  const header = (
    <section className="bg-navy-deep">
      <div className="container-page pb-16 pt-32">
        <Reveal>
          <p className="eyebrow text-saffron">Aapno Aavas</p>
          <h1 className="mt-3 text-bg">Terms &amp; Conditions</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-bg/70">
            Please read these terms carefully. By using this website or enquiring with our advisors,
            you agree to the terms below.
          </p>
        </Reveal>
      </div>
    </section>
  );

  if (isLoading) {
    return (
      <>
        {seo}
        {header}
        <div className="container-page max-w-3xl py-24">
          <div className="h-4 w-2/3 animate-pulse rounded-xs bg-sand" />
          <div className="mt-4 h-4 w-full animate-pulse rounded-xs bg-sand" />
          <div className="mt-3 h-4 w-5/6 animate-pulse rounded-xs bg-sand" />
        </div>
      </>
    );
  }

  if (data?.body) {
    return (
      <>
        <Seo title={data.meta_title || "Terms & Conditions"} description={data.meta_description || undefined} />
        {header}
        <div className="container-page max-w-3xl py-24">
          <Reveal>
            <div className="prose" dangerouslySetInnerHTML={{ __html: data.body }} />
          </Reveal>
        </div>
      </>
    );
  }

  return (
    <>
      {seo}
      {header}
      <div className="container-page max-w-3xl py-24">
        <Reveal>
          <p className="text-ink-muted leading-relaxed">
            These Terms &amp; Conditions govern your access to and use of aapnoaavas.com and the
            advisory services offered by Aapno Aavas. If you do not agree with them, please do not
            use this website.
          </p>

          <h2 className="mt-10 text-2xl text-navy">1. Our Role — Advisory / Channel Partner</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">{DISCLAIMERS.notDeveloper}</p>

          <h2 className="mt-10 text-2xl text-navy">2. Invitation to Offer</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">{DISCLAIMERS.invitationToOffer}</p>

          <h2 className="mt-10 text-2xl text-navy">3. RERA Verification Obligation</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">{DISCLAIMERS.rera}</p>

          <h2 className="mt-10 text-2xl text-navy">4. Artistic Impressions</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">{DISCLAIMERS.visuals}</p>

          <h2 className="mt-10 text-2xl text-navy">5. Tentative Area &amp; Pricing</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">{DISCLAIMERS.area}</p>

          <h2 className="mt-10 text-2xl text-navy">6. Limitation of Liability</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">
            The content on this website is provided in good faith for general information only.
            Aapno Aavas makes no warranty as to the accuracy, completeness or currency of any
            project detail, and shall not be liable for any direct, indirect or consequential loss
            arising from reliance on this website, from your dealings with a developer, or from any
            decision to book, invest in or purchase a property. Your relationship for any purchase
            is solely with the respective developer under the executed agreement.
          </p>

          <h2 className="mt-10 text-2xl text-navy">7. Telecom &amp; DND Consent (TRAI / TCCCPR)</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">
            By submitting an enquiry, you authorise Aapno Aavas and its representatives to contact
            you by call, SMS, WhatsApp and email regarding your enquiry. You expressly agree that
            this consent overrides your registration on any Do-Not-Disturb (DND) or National
            Do-Not-Call (NDNC) list under the TRAI Telecom Commercial Communications Customer
            Preference Regulations (TCCCPR). You may withdraw this authorisation at any time by
            writing to{" "}
            <a href={`mailto:${SITE.email}`} className="text-terracotta underline underline-offset-2">
              {SITE.email}
            </a>
            .
          </p>

          <h2 className="mt-10 text-2xl text-navy">8. Data Privacy (DPDPA, 2023)</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">
            We process your personal data as a Data Fiduciary under the Digital Personal Data
            Protection Act, 2023, strictly for the purpose of responding to your enquiry. For full
            details of what we collect, how it is used and your rights, please read our{" "}
            <a href="/privacy" className="text-terracotta underline underline-offset-2">
              Privacy Policy
            </a>
            .
          </p>

          <h2 className="mt-10 text-2xl text-navy">9. Intellectual Property</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">
            The Aapno Aavas name, brand and original content on this website are our property.
            Project names, logos and marketing material belong to the respective developers and are
            displayed for informational purposes only.
          </p>

          <h2 className="mt-10 text-2xl text-navy">10. Governing Law</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">
            These terms are governed by the laws of India, and any dispute shall be subject to the
            exclusive jurisdiction of the courts at Jaipur, Rajasthan.
          </p>

          <p className="mt-10 border-t hairline pt-6 text-sm text-ink-muted">
            Questions about these terms? Contact us at{" "}
            <a href={`mailto:${SITE.email}`} className="text-terracotta underline underline-offset-2">
              {SITE.email}
            </a>{" "}
            or {SITE.phone}. Last updated {SITE.consentPolicyVersion}.
          </p>
        </Reveal>
      </div>
    </>
  );
}
