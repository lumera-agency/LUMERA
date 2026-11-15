import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { allowIndexing, siteUrl } from "./src/config/site";

/**
 * The site's one address. On 12 Nov 2026 a stale NEXT_PUBLIC_SITE_URL put lumera-one-omega.vercel.app into every
 * canonical, the sitemap and the share tags; so a production or indexable build with any other address now stops here.
 * A failed build leaves the last good deployment live: a wrong address never reaches visitors, search engines or AI.
 * Moving to another domain means changing this line as well as the variable, on purpose.
 */
const LIVE = "https://eclo.com.ua";
const rawUrl = process.env.NEXT_PUBLIC_SITE_URL;
const rawIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING;
if (rawUrl !== undefined && rawUrl !== rawUrl.trim()) throw new Error("NEXT_PUBLIC_SITE_URL has a space or a line break in it");
if (rawIndexing !== undefined && rawIndexing !== "true" && rawIndexing !== "false")
  throw new Error(`NEXT_PUBLIC_ALLOW_INDEXING must be "true" or "false", got ${JSON.stringify(rawIndexing)}`);
if ((process.env.VERCEL_ENV === "production" || allowIndexing) && siteUrl !== LIVE)
  throw new Error(`A production or indexable build needs NEXT_PUBLIC_SITE_URL=${LIVE} (or none), got ${JSON.stringify(siteUrl)}`);

/**
 * The project's own production addresses on Vercel lead to the domain for good (308), every path with them. Matched by
 * exact host (Vercel's documented pattern), so previews and the domain itself never match, whatever the build's
 * environment; the destination is the fixed address above, so no variable can send these visitors anywhere else.
 */
const toDomain = [
  { source: "/:path*", has: [{ type: "host" as const, value: "lumera-(one-omega|vy-s-projects1|git-main-vy-s-projects1)\\.vercel\\.app" }], destination: `${LIVE}/:path*`, permanent: true },
];

/**
 * Security headers on every response. Framing is refused (no page here embeds another), the browser keeps to the
 * declared file types, other sites get only the origin as referrer, and the browser features the site never uses stay
 * off. The content policy names what the pages load (all first-party: inline boot scripts, workers and blob: URLs of
 * the 3D, data:/blob: pictures, /_vercel/insights) and is enforced (the owner, 13 Nov 2026): a script, style, frame or
 * request from any other host is refused, so injected code cannot load more or send data away. Checked with no
 * violations on every page type. `next dev` needs eval; Vercel's toolbar on previews needs vercel.live (previews only).
 */
const preview = process.env.VERCEL_ENV === "preview";
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}${preview ? " https://vercel.live" : ""}`,
  `style-src 'self' 'unsafe-inline'${preview ? " https://vercel.live" : ""}`,
  `img-src 'self' data: blob:${preview ? " https://vercel.live https://vercel.com" : ""}`,
  `font-src 'self'${preview ? " https://vercel.live https://assets.vercel.com" : ""}`,
  "media-src 'self' blob:",
  `connect-src 'self'${preview ? " https://vercel.live wss://ws-us3.pusher.com" : ""}`,
  "worker-src 'self' blob:",
  `frame-src ${preview ? "https://vercel.live" : "'none'"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");
const security = [
  {
    source: "/:path*",
    headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
      { key: "Content-Security-Policy", value: CSP },
    ],
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The AI-automation page and its cases are app pages (app/[locale]/ai-avtomatyzatsiia, …/keisy/*): Russian under
  // /ru like the main page. Their first, static version took ?lang=ru: such links land on the Russian page.
  async redirects() {
    return [
      ...toDomain,
      ...["/ai-avtomatyzatsiia", "/keisy/poshuk-zamovlen", "/keisy/ai-asystent"].map((source) => ({
        source,
        has: [{ type: "query" as const, key: "lang", value: "ru" }],
        destination: `/ru${source}`,
        permanent: false,
      })),
    ];
  },
  // Cache: the fonts for a year (a changed font gets a new file name), the pictures and films for a week, then served
  // while fresh ones load (a changed picture shows within a week, or at once under a new name). Both were max-age=0:
  // every visit loaded them again.
  async headers() {
    const cache = [
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/img/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      // the component registry's JSON (public/r): never a search result, also after launch (crawlable, so the header
      // is read; no robots.txt line)
      { source: "/r/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
    if (allowIndexing) return [...security, ...cache];
    return [...security, ...cache, { source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
  // The pages' CSS in the HTML itself: the first paint no longer waits for 8 to 11 stylesheet requests (Lighthouse,
  // 6 Nov 2026: 0.6 to 1.4 s on a phone)
  experimental: {
    inlineCss: true,
    // the 404 (app/global-not-found.tsx): the layout is under the language, so a 404 inside it came out as an empty
    // shell drawn in the browser; Next.js's own file for this case renders it whole on the server
    globalNotFound: true,
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
