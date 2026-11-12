import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

/** Every page in both languages, each pointing at the other (hreflang): the main page, the sites page, the ads page, the AI page and its
 *  two cases.
 *
 *  `updated` is the day the page's texts last changed (lastmod; from the git history on 12 Nov 2026). Search engines
 *  trust it only while it is true: move it when a page's texts change, not on every deploy (a build date would say
 *  «changed» every time, and Google would stop reading it). */
const PAGES = [
  { path: "", priority: 1, updated: "2026-11-11" },
  { path: "/dyzain-i-saity", priority: 0.8, updated: "2026-11-10" },
  { path: "/reklama-i-analityka", priority: 0.8, updated: "2026-11-10" },
  { path: "/ai-avtomatyzatsiia", priority: 0.8, updated: "2026-11-10" },
  { path: "/keisy/poshuk-zamovlen", priority: 0.6, updated: "2026-11-10" },
  { path: "/keisy/ai-asystent", priority: 0.6, updated: "2026-11-10" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap(({ path, priority, updated }) => {
    const languages = { uk: `${siteUrl}${path || "/"}`, ru: `${siteUrl}/ru${path}` };
    return [
      { url: languages.uk, lastModified: updated, changeFrequency: "monthly" as const, priority, alternates: { languages } },
      { url: languages.ru, lastModified: updated, changeFrequency: "monthly" as const, priority: Math.round(priority * 90) / 100, alternates: { languages } },
    ];
  });
}
