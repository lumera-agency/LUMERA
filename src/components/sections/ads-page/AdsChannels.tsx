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

/**
 * The people of a city for the Facebook / Instagram scene: 6 × 5, a little jitter, always the same. `k` says which chip
 * leaves a person out: 1 the city, 2 the age, 3 those who stay; three of those, the ones Meta finds likelier to respond,
 * light up (`fit`). Coordinates in % of the crowd's box.
 */
const CROWD = (() => {
  const pts = Array.from({ length: 30 }, (_, i) => {
    const c = i % 6;
    const r = Math.floor(i / 6);
    const x = 7 + c * 17.2 + ((((i * 37) % 11) - 5) * 0.9);
    const y = 9 + r * 20.5 + ((((i * 53) % 9) - 4) * 1.1);
    return { i, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, d: Math.hypot(x - 46, (y - 50) * 1.15) };
  });
  const byDist = [...pts].sort((a, b) => b.d - a.d);
  const k = new Map<number, 1 | 2 | 3>();
  byDist.slice(0, 14).forEach((p) => k.set(p.i, 1));
  byDist.slice(14).forEach((p, n) => k.set(p.i, n % 2 === 0 && n < 14 ? 2 : 3));
  const stay = byDist.filter((p) => k.get(p.i) === 3).map((p) => p.i);
  const fit = new Set([stay[0], stay[Math.floor(stay.length / 2)], stay[stay.length - 1]]);
  return pts.map((p) => ({ x: p.x, y: p.y, k: k.get(p.i)!, fit: fit.has(p.i) }));
})();

const Check = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 12.5 4.2 4.2L19 7" /></svg>
);

/**
 * 3 · Реклама: the two places the ads are shown, each its own scene with its words under it (black and without cards
 * since the owner's brief of 21 Oct; the scenes play again each time they come back into view).
 * Google: a query types itself into the search field (React Bits TextType), two ordinary results come up and our ad
 * slides in on top of them with Google's mark, a tap, «+1 заявка». Facebook / Instagram: the people of a city; each
 * audience chip leaves some out (the city, the age), three light up, the ad stands in the feed, and a request comes from
 * it. Each card's top line says when to start with it (wave B: the separate hint line moved into the cards).
 */
export async function AdsChannels({ index, facts }: { index: number; facts: AdsFacts }) {
  const t = await getTranslations("ads");
  const m = (k: string) => t(`ch.mock.${k}`);
  /** the price cards' choice, here too: «Обговорити» puts it into the form's plan box (runtime: initPlans) */
  const google = { plan: `${t("price.g.t")} · ${facts.ads}`, details: [1, 2, 3, 4].map((n) => t(`price.g.${n}`)).join("\n") };
  const meta = { plan: `${t("price.fb.t")} · ${t("price.talk")}`, details: "" };
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

        {/* phones: one network at a time (the owner, 28 Oct: the two demos one under the other took two screens); the
            switch is «Як працюємо»'s (.rk-hseg). Wider screens show both side by side and hide it (runtime: initChPick) */}
        <div className="rk-hseg rk-ch__pick" role="radiogroup" aria-label={t("ch.pick")} data-ch-pick="">
          <label className="rk-hseg__o is-on">
            <input type="radio" name="ads-ch" value="google" defaultChecked />
            <span>{t("ch.tab.g")}</span>
          </label>
          <label className="rk-hseg__o">
            <input type="radio" name="ads-ch" value="meta" />
            <span>{t("ch.tab.m")}</span>
          </label>
        </div>

        <div className="rk-ch__grid" data-pick="google">
          {/* Google */}
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

          {/* Facebook · Instagram */}
          <article className="rk-card" data-ch="meta" aria-labelledby="ch-m">
            <div className="rk-card__media">
              <div className="rk-feed" data-scene="meta" role="img" aria-label={m("aM")}>
                {/* the people of the city: each chip leaves some out, three light up (React Bits' Radar was the first idea;
                    the review of 20 Oct asked for cause and effect instead of a sonar) */}
                <div className="rk-crowd" aria-hidden="true">
                  {CROWD.map((p, i) => (
                    <i className={`rk-crowd__dot${p.fit ? " is-fit" : ""}`} data-k={p.k} style={{ "--x": `${p.x}%`, "--y": `${p.y}%` } as React.CSSProperties} key={i}>
                      {p.fit && <b />}
                    </i>
                  ))}
                </div>
                <div className="rk-aud">
                  <p className="rk-aud__k">{m("who")}</p>
                  <ul className="rk-aud__chips">
                    <li>{m("city")}</li>
                    <li>{m("age")}</li>
                    <li>{m("likes")}</li>
                  </ul>
                </div>
                <div className="rk-post">
                  <p className="rk-post__head">
                    <span className="rk-post__ava" aria-hidden="true">
                      <svg viewBox="0 0 24 24" focusable="false"><path d="M6 5h4v4H6zM14 5h4v4h-4zM6 15h4v4H6zM14 15h4v4h-4z" /></svg>
                    </span>
                    <span className="rk-post__who">
                      <b>{m("brand")}</b>
                      <span>{m("sponsored")}</span>
                    </span>
                  </p>
                  <div className="rk-post__img" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element -- the brand's stone in every mock-up (a still, 62 KB) */}
                    <img src="/img/stone.webp" width={520} height={626} alt="" loading="lazy" decoding="async" />
                  </div>
                  <p className="rk-post__cap">{m("caption")}</p>
                  <p className="rk-post__cta">
                    <span>{m("more")}</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 6 6 6-6 6" /></svg>
                    <i className="rk-tap" aria-hidden="true" />
                  </p>
                </div>
                {/* the three who fit, reached by the ad: beams that pass and fade (runtime) */}
                <i className="rk-beam" aria-hidden="true" />
                <i className="rk-beam" aria-hidden="true" />
                <i className="rk-beam" aria-hidden="true" />
                <i className="rk-finger" aria-hidden="true" />
                <p className="rk-toast rk-toast--meta">
                  <span className="rk-toast__ico" aria-hidden="true"><Check /></span>
                  <span><b>{m("lead")}</b> {m("leadM")}</span>
                </p>
              </div>
            </div>
            <p className="rk-note">{t("sample")}</p>
            <div className="rk-card__body">
              <p className="rk-card__tag">{t("ch.m.tag")}</p>
              <h3 className="rk-card__t" id="ch-m">{t("ch.m.t")}</h3>
              <p className="rk-card__p">{t("ch.m.p")}</p>
              <ul className="rk-checks">
                <li>{t("ch.m.1")}</li>
                <li>{t("ch.m.2")}</li>
                <li>{t("ch.m.3")}</li>
              </ul>
              <div className="rk-card__foot">
                <p className="rk-card__price rk-card__price--talk">{t("ch.m.price")}</p>
                <ButtonLink href="#contact" variant="ghost" size="sm" className="rk-card__go" data-plan={meta.plan} data-details={meta.details}>
                  {t("price.fb.go")}
                </ButtonLink>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
