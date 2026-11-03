import { PRICING, BUNDLES, DEFAULT_CONFIG, calculateProject, calculateTimeline, money } from "@/components/sections/pricing/configurator/engine.js";
import { STRINGS } from "@/components/sections/pricing/configurator/strings.js";

const NBSP = "\u00a0";

/**
 * «Реклама й аналітика»: the prices and the setup time, from the main page's configurator engine (one source of prices).
 * The messages carry them as ICU arguments: {analytics} {ads} {adsAi} {mgmt}, the bundle {siteAds}, and
 * {wAds}, the calculator's setup time for a site that is already there («≈ 1 тиждень»); for the bridge to the sites page
 * (block 5) the landing-with-ads bundle's time {wSiteAds} («≈ 1–2 тижні»). Facebook / Instagram have no price in the
 * engine yet: the page says «під запит» there (an open question to the owner, _merge/MERGE.md).
 */
export function adsFacts(locale: string) {
  const strings = STRINGS[locale === "ru" ? "ru" : "uk"];
  const g = PRICING.growth;
  const bundle = (id: string) => {
    const b = BUNDLES.find((x: { id: string }) => x.id === id);
    // (the engine's JSDoc types the bundles' fields as plain strings: the bundle is a valid configuration by design)
    const cfg = { ...DEFAULT_CONFIG, ...b?.config } as Parameters<typeof calculateProject>[0];
    return money(calculateProject(cfg).once) as string;
  };
  const span = calculateTimeline({ ...DEFAULT_CONFIG, format: "existing", growth: "googleAds" }) ?? { min: 1, max: 1 };
  const siteAdsCfg = { ...DEFAULT_CONFIG, ...BUNDLES.find((x: { id: string }) => x.id === "siteAds")?.config } as Parameters<typeof calculateTimeline>[0];
  const siteAdsSpan = calculateTimeline(siteAdsCfg) ?? { min: 1, max: 2 };
  return {
    analytics: money(g.analytics.price) as string,
    ads: money(g.googleAds.price) as string,
    adsAi: money(g.googleAdsAi.price) as string,
    mgmt: money(PRICING.adsManagement.monthly) as string,
    siteAds: bundle("siteAds"),
    // «≈ 1 тиждень» never splits
    wAds: strings.weeks(span.min, span.max).replace(/ /g, NBSP) as string,
    wSiteAds: strings.weeks(siteAdsSpan.min, siteAdsSpan.max).replace(/ /g, NBSP) as string,
  };
}
export type AdsFacts = ReturnType<typeof adsFacts>;

/** A line with prices in it: the raw message's {tokens} become the facts, each sum in bold. */
export function priceLine(raw: string, facts: AdsFacts) {
  return raw.split(/(\{\w+\})/).map((part, i) => {
    const key = part.match(/^\{(\w+)\}$/)?.[1] as keyof AdsFacts | undefined;
    return key && facts[key] ? <b key={i}>{facts[key]}</b> : part;
  });
}
