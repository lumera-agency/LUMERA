import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button/Button";
import { aiRich } from "@/components/ai/rich";
import { HeroFlux } from "@/components/sites/hero-fx/HeroFlux";
import { priceLine, type AdsFacts } from "@/components/ads/facts";

type Src = "google" | "insta" | "fb";

/** The week's requests (a sample): what the request was about, when, and the ad it came from. No names: Google
 *  Analytics keeps no personal data, only the request and its source. Newest on top, as in a mailbox: they arrive from
 *  the top and push the earlier ones down (runtime); phones show the latest three */
const ROWS: { n: number; time: string; src: Src }[] = [
  { n: 4, time: "16:22", src: "google" },
  { n: 3, time: "13:05", src: "fb" },
  { n: 2, time: "11:40", src: "insta" },
  { n: 1, time: "09:14", src: "google" },
];
/** where the ads are, and how many of the week's requests each brought (2 · 1 · 1 of the four rows) */
const SOURCES: { src: Src; n: number }[] = [
  { src: "google", n: 2 },
  { src: "insta", n: 1 },
  { src: "fb", n: 1 },
];
const NAME: Record<Src, string> = { google: "Google", insta: "Instagram", fb: "Facebook" };

/** the three networks' marks, plain line drawings (not their logos) */
const ICON: Record<Src, React.ReactNode> = {
  google: <><circle cx="12" cy="12" r="8" /><path d="M12.5 12h7.3" /></>,
  insta: <><rect x="4.5" y="4.5" width="15" height="15" rx="4.5" /><circle cx="12" cy="12" r="3.4" /><circle cx="16.6" cy="7.4" r="0.6" /></>,
  fb: <><path d="M13.5 20v-7h2.6l.4-3h-3V8.4c0-.9.3-1.4 1.5-1.4H16.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9V10H8v3h2.5v7" /></>,
};

/**
 * 1 · the first screen (the owner's redesign of 20 Oct: the words alone did not say where the ads are or what the
 * window was): the words on the left, as on the AI case pages (the title, one lead, the request button in lime with the
 * quiet link to the prices, one line of confirmed facts), and on the right the way of a request as an integration
 * diagram (Magic UI's / 21st.dev's Animated Beam): the three networks on top, their lines join and run into «Ваш сайт ·
 * форма заявки», and from there into the week's requests, each with the ad it came from. Plays once (scene «hero»): a
 * light runs from a network down the lines into the site, the request lands on top of the list, and that network's count
 * goes up; four times, Google, Instagram, Facebook, Google. It plays again each time it comes back into view; under
 * the window, quietly, «Приклад · дані умовні». Phones stack the diagram under the button. The ground is the
 * sibling pages' FluxLines on black; it pins, and the page slides over it (data-cover).
 */
export async function AdsHero({ facts }: { facts: AdsFacts }) {
  const t = await getTranslations("ads");
  return (
    <section className="ai-hero ad-hero" id="top" aria-labelledby="ad-title" data-cover="">
      <div className="ai-hero__bg" aria-hidden="true"><HeroFlux under="#ads" /></div>
      <div className="ai-hero__in">
        <div className="ai-hero__copy">
          <h1 className="s-head__title s-head__title--stone ai-hero__title ai-hero__title--auto" id="ad-title">
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
          {/* the facts, each kept whole: a line breaks only between them */}
          <p className="ad-hero__facts">
            {(t.raw("hero.facts") as string).split(" · ").map((part, i, all) => (
              <span key={i}>
                <span className="ad-hero__f">{priceLine(part, facts)}{i < all.length - 1 && "\u00a0·"}</span>{i < all.length - 1 && " "}
              </span>
            ))}
          </p>
        </div>

        <div className="ai-hero__visual">
          <div className="ad-fl" data-scene="hero">
            <div className="ad-fl__win" role="img" aria-label={t("hero.alt")}>
              <p className="ad-fl__top" aria-hidden="true">
                <span>{t("hero.sum")}</span>
              </p>
              {/* the networks, each with its count of the week's requests (a strip 0…n, rolled by the runtime) */}
              <ul className="ad-fl__src" aria-hidden="true">
                {SOURCES.map((s) => (
                  <li data-src={s.src} key={s.src}>
                    <span className="ad-fl__chip">
                      <svg className="ad-fl__ico" viewBox="0 0 24 24" focusable="false">{ICON[s.src]}</svg>
                      <span className="ad-fl__name"><b>{NAME[s.src]}</b><small>{t(`hero.s.${s.src}`)}</small></span>
                      <span className="ad-fl__n">
                        <span className="ad-part__n" style={{ "--n": s.n } as React.CSSProperties}>
                          <span className="ad-part__strip">
                            {Array.from({ length: s.n + 1 }, (_, k) => <span key={k}>{k}</span>)}
                          </span>
                        </span>
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              {/* the lines: from each network down, together, into the site; a light runs along them (runtime) */}
              <div className="ad-fl__bus" aria-hidden="true">
                {SOURCES.map((s, i) => (
                  <span className="ad-fl__run" data-i={i} key={s.src}><b /></span>
                ))}
              </div>
              <p className="ad-fl__hub" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false"><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><path d="M3.5 9h17M7 13h6M7 15.8h4" /></svg>
                <b>{t("an.shot.site")}</b>
                <small>{t("hero.hub")}</small>
              </p>
              <div className="ad-fl__link" aria-hidden="true"><span className="ad-fl__run"><b /></span></div>
              <div className="ad-fl__box" aria-hidden="true">
                <p className="ad-fl__k">{t("hero.win")}</p>
                <ul className="ad-inbox__list">
                  {ROWS.map((r) => (
                    <li className="ad-inbox__row" data-src={r.src} key={r.n}>
                      <span className="ad-inbox__ava">
                        <svg viewBox="0 0 24 24" focusable="false"><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" /></svg>
                      </span>
                      <span className="ad-inbox__who">
                        <b>{t(`hero.req.${r.n}`)}</b>
                        <time>{r.time}</time>
                      </span>
                      <span className="ad-inbox__src">
                        <span className="ad-inbox__tick">✓</span>
                        <span className="ad-inbox__l">{t(`hero.src.${r.src}`)}</span>
                        <span className="ad-inbox__s">{NAME[r.src]}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="ad-note">{t("sample")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
