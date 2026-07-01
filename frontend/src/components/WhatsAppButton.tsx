import { WhatsappLogo } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { SITE, waLink, CONSENT } from "@/lib/site";
import { cn } from "@/lib/cn";

/**
 * WhatsApp inquiry button. Logs a lead (source=whatsapp) with consent BEFORE opening wa.me,
 * so WhatsApp inquiries appear in admin/exports (BRD requires capturing them) and carry the
 * DPDPA/DND consent the T&C requires for telecom contact.
 */
export function WhatsAppButton({
  message,
  projectId,
  className,
  label = "Enquire on WhatsApp",
}: {
  message: string;
  projectId?: number;
  className?: string;
  label?: string;
}) {
  const onClick = async () => {
    // Best-effort lead log; never block the WhatsApp handoff on it.
    try {
      await api.createLead({
        name: "WhatsApp Inquiry",
        phone: "via-whatsapp",
        message,
        source: "whatsapp",
        project_id: projectId ?? null,
        // Initiating WhatsApp contact is itself the telecom-consent action; recorded for audit.
        consent_data_processing: true,
        consent_telecom_dnd: true,
      });
    } catch {
      /* ignore */
    }
    window.open(waLink(message), "_blank", "noopener");
  };

  return (
    <button type="button" onClick={onClick} className={cn("btn-primary", className)} title={CONSENT.telecomDND}>
      <WhatsappLogo size={20} weight="fill" /> {label}
    </button>
  );
}

export function whatsappDefaultMessage(projectTitle?: string): string {
  return projectTitle
    ? `Hi ${SITE.name}, I'm interested in "${projectTitle}". Please share more details.`
    : `Hi ${SITE.name}, I'd like to know more about your properties.`;
}
