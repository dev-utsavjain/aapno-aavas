import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Plus, Minus } from "@phosphor-icons/react";
import { FAQ_ITEMS } from "@/lib/site";
import { Reveal } from "@/components/motion/Reveal";

/** Buyer-advisory FAQ accordion (single-open). Re-skinned to the editorial system. */
export function Faq() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="container-page py-24 md:py-32">
      <Reveal>
        <p className="eyebrow mb-3">Good to know</p>
        <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] max-w-2xl">Frequently asked questions</h2>
      </Reveal>

      <div className="mt-12 mx-auto max-w-3xl border-t hairline">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="border-b hairline">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span className="text-lg font-medium text-ink">{item.q}</span>
                <span className="shrink-0 text-saffron-ink">
                  {isOpen ? <Minus size={20} weight="bold" /> : <Plus size={20} weight="bold" />}
                </span>
              </button>

              {reduced ? (
                isOpen && <p className="pb-6 pr-10 text-ink-muted m-0">{item.a}</p>
              ) : (
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-10 text-ink-muted m-0">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
