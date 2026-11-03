/**
 * The site's one source of truth: where it lives, what it is called, which languages it speaks.
 *
 * The address comes from the environment (NEXT_PUBLIC_SITE_URL, see .env.example), the live domain without it: canonical,
 * hreflang, Open Graph, robots and the sitemap are all built from it, so moving to another domain is one variable.
 * The name reaches the texts as {brand} and {studio} (i18n/request.ts puts it in every message).
 */
const url = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eclo.com.ua";

/** The address, without a trailing slash: `${siteUrl}/ru` */
export const siteUrl = url.replace(/\/+$/, "");
/** Search engines stay out (the header in next.config, the meta tag in the layout) until the launch sets this to "true" */
export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
export const brandName = "ECLO";
/** The name as the titles, the © line and the logo's mono line carry it */
export const studioName = `${brandName} Studio`;
export const locales = ["uk", "ru"] as const;
