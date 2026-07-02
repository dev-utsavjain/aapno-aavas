import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

/** Brief branded intro (once per session). Skipped entirely under reduced-motion. */
export function IntroLoader() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    // Skip via ?nointro (previews/embeds) or once-per-session.
    if (new URLSearchParams(window.location.search).has("nointro")) return false;
    return sessionStorage.getItem("aa_intro") !== "done";
  });

  useEffect(() => {
    if (!show) return;
    const done = () => {
      sessionStorage.setItem("aa_intro", "done");
      setShow(false);
    };
    if (reduced) {
      done();
      return;
    }
    const t = setTimeout(done, 1800);
    return () => clearTimeout(t);
  }, [show, reduced]);

  return (
    <AnimatePresence>
      {show && !reduced && (
        <motion.div
          className="fixed inset-0 z-[100] bg-ink flex flex-col items-center justify-center"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="font-deva text-saffron text-2xl mb-1">आपणों</div>
            <div className="text-white font-display font-bold text-4xl tracking-[0.25em] uppercase">
              Aavas
            </div>
          </motion.div>
          <motion.div
            className="mt-7 h-[2px] bg-saffron"
            initial={{ width: 0 }}
            animate={{ width: 180 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
