/*
 * Sums in the services' copy come from the configurator's engine (one source of prices): the
 * messages carry ICU arguments ({landing}, {site} …) and these are their values. The dialogs'
 * preset links read «Open the „Landing“ option · $500» in the page's language.
 */
import { PRICING, money, applyBundle, calculateProject } from "@/components/sections/pricing/configurator/engine.js";
import { STRINGS } from "@/components/sections/pricing/configurator/strings.js";

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
    lead: PRICING.automation.lead.price,
    crm: PRICING.automation.crmAi.price,
    ecommerce: PRICING.formats.ecommerce.price,
    adsAi: PRICING.growth.googleAdsAi.price,
    designL: PRICING.design.custom.price.landing,
    designC: PRICING.design.custom.price.corporate,
    designE: PRICING.design.custom.price.ecommerce,
    three: PRICING.threeDHero.price,
  }).map(([k, v]) => [k, money(v as number) as string]),
);

type T = (key: string, values?: Record<string, string>) => string;

/** «Відкрити варіант «Лендінг» · $500» — the sum stays with the dot and the name's last word. */
export function presetLabelFor(locale: string, t: T) {
  const copy = (STRINGS as Record<string, { bundles: Record<string, string[]> }>)[locale] ?? STRINGS.uk;
  return (id: string) =>
    t("services.more.preset", { name: copy.bundles[id]?.[0] ?? id, price: money(once(id)) }).replace(" · ", " · ");
}
