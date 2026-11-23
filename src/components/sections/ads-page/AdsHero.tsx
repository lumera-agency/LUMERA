import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button/Button";
import { aiRich } from "@/components/ai/rich";
import { AdsFibers } from "@/components/ads/AdsFibers";
import { priceLine, type AdsFacts } from "@/components/ads/facts";

/** three of the queries people type into Google before they find the business (the mock-up's «ваша послуга …», cut to
 *  the word that differs): each brings its own requests. The words are hero.g.*: the old hero.sum / s / src / alt stay
 *  for the main page's configurator, which still draws the old diagram (pricing/AdsScheme.tsx, a shared file) */
type Src = "price" | "city" | "fast";

/** The week's requests (a sample): what the request was about, when, and the query it came from. No names: Google
 *  Analytics keeps no personal data, only the request and its source. Newest on top, as in a mailbox: they arrive from
 *  the top and push the earlier ones down (runtime); phones show the latest three, so the first screen fits theirs */
const ROWS: { n: number; time: string; src: Src }[] = [
  { n: 4, time: "16:22", src: "price" },
  { n: 3, time: "13:05", src: "fast" },
  { n: 2, time: "11:40", src: "city" },
  { n: 1, time: "09:14", src: "price" },
];
const PHONE_ROWS = 3;
/** the queries; each one's count is its rows in the list, on phones only the rows they show */
const SOURCES: Src[] = ["price", "city", "fast"];
const countOf = (src: Src, rows: typeof ROWS) => rows.filter((row) => row.src === src).length;

/**
 * 1 · the first screen (the owner's redesign of 20 Oct: the words alone did not say where the ads are or what the
 * window was; Google only since the owner's word of 22 Nov 2026): the words on the left (the owner's setting of 5 Nov 2026: the title large and white, one lead, the
 * confirmed facts as a numbered table, the request button in lime with the quiet link to the prices), and on the right
 * the way of a request as an integration diagram (Magic UI's / 21st.dev's Animated Beam): three Google queries on top,
 * their lines join and run into «Ваш сайт · форма заявки», and from there into the week's requests, each with the query
 * it came from. Plays once (scene «hero»): a light runs from a query down the lines into the site, the request lands on
 * top of the list, and that query's count goes up; four times, «ціна», «київ», «терміново», «ціна» (phones three).
 * It plays again each time it comes back into view. Phones set the title, the facts, the diagram, then the button (the
 * owner, 5 Nov 2026). The ground (the owner, 5 Nov 2026): a stream of glowing lines arcing under the window
 * (AdsFibers), the window over it as frosted glass. No longer pinned: block 2 scrolls in after it, it does not slide
 * over it (the owner, 5 Nov 2026).
 */
export async function AdsHero({ facts }: { facts: AdsFacts }) {
  const t = await getTranslations("ads");
  return (
    <section className="ai-hero rk-hero" id="top" aria-labelledby="rk-title">
      <div className="ai-hero__bg" aria-hidden="true"><AdsFibers under="#case" /></div>
      <div className="ai-hero__in">
        <div className="ai-hero__copy">
          <h1 className="s-head__title s-head__title--stone ai-hero__title ai-hero__title--auto" id="rk-title">
            {t.rich("hero.title", aiRich)}
          </h1>
          <p className="ai-hero__lead">{t("hero.lead")}</p>
          <div className="ai-hero__actions">
            <ButtonLink href="#contact" variant="primary">{t("cta")}</ButtonLink>
            <a className="ai-down" href="#price">
              <span>{t("hero.prices")}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg>
            </a>
          </div>
          {/* the facts, a row each in a numbered table (the numbers are CSS counters) */}
          <ol className="rk-hero__facts">
            {(t.raw("hero.facts") as string).split(" · ").map((part, index) => (
              <li className="rk-hero__f" key={index}><span>{priceLine(part, facts)}</span></li>
            ))}
          </ol>
        </div>

        <div className="ai-hero__visual">
          <div className="rk-fl" data-scene="hero">
            <div className="rk-fl__win" role="img" aria-label={t("hero.g.alt")}>
              <p className="rk-fl__top" aria-hidden="true">
                <span>{t("hero.g.sum")}</span>
              </p>
              {/* the queries, each with its count of the week's requests (a strip 0…n, rolled by the runtime) */}
              <ul className="rk-fl__src" aria-hidden="true">
                {SOURCES.map((src) => (
                  <li data-src={src} key={src}>
                    <span className="rk-fl__chip">
                      <svg className="rk-fl__ico" viewBox="0 0 24 24" focusable="false"><circle cx="11" cy="11" r="6" /><path d="m20 20-4.3-4.3" /></svg>
                      <span className="rk-fl__name"><b>{t(`hero.g.q.${src}`)}</b><small>{t("hero.g.s")}</small></span>
                      <span className="rk-fl__n">
                        <span className="rk-part__n" style={{ "--n": countOf(src, ROWS), "--n-phone": countOf(src, ROWS.slice(0, PHONE_ROWS)) } as React.CSSProperties}>
                          <span className="rk-part__strip">
                            {Array.from({ length: countOf(src, ROWS) + 1 }, (_, k) => <span key={k}>{k}</span>)}
                          </span>
                        </span>
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              {/* the lines: from each query down, together, into the site; a light runs along them (runtime) */}
              <div className="rk-fl__bus" aria-hidden="true">
                {SOURCES.map((src, i) => (
                  <span className="rk-fl__run" data-i={i} key={src}><b /></span>
                ))}
              </div>
              <p className="rk-fl__hub" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false"><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><path d="M3.5 9h17M7 13h6M7 15.8h4" /></svg>
                <b>{t("an.shot.site")}</b>
                <small>{t("hero.hub")}</small>
              </p>
              <div className="rk-fl__link" aria-hidden="true"><span className="rk-fl__run"><b /></span></div>
              <div className="rk-fl__box" aria-hidden="true">
                <p className="rk-fl__k">{t("hero.win")}</p>
                <ul className="rk-inbox__list">
                  {ROWS.map((r, index) => (
                    <li className="rk-inbox__row" data-src={r.src} data-wide={index >= PHONE_ROWS || undefined} key={r.n}>
                      <span className="rk-inbox__ava">
                        <svg viewBox="0 0 24 24" focusable="false"><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" /></svg>
                      </span>
                      <span className="rk-inbox__who">
                        <b>{t(`hero.req.${r.n}`)}</b>
                        <time>{r.time}</time>
                      </span>
                      <span className="rk-inbox__src">
                        <span className="rk-inbox__tick">✓</span>
                        <span className="rk-inbox__l">{t(`hero.g.src.${r.src}`)}</span>
                        <span className="rk-inbox__s">{t(`hero.g.q.${r.src}`)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
