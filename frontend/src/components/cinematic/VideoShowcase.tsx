import { useEffect, useRef } from "react";
import { WhatsAppButton, whatsappDefaultMessage } from "@/components/WhatsAppButton";
import { GrainOverlay } from "./GrainOverlay";

/** Full-bleed "Step Inside" ambient video band. Plays only while in view (saves CPU/data). */
export function VideoShowcase() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative h-[72vh] min-h-[520px] overflow-hidden bg-ink">
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover opacity-70"
        muted
        loop
        playsInline
        preload="none"
        poster="/img/showcase-poster.jpg"
      >
        <source src="/video/showcase.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/45 to-ink/75" />
      <GrainOverlay />
      <div className="container-page relative h-full flex flex-col justify-center max-w-2xl text-white">
        <p className="eyebrow !text-saffron mb-3">A closer look</p>
        <h2 className="text-white text-[clamp(2.5rem,5.5vw,4.5rem)]">Step Inside</h2>
        <p className="mt-4 text-white/80 max-w-md text-lg">
          Walk through the spaces we represent — the light, the finish, the feel of a home long
          before you ever set foot on site.
        </p>
        <div className="mt-8">
          <WhatsAppButton message={whatsappDefaultMessage()} label="Book a Site Visit" />
        </div>
      </div>
    </section>
  );
}
