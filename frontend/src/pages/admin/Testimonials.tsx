import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, PencilSimple, Trash, Star, X } from "@phosphor-icons/react";
import { api, ApiError } from "@/lib/api";
import { Seo } from "@/components/Seo";
import type { Testimonial } from "@/lib/types";

type TestimonialDraft = {
  name: string;
  quote: string;
  location: string;
  photo_url: string;
  rating: number;
  sort_order: number;
  active: boolean;
};

function emptyDraft(): TestimonialDraft {
  return { name: "", quote: "", location: "", photo_url: "", rating: 5, sort_order: 0, active: true };
}

function toDraft(t: Testimonial): TestimonialDraft {
  return {
    name: t.name,
    quote: t.quote,
    location: t.location,
    photo_url: t.photo_url,
    rating: t.rating,
    sort_order: t.sort_order,
    active: t.active,
  };
}

export default function Testimonials() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: () => api.admin.listTestimonials(),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
    qc.invalidateQueries({ queryKey: ["testimonials"] });
  };

  const createMutation = useMutation({
    mutationFn: (draft: TestimonialDraft) => api.admin.createTestimonial(draft),
    onSuccess: () => {
      invalidate();
      setCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, draft }: { id: number; draft: TestimonialDraft }) =>
      api.admin.updateTestimonial(id, draft),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.admin.deleteTestimonial(id),
    onSuccess: invalidate,
  });

  const testimonials = data ?? [];

  return (
    <div className="space-y-8">
      <Seo title="Testimonials — Advisory Console" noindex />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-ink-muted">Advisory Console</p>
          <h1 className="text-3xl text-navy">Testimonials</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Customer quotes shown on the home page. Only active ones appear on the live site.
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
          New testimonial
        </button>
      </header>

      {creating && (
        <TestimonialForm
          initial={emptyDraft()}
          title="New testimonial"
          submitLabel={createMutation.isPending ? "Creating…" : "Create testimonial"}
          disabled={createMutation.isPending}
          errorMsg={createMutation.error instanceof ApiError ? createMutation.error.message : null}
          onCancel={() => setCreating(false)}
          onSubmit={(draft) => createMutation.mutate(draft)}
        />
      )}

      {isLoading && (
        <div className="bg-surface hairline rounded-sm p-12 text-center text-ink-muted">
          Loading testimonials…
        </div>
      )}

      {isError && (
        <div className="bg-surface hairline rounded-sm p-12 text-center text-terracotta">
          {error instanceof ApiError ? error.message : "Could not load testimonials."}
        </div>
      )}

      {!isLoading && !isError && testimonials.length === 0 && !creating && (
        <div className="bg-surface hairline rounded-sm p-12 text-center">
          <p className="text-navy">No testimonials yet.</p>
          <p className="mt-1 text-sm text-ink-muted">
            Add a customer quote to build trust on the home page.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {testimonials.map((t) =>
          editingId === t.id ? (
            <TestimonialForm
              key={t.id}
              initial={toDraft(t)}
              title={`Edit testimonial #${t.id}`}
              submitLabel={updateMutation.isPending ? "Saving…" : "Save changes"}
              disabled={updateMutation.isPending}
              errorMsg={
                updateMutation.error instanceof ApiError ? updateMutation.error.message : null
              }
              onCancel={() => setEditingId(null)}
              onSubmit={(draft) => updateMutation.mutate({ id: t.id, draft })}
            />
          ) : (
            <TestimonialCard
              key={t.id}
              testimonial={t}
              onEdit={() => {
                setEditingId(t.id);
                setCreating(false);
              }}
              onDelete={() => {
                if (window.confirm(`Delete testimonial from "${t.name}"? This cannot be undone.`)) {
                  deleteMutation.mutate(t.id);
                }
              }}
              deleting={deleteMutation.isPending && deleteMutation.variables === t.id}
            />
          ),
        )}
      </div>
    </div>
  );
}

function TestimonialCard({
  testimonial,
  onEdit,
  onDelete,
  deleting,
}: {
  testimonial: Testimonial;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 bg-surface hairline rounded-sm p-4 sm:flex-row">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-sand">
        {testimonial.photo_url ? (
          <img src={testimonial.photo_url} alt={testimonial.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-lg font-semibold uppercase text-navy">
            {testimonial.name.trim().charAt(0)}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={
              testimonial.active
                ? "inline-flex items-center rounded-xs bg-navy px-2 py-0.5 text-xs text-bg"
                : "inline-flex items-center rounded-xs hairline bg-bg px-2 py-0.5 text-xs text-ink-muted"
            }
          >
            {testimonial.active ? "Active" : "Hidden"}
          </span>
          <span className="flex gap-0.5">
            {Array.from({ length: 5 }, (_, s) => (
              <Star
                key={s}
                size={13}
                weight={s < testimonial.rating ? "fill" : "regular"}
                className={s < testimonial.rating ? "text-saffron" : "text-sand"}
              />
            ))}
          </span>
          <span className="text-xs text-ink-muted">Order {testimonial.sort_order}</span>
        </div>
        <h2 className="mt-2 text-lg text-navy">
          {testimonial.name}
          {testimonial.location && (
            <span className="text-sm font-normal text-ink-muted"> · {testimonial.location}</span>
          )}
        </h2>
        <p className="mt-1 text-sm text-ink-muted line-clamp-3">{testimonial.quote}</p>
      </div>

      <div className="flex shrink-0 items-start gap-2">
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

function TestimonialForm({
  initial,
  title,
  submitLabel,
  disabled,
  errorMsg,
  onCancel,
  onSubmit,
}: {
  initial: TestimonialDraft;
  title: string;
  submitLabel: string;
  disabled: boolean;
  errorMsg: string | null;
  onCancel: () => void;
  onSubmit: (draft: TestimonialDraft) => void;
}) {
  const [draft, setDraft] = useState<TestimonialDraft>(initial);

  function set<K extends keyof TestimonialDraft>(key: K, value: TestimonialDraft[K]) {
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
        <button type="button" onClick={onCancel} className="text-ink-muted hover:text-navy" aria-label="Cancel">
          <X size={20} />
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelClass}>Quote</label>
          <textarea
            required
            rows={3}
            value={draft.quote}
            onChange={(e) => set("quote", e.target.value)}
            placeholder="They understood exactly what we wanted and never wasted our time…"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Name</label>
          <input
            type="text"
            required
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Rahul & Priya Sharma"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Location</label>
          <input
            type="text"
            value={draft.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="e.g. Mansarovar, Jaipur"
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Photo URL (optional)</label>
          <input
            type="url"
            value={draft.photo_url}
            onChange={(e) => set("photo_url", e.target.value)}
            placeholder="https://…"
            className={inputClass}
          />
          {draft.photo_url && (
            <img src={draft.photo_url} alt="Preview" className="mt-2 h-16 w-16 rounded-full object-cover" />
          )}
        </div>

        <div>
          <label className={labelClass}>Rating (1–5)</label>
          <select
            value={draft.rating}
            onChange={(e) => set("rating", Number(e.target.value))}
            className={inputClass}
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} star{r > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Sort order</label>
          <input
            type="number"
            value={draft.sort_order}
            onChange={(e) => set("sort_order", Number(e.target.value))}
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-2 md:col-span-2">
          <input
            id="testimonial-active"
            type="checkbox"
            checked={draft.active}
            onChange={(e) => set("active", e.target.checked)}
            className="h-4 w-4 accent-navy"
          />
          <label htmlFor="testimonial-active" className="text-sm text-ink">
            Active — show this testimonial on the live site
          </label>
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
