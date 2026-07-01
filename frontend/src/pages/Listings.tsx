import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import type { ProjectFilters } from "@/lib/types";
import { Seo } from "@/components/Seo";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

const TYPES = [
  { v: "", l: "All" },
  { v: "residential", l: "Residential" },
  { v: "commercial", l: "Commercial" },
];
const STATUSES = [
  { v: "", l: "Any status" },
  { v: "upcoming", l: "Upcoming" },
  { v: "ongoing", l: "Under Construction" },
  { v: "ready", l: "Ready to Move" },
];

export default function Listings() {
  const [params, setParams] = useSearchParams();

  const filters: ProjectFilters = {
    q: params.get("q") || "",
    type: (params.get("type") as ProjectFilters["type"]) || "",
    status: (params.get("status") as ProjectFilters["status"]) || "",
    city: params.get("city") || "",
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

  const selectCls = "bg-surface border hairline rounded-sm px-4 py-2.5 text-sm text-ink outline-none focus:border-navy";

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

      {/* filter bar */}
      <div className="sticky top-20 z-30 bg-bg/95 backdrop-blur-sm border-b hairline">
        <div className="container-page py-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              defaultValue={filters.q}
              onKeyDown={(e) => e.key === "Enter" && update("q", (e.target as HTMLInputElement).value)}
              onBlur={(e) => update("q", e.target.value)}
              placeholder="Search by name, locality, developer…"
              className="w-full bg-surface border hairline rounded-sm pl-10 pr-4 py-2.5 text-sm outline-none focus:border-navy"
            />
          </div>
          <select value={filters.type} onChange={(e) => update("type", e.target.value)} className={selectCls}>
            {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => update("status", e.target.value)} className={selectCls}>
            {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </div>
      </div>

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
