import { useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { api, ApiError } from "@/lib/api";
import { CONSENT } from "@/lib/site";
import { Turnstile } from "./Turnstile";

/**
 * Lead capture form. Enforces both consents client-side (server re-enforces), includes a
 * hidden honeypot, and passes a Turnstile token when configured.
 */
export function LeadForm({
  projectId,
  projectTitle,
  compact = false,
}: {
  projectId?: number;
  projectTitle?: string;
  compact?: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const fd = new FormData(form);

    const consentData = fd.get("consent_data_processing") === "on";
    const consentDnd = fd.get("consent_telecom_dnd") === "on";
    if (!consentData || !consentDnd) {
      setError("Please accept both consent statements to submit.");
      return;
    }

    setSubmitting(true);
    try {
      await api.createLead({
        name: String(fd.get("name") || ""),
        phone: String(fd.get("phone") || ""),
        email: String(fd.get("email") || ""),
        message: String(fd.get("message") || ""),
        source: "form",
        project_id: projectId ?? null,
        consent_data_processing: consentData,
        consent_telecom_dnd: consentDnd,
        company: String(fd.get("company") || ""), // honeypot
        turnstile_token: token,
      });
      setDone(true);
      form.reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="bg-surface border hairline rounded-sm p-8 text-center">
        <CheckCircle size={48} weight="fill" className="text-saffron mx-auto mb-4" />
        <h3 className="text-2xl m-0 mb-2">Thank you</h3>
        <p className="text-ink-muted m-0">
          Our advisor will reach out to you shortly{projectTitle ? ` about ${projectTitle}` : ""}.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full bg-bg border hairline rounded-sm px-4 py-3 text-ink placeholder:text-ink-muted/60 focus:border-navy outline-none transition-colors";

  return (
    <form onSubmit={onSubmit} className="bg-surface border hairline rounded-sm p-6 md:p-8 space-y-4">
      {!compact && (
        <div>
          <p className="eyebrow mb-1">Request a callback</p>
          <h3 className="text-2xl m-0">Speak with an advisor</h3>
        </div>
      )}

      {/* honeypot — visually hidden, must stay empty */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Full name" className={inputCls} />
        <input name="phone" required placeholder="Phone number" className={inputCls} />
      </div>
      <input name="email" type="email" placeholder="Email (optional)" className={inputCls} />
      <textarea
        name="message"
        rows={compact ? 2 : 3}
        placeholder={projectTitle ? `I'm interested in ${projectTitle}…` : "How can we help?"}
        className={inputCls}
      />

      <label className="flex gap-3 text-sm text-ink-muted leading-snug cursor-pointer">
        <input type="checkbox" name="consent_data_processing" className="mt-1 accent-[var(--color-navy)]" />
        <span>{CONSENT.dataProcessing}</span>
      </label>
      <label className="flex gap-3 text-sm text-ink-muted leading-snug cursor-pointer">
        <input type="checkbox" name="consent_telecom_dnd" className="mt-1 accent-[var(--color-navy)]" />
        <span>{CONSENT.telecomDND}</span>
      </label>

      <Turnstile onToken={setToken} />

      {error && <p className="text-terracotta text-sm m-0">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary w-full justify-center disabled:opacity-60">
        {submitting ? "Sending…" : "Submit Inquiry"}
      </button>
    </form>
  );
}
