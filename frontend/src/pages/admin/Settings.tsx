import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Seo } from "@/components/Seo";
import { SETTINGS_DEFAULTS, type SettingsKey } from "@/lib/site";

type Draft = Record<SettingsKey, string>;

const FIELDS: { key: SettingsKey; label: string; hint?: string; textarea?: boolean }[] = [
  { key: "whatsapp_number", label: "WhatsApp number", hint: "Digits only with country code, e.g. 918875106106" },
  { key: "phone", label: "Phone (display)", hint: "Shown on Contact + footer, e.g. +91 88751 06106" },
  { key: "email", label: "Email" },
  { key: "address", label: "Office address" },
  { key: "hours", label: "Working hours" },
  { key: "map_query", label: "Map location", hint: "Google Maps search term, e.g. Mansarovar, Jaipur" },
  { key: "contact_heading", label: "Contact page heading" },
  { key: "contact_intro", label: "Contact page intro", textarea: true },
];

export default function Settings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["settings"], queryFn: () => api.getSettings() });
  const [draft, setDraft] = useState<Draft>(SETTINGS_DEFAULTS);
  const [saved, setSaved] = useState(false);

  // Seed the form from live values (falling back to defaults) once loaded.
  useEffect(() => {
    if (!data) return;
    setDraft({ ...SETTINGS_DEFAULTS, ...Object.fromEntries(Object.entries(data).filter(([, v]) => v !== "")) });
  }, [data]);

  const save = useMutation({
    mutationFn: (d: Draft) => api.admin.updateSettings(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const inputClass =
    "w-full rounded-xs hairline bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-saffron";

  return (
    <div className="max-w-2xl space-y-8">
      <Seo title="Settings — Advisory Console" noindex />

      <header>
        <p className="eyebrow text-ink-muted">Advisory Console</p>
        <h1 className="text-3xl text-navy">Contact & Settings</h1>
        <p className="mt-1 text-sm text-ink-muted">
          These power the Contact page, footer and every WhatsApp button across the site.
        </p>
      </header>

      {isLoading ? (
        <div className="bg-surface hairline rounded-sm p-12 text-center text-ink-muted">Loading…</div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(draft);
          }}
          className="bg-surface hairline rounded-sm p-6 space-y-5"
        >
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="eyebrow text-ink-muted block mb-1">{f.label}</label>
              {f.textarea ? (
                <textarea
                  rows={3}
                  value={draft[f.key]}
                  onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                  className={`${inputClass} leading-relaxed`}
                />
              ) : (
                <input
                  type="text"
                  value={draft[f.key]}
                  onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                  className={inputClass}
                />
              )}
              {f.hint && <p className="mt-1 text-xs text-ink-muted">{f.hint}</p>}
            </div>
          ))}

          {save.error instanceof ApiError && (
            <p className="text-sm text-terracotta">{save.error.message}</p>
          )}

          <div className="flex items-center gap-4">
            <button type="submit" disabled={save.isPending} className="btn-primary disabled:opacity-60">
              {save.isPending ? "Saving…" : "Save settings"}
            </button>
            {saved && <span className="text-sm text-saffron-ink">Saved.</span>}
          </div>
        </form>
      )}
    </div>
  );
}
