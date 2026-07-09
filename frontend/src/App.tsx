import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RequireAuth } from "@/pages/admin/RequireAuth";

// Public pages
import Home from "@/pages/Home";
import Listings from "@/pages/Listings";
import ProjectDetail from "@/pages/ProjectDetail";
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const EmiCalculator = lazy(() => import("@/pages/EmiCalculator"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Admin (lazy — separate bundle, never prefetched for public visitors)
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminProjects = lazy(() => import("@/pages/admin/Projects"));
const ProjectEditor = lazy(() => import("@/pages/admin/ProjectEditor"));
const AdminLeads = lazy(() => import("@/pages/admin/Leads"));
const AdminBanners = lazy(() => import("@/pages/admin/Banners"));
const AdminTestimonials = lazy(() => import("@/pages/admin/Testimonials"));
const AdminPages = lazy(() => import("@/pages/admin/Pages"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));

const Fallback = () => <div className="pt-40 text-center text-ink-muted">Loading…</div>;

export default function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        {/* Public */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/projects" element={<Listings />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/tools/emi-calculator" element={<EmiCalculator />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="projects/new" element={<ProjectEditor />} />
          <Route path="projects/:id" element={<ProjectEditor />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
