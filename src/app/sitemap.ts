import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

/** Every page in both languages, each pointing at the other (hreflang): the main page, the sites page, the ads page, the AI page and its
 *  two cases.
 *
 *  `updated` is the page's last significant change (lastmod), as Google counts it: its visible text, its structured
 *  data (components/seo: the services, prices and questions) or its links. Shared messages count for every page that
 *  shows them (contact.*, faq.*, nav.*, the configurator's prices). Search engines trust lastmod only while it is true:
 *  move a date with such a change, not on every deploy (a build date would say «changed» every time, and Google would
 *  stop reading it). 12 Nov 2026: every page got its structured data. */
const PAGES = [
  { path: "", priority: 1, updated: "2026-11-12" },
  { path: "/dyzain-i-saity", priority: 0.8, updated: "2026-11-12" },
  { path: "/reklama-i-analityka", priority: 0.8, updated: "2026-11-12" },
  { path: "/ai-avtomatyzatsiia", priority: 0.8, updated: "2026-11-12" },
  { path: "/keisy/poshuk-zamovlen", priority: 0.6, updated: "2026-11-12" },
  { path: "/keisy/ai-asystent", priority: 0.6, updated: "2026-11-12" },
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
