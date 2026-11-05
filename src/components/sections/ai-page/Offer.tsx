import { getLocale, getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";
import { AUDIT, PRODUCTS, daysText, usd } from "./prices";
import { PriceCalcForm, type PriceCopy } from "./PriceCalcForm";
import { Talk } from "./Talk";

/**
 * 5 · Ціни (the owner, 21 Oct 2026: «що саме і за скільки»; since 5 Nov 2026 the lineup and the calculator are one
 * block, set as the main page's prices): the products as the calculator's choices with their price and launch time
 * (offer.ts; the form itself is React, PriceCalcForm, and keeps the page's #calc); beside the sum, what every package
 * gets free, in a window with its scene (runtime «svc-tg»). Then the audit, the way in for any task, as a call strip.
 */
export async function Offer({ index }: { index: number }) {
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
    <section className="section ai-sec ai-offer" id="offer" aria-labelledby="offer-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("offer.meta")}</span>
          </p>
          <h2 className="s-head__title" id="offer-title" data-split="">
            <span className="tone">{t.rich("offer.title", aiRich)}</span>
          </h2>
        </header>
        {/* the products as the calculator's choices; beside the sum, what every package gets free: the lead form's
            requests in Telegram and the mail, the 15-minute reminder (a window, its scene looping on screen) */}
        <div className="ai-offer__calc" id="calc">
          <PriceCalcForm
            copy={copy}
            aside={
              <div className="ai-offer__inc" data-svc="" data-rv="">
                <div className="ai-win">
                  <p className="ai-win__bar" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <span>{t("offer.inc.k")}</span>
                  </p>
                  <div className="ai-svc__art ai-svc__art--tg" data-scene="svc-tg" data-loop="" aria-hidden="true">
                    <div className="ai-mf">
                      <i />
                      <i />
                      <b className="ai-mf__btn" />
                    </div>
                    <div className="ai-mp">
                      <span className="ai-mp__ico">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <use href="#ico-tg" />
                        </svg>
                      </span>
                      <span className="ai-mp__txt">
                        <b>{t("svc.1.push.text")}</b>
                        <span>{t("svc.1.push.b")}</span>
                      </span>
                      <i className="ai-mp__dot" />
                    </div>
                  </div>
                </div>
                <h3 className="ai-offer__inc-t">{t("offer.inc.t")}</h3>
                <p className="ai-offer__inc-p">{t("offer.inc.p")}</p>
              </div>
            }
          />
        </div>
        {/* the audit: any task starts here; its price goes into the works if they are ordered */}
        <div className="ai-cta ai-offer__audit" id="audit" data-rv="">
          <div className="ai-offer__audit-head">
            <h3 className="ai-offer__audit-t">{t("offer.audit.t")}</h3>
            <p className="ai-offer__price">
              <b className="ai-offer__sum">{usd(AUDIT.price)}</b>
              <span className="ai-offer__wk">{daysText(AUDIT.days, lang)}</span>
            </p>
          </div>
          <p className="ai-offer__audit-p">{t("offer.audit.p", { sum: usd(AUDIT.price) })}</p>
          <Talk pick={4} variant="primary">
            {t("offer.audit.go")}
          </Talk>
        </div>
      </div>
    </section>
  );
}
