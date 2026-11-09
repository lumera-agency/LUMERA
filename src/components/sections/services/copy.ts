/*
 * Sums in the services' copy come from the configurator's engine (one source of prices): the
 * messages carry ICU arguments ({landing}, {site} …) and these are their values. The dialogs'
 * preset links read «Open the „Landing“ option · $500» in the page's language.
 */
import { PRICING, money, applyBundle, calculateProject } from "@/components/sections/pricing/configurator/engine.js";
import { STRINGS } from "@/components/sections/pricing/configurator/strings.js";
import { PRODUCTS } from "@/components/sections/ai-page/prices";

const once = (id: string) => calculateProject(applyBundle(id)).once as number;

export const PRICES: Record<string, string> = Object.fromEntries(
  Object.entries({
    landing: PRICING.formats.landing.price,
    site: once("site"),
    existing: once("existing"),
    analytics: once("analytics"),
    corporate: PRICING.formats.corporate.price,
    ads: PRICING.growth.googleAds.price,
    mgmt: PRICING.adsManagement.monthly,
    // automation (the owner, 9 Nov: out of the configurator, the requests in Telegram in every site's price): the AI
    // page's prices, its cheapest product as the «від» (as in the header and the footer) and the assistant
    auto: Math.min(...Object.values(PRODUCTS).flatMap((p) => (p.price ? [p.price] : []))),
    assistant: PRODUCTS.assistant.price,
    assistantMonthly: PRODUCTS.assistant.monthly,
    ecommerce: PRICING.formats.ecommerce.price,
    adsAi: PRICING.growth.googleAdsAi.price,
    designL: PRICING.design.custom.price.landing,
    designC: PRICING.design.custom.price.corporate,
    designE: PRICING.design.custom.price.ecommerce,
    three: PRICING.threeDHero.price,
  }).map(([k, v]) => [k, money(v as number) as string]),
);
/** the assistant's months of support in its price («перші 3 місяці»): a count, not a sum */
PRICES.free = String(PRODUCTS.assistant.freeMonths);

type T = (key: string, values?: Record<string, string>) => string;

/** «Відкрити варіант «Лендінг» · $500» — the sum stays with the dot and the name's last word. */
export function presetLabelFor(locale: string, t: T) {
  const copy = (STRINGS as Record<string, { bundles: Record<string, string[]> }>)[locale] ?? STRINGS.uk;
  return (id: string) =>
    t("services.more.preset", { name: copy.bundles[id]?.[0] ?? id, price: money(once(id)) }).replace(" · ", " · ");
}
