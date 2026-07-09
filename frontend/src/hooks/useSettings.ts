import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SETTINGS_DEFAULTS } from "@/lib/site";

/**
 * Live site settings (contact details, WhatsApp number, contact-page copy) from the CMS,
 * merged over SETTINGS_DEFAULTS so callers always get a complete, correct object — even offline
 * or before an admin has saved anything. Cached; one request shared across the app.
 */
export function useSettings(): typeof SETTINGS_DEFAULTS {
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.getSettings(),
    staleTime: 5 * 60_000,
  });
  // Ignore empty strings from the API so a blank field falls back to the default.
  const live = Object.fromEntries(
    Object.entries(data ?? {}).filter(([, v]) => v !== ""),
  );
  return { ...SETTINGS_DEFAULTS, ...live };
}
