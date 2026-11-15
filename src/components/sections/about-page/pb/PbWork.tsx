import { getLocale, getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { splitWords } from "../words";

type T = Awaited<ReturnType<typeof getTranslations<"about">>>;
type TM = Awaited<ReturnType<typeof getTranslations>>;
type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/** a finding pinned onto a picture (aria-hidden: the words are the plan's own two findings, said once on the sheet);
 *  `x`/`y`: where its head goes in the picture, in % (`yp`: below 1200 px, where the tags wrap to two lines); `side`: where
 *  its tag hangs */
function Pin({ t, find, x, y, yp = y, side = "r", k }: { t: T; find: 1 | 2; x: number; y: number; yp?: number; side?: "r" | "l"; k: number }) {
  return (
    <span className={`pb-pin pb-pin--${side}`} data-find={find} style={{ "--x": `${x}%`, "--y": `${y}%`, "--yp": `${yp}%`, "--k": k } as CSSVars}>
      <span className="pb-pin__head" />
      <span className="pb-pin__tag">{t(`pb.find.${find}`)}</span>
    </span>
  );
}

/** a finding on the plan: its words, each under its own stroke of the marker (so the sweep follows any wrap) */
function Finding({ t, find }: { t: T; find: 1 | 2 }) {
  return (
    <mark className="pb-find">
      {splitWords(t.raw(`pb.find.${find}`) as string, (w, i) => <span className="pb-mk" style={{ "--w": i } as CSSVars}>{w}</span>)}
    </mark>
  );
}

/** a tick in a box (the plan's checked lines, the notification's fields) */
const TICK = (
  <svg className="pb-tick" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <rect x="1.5" y="1.5" width="13" height="13" rx="3" />
    <path d="m4.75 8.25 2.25 2.25 4.25-4.75" />
  </svg>
);

/** the studio's mark (public/img/logo-mark.svg): the plan's letterhead */
const MARK = (
  <svg className="pb-doc__mark" viewBox="0 0 329 329" aria-hidden="true" focusable="false">
    <path d="M119 269.5C119 302.361 92.3609 329 59.5 329C26.6391 329 0 302.361 0 269.5C0 253.546 6.27877 239.059 16.5 228.375C26.7212 217.691 53 193.038 53 164.5C53 135.962 26.7212 111.309 16.5 100.625C6.27877 89.9406 0 75.4536 0 59.5C0 26.6391 26.6391 0 59.5 0C92.3609 0 119 26.6391 119 59.5C119 75.4536 112.721 89.9406 102.5 100.625C92.2788 111.309 66 135.962 66 164.5C66 193.038 92.2788 217.691 102.5 228.375C112.721 239.059 119 253.546 119 269.5Z" />
    <path d="M59.5 329C26.6391 329 0 302.361 0 269.5C0 236.639 26.6391 210 59.5 210C75.4536 210 89.9406 216.279 100.625 226.5C111.309 236.721 135.962 263 164.5 263C193.038 263 217.691 236.721 228.375 226.5C239.059 216.279 253.546 210 269.5 210C302.361 210 329 236.639 329 269.5C329 302.361 302.361 329 269.5 329C253.546 329 239.059 322.721 228.375 312.5C217.691 302.279 193.038 276 164.5 276C135.962 276 111.309 302.279 100.625 312.5C89.9406 322.721 75.4536 329 59.5 329Z" />
    <circle cx="270" cy="59" r="59" />
  </svg>
);

/** the plan's stages on a chart (the main page's five stages, approach.stage.title.*): where each bar starts and how
 *  long it runs, as shares of the row; no dates */
const STAGES = [
  { n: 1, a: 0, l: 0.17 },
  { n: 2, a: 0.13, l: 0.21 },
  { n: 3, a: 0.3, l: 0.24 },
  { n: 4, a: 0.5, l: 0.34 },
  { n: 5, a: 0.82, l: 0.18 },
] as const;

/** the report's search queries (the main page's ads demo, services.ads.*): the trade alone and with the demo's two
 *  words, each with its share of the requests as a bar; then the two words it never shows on */
const QUERIES = [
  { kw: null, b: 0.92 },
  { kw: "services.ads.kw.3", b: 0.64 },
  { kw: "services.ads.kw.2", b: 0.4 },
] as const;
const EXCLUDED = ["services.ads.neg.1", "services.ads.neg.2"] as const;
/** the report's requests by week, as column heights (no axis, no numbers) */
const WEEKS = [0.28, 0.36, 0.3, 0.48, 0.42, 0.55, 0.5, 0.66, 0.6, 0.74, 0.7, 0.86];

/** the four access cards on the key ring: the caption's own words (about.pb.tag.*), hanging straight; their glyphs: a
 *  page, the address, a server, an ad */
const TAGS = [1, 2, 3, 4] as const;
const TAG_GLYPH: Record<1 | 2 | 3 | 4, React.ReactNode> = {
  1: <path d="M4 5.5h16v13H4zM4 9h16M7 7.25h.01M9.5 7.25h.01" />,
  2: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2.4 2.3 3.6 5 3.6 8s-1.2 5.7-3.6 8c-2.4-2.3-3.6-5-3.6-8S9.6 6.3 12 4z" />
    </>
  ),
  3: <path d="M5 5h14v5H5zM5 14h14v5H5zM8 7.5h.01M8 16.5h.01M12 7.5h4M12 16.5h4" />,
  4: <path d="M4 10v4h3l6 4V6L7 10zM16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11" />,
};

/** an object's title and caption (the five things: about.work.<n>.h / .d) */
function Foot({ t, n }: { t: T; n: number }) {
  return (
    <div className="pb-obj__foot">
      <h3 className="pb-obj__h">{t(`work.${n}.h`)}</h3>
      <p className="pb-obj__d">{t(`work.${n}.d`)}</p>
    </div>
  );
}

/** the plan of works: a real document on the clipboard. The letterhead (the mark, «Команда ECLO»), the client's line
 *  («Ваш бренд» and the trade, the main page's mock-up client: services.mh.brand, services.site.token), the title and
 *  its summary (work.1.h / .d), then what is found out (the main page's first stage, approach.stage.checks.1.head and
 *  its lines): the client and the service with the two findings under the marker (pb.find.*), the site's aim
 *  (checks.1.b.2 / span.2), the stages on a chart (pb.plan.3, the five stage titles), the fixed price (pb.plan.4,
 *  checks.1.span.3); the team's signature and stamp at the foot */
function Plan({ t, tm }: { t: T; tm: TM }) {
  return (
    <div className="pb-sheet">
      <header className="pb-doc__head">
        <p className="pb-doc__from">
          {MARK}
          <span>{t("work.sign")}</span>
        </p>
        <p className="pb-doc__for">
          <span>{tm("services.mh.brand")}</span>
          <span className="pb-doc__pill">{tm("services.site.token")}</span>
        </p>
      </header>
      <h3 className="pb-doc__title">{t("work.1.h")}</h3>
      <p className="pb-doc__sum">{t("work.1.d")}</p>
      <p className="pb-doc__k">{tm("approach.stage.checks.1.head")}</p>
      <dl className="pb-doc__list">
        <div className="pb-doc__row">
          <dt>{tm("approach.stage.checks.1.b.1")}</dt>
          <dd>
            <ul className="pb-doc__finds">
              <li data-find="1">{TICK}<Finding t={t} find={1} /></li>
              <li data-find="2">{TICK}<Finding t={t} find={2} /></li>
            </ul>
          </dd>
        </div>
        <div className="pb-doc__row">
          <dt>{tm("approach.stage.checks.1.b.2")}</dt>
          <dd>{tm("approach.stage.checks.1.span.2")}</dd>
        </div>
        <div className="pb-doc__row">
          <dt>{t("pb.plan.3")}</dt>
          <dd>
            <ol className="pb-gantt">
              {STAGES.map(({ n, a, l }) => (
                <li key={n} style={{ "--a": a, "--l": l, "--g": n - 1 } as CSSVars}>
                  <span>{tm(`approach.stage.title.${n}`)}</span>
                  <i aria-hidden="true" />
                </li>
              ))}
            </ol>
          </dd>
        </div>
        <div className="pb-doc__row">
          <dt>{t("pb.plan.4")}</dt>
          <dd>{tm("approach.stage.checks.1.span.3")}</dd>
        </div>
      </dl>
      <footer className="pb-doc__sign">
        <svg className="pb-doc__pen" viewBox="0 0 120 40" aria-hidden="true" focusable="false">
          <path d="M4 29c6-1 11-9 14-16 2-5 1-8-1-6-4 5-5 17-1 21 3 3 8-6 11-11 2-3 3-1 2 2-1 4 1 6 4 3 3-3 5-8 8-8 2 0 1 4 3 5 3 2 7-5 10-5s1 6 4 6c4 0 9-6 13-6 3 0 3 3 6 3 5 0 12-4 19-6" />
        </svg>
        <p className="pb-stamp"><span>{t("work.sign")}</span></p>
      </footer>
    </div>
  );
}

/**
 * Variant B, 2 · Як ми працюємо: the studio's desk, the page's one light block. A square-module mat (dots
 * at the modules' corners, a ruler on its top edge) with the five things the client gets lying on it as the real things,
 * each with its key tab (Розбір, Макет, Сайт, Реклама, Ключі): A the plan, a signed document on a clipboard; B the layout,
 * the example site's real renders on a design board (public/img/about/pb-lay-*, cut from public/img/sites/how-landing-*
 * with their price line taken out: no digits), the computer's and the phone's; C the test address, a browser window with
 * that site live and the test request arriving as a Telegram notification (the one dark object; lime: the system's
 * small «done» marks); D the Google Ads report, words and bars, no digits; E the keys, the ember key and four access cards
 * in the client's name. The same two findings land as pins on the layout and on the report («Выводы на булавках»):
 * about.work.intro and 4.d say it, the site and the ads are built on the same findings. Played once as the desk comes
 * into view (runtime/pb.js, scene «desk»; phones: one object at a time). Mouse only: an object lifts; a finding (or
 * one of its pins) lights its pins and fades what lacks it.
 */
export async function PbWork({ index }: { index: number }) {
  const t = await getTranslations("about");
  const tm = await getTranslations();
  const ru = (await getLocale()) === "ru" ? "-ru" : "";
  const trade = tm("services.site.token");
  return (
    <section className="section section--ivory pb-work" id="work" aria-labelledby="work-title">
      <div className="container pb-c">
        <header className="s-head pb-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("work.meta")}</span>
          </p>
          <h2 className="s-head__title" id="work-title" data-split="">
            <span className="tone">{t.rich("work.title", R)}</span>
          </h2>
          <p className="s-head__intro">{t("work.intro")}</p>
        </header>

        <p className="pb-rcpt" id="work-rcpt">{t("work.rcpt")}</p>
        <div className="pb-mat pb-mat--desk" data-pb-desk="">
          <span className="pb-ruler" aria-hidden="true" />
          <ul className="pb-desk" aria-labelledby="work-rcpt">
            {/* A · Розбір: the plan of works, a signed document on a clipboard */}
            <li className="pb-obj pb-obj--plan" style={{ "--i": 0 } as CSSVars}>
              <div className="pb-obj__card">
                <p className="pb-tab">{t("work.1.k")}</p>
                <span className="pb-clip" aria-hidden="true" />
                <Plan t={t} tm={tm} />
              </div>
            </li>

            {/* B · Макет: the example site's layouts on a design board, the computer's and the phone's over its right
                edge (the phone selected, as in a design tool), both straight; the two findings pinned on them */}
            <li className="pb-obj pb-obj--layout" style={{ "--i": 1 } as CSSVars}>
              <div className="pb-obj__card">
                <p className="pb-tab">{t("work.2.k")}</p>
                <div className="pb-pic pb-lay" aria-hidden="true">
                  <div className="pb-lay__set">
                    <div className="pb-lay__pc">
                      <p className="pb-lay__k">{t("pb.pc")}</p>
                      <div className="pb-lay__frame">
                        {/* eslint-disable-next-line @next/next/no-img-element -- a fixed render in a fixed frame */}
                        <img src={`/img/about/pb-lay-d${ru}.webp`} width={900} height={516} alt="" loading="lazy" decoding="async" />
                      </div>
                    </div>
                    <div className="pb-lay__ph">
                      <p className="pb-lay__k">{t("pb.phone")}</p>
                      <div className="pb-lay__frame pb-lay__frame--ph">
                        {/* eslint-disable-next-line @next/next/no-img-element -- a fixed render in a fixed frame */}
                        <img src={`/img/about/pb-lay-m${ru}.webp`} width={300} height={556} alt="" loading="lazy" decoding="async" />
                        <span className="pb-lay__sel" />
                      </div>
                    </div>
                    <Pin t={t} find={1} x={7} y={36} k={0} />
                    <Pin t={t} find={2} x={70} y={62} yp={70} side="l" k={1} />
                  </div>
                </div>
                <Foot t={t} n={2} />
              </div>
            </li>

            {/* C · Сайт: the test address, the one dark object; the site live in a browser, the test request arriving
                as a Telegram notification (the main page's why.step.4: the request comes to Telegram or a CRM) with the
                form's own fields (contact.field.label.*, a task chip), no one's data */}
            <li className="pb-obj pb-obj--test pb-obj--none" style={{ "--i": 2 } as CSSVars}>
              <div className="pb-obj__card">
                <p className="pb-tab">{t("work.3.k")}</p>
                <div className="pb-pic pb-win" aria-hidden="true">
                  <div className="pb-win__chrome">
                    <p className="pb-win__bar">
                      <span className="pb-win__dots" />
                      <span className="pb-win__url">
                        <svg viewBox="0 0 16 16" focusable="false"><rect x="3.5" y="7" width="9" height="6.5" rx="1.5" /><path d="M5.5 7V5.25a2.5 2.5 0 0 1 5 0V7" /></svg>
                        <span>{t("pb.url")}</span>
                      </span>
                      <svg className="pb-win__re" viewBox="0 0 16 16" focusable="false"><path d="M12.5 8A4.5 4.5 0 1 1 11 4.6M12.5 3v2.5H10" /></svg>
                    </p>
                    <div className="pb-win__view">
                      {/* eslint-disable-next-line @next/next/no-img-element -- the layout's render, now the live site */}
                      <img src={`/img/about/pb-lay-d${ru}.webp`} width={900} height={516} alt="" loading="lazy" decoding="async" />
                      <svg className="pb-win__cur" viewBox="0 0 16 22" focusable="false"><path d="M1.5 1.5v16l4.2-4 2.8 6.5 2.6-1.2-2.8-6.3h5.9z" /></svg>
                    </div>
                  </div>
                  <div className="pb-toast">
                    <p className="pb-toast__app">
                      <span className="pb-toast__ico">
                        <svg viewBox="0 0 24 24" focusable="false"><path d="m20 4.5-16 6.4 5.2 1.9M20 4.5l-3 14.8-7.8-6.5M20 4.5 9.2 12.8v5.4l2.9-3" /></svg>
                      </span>
                      <span>Telegram</span>
                    </p>
                    <p className="pb-toast__t">
                      <span>{t("pb.toast")}</span>
                      <span className="pb-toast__ok">
                        <svg viewBox="0 0 24 24" focusable="false"><path d="m6 12.5 4 4L18 8" /></svg>
                      </span>
                    </p>
                    <ul className="pb-toast__f">
                      <li>{TICK}{tm("contact.field.label.1")}</li>
                      <li>{TICK}{tm("contact.field.label.2")}</li>
                    </ul>
                    <p className="pb-toast__chip">{tm("contact.chip.span.1")}</p>
                  </div>
                </div>
                <Foot t={t} n={3} />
              </div>
            </li>

            {/* D · Реклама: the Google Ads report (the main page's ads demo words: services.ads.*, start.route.1): the
                campaign, its tabs with «Звіт» open, the requests by week as columns, the queries with their bars and
                the words it never shows on; no digits anywhere. The findings pinned on the ads' tab and the queries */}
            <li className="pb-obj pb-obj--ads" style={{ "--i": 3 } as CSSVars}>
              <div className="pb-obj__card">
                <p className="pb-tab">{t("work.4.k")}</p>
                <div className="pb-pic pb-ad" aria-hidden="true">
                  <div className="pb-rep">
                    <p className="pb-rep__top">
                      <span className="pb-rep__brand">
                        <svg viewBox="0 0 24 24" focusable="false"><path d="m9.2 4.8 7.6 13.2M14.8 4.8 7.2 18" /><circle cx="6.6" cy="17.2" r="2.6" /></svg>
                        {t("pb.ads")}
                      </span>
                      <span className="pb-rep__camp">
                        <i />
                        {tm("start.route.1")} · {trade}
                      </span>
                    </p>
                    <p className="pb-rep__tabs">
                      <span>{tm("services.ads.step.1")}</span>
                      <span>{tm("services.ads.step.2")}</span>
                      <span className="is-on">{tm("services.ads.step.3")}</span>
                    </p>
                    <p className="pb-rep__k">{tm("services.ads.cap.3")}</p>
                    <span className="pb-rep__chart">
                      {WEEKS.map((h, i) => (
                        <i key={i} style={{ "--h": h, "--c": i } as CSSVars} />
                      ))}
                    </span>
                    <span className="pb-rep__table">
                      <span className="pb-rep__row pb-rep__row--head">
                        <span>{tm("services.ads.col.query")}</span>
                        <span>{tm("services.ads.col.leads")}</span>
                      </span>
                      {QUERIES.map(({ kw, b }, i) => (
                        <span className="pb-rep__row" key={kw ?? "trade"}>
                          <span className="pb-rep__q"><i className="pb-rep__on" />{trade}{kw ? ` ${tm(kw)}` : ""}</span>
                          <span className="pb-rep__bar" style={{ "--b": b, "--q": i } as CSSVars} />
                        </span>
                      ))}
                      {EXCLUDED.map((kw) => (
                        <span className="pb-rep__row pb-rep__row--off" key={kw}>
                          <span className="pb-rep__q"><i className="pb-rep__no" />{tm(kw)}</span>
                          <span className="pb-rep__off">{tm("services.ads.excluded")}</span>
                        </span>
                      ))}
                    </span>
                  </div>
                  <Pin t={t} find={1} x={80} y={33} yp={33} side="l" k={0} />
                  <Pin t={t} find={2} x={95} y={53} yp={53} side="l" k={1} />
                </div>
                <Foot t={t} n={4} />
              </div>
            </li>

            {/* E · Ключі: everything in the client's name, a ring on a pin with the ember key and four access cards */}
            <li className="pb-obj pb-obj--keys pb-obj--none" style={{ "--i": 4 } as CSSVars}>
              <div className="pb-obj__card">
                <p className="pb-tab">{t("work.5.k")}</p>
                <div className="pb-pic pb-keys" aria-hidden="true">
                  <span className="pb-keys__hang">
                    <span className="pb-keys__pin" />
                    <span className="pb-keys__ring" />
                    <span className="pb-keys__key">
                      <svg viewBox="0 0 24 60" focusable="false">
                        <circle cx="12" cy="13" r="9" />
                        <circle cx="12" cy="13" r="3.25" />
                        <path d="M12 22v34M12 44h7M12 52h5" />
                      </svg>
                    </span>
                  </span>
                  <span className="pb-keys__tags">
                    {TAGS.map((n, k) => (
                      <span className="pb-tag" key={n} style={{ "--k": k } as CSSVars}>
                        <span className="pb-tag__sw">
                          <span className="pb-tag__in">
                            <span className="pb-tag__top">
                              <svg viewBox="0 0 24 24" focusable="false">{TAG_GLYPH[n]}</svg>
                              <span>{t(`pb.tag.${n}`)}</span>
                            </span>
                            {n === 2 && <span className="pb-tag__v">{t("pb.url")}</span>}
                            <span className="pb-tag__own">{tm("services.mh.brand")}</span>
                            <span className="pb-tag__chip" />
                          </span>
                        </span>
                      </span>
                    ))}
                  </span>
                </div>
                <Foot t={t} n={5} />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
