import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button/Button";
import { aiRich as R } from "@/components/ai/rich";
import { priceLine, type AdsFacts } from "@/components/ads/facts";

type Card = {
  id: string;
  /** the message group: price.a, price.g … */
  key: string;
  /** the sum, or null: «за запитом» */
  sum: string | null;
  period: "once" | "month" | null;
  items: number;
  featured?: boolean;
  /** the bundle with a site: its own badge (a quiet one) and its own time */
  bundle?: boolean;
};

/**
 * 4 · Ціна (dark): what each part costs, from the configurator engine (facts). The art director's order (20 Oct): the
 * one-time setups in a row on shared lines (title, sum, text, list, footer line up across the cards; the Google ads one
 * recommended, the only one in signal; the ChatGPT note under the row), then what can be added as thin strips (the
 * monthly management, with its list under «Що входить»; Facebook / Instagram, no price in the engine yet), then the first
 * month in plain text. The landing with the ads stands in the row as the fourth card (the owner's brief of 26 Oct: the
 * bridge from block 5 ends on a price; «якщо сайту немає», its own ≈ 1–2 тижні); the line of bundles with a site that
 * closed the block (the full system, the calculator link) went at the owner's word the same day. «Обговорити» puts
 * that choice into the form's plan box and glides there (runtime). On phones the other setups' lists fold under «Що
 * входить» (runtime closes them; the recommended one stays open).
 */
export async function AdsPrice({ index, facts }: { index: number; facts: AdsFacts }) {
  const t = await getTranslations("ads");
  const setups: Card[] = [
    { id: "analytics", key: "a", sum: facts.analytics, period: "once", items: 3 },
    { id: "googleAds", key: "g", sum: facts.ads, period: "once", items: 4, featured: true },
    { id: "googleAdsAi", key: "ai", sum: facts.adsAi, period: "once", items: 6 },
    { id: "siteAds", key: "s", sum: facts.siteAds, period: "once", items: 4, bundle: true },
  ];
  const mgmt: Card = { id: "mgmt", key: "m", sum: facts.mgmt, period: "month", items: 3 };
  const meta: Card = { id: "meta", key: "fb", sum: null, period: null, items: 0 };
  const plan = (c: Card) => [t(`price.${c.key}.t`), c.sum ? `${c.sum}${c.period === "month" ? ` ${t("price.month")}` : ""}` : t("price.talk")].join(" · ");
  const details = (c: Card) => Array.from({ length: c.items }, (_, i) => t(`price.${c.key}.${i + 1}`)).join("\n");
  /** wider screens show the first four items and «ще N» (so the three cards end level); phones list them all (CSS) */
  const SHOWN = 4;
  const items = (c: Card) => (
    <>
      <ul className="ad-pc__inc">
        {Array.from({ length: c.items }, (_, i) => (
          <li className={i >= SHOWN ? "ad-pc__extra" : undefined} key={i}>{t(`price.${c.key}.${i + 1}`)}</li>
        ))}
      </ul>
      {c.items > SHOWN && (
        <button type="button" className="ad-pc__rest" aria-expanded="false" data-more="">
          {t("price.rest", { n: c.items - SHOWN })}
        </button>
      )}
    </>
  );
  const go = (c: Card, featured = false) => (
    <ButtonLink href="#contact" variant={featured ? "primary" : "ghost"} size="sm" className="ad-price__go" data-plan={plan(c)} data-details={details(c)}>
      {c.key === "fb" ? t("price.fb.go") : t("price.go")}
    </ButtonLink>
  );
  return (
    <section className="section ai-sec ad-price" id="price" aria-labelledby="price-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("nav.price")}</span>
          </p>
          <h2 className="s-head__title" id="price-title" data-split="">
            <span className="tone">{t.rich("price.title", R)}</span>
          </h2>
          <p className="s-head__intro">{t("price.intro")}</p>
        </header>

        {/* the setups: one row, shared lines */}
        <ul className="ad-prices">
          {setups.map((c) => (
            <li className={`ad-pc${c.featured ? " ad-pc--featured" : ""}${c.bundle ? " ad-pc--bundle" : ""}`} data-card={c.id} key={c.id}>
              <div className="ad-pc__top">
                <h3 className="ad-pc__t">{t(`price.${c.key}.t`)}</h3>
                {c.featured && <span className="ad-pc__badge">{t("price.g.badge")}</span>}
                {c.bundle && <span className="ad-pc__badge ad-pc__badge--q">{t("price.s.badge")}</span>}
              </div>
              <p className="ad-pc__sum">
                <b>{c.sum}</b>
                <span>{t("price.once")}</span>
              </p>
              <p className="ad-pc__d">
                {t(`price.${c.key}.d`)}
                {c.key === "ai" && <span className="ad-pc__star" aria-hidden="true">*</span>}
              </p>
              <details className="ad-pc__more" data-fold={c.featured ? undefined : ""} open>
                <summary>{t("price.more")}</summary>
                {items(c)}
              </details>
              <div className="ad-pc__foot">
                <span className="ad-pc__wk">{c.bundle ? facts.wSiteAds : facts.wAds}</span>
                {go(c, c.featured)}
              </div>
            </li>
          ))}
        </ul>
        {/* the exact sum is fixed in the contract: said right under the prices, where the doubt comes (the review, 20 Oct) */}
        <p className="ai-foot ad-price__note">{t("price.note")}</p>
        <p className="ad-price__star">* {t("price.ai.note")}</p>

        {/* what can be added: thin strips (the management one without its own button: it is chosen with a setup) */}
        <div className="ad-addons">
          <h3 className="ad-addons__h">{t("price.add")}</h3>
          <div className="ad-addon" data-card={mgmt.id}>
            <div className="ad-addon__main">
              <h4 className="ad-addon__t">{t("price.m.t")}</h4>
              <p className="ad-addon__d">{t("price.m.d")}</p>
              <details className="ad-addon__more">
                <summary>{t("price.more")}</summary>
                {items(mgmt)}
              </details>
            </div>
            <p className="ad-addon__sum"><b>{facts.mgmt}</b><span>{t("price.month")}</span></p>
          </div>
          <div className="ad-addon" data-card={meta.id}>
            <div className="ad-addon__main">
              <h4 className="ad-addon__t">{t("price.fb.t")}</h4>
              <p className="ad-addon__d">{t("price.fb.d")}</p>
            </div>
            <p className="ad-addon__sum"><b className="ad-addon__talk">{t("price.talk")}</b></p>
            {go(meta)}
          </div>
        </div>

        {/* the whole sum of the first month and what stays outside our price, as plain text after the prices (the art
            director's review, 20 Oct: as a card before them it pushed the prices down) */}
        <dl className="ad-first">
          <div>
            <dt>{t("price.first.k")}</dt>
            <dd>{priceLine(t.raw("price.first.v"), facts)}</dd>
          </div>
          <div>
            <dt>{t("price.out.k")}</dt>
            <dd>{t("price.out.v")}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
