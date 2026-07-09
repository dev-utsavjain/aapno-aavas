// Mirrors the Go API JSON (backend/internal/models). Keep in sync.

export type ProjectType = "residential" | "commercial";
export type ProjectCategory = "flat" | "plot" | "commercial" | "land";
export type ProjectStatus = "upcoming" | "ongoing" | "ready";
export type MediaKind = "image" | "video";
export type LeadStatus = "new" | "contacted" | "qualified" | "closed" | "lost";
export type LeadSource = "form" | "whatsapp";

export interface Media {
  id: number;
  project_id: number;
  url: string;
  kind: MediaKind;
  sort_order: number;
  alt: string;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  developer_name: string;
  city: string;
  locality: string;
  type: ProjectType;
  category: ProjectCategory;
  bhk_config: string;
  price_min: number;
  price_max: number;
  status: ProjectStatus;
  rera_no: string;
  rera_authority_url: string;
  description: string;
  amenities: string[] | null;
  tags: string[] | null;
  lat: number;
  lng: number;
  meta_title: string;
  meta_description: string;
  is_published: boolean;
  featured: boolean;
  media?: Media[] | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  project_id: number | null;
  message: string;
  source: LeadSource;
  status: LeadStatus;
  consent_data_processing: boolean;
  consent_telecom_dnd: boolean;
  consent_policy_version: string;
  consent_timestamp: string;
  consent_ip: string;
  notes: string;
  created_at: string;
}

export interface Banner {
  id: number;
  image_url: string;
  link: string;
  headline: string;
  subtext: string;
  sort_order: number;
  active: boolean;
  placement: string;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  body: string;
  meta_title: string;
  meta_description: string;
}

export interface Testimonial {
  id: number;
  name: string;
  quote: string;
  location: string;
  photo_url: string;
  rating: number;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateLeadInput {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source?: LeadSource;
  project_id?: number | null;
  consent_data_processing: boolean;
  consent_telecom_dnd: boolean;
  company?: string; // honeypot — must stay empty
  turnstile_token?: string;
}

export interface ProjectFilters {
  city?: string;
  type?: ProjectType | "";
  category?: ProjectCategory | "";
  bhk?: string;
  status?: ProjectStatus | "";
  tag?: string;
  price_min?: number;
  price_max?: number;
  q?: string;
  page?: number;
  limit?: number;
}
