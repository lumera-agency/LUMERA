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
/** Search engines may index the site (no noindex header in next.config, no robots meta in the layout): the production
 *  deployment, eclo.com.ua, is open since the launch (the owner, 16 Nov 2026: «уберем no index на всех страницах»);
 *  previews and local builds stay closed. NEXT_PUBLIC_ALLOW_INDEXING overrides it either way: "false" closes the live
 *  site again, "true" opens any build. */
const indexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING;
export const allowIndexing = indexing === "true" || (indexing !== "false" && process.env.VERCEL_ENV === "production");
export const brandName = "ECLO";
/** Other spellings people use for the name: the structured data lists them as the studio's alternateName (the owner,
 *  12 Nov 2026: «Екло») */
export const brandAltNames = ["Екло"];
/** The name as the titles, the © line and the logo's mono line carry it */
export const studioName = `${brandName} Studio`;
export const locales = ["uk", "ru"] as const;
