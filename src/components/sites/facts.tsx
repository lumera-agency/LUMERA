import { PRICING, money } from "@/components/sections/pricing/configurator/engine.js";
import { STRINGS } from "@/components/sections/pricing/configurator/strings.js";

/**
 * «Дизайн і сайти»: the four formats' prices and weeks, from the main page's configurator engine (one source of
 * prices). Лендінг+ is this page's own (the owner's OK, 14 Oct 2026: $700, 2–3 weeks) until the engine has it. The
 * messages carry them as ICU arguments: {landing} {landingPlus} {corporate} {ecommerce} and {wLanding} … {wEcommerce}.
 */
export const LANDING_PLUS = { price: 700, weeks: [2, 3] as const };
const NBSP = " ";

export function sitesFacts(locale: string) {
  const strings = STRINGS[locale === "ru" ? "ru" : "uk"];
  const weeks = (w: readonly number[]) => strings.weeks(w[0], w[1]).replace(/ /g, NBSP); // «≈ 1–2 тижні» never splits
  const f = PRICING.formats;
  return {
    landing: money(f.landing.price) as string,
    landingPlus: money(LANDING_PLUS.price) as string,
    corporate: money(f.corporate.price) as string,
    ecommerce: money(f.ecommerce.price) as string,
    wLanding: weeks(f.landing.weeks),
    wLandingPlus: weeks(LANDING_PLUS.weeks),
    wCorporate: weeks(f.corporate.weeks),
    wEcommerce: weeks(f.ecommerce.weeks),
  };
}
export type SitesFacts = ReturnType<typeof sitesFacts>;

/** A line with prices in it (the first screen's «від …», the questions' answers): the raw message's {tokens} become
 *  the facts, each sum in bold. */
export function priceLine(raw: string, facts: SitesFacts) {
  return raw.split(/(\{\w+\})/).map((part, i) => {
    const key = part.match(/^\{(\w+)\}$/)?.[1] as keyof SitesFacts | undefined;
    return key && facts[key] ? <b key={i}>{facts[key]}</b> : part;
  });
}
