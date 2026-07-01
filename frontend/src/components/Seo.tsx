import { SITE } from "@/lib/site";

/**
 * Client-side document metadata. React 19 hoists <title>/<meta> rendered anywhere in the tree
 * to <head>, so this updates the tab title + tags on SPA navigation. The crawler/social-facing
 * meta is injected server-side by the Go backend — this is purely for in-app UX.
 */
export function Seo({
  title,
  description,
  image,
  noindex,
}: {
  title: string;
  description?: string;
  image?: string;
  noindex?: boolean;
}) {
  const fullTitle = title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;
  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </>
  );
}
