import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ProjectFilters } from "@/lib/types";
import { Seo } from "@/components/Seo";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/motion/Reveal";
import { HeroSearch } from "@/components/HeroSearch";
import { cn } from "@/lib/cn";

export default function Listings() {
  const [params, setParams] = useSearchParams();

  const filters: ProjectFilters = {
    q: params.get("q") || "",
    type: (params.get("type") as ProjectFilters["type"]) || "",
    category: (params.get("category") as ProjectFilters["category"]) || "",
    status: (params.get("status") as ProjectFilters["status"]) || "",
    city: params.get("city") || "",
    price_min: Number(params.get("price_min")) || undefined,
    price_max: Number(params.get("price_max")) || undefined,
    page: Number(params.get("page") || 1),
    limit: 12,
  };

  const { data, isFetching } = useQuery({
    queryKey: ["projects", "list", filters],
    queryFn: () => api.listProjects(filters),
    placeholderData: keepPreviousData,
  });

  const projects = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / (filters.limit || 12)));

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  return (
    <>
      <Seo title="Property Listings in Jaipur" description="Browse residential and commercial projects across Jaipur. Filter by locality, configuration, budget and status." />

      {/* header */}
      <section className="bg-navy-deep text-surface pt-32 pb-14">
        <div className="container-page">
          <p className="eyebrow text-saffron mb-3">Our Portfolio</p>
          <h1 className="text-surface text-[clamp(2.25rem,4vw,3.5rem)] m-0">Properties in Jaipur</h1>
          <p className="mt-3 text-surface/70 max-w-xl">
            {total > 0 ? `${total} project${total > 1 ? "s" : ""} to explore.` : "Explore our curated projects."}
          </p>
        </div>
      </section>

      {/* search + filters */}
      <HeroSearch />

      {/* grid */}
      <section className="container-page py-16 min-h-[40vh]">
        {projects.length === 0 ? (
          <div className="text-center py-20 text-ink-muted">
            {isFetching ? "Loading…" : "No projects match your filters yet. Try clearing them."}
          </div>
        ) : (
          <div className={cn("grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 transition-opacity", isFetching && "opacity-60")}>
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.06}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-16 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => update("page", String(n))}
                className={cn(
                  "h-10 w-10 rounded-sm text-sm font-medium transition-colors",
                  n === filters.page ? "bg-navy text-surface" : "border hairline hover:bg-sand",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
