/*
 * The AI page's prices (the owner, 21 Oct 2026): the product line, the niches' «від» prices and the audit. Since 9 Nov
 * 2026 (one price list on every page) the numbers live in the engine (PRICING.ai, PRICING.audit), which the main page's
 * configurator offers too; this file keeps the page's own shape of them. The landing's price and weeks are the
 * engine's as before. The lineup, the niches, the price calculator and (phase 2) the losses calculator read from here.
 */
import { PRICING, money } from "@/components/sections/pricing/configurator/engine.js";

export type Product = "search" | "sources" | "assistant" | "custom";

/** price: null = «ціна після аудиту»; from: shown as «від $…» (the volume differs from business to business) */
export const PRODUCTS = PRICING.ai as Record<Product, { price: number | null; from: boolean; weeks: [number, number] | null; monthly?: number; freeMonths?: number }>;
export const PRODUCT_ORDER: Product[] = ["search", "sources", "assistant", "custom"];

/** the process audit: $150, 2–3 days, credited to the works if they are ordered */
export const AUDIT = PRICING.audit as { price: number; days: [number, number] };

/** the niches' cards: the cheapest product that answers them */
export const NICHES = [
  { key: "salon", price: 450 },
  { key: "service", price: 500 },
  { key: "shop", price: 500 },
] as const;

/** a landing for those without a site (the engine's, as on the main page) */
export const LANDING = { price: PRICING.formats.landing.price as number, weeks: PRICING.formats.landing.weeks as [number, number] };

export const usd = (n: number) => money(n) as string;

type Lang = "uk" | "ru";
const plural = (n: number, forms: [string, string, string]) => {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
};
const span = ([a, b]: [number, number]) => (a === b ? `${a}` : `${a}–${b}`);
/** «2–3 тижні» / «2–3 недели» (a no-break space: the number never leaves its unit) */
export const weeksText = (w: [number, number], lang: Lang) =>
  `${span(w)}\u00a0${plural(w[1], lang === "ru" ? ["неделя", "недели", "недель"] : ["тиждень", "тижні", "тижнів"])}`;
/** «2–3 дні» / «2–3 дня» */
export const daysText = (d: [number, number], lang: Lang) =>
  `${span(d)}\u00a0${plural(d[1], lang === "ru" ? ["день", "дня", "дней"] : ["день", "дні", "днів"])}`;

/** the losses calculator (phase 2) is on the page: the first screen's «Порахувати, скільки ви втрачаєте» leads there */
export const LOSS_READY = false;
