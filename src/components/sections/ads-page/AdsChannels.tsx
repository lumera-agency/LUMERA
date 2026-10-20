import { getTranslations } from "next-intl/server";
import { Replay, Sample } from "@/components/ai/parts";
import { aiRich as R } from "@/components/ai/rich";
import { ButtonLink } from "@/components/ui/button/Button";
import { priceLine, type AdsFacts } from "@/components/ads/facts";

/** The search field's words, letter by letter: the scene shows them one after another (React Bits' TextType, see
 *  runtime/ads-runtime.js); at rest and for screen readers the whole query is there */
function Typed({ text }: { text: string }) {
  return (
    <>
      <span className="ad-type" aria-hidden="true">
        {Array.from(text).map((ch, i) => (
          <i key={i}>{ch}</i>
        ))}
        <b className="ad-type__caret" />
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
 * 2 · Реклама (ivory): the two places the ads are shown, a card each with its own scene.
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
    <section className="section section--ivory ai-sec ad-ch" id="ads" aria-labelledby="ads-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("nav.ads")}</span>
          </p>
          <h2 className="s-head__title" id="ads-title" data-split="">
            <span className="tone">{t.rich("ch.title", R)}</span>
          </h2>
          <p className="s-head__intro">{t("ch.intro")}</p>
        </header>

        <div className="ad-ch__grid">
          {/* Google */}
          <article className="ad-card" aria-labelledby="ch-g">
            <div className="ad-card__media">
              <div className="ad-serp" data-scene="google" data-gate=".ad-toast" role="img" aria-label={m("aG")}>
                <div className="ai-sheet__bar">
                  <i aria-hidden="true" />
                  <i aria-hidden="true" />
                  <i aria-hidden="true" />
                  <span>{m("host")}</span>
                  <Sample>{t("sample")}</Sample>
                </div>
                <div className="ad-serp__in">
                  <p className="ad-serp__field">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6" /><path d="m20 20-4.3-4.3" /></svg>
                    <Typed text={m("query")} />
                  </p>
                  {/* the results: our ad on top (Google's mark above the address, quick links under the text), then two
                      ordinary results it pushes down as it comes in */}
                  <div className="ad-serp__res">
                    <div className="ad-serp__ad">
                      <p className="ad-serp__site"><b>{m("ad")}</b><span>{m("site")}</span></p>
                      <p className="ad-serp__head">{m("head")}</p>
                      <p className="ad-serp__desc">{m("desc")}</p>
                      <p className="ad-serp__links"><span>{m("l1")}</span><span>{m("l2")}</span><span>{m("l3")}</span></p>
                      <i className="ad-tap" aria-hidden="true" />
                    </div>
                    {[1, 2].map((n) => (
                      <div className="ad-serp__org" key={n}>
                        <p className="ad-serp__url"><i aria-hidden="true" />{m(`o${n}s`)}</p>
                        <p className="ad-serp__otitle">{m(`o${n}t`)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="ad-toast">
                  <span className="ad-toast__ico" aria-hidden="true"><Check /></span>
                  <span><b>{m("lead")}</b> {m("leadG")}</span>
                </p>
                {/* the person's finger (ember), only while the scene plays */}
                <i className="ad-finger" aria-hidden="true" />
              </div>
              <Replay scenes="google" label={t("replay.google")}>{t("replay.text")}</Replay>
            </div>
            <div className="ad-card__body">
              <p className="ad-card__tag">{t("ch.g.tag")}</p>
              <h3 className="ad-card__t" id="ch-g">{t("ch.g.t")}</h3>
              <p className="ad-card__p">{t("ch.g.p")}</p>
              <ul className="ad-checks">
                <li>{t("ch.g.1")}</li>
                <li>{t("ch.g.2")}</li>
                <li>{t("ch.g.3")}</li>
              </ul>
              <div className="ad-card__foot">
                <p className="ad-card__price">{priceLine(t.raw("ch.g.price"), facts)}</p>
                <ButtonLink href="#contact" variant="ghost" size="sm" className="ad-card__go" data-plan={google.plan} data-details={google.details}>
                  {t("ch.g.go")}
                </ButtonLink>
              </div>
            </div>
          </article>

          {/* Facebook · Instagram */}
          <article className="ad-card" aria-labelledby="ch-m">
            <div className="ad-card__media">
              <div className="ad-feed" data-scene="meta" data-gate=".ad-toast" role="img" aria-label={m("aM")}>
                {/* the people of the city: each chip leaves some out, three light up (React Bits' Radar was the first idea;
                    the review of 20 Oct asked for cause and effect instead of a sonar) */}
                <div className="ad-crowd" aria-hidden="true">
                  {CROWD.map((p, i) => (
                    <i className={`ad-crowd__dot${p.fit ? " is-fit" : ""}`} data-k={p.k} style={{ "--x": `${p.x}%`, "--y": `${p.y}%` } as React.CSSProperties} key={i}>
                      {p.fit && <b />}
                    </i>
                  ))}
                </div>
                <Sample>{t("sample")}</Sample>
                <div className="ad-aud">
                  <p className="ad-aud__k">{m("who")}</p>
                  <ul className="ad-aud__chips">
                    <li>{m("city")}</li>
                    <li>{m("age")}</li>
                    <li>{m("likes")}</li>
                  </ul>
                </div>
                <div className="ad-post">
                  <p className="ad-post__head">
                    <span className="ad-post__ava" aria-hidden="true">
                      <svg viewBox="0 0 24 24" focusable="false"><path d="M6 5h4v4H6zM14 5h4v4h-4zM6 15h4v4H6zM14 15h4v4h-4z" /></svg>
                    </span>
                    <span className="ad-post__who">
                      <b>{m("brand")}</b>
                      <span>{m("sponsored")}</span>
                    </span>
                  </p>
                  <div className="ad-post__img" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element -- the brand's stone in every mock-up (a still, 62 KB) */}
                    <img src="/img/stone.webp" width={520} height={626} alt="" loading="lazy" decoding="async" />
                  </div>
                  <p className="ad-post__cap">{m("caption")}</p>
                  <p className="ad-post__cta">
                    <span>{m("more")}</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 6 6 6-6 6" /></svg>
                    <i className="ad-tap" aria-hidden="true" />
                  </p>
                </div>
                {/* the three who fit, reached by the ad: beams that pass and fade (runtime) */}
                <i className="ad-beam" aria-hidden="true" />
                <i className="ad-beam" aria-hidden="true" />
                <i className="ad-beam" aria-hidden="true" />
                <i className="ad-finger" aria-hidden="true" />
                <p className="ad-toast ad-toast--meta">
                  <span className="ad-toast__ico" aria-hidden="true"><Check /></span>
                  <span><b>{m("lead")}</b> {m("leadM")}</span>
                </p>
              </div>
              <Replay scenes="meta" label={t("replay.meta")}>{t("replay.text")}</Replay>
            </div>
            <div className="ad-card__body">
              <p className="ad-card__tag">{t("ch.m.tag")}</p>
              <h3 className="ad-card__t" id="ch-m">{t("ch.m.t")}</h3>
              <p className="ad-card__p">{t("ch.m.p")}</p>
              <ul className="ad-checks">
                <li>{t("ch.m.1")}</li>
                <li>{t("ch.m.2")}</li>
                <li>{t("ch.m.3")}</li>
              </ul>
              <div className="ad-card__foot">
                <p className="ad-card__price ad-card__price--talk">{t("ch.m.price")}</p>
                <ButtonLink href="#contact" variant="ghost" size="sm" className="ad-card__go" data-plan={meta.plan} data-details={meta.details}>
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
