import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

/** Every bot, AI ones too (the owner, 12 Nov 2026), may read every page; the lead endpoint is no page. /lab is not
 *  blocked on purpose: its own noindex keeps it out of results, and a crawler can only read that tag on a page it may
 *  open (a blocked address can still be listed, bare, from a link to it). */
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }], sitemap: `${siteUrl}/sitemap.xml` };
}
