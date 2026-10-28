/**
 * The site's one source of truth: where it lives, what it is called, which languages it speaks.
 *
 * The address comes from the environment (NEXT_PUBLIC_SITE_URL, see .env.example), never from the code: canonical,
 * hreflang, Open Graph, robots and the sitemap are all built from it, so moving to another domain is one variable.
 * The name reaches the texts as {brand} and {studio} (i18n/request.ts puts it in every message).
 */
const url = process.env.NEXT_PUBLIC_SITE_URL;
if (!url) throw new Error("NEXT_PUBLIC_SITE_URL is not set: the site's address for canonical, hreflang and OG (see .env.example)");

/** The address, without a trailing slash: `${siteUrl}/ru` */
export const siteUrl = url.replace(/\/+$/, "");
export const brandName = "ECLO";
/** The name as the titles, the © line and the logo's mono line carry it */
export const studioName = `${brandName} Studio`;
export const locales = ["uk", "ru"] as const;
