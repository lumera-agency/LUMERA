import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lumera-seven-eta.vercel.app";

/** Both languages, each pointing at the other (hreflang). */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { uk: `${SITE}/`, ru: `${SITE}/ru` };
  return [
    { url: `${SITE}/`, changeFrequency: "monthly", priority: 1, alternates: { languages } },
    { url: `${SITE}/ru`, changeFrequency: "monthly", priority: 0.9, alternates: { languages } },
  ];
}
