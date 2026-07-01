import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, PencilSimple, Trash, Star, MapPin } from "@phosphor-icons/react";
import { api, ApiError } from "@/lib/api";
import type { Project } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/site";
import { cn } from "@/lib/cn";

const PAGE_LIMIT = 20;

export default function Projects() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "projects", page],
    queryFn: () => api.admin.listProjects({ page, limit: PAGE_LIMIT }),
  });

  const publishMut = useMutation({
    mutationFn: ({ id, is_published }: { id: number; is_published: boolean }) =>
      api.admin.updateProject(id, { is_published }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "projects"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.admin.deleteProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "projects"] }),
  });

  const projects = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  function onDelete(p: Project) {
    if (
      window.confirm(
        `Delete "${p.title}"? This removes the listing and its media permanently.`,
      )
    ) {
      deleteMut.mutate(p.id);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="eyebrow text-ink-muted">Content</p>
          <h1 className="text-navy">Projects</h1>
          <p className="text-ink-muted mt-1">
            {total} listing{total === 1 ? "" : "s"} across the Jaipur catalogue.
          </p>
        </div>
        <Link to="/admin/projects/new" className="btn-primary inline-flex items-center gap-2">
          <Plus size={18} weight="bold" />
          New Project
        </Link>
      </div>

      {deleteMut.isError && (
        <div className="mb-4 hairline rounded-sm bg-surface px-4 py-3 text-terracotta">
          Could not delete this project. {(deleteMut.error as ApiError)?.message}
        </div>
      )}

      <div className="hairline rounded-sm bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b hairline text-ink-muted">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="px-4 py-3 font-medium">Featured</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-ink-muted">
                    Loading projects…
                  </td>
                </tr>
              )}

              {isError && !isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-terracotta">
                    Failed to load projects. {(error as ApiError)?.message}
                  </td>
                </tr>
              )}

              {!isLoading && !isError && projects.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <p className="text-ink">No projects yet.</p>
                    <p className="text-ink-muted mt-1">
                      Add your first Jaipur listing to begin building the catalogue.
                    </p>
                    <Link
                      to="/admin/projects/new"
                      className="btn-outline inline-flex items-center gap-2 mt-4"
                    >
                      <Plus size={16} weight="bold" />
                      New Project
                    </Link>
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                projects.map((p) => (
                  <tr key={p.id} className="border-b hairline last:border-0 align-top">
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/projects/${p.id}`}
                        className="text-navy font-medium hover:text-saffron-ink"
                      >
                        {p.title || "Untitled"}
                      </Link>
                      {p.developer_name && (
                        <div className="text-ink-muted text-xs mt-0.5">{p.developer_name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={14} />
                        {[p.locality, p.city].filter(Boolean).join(", ") || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize text-ink-muted">{p.type}</td>
                    <td className="px-4 py-3 text-ink-muted">
                      {STATUS_LABEL[p.status] ?? p.status}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={publishMut.isPending}
                        onClick={() =>
                          publishMut.mutate({ id: p.id, is_published: !p.is_published })
                        }
                        className={cn(
                          "hairline rounded-xs px-2.5 py-1 text-xs font-medium transition-colors",
                          p.is_published
                            ? "bg-saffron text-saffron-ink"
                            : "bg-bg text-ink-muted hover:border-navy",
                        )}
                      >
                        {p.is_published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {p.featured ? (
                        <span className="inline-flex items-center gap-1 text-saffron-ink">
                          <Star size={16} weight="fill" />
                        </span>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/projects/${p.id}`}
                          className="hairline rounded-xs p-1.5 text-navy hover:border-navy"
                          aria-label={`Edit ${p.title}`}
                        >
                          <PencilSimple size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDelete(p)}
                          disabled={deleteMut.isPending}
                          className="hairline rounded-xs p-1.5 text-terracotta hover:border-terracotta"
                          aria-label={`Delete ${p.title}`}
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 text-sm">
          <span className="text-ink-muted">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((n) => Math.max(1, n - 1))}
              disabled={page <= 1}
              className="btn-outline disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((n) => Math.min(totalPages, n + 1))}
              disabled={page >= totalPages}
              className="btn-outline disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
