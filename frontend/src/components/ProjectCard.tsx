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
      <div className="relative overflow-hidden rounded-sm bg-sand aspect-[4/3]">
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
          <span className="absolute top-3 left-3 bg-navy-deep/85 text-surface text-xs font-medium px-3 py-1 rounded-xs backdrop-blur-sm">
            {STATUS_LABEL[project.status] || project.status}
          </span>
        )}
      </div>

      <div className="pt-4">
        <h3 className="text-xl leading-tight m-0 transition-colors">
          <span className="bg-[linear-gradient(var(--color-saffron),var(--color-saffron))] bg-[length:0%_2px] bg-no-repeat bg-left-bottom transition-[background-size] duration-500 group-hover:bg-[length:100%_2px]">
            {project.title}
          </span>
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-muted m-0">
          <MapPin size={15} className="text-saffron-ink" />
          {[project.locality, project.city].filter(Boolean).join(", ")}
        </p>
        <div className="mt-2 flex items-center gap-3 text-sm text-ink">
          {project.bhk_config && <span>{project.bhk_config}</span>}
          {project.bhk_config && <span className="text-sand">·</span>}
          <span className="font-medium">{formatPrice(project.price_min, project.price_max)}</span>
        </div>
      </div>
    </Link>
  );
}
