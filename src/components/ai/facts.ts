import { PRICING, money } from "@/components/sections/pricing/configurator/engine.js";

/** The AI pages' sums the messages carry as ICU arguments: {landing} (the main page's configurator, one source for
 *  the site) and {crm}, «Асистент із CRM — від …» (the AI-асистент case's questions). The main page's configurator
 *  sold «CRM і AI-асистент» for $500 until 9 Nov 2026 (the owner: automation out of the configurator, its prices are
 *  the AI page's); the case page keeps that sum as its «від». */
const ASSISTANT_CRM_FROM = 500;
export function aiFacts(locale: string) {
  void locale;
  return {
    crm: money(ASSISTANT_CRM_FROM) as string,
    landing: money(PRICING.formats.landing.price) as string,
  };
}
export type AiFacts = ReturnType<typeof aiFacts>;
