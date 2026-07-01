import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SITE } from "@/lib/site";
import { Seo } from "@/components/Seo";
import { Reveal } from "@/components/motion/Reveal";

export default function Privacy() {
  const { data, isLoading } = useQuery({
    queryKey: ["page", "privacy"],
    queryFn: () => api.getPage("privacy"),
    retry: false,
  });

  const seo = (
    <Seo
      title="Privacy Policy"
      description="How Aapno Aavas collects, uses, retains and protects your personal data under the Digital Personal Data Protection Act, 2023."
    />
  );

  const header = (
    <section className="bg-navy-deep">
      <div className="container-page pb-16 pt-32">
        <Reveal>
          <p className="eyebrow text-saffron">Aapno Aavas</p>
          <h1 className="mt-3 text-bg">Privacy Policy</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-bg/70">
            This policy explains what personal data we collect when you enquire about a property,
            why we collect it, and the rights you hold under the Digital Personal Data Protection
            Act, 2023.
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
        <Seo title={data.meta_title || "Privacy Policy"} description={data.meta_description || undefined} />
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
            Aapno Aavas ("we", "us") is a Jaipur-based real-estate advisory firm. We respect your
            privacy and handle every enquiry as a Data Fiduciary under the Digital Personal Data
            Protection Act, 2023 (DPDPA). This policy applies to aapnoaavas.com and to any enquiry
            you make with our advisors.
          </p>

          <h2 className="mt-10 text-2xl text-navy">1. Personal Data We Collect</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">
            When you submit an enquiry, request a callback or share your requirement with us, we
            collect only what is needed to respond:
          </p>
          <ul className="mt-4 space-y-2 text-ink-muted leading-relaxed">
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
              <span>Your <strong className="text-ink">name</strong>, so our advisors can address you.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
              <span>Your <strong className="text-ink">phone number</strong>, to call or message you about your enquiry.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
              <span>Your <strong className="text-ink">email address</strong>, to send project details, floor plans and follow-ups.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
              <span>The <strong className="text-ink">property or locality</strong> you enquired about and any message you write to us.</span>
            </li>
          </ul>
          <p className="mt-4 text-ink-muted leading-relaxed">
            We do not knowingly collect financial account details, government identifiers or the
            data of children through this website.
          </p>

          <h2 className="mt-10 text-2xl text-navy">2. Why We Use Your Data</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">
            Your data is processed strictly for the specified purpose you consented to: responding
            to your enquiry, sharing details of RERA-registered projects that match your
            requirement, arranging site visits with the respective developer, and keeping you
            informed of relevant options in Jaipur. We do not sell your personal data.
          </p>

          <h2 className="mt-10 text-2xl text-navy">3. Consent &amp; Withdrawal</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">
            We process your data on the basis of the consent you give when you submit the enquiry
            form, which includes your authorisation to be contacted by call, SMS, WhatsApp and
            email. Your consent is free, specific and informed, and you may withdraw it at any time
            with the same ease. To withdraw consent or ask us to stop contacting you, write to us at{" "}
            <a href={`mailto:${SITE.email}`} className="text-terracotta underline underline-offset-2">
              {SITE.email}
            </a>
            . Withdrawal does not affect the lawfulness of processing done before withdrawal.
          </p>

          <h2 className="mt-10 text-2xl text-navy">4. Sharing With Developers</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">
            As a channel partner, we may share your name and contact details with the developer of
            the specific project you enquired about, solely so they can process your interest and
            allotment. Such developers act as independent Data Fiduciaries for their own processing.
          </p>

          <h2 className="mt-10 text-2xl text-navy">5. Retention</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">
            We retain your enquiry data only for as long as necessary to serve your requirement and
            to meet legal or accounting obligations, and we securely erase it thereafter unless a
            longer period is required by law or you continue to engage with us.
          </p>

          <h2 className="mt-10 text-2xl text-navy">6. Your Rights Under DPDPA, 2023</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">
            As a Data Principal you have the right to access a summary of your personal data, to
            request correction or erasure of inaccurate or no-longer-needed data, to nominate
            another person to exercise your rights, and to grievance redressal. Exercise any of
            these by contacting our Grievance Officer below.
          </p>

          <h2 className="mt-10 text-2xl text-navy">7. Data Security</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">
            We apply reasonable technical and organisational safeguards to protect your data against
            unauthorised access, loss or misuse, and limit access to authorised advisors only.
          </p>

          <h2 className="mt-10 text-2xl text-navy">8. Grievance Contact</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">
            For any privacy concern, consent withdrawal or to exercise your rights, contact our
            Grievance Officer at{" "}
            <a href={`mailto:${SITE.email}`} className="text-terracotta underline underline-offset-2">
              {SITE.email}
            </a>{" "}
            or call {SITE.phone}. We aim to acknowledge every request promptly and resolve it within
            the timelines prescribed under the DPDPA, 2023.
          </p>

          <p className="mt-10 border-t hairline pt-6 text-sm text-ink-muted">
            This policy may be updated to reflect changes in law or our practices. The version in
            effect is dated {SITE.consentPolicyVersion}.
          </p>
        </Reveal>
      </div>
    </>
  );
}
