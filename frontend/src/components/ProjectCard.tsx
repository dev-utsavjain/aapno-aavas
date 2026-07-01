import { Link } from "react-router-dom";
import { MapPin } from "@phosphor-icons/react";
import type { Project } from "@/lib/types";
import { formatPrice, STATUS_LABEL } from "@/lib/site";

/**
 * Editorial, card-less project tile: large image, title in display serif, fine metadata.
 * Hover = gentle image zoom + saffron title underline. No box shadows, no app-chrome rounding.
 */
export function ProjectCard({ project }: { project: Project }) {
  const cover = project.media?.[0]?.url;
  return (
    <Link to={`/projects/${project.slug}`} className="group block">
      <div className="relative overflow-hidden border hairline bg-panel aspect-[4/3]">
        {cover ? (
          <img
            src={cover}
            alt={project.media?.[0]?.alt || project.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-ink-muted/50 text-sm">No image</div>
        )}
        {project.status && (
          <span className="absolute top-0 left-0 bg-ink text-white text-[0.65rem] font-semibold uppercase tracking-[0.12em] px-3 py-1.5">
            {STATUS_LABEL[project.status] || project.status}
          </span>
        )}
      </div>

      <div className="pt-3.5">
        <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-saffron-ink m-0">
          <MapPin size={13} weight="fill" />
          {[project.locality, project.city].filter(Boolean).join(", ")}
        </p>
        <h3 className="text-lg leading-tight mt-1.5 mb-0 transition-colors group-hover:text-saffron-ink">
          {project.title}
        </h3>
        <div className="mt-2 flex items-center gap-2.5 text-sm text-ink-muted">
          {project.bhk_config && <span className="uppercase tracking-wide text-xs font-medium">{project.bhk_config}</span>}
          {project.bhk_config && <span className="text-sand">/</span>}
          <span className="font-semibold text-ink">{formatPrice(project.price_min, project.price_max)}</span>
        </div>
      </div>
    </Link>
  );
}
