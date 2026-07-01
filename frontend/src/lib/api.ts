import type {
  Banner,
  CreateLeadInput,
  ListResponse,
  Page,
  Project,
  ProjectFilters,
} from "./types";

const BASE = "/api/v1";
const TOKEN_KEY = "aa_token";

export const auth = {
  get token() {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
  get isLoggedIn() {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isForm = false,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;
  if (body && !isForm) headers["Content-Type"] = "application/json";

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: isForm ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    auth.clear();
  }
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(res.status, data?.error || res.statusText);
  }
  return data as T;
}

function qs(filters: Record<string, unknown> = {}): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const api = {
  // ---- Public ----
  listProjects: (filters: ProjectFilters = {}) =>
    request<ListResponse<Project>>("GET", `/projects${qs(filters as Record<string, unknown>)}`),
  getProject: (slug: string) => request<Project>("GET", `/projects/${slug}`),
  listBanners: (placement?: string) =>
    request<Banner[]>("GET", `/banners${qs({ placement })}`),
  getPage: (slug: string) => request<Page>("GET", `/pages/${slug}`),
  createLead: (input: CreateLeadInput) => request<{ ok: boolean; id: number }>("POST", "/leads", input),

  // ---- Admin ----
  admin: {
    login: (email: string, password: string) =>
      request<{ token: string; admin: { id: number; email: string; role: string } }>(
        "POST",
        "/admin/login",
        { email, password },
      ),

    listProjects: (filters: ProjectFilters = {}) =>
      request<ListResponse<Project>>("GET", `/admin/projects${qs(filters as Record<string, unknown>)}`),
    getProject: (id: number) => request<Project>("GET", `/admin/projects/${id}`),
    createProject: (p: Partial<Project>) => request<Project>("POST", "/admin/projects", p),
    updateProject: (id: number, p: Partial<Project>) =>
      request<Project>("PUT", `/admin/projects/${id}`, p),
    deleteProject: (id: number) => request<void>("DELETE", `/admin/projects/${id}`),

    listLeads: (filters: Record<string, unknown> = {}) =>
      request<ListResponse<import("./types").Lead>>("GET", `/admin/leads${qs(filters)}`),
    updateLead: (id: number, patch: { status?: string; notes?: string }) =>
      request<import("./types").Lead>("PATCH", `/admin/leads/${id}`, patch),
    exportLeadsURL: () => `${BASE}/admin/leads/export.csv`,

    listBanners: () => request<Banner[]>("GET", "/admin/banners"),
    createBanner: (b: Partial<Banner>) => request<Banner>("POST", "/admin/banners", b),
    updateBanner: (id: number, b: Partial<Banner>) =>
      request<Banner>("PUT", `/admin/banners/${id}`, b),
    deleteBanner: (id: number) => request<void>("DELETE", `/admin/banners/${id}`),

    listPages: () => request<Page[]>("GET", "/admin/pages"),
    createPage: (p: Partial<Page>) => request<Page>("POST", "/admin/pages", p),
    updatePage: (id: number, p: Partial<Page>) => request<Page>("PUT", `/admin/pages/${id}`, p),
    deletePage: (id: number) => request<void>("DELETE", `/admin/pages/${id}`),

    uploadMedia: (form: FormData) => request<import("./types").Media>("POST", "/admin/media/upload", form, true),
    addMediaByURL: (m: { project_id: number; url: string; kind?: string; alt?: string; sort_order?: number }) =>
      request<import("./types").Media>("POST", "/admin/media", m),
    deleteMedia: (id: number) => request<void>("DELETE", `/admin/media/${id}`),
  },
};
