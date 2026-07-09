import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash, UploadSimple, LinkSimple } from "@phosphor-icons/react";
import { api, ApiError } from "@/lib/api";
import type { Media, Project, ProjectCategory, ProjectStatus, ProjectType } from "@/lib/types";

const INPUT =
  "w-full bg-bg border hairline rounded-sm px-3 py-2 outline-none focus:border-navy";

interface FormState {
  title: string;
  slug: string;
  developer_name: string;
  city: string;
  locality: string;
  type: ProjectType;
  category: ProjectCategory;
  bhk_config: string;
  price_min: string;
  price_max: string;
  status: ProjectStatus;
  rera_no: string;
  rera_authority_url: string;
  description: string;
  amenities: string;
  tags: string;
  lat: string;
  lng: string;
  meta_title: string;
  meta_description: string;
  is_published: boolean;
  featured: boolean;
}

const BLANK: FormState = {
  title: "",
  slug: "",
  developer_name: "",
  city: "Jaipur",
  locality: "",
  type: "residential",
  category: "flat",
  bhk_config: "",
  price_min: "",
  price_max: "",
  status: "upcoming",
  rera_no: "",
  rera_authority_url: "",
  description: "",
  amenities: "",
  tags: "",
  lat: "",
  lng: "",
  meta_title: "",
  meta_description: "",
  is_published: false,
  featured: false,
};

function fromProject(p: Project): FormState {
  return {
    title: p.title ?? "",
    slug: p.slug ?? "",
    developer_name: p.developer_name ?? "",
    city: p.city ?? "",
    locality: p.locality ?? "",
    type: p.type,
    category: p.category ?? "flat",
    bhk_config: p.bhk_config ?? "",
    price_min: p.price_min ? String(p.price_min) : "",
    price_max: p.price_max ? String(p.price_max) : "",
    status: p.status,
    rera_no: p.rera_no ?? "",
    rera_authority_url: p.rera_authority_url ?? "",
    description: p.description ?? "",
    amenities: (p.amenities ?? []).join(", "),
    tags: (p.tags ?? []).join(", "),
    lat: p.lat ? String(p.lat) : "",
    lng: p.lng ? String(p.lng) : "",
    meta_title: p.meta_title ?? "",
    meta_description: p.meta_description ?? "",
    is_published: p.is_published,
    featured: p.featured,
  };
}

function toList(csv: string): string[] {
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toPayload(f: FormState): Partial<Project> {
  return {
    title: f.title.trim(),
    slug: f.slug.trim() || undefined,
    developer_name: f.developer_name.trim(),
    city: f.city.trim(),
    locality: f.locality.trim(),
    type: f.type,
    category: f.category,
    bhk_config: f.bhk_config.trim(),
    price_min: f.price_min ? Number(f.price_min) : 0,
    price_max: f.price_max ? Number(f.price_max) : 0,
    status: f.status,
    rera_no: f.rera_no.trim(),
    rera_authority_url: f.rera_authority_url.trim(),
    description: f.description,
    amenities: toList(f.amenities),
    tags: toList(f.tags),
    lat: f.lat ? Number(f.lat) : 0,
    lng: f.lng ? Number(f.lng) : 0,
    meta_title: f.meta_title.trim(),
    meta_description: f.meta_description.trim(),
    is_published: f.is_published,
    featured: f.featured,
  };
}

export default function ProjectEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const projectId = isNew ? 0 : Number(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState<FormState>(BLANK);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    data: project,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin", "project", projectId],
    queryFn: () => api.admin.getProject(projectId),
    enabled: !isNew,
  });

  useEffect(() => {
    if (project) setForm(fromProject(project));
  }, [project]);

  const saveMut = useMutation({
    mutationFn: (payload: Partial<Project>) =>
      isNew
        ? api.admin.createProject(payload)
        : api.admin.updateProject(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "projects"] });
      navigate("/admin/projects");
    },
    onError: (e) => setSaveError((e as ApiError)?.message || "Save failed."),
  });

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    if (!form.title.trim()) {
      setSaveError("A project title is required.");
      return;
    }
    saveMut.mutate(toPayload(form));
  }

  if (!isNew && isLoading) {
    return <p className="text-ink-muted py-16 text-center">Loading project…</p>;
  }
  if (!isNew && isError) {
    return (
      <p className="text-terracotta py-16 text-center">
        Failed to load this project. {(error as ApiError)?.message}
      </p>
    );
  }

  return (
    <div className="max-w-4xl">
      <Link
        to="/admin/projects"
        className="inline-flex items-center gap-1 text-ink-muted hover:text-navy mb-6"
      >
        <ArrowLeft size={16} /> Back to projects
      </Link>

      <div className="mb-8">
        <p className="eyebrow text-ink-muted">{isNew ? "Create" : "Edit"}</p>
        <h1 className="text-navy">{isNew ? "New Project" : form.title || "Project"}</h1>
      </div>

      {saveError && (
        <div className="mb-6 hairline rounded-sm bg-surface px-4 py-3 text-terracotta">
          {saveError}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-8">
        {/* Overview */}
        <fieldset className="bg-surface hairline rounded-sm p-6">
          <legend className="eyebrow text-navy px-1">Overview</legend>
          <div className="grid gap-4 md:grid-cols-2 mt-2">
            <label className="block md:col-span-2">
              <span className="text-sm text-ink-muted">Title</span>
              <input
                className={INPUT}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Mahima Iris, Mansarovar Extension"
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink-muted">Slug (auto from title if blank)</span>
              <input
                className={INPUT}
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="mahima-iris"
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink-muted">Developer</span>
              <input
                className={INPUT}
                value={form.developer_name}
                onChange={(e) => set("developer_name", e.target.value)}
                placeholder="Mahima Group"
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink-muted">City</span>
              <input
                className={INPUT}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink-muted">Locality</span>
              <input
                className={INPUT}
                value={form.locality}
                onChange={(e) => set("locality", e.target.value)}
                placeholder="Mansarovar, Jagatpura, Vaishali Nagar…"
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink-muted">Type</span>
              <select
                className={INPUT}
                value={form.type}
                onChange={(e) => set("type", e.target.value as ProjectType)}
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-ink-muted">Category (drives home sections & search)</span>
              <select
                className={INPUT}
                value={form.category}
                onChange={(e) => set("category", e.target.value as ProjectCategory)}
              >
                <option value="flat">Flat / Apartment</option>
                <option value="plot">Plot</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-ink-muted">Status</span>
              <select
                className={INPUT}
                value={form.status}
                onChange={(e) => set("status", e.target.value as ProjectStatus)}
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Under construction</option>
                <option value="ready">Ready to move</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-ink-muted">
                {form.category === "plot" || form.category === "land"
                  ? "Plot / land size (e.g. 200–500 sq yd)"
                  : "BHK / unit configuration"}
              </span>
              <input
                className={INPUT}
                value={form.bhk_config}
                onChange={(e) => set("bhk_config", e.target.value)}
                placeholder={
                  form.category === "plot" || form.category === "land"
                    ? "e.g. 160, 200 & 300 sq yd"
                    : "2, 3 & 4 BHK"
                }
              />
            </label>
          </div>
        </fieldset>

        {/* Pricing & location */}
        <fieldset className="bg-surface hairline rounded-sm p-6">
          <legend className="eyebrow text-navy px-1">Pricing & map</legend>
          <div className="grid gap-4 md:grid-cols-2 mt-2">
            <label className="block">
              <span className="text-sm text-ink-muted">Price min (₹)</span>
              <input
                type="number"
                className={INPUT}
                value={form.price_min}
                onChange={(e) => set("price_min", e.target.value)}
                placeholder="6500000"
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink-muted">Price max (₹)</span>
              <input
                type="number"
                className={INPUT}
                value={form.price_max}
                onChange={(e) => set("price_max", e.target.value)}
                placeholder="12000000"
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink-muted">Latitude</span>
              <input
                type="number"
                step="any"
                className={INPUT}
                value={form.lat}
                onChange={(e) => set("lat", e.target.value)}
                placeholder="26.8505"
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink-muted">Longitude</span>
              <input
                type="number"
                step="any"
                className={INPUT}
                value={form.lng}
                onChange={(e) => set("lng", e.target.value)}
                placeholder="75.7628"
              />
            </label>
          </div>
        </fieldset>

        {/* RERA & compliance */}
        <fieldset className="bg-surface hairline rounded-sm p-6">
          <legend className="eyebrow text-navy px-1">RERA & compliance</legend>
          <div className="grid gap-4 md:grid-cols-2 mt-2">
            <label className="block">
              <span className="text-sm text-ink-muted">RERA registration no.</span>
              <input
                className={INPUT}
                value={form.rera_no}
                onChange={(e) => set("rera_no", e.target.value)}
                placeholder="RAJ/P/2024/1234"
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink-muted">RERA authority URL</span>
              <input
                className={INPUT}
                value={form.rera_authority_url}
                onChange={(e) => set("rera_authority_url", e.target.value)}
                placeholder="https://rera.rajasthan.gov.in/…"
              />
            </label>
          </div>
        </fieldset>

        {/* Content */}
        <fieldset className="bg-surface hairline rounded-sm p-6">
          <legend className="eyebrow text-navy px-1">Content</legend>
          <div className="grid gap-4 mt-2">
            <label className="block">
              <span className="text-sm text-ink-muted">Description</span>
              <textarea
                className={`${INPUT} min-h-40`}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Positioning, connectivity, floor plans, possession timeline — written for a buyer weighing this against nearby options."
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink-muted">Amenities (comma separated)</span>
              <input
                className={INPUT}
                value={form.amenities}
                onChange={(e) => set("amenities", e.target.value)}
                placeholder="Clubhouse, Rooftop deck, EV charging, Power backup"
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink-muted">Tags (comma separated)</span>
              <input
                className={INPUT}
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="Gated, Metro corridor, Ring Road"
              />
            </label>
          </div>
        </fieldset>

        {/* SEO */}
        <fieldset className="bg-surface hairline rounded-sm p-6">
          <legend className="eyebrow text-navy px-1">SEO</legend>
          <div className="grid gap-4 mt-2">
            <label className="block">
              <span className="text-sm text-ink-muted">Meta title</span>
              <input
                className={INPUT}
                value={form.meta_title}
                onChange={(e) => set("meta_title", e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink-muted">Meta description</span>
              <textarea
                className={`${INPUT} min-h-24`}
                value={form.meta_description}
                onChange={(e) => set("meta_description", e.target.value)}
              />
            </label>
          </div>
        </fieldset>

        {/* Visibility */}
        <fieldset className="bg-surface hairline rounded-sm p-6">
          <legend className="eyebrow text-navy px-1">Visibility</legend>
          <div className="flex flex-wrap gap-6 mt-2">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => set("is_published", e.target.checked)}
              />
              <span className="text-ink">Published (visible on the public site)</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
              />
              <span className="text-ink">Featured on the homepage</span>
            </label>
          </div>
        </fieldset>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saveMut.isPending} className="btn-primary">
            {saveMut.isPending ? "Saving…" : isNew ? "Create project" : "Save changes"}
          </button>
          <Link to="/admin/projects" className="btn-outline">
            Cancel
          </Link>
        </div>
      </form>

      {!isNew && (
        <MediaManager projectId={projectId} media={project?.media ?? []} />
      )}
    </div>
  );
}

function MediaManager({
  projectId,
  media,
}: {
  projectId: number;
  media: Media[];
}) {
  const qc = useQueryClient();
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function reload() {
    qc.invalidateQueries({ queryKey: ["admin", "project", projectId] });
  }

  const addUrlMut = useMutation({
    mutationFn: () =>
      api.admin.addMediaByURL({ project_id: projectId, url: url.trim(), kind: "image", alt: alt.trim() }),
    onSuccess: () => {
      setUrl("");
      setAlt("");
      setNotice("Image added.");
      reload();
    },
    onError: (e) => setNotice((e as ApiError)?.message || "Could not add image."),
  });

  const uploadMut = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("project_id", String(projectId));
      fd.append("alt", alt.trim());
      fd.append("kind", "image");
      return api.admin.uploadMedia(fd);
    },
    onSuccess: () => {
      setUploadErr(null);
      setNotice("File uploaded.");
      if (fileRef.current) fileRef.current.value = "";
      reload();
    },
    onError: (e) => {
      const err = e as ApiError;
      if (err?.status === 503) {
        setUploadErr(
          "File storage isn't configured on the server, so uploads are disabled. Add the image by URL instead.",
        );
      } else {
        setUploadErr(err?.message || "Upload failed.");
      }
    },
  });

  const deleteMut = useMutation({
    mutationFn: (mediaId: number) => api.admin.deleteMedia(mediaId),
    onSuccess: reload,
  });

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadMut.mutate(file);
  }

  return (
    <div className="mt-12 bg-surface hairline rounded-sm p-6">
      <p className="eyebrow text-navy">Media</p>
      <h3 className="text-navy mt-1">Gallery for this project</h3>

      {notice && <p className="text-ink-muted text-sm mt-2">{notice}</p>}

      {media.length === 0 ? (
        <p className="text-ink-muted mt-4">No media yet. Add an image by URL or upload a file.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {media.map((m) => (
            <div key={m.id} className="relative hairline rounded-sm overflow-hidden bg-bg">
              <img
                src={m.url}
                alt={m.alt || "Project media"}
                className="w-full aspect-[4/3] object-cover"
              />
              <button
                type="button"
                onClick={() => deleteMut.mutate(m.id)}
                disabled={deleteMut.isPending}
                className="absolute top-2 right-2 bg-surface hairline rounded-xs p-1.5 text-terracotta hover:border-terracotta"
                aria-label="Delete media"
              >
                <Trash size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 mt-8">
        {/* Add by URL */}
        <div>
          <p className="text-sm font-medium text-ink mb-2 inline-flex items-center gap-1">
            <LinkSimple size={16} /> Add by URL
          </p>
          <input
            className={INPUT}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…/image.jpg"
          />
          <input
            className={`${INPUT} mt-2`}
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Alt text (optional)"
          />
          <button
            type="button"
            onClick={() => addUrlMut.mutate()}
            disabled={addUrlMut.isPending || !url.trim()}
            className="btn-outline mt-3 disabled:opacity-40"
          >
            {addUrlMut.isPending ? "Adding…" : "Add image"}
          </button>
        </div>

        {/* Upload file */}
        <div>
          <p className="text-sm font-medium text-ink mb-2 inline-flex items-center gap-1">
            <UploadSimple size={16} /> Upload a file
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFile}
            disabled={uploadMut.isPending}
            className="w-full text-sm text-ink-muted file:mr-3 file:hairline file:rounded-xs file:bg-bg file:px-3 file:py-2 file:text-navy"
          />
          {uploadMut.isPending && (
            <p className="text-ink-muted text-sm mt-2">Uploading…</p>
          )}
          {uploadErr && <p className="text-terracotta text-sm mt-2">{uploadErr}</p>}
        </div>
      </div>
    </div>
  );
}
