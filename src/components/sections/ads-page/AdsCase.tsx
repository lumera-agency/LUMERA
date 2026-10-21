/* eslint-disable @next/next/no-img-element -- the account's screenshots are shown as they are, never re-encoded (the client's numbers stay pixel for pixel) */
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button/Button";
import { aiRich as R } from "@/components/ai/rich";

/** A cell ringed on a screenshot, in % of the image */
type Ring = { left: number; top: number; width: number; height: number };
type Shot = { id: string; src: string; w: number; h: number; rings?: Ring[] };
type Case = {
  id: "ac" | "pest" | "volter";
  shots: Shot[];
  /** the conversion tile's segments: [filled, of] (≈ 1 in 4), or none */
  seg?: [number, number];
  /** the client's site, linked from the case (the owner, 21 Oct) */
  site: string;
  /** the screenshot shows the account before our changes: the window's chip and its caption say so */
  before?: boolean;
};

/**
 * The cases, one per client (the owner, 20–21 Oct). Numbers are the accounts' own (_cases/<id>/case.md); each case links
 * the client's site (the owner, 21 Oct; the screenshots still hide the names). Before a case goes live: its dated
 * screenshots, our role and the client's consent (_merge/MERGE.md).
 * · ac: a heating and air-conditioning service, Kyiv and Dnipro, June – September 2026, setup and ads: keywords with the
 *   Total row's conversions and cost per conversion ringed, campaigns.
 * · pest: pest control, July – September 2026, managing an account that was already running: the accepted calls counted
 *   by call tracking (one call never twice), the spend ringed on the account's total.
 * · volter: backup power systems, Kyiv and Dnipro, 29 August – 20 October 2026, the first cycle of managing an account:
 *   the budget no longer spent on keywords with no requests, the click's price and the share of impressions before and
 *   after (only three days after the changes, and the card says so). One screenshot, the campaigns, marked «before our
 *   changes» (the owner, 21 Oct: the keywords' screenshot, its quality scores of 3–5 out of 10, only hurt the case).
 */
const CASES: Case[] = [
  {
    id: "ac",
    seg: [1, 4],
    site: "https://airfrost.com.ua",
    shots: [
      { id: "kw", src: "/img/ads/case-ac-keywords.jpg", w: 780, h: 400, rings: [{ left: 78, top: 13, width: 10.6, height: 7.5 }, { left: 88.6, top: 13, width: 11, height: 7.5 }] },
      { id: "cmp", src: "/img/ads/case-ac-campaigns.jpg", w: 780, h: 385 },
    ],
  },
  {
    id: "pest",
    site: "https://prussakoff.dp.ua",
    shots: [
      { id: "cmp", src: "/img/ads/case-pest-campaigns.jpg", w: 1086, h: 465, rings: [{ left: 46.4, top: 79.2, width: 8.3, height: 8.2 }] },
      { id: "mon", src: "/img/ads/case-pest-months.jpg", w: 1086, h: 550 },
    ],
  },
  {
    id: "volter",
    site: "https://volter.co.ua",
    before: true,
    shots: [{ id: "cmp", src: "/img/ads/case-volter-campaigns.jpg", w: 1138, h: 335 }],
  },
];
/** the four numbers: the price of a request first (the large tile), requests and spend side by side, conversion under them */
const METRICS = ["cpl", "n", "spend", "cr"] as const;

/** A number whose digits stand on strips of 0–9 (React Bits' Counter, as in block 3): the runtime rolls each digit up
 *  from 0 once; signs, spaces and the comma stay put. Screen readers get the text itself. */
function Roll({ text, sr = true }: { text: string; sr?: boolean }) {
  return (
    <>
      <span className="ad-count" aria-hidden="true">
        {Array.from(text).map((ch, i) =>
          /\d/.test(ch) ? (
            <span className="ad-count__d" style={{ "--d": ch } as React.CSSProperties} key={i}>
              <span className="ad-count__sizer">0</span>
              <span className="ad-count__strip">
                {"0123456789".split("").map((n) => <span key={n}>{n}</span>)}
              </span>
            </span>
          ) : (
            <span className="ad-count__c" key={i}>{ch}</span>
          ),
        )}
      </span>
      {sr && <span className="visually-hidden">{text}</span>}
    </>
  );
}

/** A number, or «before → after»: the old one small and struck through, the new one rolled up large */
function Value({ text }: { text: string }) {
  const [was, now] = text.split(" → ");
  if (!now) return <Roll text={text} />;
  return (
    <>
      <span className="ad-kase__ba" aria-hidden="true">
        <s className="ad-kase__was">{was}</s>
        <Roll text={now} sr={false} />
      </span>
      <span className="visually-hidden">{text}</span>
    </>
  );
}

/**
 * 2 · Кейси (the page's one light block, right after the first screen: the owner's brief of 21 Oct, the proof before the
 * explaining; the headline number the largest type on the page, in ember; the screenshot across the block, open on
 * phones too): the clients' cases behind a switcher (the owner, 21 Oct: more cases, the page no longer than one;
 * each tab shows the case's headline number, as 21st.dev's «Logo Cloud Story Tabs»; phones swipe the tabs as a row):
 * each is one card with the numbers that matter (21st.dev's «Stats Bento»): the price of a request or of an accepted
 * call large, then requests or calls, spend, conversion; what was done in one line; the account's screenshots under
 * «Скриншот з акаунта» (open beside the numbers on wide screens, folded on phones; tabs, the key cells ringed); the
 * honest line; the button. Plays once per case (runtime: scene «case»): the tiles rise, the digits roll up.
 */
export async function AdsCase({ index }: { index: number }) {
  const t = await getTranslations("ads");
  return (
    <section className="section section--ivory ai-sec ad-case" id="case" aria-labelledby="case-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("nav.case")}</span>
          </p>
          <h2 className="s-head__title" id="case-title" data-split="">
            <span className="tone">{t.rich("case.title", R)}</span>
          </h2>
          <p className="s-head__intro">{t("case.intro")}</p>
        </header>

        {/* the cases as a stack of short cards (React Bits «Stack»; phones on 21 Oct, then wide screens too): the top one
            is swiped or sent away and tucks under the pile; the case's details follow it, beside the stack on wide screens,
            under it on phones (runtime: initCaseStack, scene «kstack») */}
        <div className="ad-kgrid">
          <div className="ad-kstack" data-scene="kstack">
            <div className="ad-kstack__pile">
              {CASES.map((c, i) => (
                <article className="ad-kstack__card" data-case-card={c.id} data-pos={i} aria-hidden={i > 0} key={c.id}>
                  <p className="ad-kstack__top">
                    <span className="ad-kstack__chip">{t(`case.${c.id}.chip`)}</span>
                    <span className="ad-kstack__of">{t("case.of", { n: i + 1, total: CASES.length })}</span>
                  </p>
                  <h3 className="ad-kstack__name">{t(`case.${c.id}.name`)}</h3>
                  <p className="ad-kstack__when">{t(`case.${c.id}.when`)}</p>
                  <p className="ad-kstack__v"><Value text={t(`case.${c.id}.tab.v`)} /></p>
                  <p className="ad-kstack__k">{t(`case.${c.id}.tab.k`)}</p>
                  <dl className="ad-kstack__mini">
                    {(["n", "cr"] as const).map((m) => (
                      <div key={m}>
                        <dt>{t(`case.${c.id}.m.${m}.k`)}</dt>
                        <dd><Value text={t(`case.${c.id}.m.${m}.v`)} /></dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>
            <div className="ad-kstack__nav">
              <button type="button" className="ad-kstack__btn" data-kstack-go="-1" aria-label={t("case.prev")}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5.5 8.5 12l6.5 6.5" /></svg>
              </button>
              <span className="ad-kstack__dots" aria-hidden="true">
                {CASES.map((c, i) => <i className={i === 0 ? "is-on" : undefined} data-case-dot={c.id} key={c.id} />)}
              </span>
              <button type="button" className="ad-kstack__btn" data-kstack-go="1" aria-label={t("case.next")}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5.5 15.5 12 9 18.5" /></svg>
              </button>
            </div>
          </div>

          {/* the switcher: one case at a time (runtime: initCasePick; arrow keys move between them) */}
          <div className="ad-kase-pick" role="tablist" aria-label={t("case.pick")}>
            {CASES.map((c, i) => (
              <button type="button" className="ad-kase-pick__b" role="tab" id={`case-${c.id}`} aria-controls={`case-${c.id}-panel`} aria-selected={i === 0} tabIndex={i === 0 ? 0 : -1} data-case-pick={c.id} key={c.id}>
                <span className="ad-kase-pick__n">{t(`case.${c.id}.name`)}</span>
                <b className="ad-kase-pick__v">{t(`case.${c.id}.tab.v`)}</b>
                <small className="ad-kase-pick__k">{t(`case.${c.id}.tab.k`)}</small>
              </button>
            ))}
          </div>

          {CASES.map((c, i) => (
            <div className="ad-kase-panel" role="tabpanel" id={`case-${c.id}-panel`} aria-labelledby={`case-${c.id}`} data-case-panel={c.id} hidden={i > 0} key={c.id}>
              <article className="ad-kase" data-scene="case" aria-labelledby={`case-${c.id}-who`}>
                <div className="ad-kase__main">
                  <p className="ad-kase__who" id={`case-${c.id}-who`}>
                    <span className="ad-kase__chip">{t(`case.${c.id}.chip`)}</span>
                    <span>{t(`case.${c.id}.who`)}</span>
                  </p>
                  <p className="ad-kase__per">{t(`case.${c.id}.per`)}</p>
                  <dl className="ad-kase__stats">
                    {METRICS.map((m) => (
                      <div className={`ad-kase__m ad-kase__m--${m}`} key={m}>
                        <dt className="ad-kase__k">{t(`case.${c.id}.m.${m}.k`)}</dt>
                        <dd className="ad-kase__v"><Value text={t(`case.${c.id}.m.${m}.v`)} /></dd>
                        <dd className="ad-kase__s">
                          {t(`case.${c.id}.m.${m}.s`)}
                          {m === "cr" && c.seg && (
                            <span className="ad-kase__seg" aria-hidden="true">
                              {Array.from({ length: c.seg[1] }, (_, k) => <i className={k < c.seg![0] ? "is-on" : undefined} key={k} />)}
                            </span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="ad-kase__site">
                    <span>{t("case.site")}</span>
                    <a className="ad-kase__go" href={c.site} target="_blank" rel="noopener">
                      {new URL(c.site).hostname}
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-arrow" /></svg>
                    </a>
                  </p>
                  <p className="ad-kase__how">{t.rich(`case.${c.id}.how`, R)}</p>
                </div>

                <details className="ad-kase__shot" open>
                  <summary className="ad-kase__sum">{t("case.shot")}</summary>
                  <div className="ad-case__win">
                    <div className="ad-case__bar">
                      <i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" />
                      <span className="ad-case__host">ads.google.com</span>
                      {/* tabs only when there is more than one screenshot */}
                      {c.shots.length > 1 && (
                        <span className="ad-case__tabs" role="tablist" aria-label={t("case.tabs")}>
                          {c.shots.map((s, k) => (
                            <button type="button" className="ad-case__tab" role="tab" id={`case-${c.id}-tab-${s.id}`} aria-controls={`case-${c.id}-pic-${s.id}`} aria-selected={k === 0} tabIndex={k === 0 ? 0 : -1} data-case-tab={s.id} key={s.id}>
                              {t(`case.${c.id}.shots.${s.id}`)}
                            </button>
                          ))}
                        </span>
                      )}
                      {c.before ? (
                        <span className="ad-case__ok ad-case__ok--before">{t("case.before")}</span>
                      ) : (
                        <span className="ad-case__ok"><b aria-hidden="true" />{t("case.ok")}</span>
                      )}
                    </div>
                    {c.shots.map((s, k) => (
                      <div className="ad-case__pic" id={`case-${c.id}-pic-${s.id}`} role={c.shots.length > 1 ? "tabpanel" : undefined} aria-labelledby={c.shots.length > 1 ? `case-${c.id}-tab-${s.id}` : undefined} tabIndex={0} data-case-pic={s.id} hidden={k > 0} key={s.id}>
                        <div className="ad-case__in">
                          <img src={s.src} width={s.w} height={s.h} alt={t(`case.${c.id}.alt.${s.id}`)} loading="lazy" decoding="async" />
                          {s.rings?.map((r, j) => (
                            <span className="ad-case__ring" aria-hidden="true" key={j} style={{ left: `${r.left}%`, top: `${r.top}%`, width: `${r.width}%`, height: `${r.height}%` }} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="ad-case__swipe" aria-hidden="true">← {t("case.swipe")} →</p>
                  <p className="ad-case__cap">{c.before ? t(`case.${c.id}.cap`) : t("case.cap")}</p>
                </details>

                <div className="ad-kase__end">
                  <p className="ad-kase__honest">{t.rich(`case.${c.id}.honest`, R)}</p>
                  <ButtonLink href="#contact" variant="primary">{t("cta")}</ButtonLink>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
