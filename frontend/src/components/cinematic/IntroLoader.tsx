import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";

/**
 * Brief branded intro — HOME ROUTE ONLY (never on shared deep links), once per session,
 * skipped under reduced-motion or ?nointro. Dismissal is guaranteed: it lifts after a delay and
 * hard-unmounts on animation complete, with a hard timeout fallback so it can never get stuck.
 */
export function IntroLoader() {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();

  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    if (pathname !== "/") return false;
    if (new URLSearchParams(window.location.search).has("nointro")) return false;
    return sessionStorage.getItem("aa_intro") !== "done";
  });
  const [lift, setLift] = useState(false);

  useEffect(() => {
    if (!show) return;
    sessionStorage.setItem("aa_intro", "done");
    if (reduced) {
      setShow(false);
      return;
    }
    const liftTimer = setTimeout(() => setLift(true), 1500);
    // Hard fallback: unmount no matter what, so a stuck animation can never leave a black screen.
    const killTimer = setTimeout(() => setShow(false), 3000);
    return () => {
      clearTimeout(liftTimer);
      clearTimeout(killTimer);
    };
  }, [show, reduced]);

  if (!show) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-ink flex flex-col items-center justify-center"
      initial={{ y: 0 }}
      animate={{ y: lift ? "-100%" : 0 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => {
        if (lift) setShow(false);
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <div className="font-deva text-saffron text-2xl mb-1">आपणों</div>
        <div className="text-white font-display font-bold text-4xl tracking-[0.25em] uppercase">Aavas</div>
      </motion.div>
      <motion.div
        className="mt-7 h-[2px] bg-saffron"
        initial={{ width: 0 }}
        animate={{ width: 180 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
