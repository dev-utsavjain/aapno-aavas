import { Navigate } from "react-router-dom";
import { auth } from "@/lib/api";
import type { ReactNode } from "react";

/** Redirects to the login page when no admin JWT is present. */
export function RequireAuth({ children }: { children: ReactNode }) {
  if (!auth.isLoggedIn) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
