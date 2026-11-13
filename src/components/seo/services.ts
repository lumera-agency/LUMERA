import { getTranslations } from "next-intl/server";
import { BUNDLES, DEFAULT_CONFIG, PRICING, calculateProject, money } from "@/components/sections/pricing/configurator/engine.js";
import { LANDING_PLUS } from "@/components/sites/facts";
import { AUDIT, PRODUCTS } from "@/components/sections/ai-page/prices";

/**
 * The studio's services as the structured data (components/seo/graph) and /llms.txt describe them: each one's name and
 * line in the main page's words (what.*), its page and its prices. Every sum comes from where its page takes it (the
 * configurator's engine, the sites page's Лендінг+, the AI page's lineup), so the markup can never show another price.
 *
 * The order is the owner's (12 Nov 2026): sites, ads, AI. No SaaS products: the studio does not make them (the owner,
 * 4 and 12 Nov 2026).
 */

/** A price as the page shows it: «від $500» (from) or exactly $450; per month for the ads' management. `note` is the
 *  page's own line beside it (the assistant's monthly support, an ads card's line), never new wording. */
export type Price = { name: string; sum: number; from: boolean; perMonth?: boolean; note?: string };
export type ServiceKey = "sites" | "ads" | "ai";
export type ServiceInfo = {
  key: ServiceKey;
  /** its page, without the language */
  path: string;
  name: string;
  desc: string;
  prices: Price[];
};

/** A bundle's one-off sum, as the ads page computes it (components/ads/facts) */
function bundleOnce(id: string) {
  const b = BUNDLES.find((x: { id: string }) => x.id === id);
  const cfg = { ...DEFAULT_CONFIG, ...b?.config } as Parameters<typeof calculateProject>[0];
  return calculateProject(cfg).once as number;
}

export async function services(locale: string): Promise<ServiceInfo[]> {
  const t = await getTranslations({ locale });
  const f = PRICING.formats;
  const g = PRICING.growth;
  const ai = (p: "search" | "sources" | "assistant") => PRODUCTS[p];
  return [
    {
      key: "sites",
      path: "/dyzain-i-saity",
      name: t("what.1.name"),
      desc: t("what.1.desc"),
      // the formats, «від» on the page (sites/facts: the engine's, Лендінг+ the page's own)
      prices: [
        { name: t("sites.f.landing.t"), sum: f.landing.price, from: true },
        { name: t("sites.f.plus.t"), sum: LANDING_PLUS.price, from: true },
        { name: t("sites.f.corp.t"), sum: f.corporate.price, from: true },
        { name: t("sites.f.shop.t"), sum: f.ecommerce.price, from: true },
      ],
    },
    {
      key: "ads",
      path: "/reklama-i-analityka",
      name: t("what.4.name"),
      desc: t("what.4.desc"),
      // the price block's cards (ads/facts) as the site shows them: exact sums (the ads page, its FAQ «коштує $750»,
      // «$150 на місяць»), Google Ads «від» as the main page and the menu say it. ChatGPT + Gemini and the management
      // carry their cards' own lines (what the extra is and its «*» note; management only with a setup), so a reader
      // of the markup gets no more than the page promises. Facebook / Instagram has no price yet («за запитом»): no offer
      prices: [
        { name: t("ads.price.a.t"), sum: g.analytics.price, from: false },
        { name: t("ads.price.g.t"), sum: g.googleAds.price, from: true },
        { name: t("ads.price.ai.t"), sum: g.googleAdsAi.price, from: false, note: `${t("ads.price.ai.d")} ${t("ads.price.ai.note")}` },
        { name: t("ads.price.s.t"), sum: bundleOnce("siteAds"), from: false },
        { name: t("ads.price.m.t"), sum: PRICING.adsManagement.monthly, from: false, perMonth: true, note: t("ads.price.m.d") },
      ],
    },
    {
      key: "ai",
      path: "/ai-avtomatyzatsiia",
      name: t("aiCommon.nav.ai"),
      desc: t("what.2.desc"),
      // the AI page's lineup (prices.ts): «від» where the page says so; «Інша рутина» is priced after the audit
      prices: [
        { name: t("ai.offer.search.t"), sum: ai("search").price ?? 0, from: ai("search").from },
        { name: t("ai.offer.sources.t"), sum: ai("sources").price ?? 0, from: ai("sources").from },
        {
          name: t("ai.offer.assistant.t"),
          sum: ai("assistant").price ?? 0,
          from: ai("assistant").from,
          note: t("ai.offer.assistant.monthly", { sum: money(ai("assistant").monthly ?? 0) as string, n: ai("assistant").freeMonths ?? 0 }),
        },
        { name: t("ai.offer.audit.t"), sum: AUDIT.price, from: false },
      ].filter((p) => p.sum > 0),
    },
  ];
}
