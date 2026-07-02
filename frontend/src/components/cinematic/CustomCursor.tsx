import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/** Minimal dot + trailing ring cursor. Desktop (pointer:fine) + non-reduced-motion only. */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 350, damping: 28 });
  const ry = useSpring(y, { stiffness: 350, damping: 28 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    setEnabled(true);
    document.body.classList.add("cursor-none");
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const next = !!t?.closest("a, button, [data-cursor]");
      // ponytail: only setState on change — mouseover fires per element crossing
      setHover((prev) => (prev === next ? prev : next));
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      document.body.classList.remove("cursor-none");
    };
  }, [x, y]);

  if (!enabled) return null;
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90] rounded-full bg-saffron"
        style={{ x, y, width: 7, height: 7, translateX: "-50%", translateY: "-50%" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90] rounded-full border border-ink/50"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        animate={{ width: hover ? 52 : 30, height: hover ? 52 : 30, opacity: hover ? 1 : 0.7 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      />
    </>
  );
}
