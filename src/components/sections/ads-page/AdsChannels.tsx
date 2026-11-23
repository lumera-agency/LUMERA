import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { ButtonLink } from "@/components/ui/button/Button";
import { priceLine, type AdsFacts } from "@/components/ads/facts";

/** The search field's words, letter by letter: the scene shows them one after another (React Bits' TextType, see
 *  runtime/ads-runtime.js); at rest and for screen readers the whole query is there */
function Typed({ text }: { text: string }) {
  return (
    <>
      <span className="rk-type" aria-hidden="true">
        {Array.from(text).map((ch, i) => (
          <i key={i}>{ch}</i>
        ))}
        <b className="rk-type__caret" />
      </span>
      <span className="visually-hidden">{text}</span>
    </>
  );
}

/** The queries people type into Google, in the order they come in (the mock-up's «ваша послуга …»): the ad is shown for
 *  those that bring clients (`on`) and left out for those that never will («безкоштовно», «вакансії», «своїми руками») */
const QUERIES: { n: number; on: boolean }[] = [
  { n: 1, on: true },
  { n: 2, on: false },
  { n: 3, on: true },
  { n: 4, on: false },
  { n: 5, on: true },
  { n: 6, on: false },
];

const Check = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 12.5 4.2 4.2L19 7" /></svg>
);
const Minus = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 12h12" /></svg>
);

/**
 * 3 · Реклама: how the ads in Google work, in two scenes, each with its words beside it (black and without cards since
 * the owner's brief of 21 Oct; the scenes play again each time they come back into view). Google only since the owner's
 * word of 22 Nov 2026 (the Facebook / Instagram card went).
 * The ad: a query types itself into the search field (React Bits TextType), two ordinary results come up and our ad
 * slides in on top of them with Google's mark, a tap, «+1 заявка». The queries: what people type into Google comes in
 * line by line (Magic UI's Animated List); the ones that bring clients get the ad (a lime tick), the ones that never will
 * are struck out («безкоштовно», «вакансії», «своїми руками»), and «3 запити виключено» closes it.
 */
export async function AdsChannels({ index, facts }: { index: number; facts: AdsFacts }) {
  const t = await getTranslations("ads");
  const m = (k: string) => t(`ch.mock.${k}`);
  /** the price cards' choice, here too: «Обговорити» puts it into the form's plan box (runtime: initPlans) */
  const google = { plan: `${t("price.g.t")} · ${facts.ads}`, details: [1, 2, 3, 4].map((n) => t(`price.g.${n}`)).join("\n") };
  return (
    <section className="section ai-sec rk-ch" id="kanaly" aria-labelledby="kanaly-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("nav.ads")}</span>
          </p>
          <h2 className="s-head__title" id="kanaly-title" data-split="">
            <span className="tone">{t.rich("ch.title", R)}</span>
          </h2>
          <p className="s-head__intro">{t("ch.intro")}</p>
        </header>

        {/* phones: one scene at a time (the owner, 28 Oct: the two demos one under the other took two screens); the
            switch is «Як працюємо»'s (.rk-hseg). Wider screens show both and hide it (runtime: initChPick) */}
        <div className="rk-hseg rk-ch__pick" role="radiogroup" aria-label={t("ch.pick")} data-ch-pick="">
          <label className="rk-hseg__o is-on">
            <input type="radio" name="ads-ch" value="google" defaultChecked />
            <span>{t("ch.tab.g")}</span>
          </label>
          <label className="rk-hseg__o">
            <input type="radio" name="ads-ch" value="kw" />
            <span>{t("ch.tab.k")}</span>
          </label>
        </div>

        <div className="rk-ch__grid" data-pick="google">
          {/* the ad in the search */}
          <article className="rk-card" data-ch="google" aria-labelledby="ch-g">
            <div className="rk-card__media">
              <div className="rk-serp" data-scene="google" role="img" aria-label={m("aG")}>
                <div className="ai-sheet__bar">
                  <i aria-hidden="true" />
                  <i aria-hidden="true" />
                  <i aria-hidden="true" />
                  <span>{m("host")}</span>
                </div>
                <div className="rk-serp__in">
                  <p className="rk-serp__field">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6" /><path d="m20 20-4.3-4.3" /></svg>
                    <Typed text={m("query")} />
                  </p>
                  {/* the results: our ad on top (Google's mark above the address, quick links under the text), then two
                      ordinary results it pushes down as it comes in */}
                  <div className="rk-serp__res">
                    <div className="rk-serp__ad">
                      <p className="rk-serp__site"><b>{m("ad")}</b><span>{m("site")}</span></p>
                      <p className="rk-serp__head">{m("head")}</p>
                      <p className="rk-serp__desc">{m("desc")}</p>
                      <p className="rk-serp__links"><span>{m("l1")}</span><span>{m("l2")}</span><span>{m("l3")}</span></p>
                      <i className="rk-tap" aria-hidden="true" />
                    </div>
                    {[1, 2].map((n) => (
                      <div className="rk-serp__org" key={n}>
                        <p className="rk-serp__url"><i aria-hidden="true" />{m(`o${n}s`)}</p>
                        <p className="rk-serp__otitle">{m(`o${n}t`)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="rk-toast">
                  <span className="rk-toast__ico" aria-hidden="true"><Check /></span>
                  <span><b>{m("lead")}</b> {m("leadG")}</span>
                </p>
                {/* the person's finger, only while the scene plays */}
                <i className="rk-finger" aria-hidden="true" />
              </div>
            </div>
            <p className="rk-note">{t("sample")}</p>
            <div className="rk-card__body">
              <p className="rk-card__tag">{t("ch.g.tag")}</p>
              <h3 className="rk-card__t" id="ch-g">{t("ch.g.t")}</h3>
              <p className="rk-card__p">{t("ch.g.p")}</p>
              <ul className="rk-checks">
                <li>{t("ch.g.1")}</li>
                <li>{t("ch.g.2")}</li>
                <li>{t("ch.g.3")}</li>
              </ul>
              <div className="rk-card__foot">
                <p className="rk-card__price">{priceLine(t.raw("ch.g.price"), facts)}</p>
                <ButtonLink href="#contact" variant="ghost" size="sm" className="rk-card__go" data-plan={google.plan} data-details={google.details}>
                  {t("ch.g.go")}
                </ButtonLink>
              </div>
            </div>
          </article>

          {/* the queries */}
          <article className="rk-card" data-ch="kw" aria-labelledby="ch-k">
            <div className="rk-card__media">
              <div className="rk-kw" data-scene="kw" role="img" aria-label={m("kw.a")}>
                <div className="ai-sheet__bar">
                  <i aria-hidden="true" />
                  <i aria-hidden="true" />
                  <i aria-hidden="true" />
                  <span>{m("kw.host")}</span>
                </div>
                <div className="rk-kw__in" aria-hidden="true">
                  <p className="rk-kw__k">{m("kw.k")}</p>
                  <ul className="rk-kw__list">
                    {QUERIES.map((q) => (
                      <li className="rk-kw__row" data-on={q.on ? "" : undefined} key={q.n}>
                        <svg className="rk-kw__ico" viewBox="0 0 24 24" focusable="false"><circle cx="11" cy="11" r="6" /><path d="m20 20-4.3-4.3" /></svg>
                        <span className="rk-kw__q"><span>{m(`kw.${q.n}`)}</span><i className="rk-kw__cut" /></span>
                        <span className="rk-kw__v">
                          <span className="rk-kw__mark">{q.on ? <Check /> : <Minus />}</span>
                          <span className="rk-kw__vt">{m(q.on ? "kw.on" : "kw.off")}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="rk-toast rk-toast--kw" aria-hidden="true">
                  <span className="rk-toast__ico"><Minus /></span>
                  <span><b>{m("kw.cut")}</b> {m("kw.why")}</span>
                </p>
              </div>
            </div>
            <p className="rk-note">{t("sample")}</p>
            <div className="rk-card__body">
              <p className="rk-card__tag">{t("ch.k.tag")}</p>
              <h3 className="rk-card__t" id="ch-k">{t("ch.k.t")}</h3>
              <p className="rk-card__p">{t("ch.k.p")}</p>
              <ul className="rk-checks">
                <li>{t("ch.k.1")}</li>
                <li>{t("ch.k.2")}</li>
                <li>{t("ch.k.3")}</li>
              </ul>
              <div className="rk-card__foot">
                <p className="rk-card__price">{priceLine(t.raw("ch.k.price"), facts)}</p>
                <ButtonLink href="#contact" variant="ghost" size="sm" className="rk-card__go" data-plan={google.plan} data-details={google.details}>
                  {t("ch.g.go")}
                </ButtonLink>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
