import { motion, useReducedMotion } from "motion/react";

/** Hero scroll hint — a scanning vertical line under a "Scroll" label. */
export function ScrollCue() {
  const reduced = useReducedMotion();
  return (
    <div className="flex flex-col items-center gap-2 text-white/70">
      <span className="text-[0.6rem] uppercase tracking-[0.35em]">Scroll</span>
      <motion.span
        className="block w-px h-10 bg-white/50 origin-top"
        animate={reduced ? undefined : { scaleY: [0, 1, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
