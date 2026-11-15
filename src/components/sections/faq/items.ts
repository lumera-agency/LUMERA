import { getTranslations } from "next-intl/server";
import { PRICES } from "@/components/sections/services/copy";

/**
 * 7 · Питання's questions and answers, in order: the list (Faq.tsx) and the page's structured data (components/seo)
 * read them from here, so the two always say the same. The sums in 1 and 9 come from the configurator's engine
 * (services/copy). The first answer's link to the calculator is the list's own.
 */
export async function mainFaqItems() {
  const t = await getTranslations();
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
    n,
    q: t(`faq.q.${n}`),
    a: n === 1 ? t("faq.a.1.text", PRICES) : n === 9 ? t("faq.a.9", PRICES) : t(`faq.a.${n}`),
  }));
}
