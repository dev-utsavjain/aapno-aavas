import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  House,
  Buildings,
  UserList,
  Image as ImageIcon,
  FileText,
  SignOut,
} from "@phosphor-icons/react";
import { auth } from "@/lib/api";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: House, end: true },
  { to: "/admin/projects", label: "Projects", icon: Buildings, end: false },
  { to: "/admin/leads", label: "Leads", icon: UserList, end: false },
  { to: "/admin/banners", label: "Banners", icon: ImageIcon, end: false },
  { to: "/admin/pages", label: "Pages", icon: FileText, end: false },
] as const;

export default function AdminLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    auth.clear();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-bg">
      <aside className="fixed inset-y-0 left-0 w-60 bg-navy-deep text-surface flex flex-col">
        <div className="px-6 py-7">
          <img src="/logo.png" alt="Aapno Aavas" className="h-9 w-auto" />
          <p className="eyebrow mt-3 text-surface/60">Advisory Console</p>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xs px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-navy text-surface border-l-2 border-saffron pl-2.5"
                    : "text-surface/70 hover:text-surface hover:bg-navy/60"
                )
              }
            >
              <Icon size={18} weight="regular" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-surface/10">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xs px-3 py-2.5 text-sm text-surface/70 hover:text-surface hover:bg-navy/60 transition-colors"
          >
            <SignOut size={18} weight="regular" />
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-60 min-h-screen bg-bg p-8">
        <Outlet />
      </main>
    </div>
  );
}
