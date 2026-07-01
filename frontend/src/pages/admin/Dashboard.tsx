import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import type { Lead, LeadStatus } from "@/lib/types";

const STATUS_TONE: Record<LeadStatus, string> = {
  new: "bg-saffron/15 text-saffron-ink",
  contacted: "bg-navy/10 text-navy",
  qualified: "bg-navy/10 text-navy",
  closed: "bg-sand text-ink-muted",
  lost: "bg-sand text-ink-muted",
};

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Dashboard() {
  const projectsQuery = useQuery({
    queryKey: ["admin", "projects", { limit: 1 }],
    queryFn: () => api.admin.listProjects({ limit: 1 }),
  });

  const leadsQuery = useQuery({
    queryKey: ["admin", "leads", { limit: 5 }],
    queryFn: () => api.admin.listLeads({ limit: 5 }),
  });

  const newLeadsQuery = useQuery({
    queryKey: ["admin", "leads", { status: "new", limit: 1 }],
    queryFn: () => api.admin.listLeads({ status: "new", limit: 1 }),
  });

  const totalProjects = projectsQuery.data?.total ?? 0;
  const totalLeads = leadsQuery.data?.total ?? 0;
  const newLeads = newLeadsQuery.data?.total ?? 0;
  const recentLeads: Lead[] = leadsQuery.data?.data ?? [];

  const statsLoading =
    projectsQuery.isLoading || leadsQuery.isLoading || newLeadsQuery.isLoading;
  const statsError =
    projectsQuery.isError || leadsQuery.isError || newLeadsQuery.isError;

  const tiles = [
    {
      label: "Published & draft projects",
      value: totalProjects,
      to: "/admin/projects",
      cta: "Manage projects",
    },
    {
      label: "Total inquiries",
      value: totalLeads,
      to: "/admin/leads",
      cta: "View all leads",
    },
    {
      label: "New, awaiting contact",
      value: newLeads,
      to: "/admin/leads",
      cta: "Follow up",
    },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-ink-muted">Overview</p>
          <h1 className="text-3xl text-navy mt-1">Dashboard</h1>
        </div>
        <Link to="/admin/projects" className="btn-primary">
          Add a project
        </Link>
      </header>

      {statsError && (
        <div className="hairline rounded-sm bg-surface p-6">
          <p className="text-terracotta text-sm">
            Couldn’t load dashboard figures. Refresh the page or check your
            connection.
          </p>
        </div>
      )}

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="hairline rounded-sm bg-surface p-6 flex flex-col justify-between"
          >
            <div>
              <p className="eyebrow text-ink-muted">{tile.label}</p>
              <p className="mt-3 text-4xl text-navy tabular-nums">
                {statsLoading ? "—" : tile.value.toLocaleString("en-IN")}
              </p>
            </div>
            <Link
              to={tile.to}
              className="mt-6 inline-flex items-center gap-1.5 text-sm text-navy hover:text-saffron-ink transition-colors"
            >
              {tile.cta}
              <ArrowRight size={15} weight="bold" />
            </Link>
          </div>
        ))}
      </section>

      <section className="hairline rounded-sm bg-surface">
        <div className="flex items-center justify-between px-6 py-5 border-b border-sand">
          <h2 className="text-xl text-navy">Recent inquiries</h2>
          <Link
            to="/admin/leads"
            className="inline-flex items-center gap-1.5 text-sm text-navy hover:text-saffron-ink transition-colors"
          >
            View all
            <ArrowRight size={15} weight="bold" />
          </Link>
        </div>

        {leadsQuery.isLoading ? (
          <p className="px-6 py-10 text-sm text-ink-muted">Loading inquiries…</p>
        ) : leadsQuery.isError ? (
          <p className="px-6 py-10 text-sm text-terracotta">
            Couldn’t load recent inquiries.
          </p>
        ) : recentLeads.length === 0 ? (
          <p className="px-6 py-10 text-sm text-ink-muted">
            No inquiries yet. New enquiries from the site will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left eyebrow text-ink-muted">
                  <th className="px-6 py-3 font-normal">Name</th>
                  <th className="px-6 py-3 font-normal">Phone</th>
                  <th className="px-6 py-3 font-normal">Source</th>
                  <th className="px-6 py-3 font-normal">Status</th>
                  <th className="px-6 py-3 font-normal">Received</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-t border-sand">
                    <td className="px-6 py-4 text-ink font-medium">
                      {lead.name}
                    </td>
                    <td className="px-6 py-4 text-ink-muted tabular-nums">
                      {lead.phone}
                    </td>
                    <td className="px-6 py-4 text-ink-muted">
                      {lead.source || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-xs px-2 py-0.5 text-xs capitalize ${STATUS_TONE[lead.status]}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ink-muted whitespace-nowrap">
                      {formatDate(lead.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
