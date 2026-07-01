import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Buildings, House, CheckCircle, CaretRight } from "@phosphor-icons/react";
import { api, ApiError } from "@/lib/api";
import { formatPrice, STATUS_LABEL } from "@/lib/site";
import { Seo } from "@/components/Seo";
import { Gallery } from "@/components/Gallery";
import { DisclaimerBlock } from "@/components/DisclaimerBlock";
import { LeadForm } from "@/components/LeadForm";
import { WhatsAppButton, whatsappDefaultMessage } from "@/components/WhatsAppButton";

export default function ProjectDetail() {
  const { slug = "" } = useParams();
  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", slug],
    queryFn: () => api.getProject(slug),
    retry: (count, err) => !(err instanceof ApiError && err.status === 404) && count < 2,
  });

  if (isLoading) {
    return <div className="container-page pt-40 pb-32 text-center text-ink-muted">Loading…</div>;
  }
  if (error || !project) {
    return (
      <div className="container-page pt-40 pb-32 text-center">
        <Seo title="Project not found" noindex />
        <h1 className="text-3xl">Project not found</h1>
        <p className="text-ink-muted">This project may have been removed or is not yet published.</p>
        <Link to="/projects" className="btn-outline mt-6">Back to all properties</Link>
      </div>
    );
  }

  const media = project.media ?? [];
  const mapQ = encodeURIComponent(
    project.lat && project.lng
      ? `${project.lat},${project.lng}`
      : `${project.title}, ${project.locality}, ${project.city}`,
  );

  return (
    <>
      <Seo
        title={project.meta_title || `${project.title} in ${project.locality || project.city}`}
        description={project.meta_description || project.description?.slice(0, 200)}
        image={media[0]?.url}
      />

      {/* breadcrumb + heading */}
      <section className="container-page pt-28 pb-8">
        <nav className="flex items-center gap-1.5 text-sm text-ink-muted mb-6">
          <Link to="/" className="hover:text-navy">Home</Link>
          <CaretRight size={13} />
          <Link to="/projects" className="hover:text-navy">Properties</Link>
          <CaretRight size={13} />
          <span className="text-ink">{project.title}</span>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            {project.status && <p className="eyebrow mb-2">{STATUS_LABEL[project.status] || project.status}</p>}
            <h1 className="text-[clamp(2.25rem,4vw,3.5rem)] m-0">{project.title}</h1>
            <p className="mt-3 flex items-center gap-2 text-ink-muted">
              <MapPin size={18} className="text-saffron-ink" />
              {[project.locality, project.city].filter(Boolean).join(", ")}
              {project.developer_name && <span className="text-sand">·</span>}
              {project.developer_name && <span>by {project.developer_name}</span>}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-display font-bold text-navy">
              {formatPrice(project.price_min, project.price_max)}
            </div>
            {project.bhk_config && <div className="text-ink-muted text-sm mt-1">{project.bhk_config}</div>}
          </div>
        </div>
      </section>

      {/* gallery */}
      <section className="container-page pb-12">
        <Gallery media={media} />
      </section>

      {/* body: content + sticky sidebar */}
      <section className="container-page pb-24 grid gap-12 lg:grid-cols-[1.7fr_1fr] items-start">
        <div className="space-y-12">
          {project.description && (
            <div>
              <h2 className="text-2xl mb-4">About this project</h2>
              <p className="text-ink-muted whitespace-pre-line leading-relaxed">{project.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-y hairline py-8">
            <Spec icon={<House size={22} />} label="Type" value={project.type === "commercial" ? "Commercial" : "Residential"} />
            <Spec icon={<Buildings size={22} />} label="Config" value={project.bhk_config || "—"} />
            <Spec icon={<CheckCircle size={22} />} label="Status" value={STATUS_LABEL[project.status] || "—"} />
            <Spec icon={<MapPin size={22} />} label="Locality" value={project.locality || project.city || "—"} />
          </div>

          {project.amenities && project.amenities.length > 0 && (
            <div>
              <h2 className="text-2xl mb-5">Amenities</h2>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 list-none p-0 m-0">
                {project.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-ink">
                    <CheckCircle size={18} weight="fill" className="text-saffron shrink-0" /> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* location map (native iframe, no SDK) */}
          <div>
            <h2 className="text-2xl mb-5">Location</h2>
            <div className="rounded-sm overflow-hidden border hairline aspect-[16/9]">
              <iframe
                title="Location map"
                src={`https://www.google.com/maps?q=${mapQ}&output=embed`}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <DisclaimerBlock reraNo={project.rera_no} reraUrl={project.rera_authority_url} />
        </div>

        {/* sticky enquire */}
        <aside className="lg:sticky lg:top-28 space-y-4">
          <LeadForm projectId={project.id} projectTitle={project.title} compact />
          <WhatsAppButton
            message={whatsappDefaultMessage(project.title)}
            projectId={project.id}
            className="w-full justify-center"
          />
        </aside>
      </section>
    </>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="text-saffron-ink mb-2">{icon}</div>
      <div className="text-xs uppercase tracking-widest text-ink-muted">{label}</div>
      <div className="text-ink font-medium mt-0.5">{value}</div>
    </div>
  );
}
