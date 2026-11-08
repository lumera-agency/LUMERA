import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { allowIndexing } from "./src/config/site";

const nextConfig: NextConfig = {
  // The AI-automation page and its cases are app pages (app/[locale]/ai-avtomatyzatsiia, …/keisy/*): Russian under
  // /ru like the main page. Their first, static version took ?lang=ru: such links land on the Russian page.
  async redirects() {
    return ["/ai-avtomatyzatsiia", "/keisy/poshuk-zamovlen", "/keisy/ai-asystent"].map((source) => ({
      source,
      has: [{ type: "query" as const, key: "lang", value: "ru" }],
      destination: `/ru${source}`,
      permanent: false,
    }));
  },
  // Cache: the fonts for a year (a changed font gets a new file name), the pictures and films for a week, then served
  // while fresh ones load (a changed picture shows within a week, or at once under a new name). Both were max-age=0:
  // every visit loaded them again.
  async headers() {
    const cache = [
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/img/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
    ];
    if (allowIndexing) return cache;
    return [...cache, { source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
  // The pages' CSS in the HTML itself: the first paint no longer waits for 8 to 11 stylesheet requests (Lighthouse,
  // 6 Nov 2026: 0.6 to 1.4 s on a phone)
  experimental: {
    inlineCss: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default createNextIntlPlugin()(nextConfig);
