import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CaretDown, CaretUp, DownloadSimple, ShieldCheck, PhoneSlash, MagnifyingGlass } from "@phosphor-icons/react";
import { api, auth, ApiError } from "@/lib/api";
import { Seo } from "@/components/Seo";
import type { Lead, LeadStatus } from "@/lib/types";

const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed", "lost"];

const STATUS_LEAD_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  closed: "Closed",
  lost: "Lost",
};

const SOURCE_LABEL: Record<string, string> = {
  form: "Enquiry form",
  whatsapp: "WhatsApp",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SourceBadge({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center rounded-xs bg-sand px-2 py-0.5 text-xs text-navy">
      {SOURCE_LABEL[source] ?? source}
    </span>
  );
}

function ConsentBadges({ lead }: { lead: Lead }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {lead.consent_data_processing && (
        <span
          title="Consented to data processing"
          className="inline-flex items-center gap-1 rounded-xs hairline bg-bg px-1.5 py-0.5 text-[11px] text-ink-muted"
        >
          <ShieldCheck size={12} weight="fill" className="text-navy" />
          Data
        </span>
      )}
      {lead.consent_telecom_dnd && (
        <span
          title="Overrides DND / NDNC for telecom contact"
          className="inline-flex items-center gap-1 rounded-xs hairline bg-bg px-1.5 py-0.5 text-[11px] text-ink-muted"
        >
          <PhoneSlash size={12} weight="fill" className="text-terracotta" />
          DND
        </span>
      )}
    </div>
  );
}

export default function Leads() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const filters = { status, source, q, page };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-leads", filters],
    queryFn: () => api.admin.listLeads(filters),
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: { status?: string; notes?: string } }) =>
      api.admin.updateLead(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
    },
  });

  async function handleExport() {
    setExportError(null);
    setExporting(true);
    try {
      const res = await fetch(api.admin.exportLeadsURL(), {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "leads.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Could not export leads.");
    } finally {
      setExporting(false);
    }
  }

  function resetToFirstPage(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      setPage(1);
    };
  }

  const leads = data?.data ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const selectClass =
    "rounded-xs hairline bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-saffron";

  return (
    <div className="space-y-8">
      <Seo title="Leads — Advisory Console" noindex />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-ink-muted">Advisory Console</p>
          <h1 className="text-3xl text-navy">Enquiries &amp; Leads</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Every enquiry captured across project pages, WhatsApp and the site forms.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="btn-outline inline-flex items-center gap-2 disabled:opacity-60"
          >
            <DownloadSimple size={18} />
            {exporting ? "Preparing…" : "Export CSV"}
          </button>
          {exportError && <span className="text-xs text-terracotta">{exportError}</span>}
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 bg-surface hairline rounded-sm p-4">
        <div className="relative flex-1 min-w-56">
          <MagnifyingGlass
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => resetToFirstPage(setQ)(e.target.value)}
            placeholder="Search name, phone or email"
            className="w-full rounded-xs hairline bg-bg py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-saffron"
          />
        </div>
        <select
          value={status}
          onChange={(e) => resetToFirstPage(setStatus)(e.target.value)}
          className={selectClass}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LEAD_LABEL[s]}
            </option>
          ))}
        </select>
        <select
          value={source}
          onChange={(e) => resetToFirstPage(setSource)(e.target.value)}
          className={selectClass}
          aria-label="Filter by source"
        >
          <option value="">All sources</option>
          <option value="form">Enquiry form</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </div>

      {isLoading && (
        <div className="bg-surface hairline rounded-sm p-12 text-center text-ink-muted">
          Loading enquiries…
        </div>
      )}

      {isError && (
        <div className="bg-surface hairline rounded-sm p-12 text-center text-terracotta">
          {error instanceof ApiError ? error.message : "Could not load leads."}
        </div>
      )}

      {!isLoading && !isError && leads.length === 0 && (
        <div className="bg-surface hairline rounded-sm p-12 text-center">
          <p className="text-navy">No enquiries match these filters.</p>
          <p className="mt-1 text-sm text-ink-muted">
            New leads from the site and WhatsApp will appear here as they arrive.
          </p>
        </div>
      )}

      {!isLoading && !isError && leads.length > 0 && (
        <div className="overflow-x-auto bg-surface hairline rounded-sm">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-sand text-ink-muted">
                <th className="px-4 py-3 font-normal eyebrow">Received</th>
                <th className="px-4 py-3 font-normal eyebrow">Contact</th>
                <th className="px-4 py-3 font-normal eyebrow">Source</th>
                <th className="px-4 py-3 font-normal eyebrow">Project</th>
                <th className="px-4 py-3 font-normal eyebrow">Status</th>
                <th className="px-4 py-3 font-normal eyebrow">Consent</th>
                <th className="px-4 py-3 font-normal eyebrow text-right">Notes</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const isOpen = expanded === lead.id;
                return (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    isOpen={isOpen}
                    onToggle={() => setExpanded(isOpen ? null : lead.id)}
                    onStatusChange={(next) =>
                      patchMutation.mutate({ id: lead.id, patch: { status: next } })
                    }
                    onNotesSave={(notes) =>
                      patchMutation.mutate({ id: lead.id, patch: { notes } })
                    }
                    saving={patchMutation.isPending}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !isError && total > limit && (
        <div className="flex items-center justify-between text-sm text-ink-muted">
          <span>
            Showing {leads.length} of {total} enquiries
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-outline px-3 py-1.5 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="btn-outline px-3 py-1.5 disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadRow({
  lead,
  isOpen,
  onToggle,
  onStatusChange,
  onNotesSave,
  saving,
}: {
  lead: Lead;
  isOpen: boolean;
  onToggle: () => void;
  onStatusChange: (status: string) => void;
  onNotesSave: (notes: string) => void;
  saving: boolean;
}) {
  const [notes, setNotes] = useState<string>(lead.notes ?? "");
  const dirty = notes !== (lead.notes ?? "");

  return (
    <>
      <tr className="border-b border-sand align-top">
        <td className="px-4 py-3 whitespace-nowrap text-ink-muted">{formatDate(lead.created_at)}</td>
        <td className="px-4 py-3">
          <div className="font-medium text-navy">{lead.name || "—"}</div>
          <div className="text-ink-muted">
            <a href={`tel:${lead.phone}`} className="hover:text-saffron-ink">
              {lead.phone || "—"}
            </a>
          </div>
          {lead.email && (
            <div className="text-ink-muted">
              <a href={`mailto:${lead.email}`} className="hover:text-saffron-ink">
                {lead.email}
              </a>
            </div>
          )}
        </td>
        <td className="px-4 py-3">
          <SourceBadge source={lead.source} />
        </td>
        <td className="px-4 py-3 text-ink-muted">
          {lead.project_id != null ? `#${lead.project_id}` : "General"}
        </td>
        <td className="px-4 py-3">
          <select
            value={lead.status}
            onChange={(e) => onStatusChange(e.target.value)}
            disabled={saving}
            className="rounded-xs hairline bg-bg px-2 py-1.5 text-sm text-ink outline-none focus:border-saffron disabled:opacity-60"
            aria-label={`Status for ${lead.name}`}
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LEAD_LABEL[s]}
              </option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3">
          <ConsentBadges lead={lead} />
        </td>
        <td className="px-4 py-3 text-right">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-1 text-sm text-navy hover:text-saffron-ink"
          >
            {isOpen ? "Hide" : "Notes"}
            {isOpen ? <CaretUp size={14} /> : <CaretDown size={14} />}
          </button>
        </td>
      </tr>
      {isOpen && (
        <tr className="border-b border-sand bg-bg">
          <td colSpan={7} className="px-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="eyebrow text-ink-muted mb-1">Enquiry message</p>
                <p className="text-sm text-ink whitespace-pre-wrap">
                  {lead.message ? lead.message : "No message left with this enquiry."}
                </p>
                {lead.consent_timestamp && (
                  <p className="mt-3 text-xs text-ink-muted">
                    Consent recorded {formatDate(lead.consent_timestamp)}
                    {lead.consent_policy_version
                      ? ` · policy ${lead.consent_policy_version}`
                      : ""}
                    {lead.consent_ip ? ` · ${lead.consent_ip}` : ""}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <label className="eyebrow text-ink-muted mb-1">Internal notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Call outcome, follow-up date, site-visit interest…"
                  className="w-full flex-1 rounded-xs hairline bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-saffron"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onNotesSave(notes)}
                    disabled={!dirty || saving}
                    className="btn-primary px-4 py-1.5 disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save notes"}
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
