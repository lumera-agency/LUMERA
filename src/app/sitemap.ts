import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lumera-seven-eta.vercel.app";

/** Every page in both languages, each pointing at the other (hreflang): the main page, the sites page, the ads page, the AI page and its
 *  two cases. */
const PAGES = [
  { path: "", priority: 1 },
  { path: "/dyzain-i-saity", priority: 0.8 },
  { path: "/reklama-i-analityka", priority: 0.8 },
  { path: "/ai-avtomatyzatsiia", priority: 0.8 },
  { path: "/keisy/poshuk-zamovlen", priority: 0.6 },
  { path: "/keisy/ai-asystent", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap(({ path, priority }) => {
    const languages = { uk: `${SITE}${path || "/"}`, ru: `${SITE}/ru${path}` };
    return [
      { url: languages.uk, changeFrequency: "monthly" as const, priority, alternates: { languages } },
      { url: languages.ru, changeFrequency: "monthly" as const, priority: Math.round(priority * 90) / 100, alternates: { languages } },
    ];
  });
}
