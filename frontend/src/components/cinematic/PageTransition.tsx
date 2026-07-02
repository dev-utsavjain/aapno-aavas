import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

/** A quick black panel wipe on route change. No-op under reduced-motion. */
export function PageTransition() {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  const [prev, setPrev] = useState(pathname);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (reduced || pathname === prev) return;
    setPrev(pathname);
    setPlay(true);
    const t = setTimeout(() => setPlay(false), 650);
    return () => clearTimeout(t);
  }, [pathname, prev, reduced]);

  return (
    <AnimatePresence>
      {play && (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-[95] bg-ink pointer-events-none origin-bottom"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.34, ease: [0.76, 0, 0.24, 1] }}
        />
      )}
    </AnimatePresence>
  );
}
