import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "@phosphor-icons/react";
import type { ProjectCategory } from "@/lib/types";
import { api } from "@/lib/api";
import { Reveal } from "@/components/motion/Reveal";
import { ProjectCard } from "@/components/ProjectCard";
import { cn } from "@/lib/cn";

interface Props {
  category: ProjectCategory;
  title: string;
  eyebrow?: string;
  /** Optional band tint to alternate section backgrounds. */
  muted?: boolean;
}

/**
 * A home-page band that shows up to 6 published projects of one category, with a "View all" link
 * into the filtered listing. Renders nothing when the category has no published projects, so the
 * home page never shows an empty section.
 */
export function CategorySection({ category, title, eyebrow, muted = false }: Props) {
  const { data } = useQuery({
    queryKey: ["projects", "category", category],
    queryFn: () => api.listProjects({ category, limit: 6 }),
  });
  const projects = data?.data ?? [];
  if (projects.length === 0) return null;

  return (
    <section className={cn(muted && "bg-panel")}>
      <div className="container-page py-24 md:py-28">
        <Reveal>
          <div className="flex items-end justify-between gap-4 mb-12">
            <div>
              <p className="eyebrow mb-3">{eyebrow ?? "Explore"}</p>
              <h2 className="text-[clamp(2rem,3.5vw,2.75rem)]">{title}</h2>
            </div>
            <Link
              to={`/projects?category=${category}`}
              className="hidden sm:inline-flex items-center gap-1.5 text-ink font-medium hover:text-saffron-ink transition-colors"
            >
              View all <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </Reveal>
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 0.08}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>
        <div className="mt-10 sm:hidden">
          <Link to={`/projects?category=${category}`} className="btn-outline w-full justify-center">
            View all <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      </div>
    </section>
  );
}
