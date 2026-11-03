import { getLocale, getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";
import { AUDIT, PRODUCTS, usd } from "./prices";
import { PriceCalcForm, type PriceCopy } from "./PriceCalcForm";

/**
 * Розрахунок ціни (the owner, 21 Oct 2026: kept, low on the page, before the questions and the form: «скільки»): the
 * page's own lineup (offer.ts) and a site or a landing. The form itself is React (PriceCalcForm); this reads its words.
 */
export async function Calc({ index }: { index: number }) {
  const t = await getTranslations("ai");
  const lang = (await getLocale()) === "ru" ? "ru" : "uk";
  const product = (p: "search" | "sources" | "assistant" | "custom") => ({ t: t(`offer.${p}.t`), d: t(`pcalc.${p}.d`) });
  const copy: PriceCopy = {
    lang,
    g1: t("pcalc.g1"),
    g3: t("calc.g3"),
    products: { search: product("search"), sources: product("sources"), assistant: product("assistant"), custom: product("custom") },
    from: t.raw("offer.from") as string,
    after: t("pcalc.after"),
    extra: t.raw("pcalc.extra") as string,
    monthly: t("offer.assistant.monthly", { sum: usd(PRODUCTS.assistant.monthly ?? 0), n: PRODUCTS.assistant.freeMonths ?? 0 }),
    site: {
      has: t("calc.site.has.text"),
      hasD: t("calc.site.has.d"),
      hasP: t("calc.site.has.p"),
      need: t("calc.site.new.text"),
      needD: t("calc.site.new.d"),
      name: t("calc.site.name"),
    },
    k: t("calc.k"),
    once: t("svc.once"),
    audit: t("pcalc.audit", { sum: usd(AUDIT.price) }),
    send: t("calc.send"),
    tol: t("calc.tol"),
  };
  return (
    <section className="section ai-sec" id="calc" aria-labelledby="calc-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("nav.calc")}</span>
          </p>
          <h2 className="s-head__title" id="calc-title" data-split="">
            <span className="tone">{t.rich("calc.title", aiRich)}</span>
          </h2>
          <p className="s-head__intro">{t("calc.intro")}</p>
        </header>
        <PriceCalcForm copy={copy} />
      </div>
    </section>
  );
}
