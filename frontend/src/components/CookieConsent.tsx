import { useState } from "react";
import { Link } from "react-router-dom";

const KEY = "aa_cookie_consent";

/** Minimal cookie-consent banner backed by localStorage — no third-party library. */
export function CookieConsent() {
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(KEY));
  if (dismissed) return null;

  const choose = (value: "accepted" | "declined") => {
    localStorage.setItem(KEY, value);
    setDismissed(true);
    if (value === "accepted") window.location.reload(); // let Analytics initialise
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] bg-navy-deep text-surface">
      <div className="container-page py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <p className="text-sm text-surface/80 max-w-2xl">
          We use cookies to improve your experience and understand site traffic. See our{" "}
          <Link to="/privacy" className="underline text-saffron">Privacy Policy</Link>.
        </p>
        <div className="flex gap-3 shrink-0">
          <button onClick={() => choose("declined")} className="text-sm px-4 py-2 text-surface/70 hover:text-surface">
            Decline
          </button>
          <button onClick={() => choose("accepted")} className="btn-primary text-sm py-2">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
