import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, PencilSimple, Trash, X, Code } from "@phosphor-icons/react";
import { api, ApiError } from "@/lib/api";
import { Seo } from "@/components/Seo";
import type { Page } from "@/lib/types";

type PageDraft = {
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  body: string;
};

function emptyDraft(): PageDraft {
  return { slug: "", title: "", meta_title: "", meta_description: "", body: "" };
}

function toDraft(p: Page): PageDraft {
  return {
    slug: p.slug,
    title: p.title,
    meta_title: p.meta_title,
    meta_description: p.meta_description,
    body: p.body,
  };
}

export default function Pages() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: () => api.admin.listPages(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-pages"] });

  const createMutation = useMutation({
    mutationFn: (draft: PageDraft) => api.admin.createPage(draft),
    onSuccess: () => {
      invalidate();
      setCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, draft }: { id: number; draft: PageDraft }) =>
      api.admin.updatePage(id, draft),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.admin.deletePage(id),
    onSuccess: invalidate,
  });

  const pages = data ?? [];

  return (
    <div className="space-y-8">
      <Seo title="Pages — Advisory Console" noindex />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-ink-muted">Advisory Console</p>
          <h1 className="text-3xl text-navy">Content Pages</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Editorial pages such as About, Advisory Services, Privacy and Terms.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            setEditingId(null);
          }}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus size={18} weight="bold" />
          New page
        </button>
      </header>

      {creating && (
        <PageForm
          initial={emptyDraft()}
          title="New page"
          submitLabel={createMutation.isPending ? "Creating…" : "Create page"}
          disabled={createMutation.isPending}
          errorMsg={
            createMutation.error instanceof ApiError ? createMutation.error.message : null
          }
          onCancel={() => setCreating(false)}
          onSubmit={(draft) => createMutation.mutate(draft)}
        />
      )}

      {isLoading && (
        <div className="bg-surface hairline rounded-sm p-12 text-center text-ink-muted">
          Loading pages…
        </div>
      )}

      {isError && (
        <div className="bg-surface hairline rounded-sm p-12 text-center text-terracotta">
          {error instanceof ApiError ? error.message : "Could not load pages."}
        </div>
      )}

      {!isLoading && !isError && pages.length === 0 && !creating && (
        <div className="bg-surface hairline rounded-sm p-12 text-center">
          <p className="text-navy">No content pages yet.</p>
          <p className="mt-1 text-sm text-ink-muted">
            Add an About or Advisory Services page to give buyers context before they enquire.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {pages.map((p) =>
          editingId === p.id ? (
            <PageForm
              key={p.id}
              initial={toDraft(p)}
              title={`Edit — ${p.title || p.slug}`}
              submitLabel={updateMutation.isPending ? "Saving…" : "Save changes"}
              disabled={updateMutation.isPending}
              errorMsg={
                updateMutation.error instanceof ApiError ? updateMutation.error.message : null
              }
              onCancel={() => setEditingId(null)}
              onSubmit={(draft) => updateMutation.mutate({ id: p.id, draft })}
            />
          ) : (
            <PageCard
              key={p.id}
              page={p}
              onEdit={() => {
                setEditingId(p.id);
                setCreating(false);
              }}
              onDelete={() => {
                if (window.confirm(`Delete page "${p.title || p.slug}"? This cannot be undone.`)) {
                  deleteMutation.mutate(p.id);
                }
              }}
              deleting={deleteMutation.isPending && deleteMutation.variables === p.id}
            />
          ),
        )}
      </div>
    </div>
  );
}

function PageCard({
  page,
  onEdit,
  onDelete,
  deleting,
}: {
  page: Page;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 bg-surface hairline rounded-sm p-5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <h2 className="text-xl text-navy">{page.title || "Untitled page"}</h2>
        <p className="mt-1 text-sm text-ink-muted">
          <span className="rounded-xs bg-sand px-1.5 py-0.5 text-navy">/{page.slug}</span>
          {page.meta_description && (
            <span className="ml-2 line-clamp-1 align-middle">{page.meta_description}</span>
          )}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="btn-outline inline-flex items-center gap-1.5 px-3 py-1.5"
        >
          <PencilSimple size={16} />
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 rounded-xs hairline bg-bg px-3 py-1.5 text-sm text-terracotta hover:border-terracotta disabled:opacity-50"
        >
          <Trash size={16} />
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

function PageForm({
  initial,
  title,
  submitLabel,
  disabled,
  errorMsg,
  onCancel,
  onSubmit,
}: {
  initial: PageDraft;
  title: string;
  submitLabel: string;
  disabled: boolean;
  errorMsg: string | null;
  onCancel: () => void;
  onSubmit: (draft: PageDraft) => void;
}) {
  const [draft, setDraft] = useState<PageDraft>(initial);

  function set<K extends keyof PageDraft>(key: K, value: PageDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  const inputClass =
    "w-full rounded-xs hairline bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-saffron";
  const labelClass = "eyebrow text-ink-muted block mb-1";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(draft);
      }}
      className="bg-surface hairline rounded-sm p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl text-navy">{title}</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-ink-muted hover:text-navy"
          aria-label="Cancel"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass}>Slug</label>
          <input
            type="text"
            required
            value={draft.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="about"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Title</label>
          <input
            type="text"
            required
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="About Aapno Aavas"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Meta title</label>
          <input
            type="text"
            value={draft.meta_title}
            onChange={(e) => set("meta_title", e.target.value)}
            placeholder="About — Aapno Aavas, Jaipur real-estate advisory"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Meta description</label>
          <input
            type="text"
            value={draft.meta_description}
            onChange={(e) => set("meta_description", e.target.value)}
            placeholder="One-line summary shown in search results."
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Body</label>
          <textarea
            value={draft.body}
            onChange={(e) => set("body", e.target.value)}
            rows={16}
            placeholder="<h2>Our approach</h2>\n<p>We advise buyers across Jaipur…</p>"
            className={`${inputClass} font-mono leading-relaxed`}
          />
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-muted">
            <Code size={14} />
            Accepts basic HTML — headings, paragraphs, lists and links. The server sanitises the
            markup on save, so unsafe tags and scripts are stripped automatically.
          </p>
        </div>
      </div>

      {errorMsg && <p className="mt-4 text-sm text-terracotta">{errorMsg}</p>}

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-outline">
          Cancel
        </button>
        <button type="submit" disabled={disabled} className="btn-primary disabled:opacity-60">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
