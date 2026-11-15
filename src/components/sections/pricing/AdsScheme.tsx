import { getTranslations } from "next-intl/server";

type Src = "google" | "insta" | "fb";

/** The «Реклама й аналітика» page's first-screen diagram (sections/ads-page/AdsHero.tsx), the same rows and words: the
 *  week's requests, newest on top, each with the ad it came from (phones show the latest three). */
const ROWS: { n: number; time: string; src: Src }[] = [
  { n: 4, time: "16:22", src: "google" },
  { n: 3, time: "13:05", src: "fb" },
  { n: 2, time: "11:40", src: "insta" },
  { n: 1, time: "09:14", src: "google" },
];
const PHONE_ROWS = 3;
const SOURCES: Src[] = ["google", "insta", "fb"];
const countOf = (src: Src, rows: typeof ROWS) => rows.filter((row) => row.src === src).length;
const NAME: Record<Src, string> = { google: "Google", insta: "Instagram", fb: "Facebook" };
const ICON: Record<Src, React.ReactNode> = {
  google: <><circle cx="12" cy="12" r="8" /><path d="M12.5 12h7.3" /></>,
  insta: <><rect x="4.5" y="4.5" width="15" height="15" rx="4.5" /><circle cx="12" cy="12" r="3.4" /><circle cx="16.6" cy="7.4" r="0.6" /></>,
  fb: <><path d="M13.5 20v-7h2.6l.4-3h-3V8.4c0-.9.3-1.4 1.5-1.4H16.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9V10H8v3h2.5v7" /></>,
};

/**
 * The way of a request (the owner, 9 Nov 2026: «як і з автоматизацією, вставте такий самий зі сторінки реклами»): the
 * «Реклама й аналітика» page's first-screen diagram, for the configurator's frame when ads or analytics are chosen
 * (PricingClient puts it there). The three networks on top, their lines into «Ваш сайт · форма заявки», and from there
 * into the week's requests, each with the ad it came from. The markup is that page's (AdsHero), its look is copied into
 * configurator.css (.cfg-ads), its play into configurator/ads-flow.js; a change to the ads page's diagram is made here too.
 */
export async function AdsScheme() {
  const t = await getTranslations("ads");
  return (
    <div className="cfg-ads">
      <div className="rk-fl">
        <div className="rk-fl__win" role="img" aria-label={t("hero.alt")}>
          <p className="rk-fl__top" aria-hidden="true">
            <span>{t("hero.sum")}</span>
          </p>
          <ul className="rk-fl__src" aria-hidden="true">
            {SOURCES.map((src) => (
              <li data-src={src} key={src}>
                <span className="rk-fl__chip">
                  <svg className="rk-fl__ico" viewBox="0 0 24 24" focusable="false">{ICON[src]}</svg>
                  <span className="rk-fl__name"><b>{NAME[src]}</b><small>{t(`hero.s.${src}`)}</small></span>
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
                    <span className="rk-inbox__l">{t(`hero.src.${r.src}`)}</span>
                    <span className="rk-inbox__s">{NAME[r.src]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
