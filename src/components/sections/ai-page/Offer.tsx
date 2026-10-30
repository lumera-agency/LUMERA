import { getLocale, getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";
import { Sample } from "@/components/ai/parts";
import { AUDIT, PRODUCTS, PRODUCT_ORDER, daysText, usd, weeksText, type Product } from "./prices";
import { Talk } from "./Talk";
import { offerScenes } from "./scenes";
import { OfferPicker } from "./OfferPicker";

/**
 * 6 · Лінійка (the owner, 21 Oct 2026): «що саме і за скільки». What every package gets free (requests never get lost),
 * then four products with their price and launch time (offer.ts) and, as their pictures, the old services block's
 * scenes, looping while they are on screen (data-loop; runtime/ai-runtime.js: «svc-flow», «svc-mail», «svc-crm»;
 * «svc-tg» shows the free part). The
 * fourth shows an empty place with a plus: the reader's own task. Then the audit, the way in for any task. Every
 * «Обговорити» goes to the form with that product's quick pick on (Talk).
 * The owner's picks, 30 Oct 2026: a computer has the price list with one panel (OfferPicker), a phone the cards that pin
 * and stack as you scroll (after React Bits Scroll Stack, CSS sticky only). ai-page.css shows the one that fits.
 */
export async function Offer({ index }: { index: number }) {
  const t = await getTranslations("ai");
  const c = await getTranslations("aiCommon");
  const lang = (await getLocale()) === "ru" ? "ru" : "uk";

  const art = await offerScenes();

  const price = (p: Product) => {
    const o = PRODUCTS[p];
    const sum = o.price === null ? t("offer.after") : o.from ? t("offer.from", { sum: usd(o.price) }) : usd(o.price);
    return (
      <p className="ai-offer__price">
        <b className={o.price === null ? "ai-offer__sum ai-offer__sum--talk" : "ai-offer__sum"}>{sum}</b>
        {o.weeks && <span className="ai-offer__wk">{weeksText(o.weeks, lang)}</span>}
      </p>
    );
  };

  const body = (p: Product, i: number) => (
    <>
      {p === "assistant" && (
        <p className="ai-offer__monthly">
          <span>{t("offer.assistant.monthly", { sum: usd(PRODUCTS.assistant.monthly ?? 0), n: PRODUCTS.assistant.freeMonths ?? 0 })}</span>{" "}
          <span className="ai-offer__infra">{t("offer.assistant.infra")}</span>
        </p>
      )}
      <p className="ai-svc__p">{t(`offer.${p}.p`)}</p>
      <div className="ai-svc__acts"><Talk pick={i} plain>{t("offer.talk")}</Talk></div>
    </>
  );

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

        {/* what every package gets, free: the lead form's requests in Telegram and the mail, the 15-minute reminder */}
        <div className="ai-offer__inc" data-svc="" data-rv="">
          <div className="ai-offer__inc-body">
            <p className="ai-offer__inc-k">{t("offer.inc.k")}</p>
            <h3 className="ai-offer__inc-t">{t("offer.inc.t")}</h3>
            <p className="ai-offer__inc-p">{t("offer.inc.p")}</p>
          </div>
          <div className="ai-svc__art ai-svc__art--tg ai-offer__inc-art" data-scene="svc-tg" data-loop="" aria-hidden="true">
            <div className="ai-mf"><i /><i /><b className="ai-mf__btn" /></div>
            <div className="ai-mp">
              <span className="ai-mp__ico"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-tg" /></svg></span>
              <span className="ai-mp__txt"><b>{t("svc.1.push.text")}</b><span>{t("svc.1.push.b")}</span></span>
              <i className="ai-mp__dot" />
            </div>
          </div>
        </div>

        <OfferPicker
          items={PRODUCT_ORDER.map((p, i) => ({
            id: p,
            name: t(`offer.${p}.t`),
            price: price(p),
            panel: (
              <>
                {art[p]}
                <div className="ai-svc__body">{body(p, i)}</div>
              </>
            ),
          }))}
        />
        <ol className="ai-svcs ai-offer__list ai-narrow">
          {PRODUCT_ORDER.map((p, i) => (
            <li className="ai-svc ai-offer__card" data-svc="" data-rv="" key={p} style={{ "--i": i } as React.CSSProperties}>
              {art[p]}
              <div className="ai-svc__body">
                <h3 className="ai-svc__t">{t(`offer.${p}.t`)}</h3>
                {price(p)}
                {body(p, i)}
              </div>
            </li>
          ))}
        </ol>
        <div className="ai-svcs__end">
          <Sample>{c("sample")}</Sample>
        </div>

        {/* the audit: any task starts here; its price goes into the works if they are ordered */}
        <div className="ai-offer__audit" id="audit" data-rv="">
          <div className="ai-offer__audit-head">
            <h3 className="ai-offer__audit-t">{t("offer.audit.t")}</h3>
            <p className="ai-offer__price">
              <b className="ai-offer__sum">{usd(AUDIT.price)}</b>
              <span className="ai-offer__wk">{daysText(AUDIT.days, lang)}</span>
            </p>
          </div>
          <p className="ai-offer__audit-p">{t("offer.audit.p", { sum: usd(AUDIT.price) })}</p>
          <div className="ai-offer__audit-go"><Talk pick={4} variant="primary">{t("offer.audit.go")}</Talk></div>
        </div>
      </div>
    </section>
  );
}
