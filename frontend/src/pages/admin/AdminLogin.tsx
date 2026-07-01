import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, auth, ApiError } from "@/lib/api";
import { Seo } from "@/components/Seo";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.admin.login(email, password);
      auth.set(res.token);
      navigate("/admin");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-deep flex items-center justify-center px-6 py-16">
      <Seo title="Admin Login" noindex />
      <div className="w-full max-w-sm bg-surface hairline rounded-sm p-8">
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src="/logo.png" alt="Aapno Aavas" className="h-10 w-auto" />
          <p className="eyebrow text-ink-muted">Advisory Console</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="eyebrow text-ink-muted block">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xs hairline bg-bg px-3 py-2.5 text-ink outline-none focus:border-saffron"
              placeholder="you@aapnoaavas.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="eyebrow text-ink-muted block">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xs hairline bg-bg px-3 py-2.5 text-ink outline-none focus:border-saffron"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-terracotta" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-xs text-ink-muted text-center">
          Authorised personnel only. Access to this console is monitored.
        </p>
      </div>
    </div>
  );
}
