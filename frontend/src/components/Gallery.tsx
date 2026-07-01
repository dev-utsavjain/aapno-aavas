import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { Media } from "@/lib/types";
import { DISCLAIMERS } from "@/lib/site";
import { cn } from "@/lib/cn";

/** Full-bleed-friendly project gallery. Embla carousel; images + videos. */
export function Gallery({ media }: { media: Media[] }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (embla) setSelected(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla, onSelect]);

  if (!media || media.length === 0) {
    return <div className="aspect-[16/9] bg-sand rounded-sm grid place-items-center text-ink-muted">No media</div>;
  }

  return (
    <figure className="m-0">
      <div className="relative overflow-hidden rounded-sm" ref={emblaRef}>
        <div className="flex">
          {media.map((m) => (
            <div key={m.id} className="relative flex-[0_0_100%] aspect-[16/10] bg-sand">
              {m.kind === "video" ? (
                <video src={m.url} controls className="h-full w-full object-cover" />
              ) : (
                <img src={m.url} alt={m.alt || "Project view"} className="h-full w-full object-cover" />
              )}
            </div>
          ))}
        </div>

        {media.length > 1 && (
          <>
            <button
              onClick={() => embla?.scrollPrev()}
              aria-label="Previous"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-navy-deep/70 hover:bg-navy-deep text-surface p-2 rounded-full backdrop-blur-sm"
            >
              <CaretLeft size={20} />
            </button>
            <button
              onClick={() => embla?.scrollNext()}
              aria-label="Next"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-navy-deep/70 hover:bg-navy-deep text-surface p-2 rounded-full backdrop-blur-sm"
            >
              <CaretRight size={20} />
            </button>
          </>
        )}
      </div>

      {media.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {media.map((m, i) => (
            <button
              key={m.id}
              onClick={() => embla?.scrollTo(i)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-xs border-2 transition-colors",
                i === selected ? "border-saffron" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              {m.kind === "video" ? (
                <div className="h-full w-full grid place-items-center bg-navy text-surface text-xs">Video</div>
              ) : (
                <img src={m.url} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}

      <figcaption className="mt-2 text-xs text-ink-muted italic">{DISCLAIMERS.visuals}</figcaption>
    </figure>
  );
}
