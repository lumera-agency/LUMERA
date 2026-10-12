import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lumera-seven-eta.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/lab", "/ru/lab", "/api/"] }], sitemap: `${SITE}/sitemap.xml` };
}
