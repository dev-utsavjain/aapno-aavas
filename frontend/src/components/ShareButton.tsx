import { useEffect, useRef, useState } from "react";
import {
  ShareNetwork,
  WhatsappLogo,
  FacebookLogo,
  XLogo,
  TelegramLogo,
  EnvelopeSimple,
  LinkSimple,
  Check,
} from "@phosphor-icons/react";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/cn";

/** Absolute URL to a project page — prefers the configured site URL, falls back to the origin. */
function projectUrl(slug: string): string {
  const origin = SITE.siteURL || (typeof window !== "undefined" ? window.location.origin : "");
  return `${origin}/projects/${slug}`;
}

interface Props {
  slug: string;
  title: string;
  /** Positioning / size utilities from the parent (e.g. absolute placement on a card). */
  className?: string;
}

/**
 * Share control with the regular set of targets: the native share sheet (mobile) plus WhatsApp,
 * Facebook, X, Telegram, email and copy-link. Self-contained popover; stops click propagation so
 * it works when overlaid on a linked card.
 */
export function ShareButton({ slug, title, className }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const url = projectUrl(slug);
  const text = `${title} — Aapno Aavas`;
  const eu = encodeURIComponent(url);
  const et = encodeURIComponent(text);

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function stop(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  async function nativeShare(e: React.MouseEvent) {
    stop(e);
    try {
      await navigator.share({ title, text, url });
      setOpen(false);
    } catch {
      /* user dismissed the share sheet — no-op */
    }
  }

  async function copyLink(e: React.MouseEvent) {
    stop(e);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  const targets = [
    { key: "whatsapp", label: "WhatsApp", icon: WhatsappLogo, href: `https://wa.me/?text=${et}%20${eu}` },
    { key: "facebook", label: "Facebook", icon: FacebookLogo, href: `https://www.facebook.com/sharer/sharer.php?u=${eu}` },
    { key: "x", label: "X (Twitter)", icon: XLogo, href: `https://twitter.com/intent/tweet?url=${eu}&text=${et}` },
    { key: "telegram", label: "Telegram", icon: TelegramLogo, href: `https://t.me/share/url?url=${eu}&text=${et}` },
    { key: "email", label: "Email", icon: EnvelopeSimple, href: `mailto:?subject=${et}&body=${et}%0A%0A${eu}` },
  ];

  const itemCls =
    "flex w-full items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-panel transition-colors";

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Share this property"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          stop(e);
          setOpen((o) => !o);
        }}
        className="grid h-9 w-9 place-items-center rounded-sm bg-white/90 text-ink shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
      >
        <ShareNetwork size={17} weight="bold" />
      </button>

      {open && (
        <div
          role="menu"
          onClick={stop}
          className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-sm border hairline bg-white shadow-sm"
        >
          <p className="border-b hairline px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            Share
          </p>

          {hasNativeShare && (
            <button type="button" role="menuitem" onClick={nativeShare} className={itemCls}>
              <ShareNetwork size={17} weight="bold" className="text-saffron-ink" />
              Share via…
            </button>
          )}

          {targets.map((t) => (
            <a
              key={t.key}
              role="menuitem"
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
              className={itemCls}
            >
              <t.icon size={17} weight="fill" className="text-saffron-ink" />
              {t.label}
            </a>
          ))}

          <button type="button" role="menuitem" onClick={copyLink} className={cn(itemCls, "border-t hairline")}>
            {copied ? (
              <Check size={17} weight="bold" className="text-saffron-ink" />
            ) : (
              <LinkSimple size={17} weight="bold" className="text-saffron-ink" />
            )}
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
