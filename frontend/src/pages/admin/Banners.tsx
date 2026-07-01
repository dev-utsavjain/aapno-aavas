import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, PencilSimple, Trash, ImageBroken, X } from "@phosphor-icons/react";
import { api, ApiError } from "@/lib/api";
import { Seo } from "@/components/Seo";
import type { Banner } from "@/lib/types";

type BannerDraft = {
  image_url: string;
  headline: string;
  subtext: string;
  link: string;
  placement: string;
  sort_order: number;
  active: boolean;
};

const PLACEMENTS = ["home_hero", "home_strip", "listing_top", "sidebar"];

const PLACEMENT_LABEL: Record<string, string> = {
  home_hero: "Home — hero",
  home_strip: "Home — strip",
  listing_top: "Listings — top",
  sidebar: "Sidebar",
};

function emptyDraft(): BannerDraft {
  return {
    image_url: "",
    headline: "",
    subtext: "",
    link: "",
    placement: "home_hero",
    sort_order: 0,
    active: true,
  };
}

function toDraft(b: Banner): BannerDraft {
  return {
    image_url: b.image_url,
    headline: b.headline,
    subtext: b.subtext,
    link: b.link,
    placement: b.placement,
    sort_order: b.sort_order,
    active: b.active,
  };
}

export default function Banners() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: () => api.admin.listBanners(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-banners"] });

  const createMutation = useMutation({
    mutationFn: (draft: BannerDraft) => api.admin.createBanner(draft),
    onSuccess: () => {
      invalidate();
      setCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, draft }: { id: number; draft: BannerDraft }) =>
      api.admin.updateBanner(id, draft),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.admin.deleteBanner(id),
    onSuccess: invalidate,
  });

  const banners = data ?? [];

  return (
    <div className="space-y-8">
      <Seo title="Banners — Advisory Console" noindex />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-ink-muted">Advisory Console</p>
          <h1 className="text-3xl text-navy">Promotional Banners</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Manage the hero and placement banners shown across the public site.
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
          New banner
        </button>
      </header>

      {creating && (
        <BannerForm
          initial={emptyDraft()}
          title="New banner"
          submitLabel={createMutation.isPending ? "Creating…" : "Create banner"}
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
          Loading banners…
        </div>
      )}

      {isError && (
        <div className="bg-surface hairline rounded-sm p-12 text-center text-terracotta">
          {error instanceof ApiError ? error.message : "Could not load banners."}
        </div>
      )}

      {!isLoading && !isError && banners.length === 0 && !creating && (
        <div className="bg-surface hairline rounded-sm p-12 text-center">
          <p className="text-navy">No banners yet.</p>
          <p className="mt-1 text-sm text-ink-muted">
            Create a banner to feature a launch, an open-house weekend or a limited inventory alert.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {banners.map((b) =>
          editingId === b.id ? (
            <BannerForm
              key={b.id}
              initial={toDraft(b)}
              title={`Edit banner #${b.id}`}
              submitLabel={updateMutation.isPending ? "Saving…" : "Save changes"}
              disabled={updateMutation.isPending}
              errorMsg={
                updateMutation.error instanceof ApiError ? updateMutation.error.message : null
              }
              onCancel={() => setEditingId(null)}
              onSubmit={(draft) => updateMutation.mutate({ id: b.id, draft })}
            />
          ) : (
            <BannerCard
              key={b.id}
              banner={b}
              onEdit={() => {
                setEditingId(b.id);
                setCreating(false);
              }}
              onDelete={() => {
                if (window.confirm(`Delete banner "${b.headline || b.id}"? This cannot be undone.`)) {
                  deleteMutation.mutate(b.id);
                }
              }}
              deleting={deleteMutation.isPending && deleteMutation.variables === b.id}
            />
          ),
        )}
      </div>
    </div>
  );
}

function BannerCard({
  banner,
  onEdit,
  onDelete,
  deleting,
}: {
  banner: Banner;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 bg-surface hairline rounded-sm p-4 sm:flex-row">
      <div className="h-28 w-full shrink-0 overflow-hidden rounded-xs bg-sand sm:w-48">
        {banner.image_url ? (
          <img
            src={banner.image_url}
            alt={banner.headline}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-muted">
            <ImageBroken size={28} />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-xs bg-sand px-2 py-0.5 text-xs text-navy">
            {PLACEMENT_LABEL[banner.placement] ?? banner.placement}
          </span>
          <span
            className={
              banner.active
                ? "inline-flex items-center rounded-xs bg-navy px-2 py-0.5 text-xs text-bg"
                : "inline-flex items-center rounded-xs hairline bg-bg px-2 py-0.5 text-xs text-ink-muted"
            }
          >
            {banner.active ? "Active" : "Hidden"}
          </span>
          <span className="text-xs text-ink-muted">Order {banner.sort_order}</span>
        </div>
        <h2 className="mt-2 text-xl text-navy">{banner.headline || "Untitled banner"}</h2>
        {banner.subtext && <p className="mt-1 text-sm text-ink-muted">{banner.subtext}</p>}
        {banner.link && (
          <p className="mt-1 truncate text-xs text-ink-muted">Links to {banner.link}</p>
        )}
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

function BannerForm({
  initial,
  title,
  submitLabel,
  disabled,
  errorMsg,
  onCancel,
  onSubmit,
}: {
  initial: BannerDraft;
  title: string;
  submitLabel: string;
  disabled: boolean;
  errorMsg: string | null;
  onCancel: () => void;
  onSubmit: (draft: BannerDraft) => void;
}) {
  const [draft, setDraft] = useState<BannerDraft>(initial);

  function set<K extends keyof BannerDraft>(key: K, value: BannerDraft[K]) {
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
        <div className="md:col-span-2">
          <label className={labelClass}>Image URL</label>
          <input
            type="url"
            required
            value={draft.image_url}
            onChange={(e) => set("image_url", e.target.value)}
            placeholder="https://…"
            className={inputClass}
          />
          {draft.image_url && (
            <img
              src={draft.image_url}
              alt="Preview"
              className="mt-2 h-24 w-auto rounded-xs hairline object-cover"
            />
          )}
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Headline</label>
          <input
            type="text"
            required
            value={draft.headline}
            onChange={(e) => set("headline", e.target.value)}
            placeholder="e.g. New launch on Ajmer Road — 3 &amp; 4 BHK"
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Subtext</label>
          <input
            type="text"
            value={draft.subtext}
            onChange={(e) => set("subtext", e.target.value)}
            placeholder="e.g. RERA-registered · Possession from 2027"
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Link</label>
          <input
            type="text"
            value={draft.link}
            onChange={(e) => set("link", e.target.value)}
            placeholder="/projects/your-project-slug"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Placement</label>
          <select
            value={draft.placement}
            onChange={(e) => set("placement", e.target.value)}
            className={inputClass}
          >
            {PLACEMENTS.map((p) => (
              <option key={p} value={p}>
                {PLACEMENT_LABEL[p]}
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
            id="banner-active"
            type="checkbox"
            checked={draft.active}
            onChange={(e) => set("active", e.target.checked)}
            className="h-4 w-4 accent-navy"
          />
          <label htmlFor="banner-active" className="text-sm text-ink">
            Active — show this banner on the live site
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
