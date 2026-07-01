import { Info } from "@phosphor-icons/react";
import { DISCLAIMERS } from "@/lib/site";

/**
 * Mandated legal disclaimer block for every project page. Content is fixed (from site
 * constants) and cannot be edited away via the CMS.
 */
export function DisclaimerBlock({ reraNo, reraUrl }: { reraNo?: string; reraUrl?: string }) {
  return (
    <aside className="border hairline bg-surface rounded-sm p-6 md:p-8 text-sm leading-relaxed text-ink-muted">
      <div className="flex items-center gap-2 text-navy mb-4">
        <Info size={20} weight="bold" />
        <h3 className="font-body font-semibold text-navy m-0 text-base normal-case tracking-normal">
          Important Disclaimer
        </h3>
      </div>
      {reraNo && (
        <p className="mb-3">
          <span className="font-semibold text-ink">RERA:</span> {reraNo}
          {reraUrl && (
            <>
              {" — "}
              <a href={reraUrl} target="_blank" rel="noopener" className="text-saffron-ink underline underline-offset-2">
                verify on the State RERA portal
              </a>
            </>
          )}
        </p>
      )}
      <ul className="space-y-2.5 list-none p-0 m-0">
        <li>{DISCLAIMERS.notDeveloper}</li>
        <li>{DISCLAIMERS.invitationToOffer}</li>
        <li>{DISCLAIMERS.rera}</li>
        <li>{DISCLAIMERS.visuals}</li>
        <li>{DISCLAIMERS.area}</li>
      </ul>
    </aside>
  );
}
