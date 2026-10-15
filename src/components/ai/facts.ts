import { PRICING, DEFAULT_CONFIG, calculateTimeline, money } from "@/components/sections/pricing/configurator/engine.js";
import { STRINGS } from "@/components/sections/pricing/configurator/strings.js";

/** The ready-made parts' prices and launch times, as the main page's configurator gives them (one source of
 *  prices): the messages carry them as ICU arguments ({lead}, {crm}, {landing}, {leadWeeks}, {crmWeeks}). The
 *  launch times are the calculator's for a site that is already there. */
export function aiFacts(locale: string) {
  const strings = STRINGS[locale === "ru" ? "ru" : "uk"];
  const weeks = (automation: "lead" | "crmAi") => {
    const span = calculateTimeline({ ...DEFAULT_CONFIG, format: "existing", automation }) ?? { min: 1, max: 1 };
    return strings.weeks(span.min, span.max).replace(/ /g, "\u00a0"); // a no-break space: «≈ 1 тиждень» never splits
  };
  return {
    lead: money(PRICING.automation.lead.price) as string,
    crm: money(PRICING.automation.crmAi.price) as string,
    landing: money(PRICING.formats.landing.price) as string,
    leadWeeks: weeks("lead"),
    crmWeeks: weeks("crmAi"),
  };
}
export type AiFacts = ReturnType<typeof aiFacts>;
