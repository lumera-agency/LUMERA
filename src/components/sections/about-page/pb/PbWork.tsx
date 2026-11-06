import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { splitWords } from "../words";

type T = Awaited<ReturnType<typeof getTranslations<"about">>>;
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

/** a finding on the plan sheet: its words, each under its own stroke of the marker (so the sweep follows any wrap) */
function Finding({ t, find }: { t: T; find: 1 | 2 }) {
  return (
    <mark className="pb-find">
      {splitWords(t.raw(`pb.find.${find}`) as string, (w, i) => <span className="pb-mk" style={{ "--w": i } as CSSVars}>{w}</span>)}
    </mark>
  );
}

/** a row's tick on the plan (the docs.tsx plan's boxes) */
const TICK = (
  <svg className="pb-plan__box" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" />
    <path d="m4.75 8.25 2.25 2.25 4.25-4.75" />
  </svg>
);

/** the plan's rows filled in (wide screens, where the plan is the desk's tall reading sheet): pictograms only, in the
 *  ad's grey-line language, no words and no numbers. Under the two findings, the analysis's notes; under the stages,
 *  their bars one after another; under the fixed price, its total on a dotted leader */
const NOTES = (
  <span className="pb-plan__x pb-plan__x--notes" aria-hidden="true">
    <i />
    <i />
  </span>
);
const STAGES = (
  <span className="pb-plan__x pb-plan__x--stages" aria-hidden="true">
    <i />
    <i />
    <i />
  </span>
);
const SUM = (
  <span className="pb-plan__x pb-plan__x--sum" aria-hidden="true">
    <i />
    <b />
  </span>
);

/** the four tags on the key ring: the caption's own words (about.work.5.d), each hanging at its own angle (fanning
 *  out from the middle; the long one the straightest) */
const TAGS = [
  { n: 1, a: "8deg" },
  { n: 2, a: "3deg" },
  { n: 3, a: "-7deg" },
  { n: 4, a: "-2deg" },
] as const;

/** an object's title and caption (the five things: about.work.<n>.h / .d) */
function Foot({ t, n }: { t: T; n: number }) {
  return (
    <div className="pb-obj__foot">
      <h3 className="pb-obj__h">{t(`work.${n}.h`)}</h3>
      <p className="pb-obj__d">{t(`work.${n}.d`)}</p>
    </div>
  );
}

/**
 * TEMPORARY · variant B, 2 · Як ми працюємо: the studio's desk, the page's one light block. A square-module mat (dots
 * at the modules' corners, a ruler on its top edge) with the five things the client gets lying on it as real objects,
 * each with its key tab (Розбір, Макет, Сайт, Реклама, Ключі): A the plan on a clipboard (its two findings under the
 * marker, then the stages and the fixed price, the team's stamp), B the layout for a computer and a phone, C the test
 * site (the one dark object; its test request pops in, lime: the system's result), D the Google ad with its report
 * slip, E the keys on a ring with four tags (everything in the client's name, ember). The same two findings land as
 * pins on the layout and on the ad («Выводы на булавках»): about.work.intro and 4.d say it, the site and the ads are
 * built on the same findings. Played once as the desk comes into view (runtime/pb.js, scene «desk»; phones: one object
 * at a time). Mouse only: an object lifts; a finding (or one of its pins) lights its pins and fades what lacks it.
 */
export async function PbWork({ index }: { index: number }) {
  const t = await getTranslations("about");
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
            {/* A · Розбір: the plan of works on a clipboard (a reading sheet: no tilt) */}
            <li className="pb-obj pb-obj--plan" style={{ "--i": 0, "--tilt": "0deg" } as CSSVars}>
              <div className="pb-obj__card">
                <p className="pb-tab">{t("work.1.k")}</p>
                <span className="pb-clip" aria-hidden="true" />
                <div className="pb-sheet">
                  <h3 className="pb-obj__h">{t("work.1.h")}</h3>
                  <ul className="pb-plan">
                    <li className="pb-plan__row" data-find="1">{TICK}<Finding t={t} find={1} />{NOTES}</li>
                    <li className="pb-plan__row" data-find="2">{TICK}<Finding t={t} find={2} />{NOTES}</li>
                    <li className="pb-plan__row">{TICK}<span>{t("pb.plan.3")}</span>{STAGES}</li>
                    <li className="pb-plan__row">{TICK}<span>{t("pb.plan.4")}</span>{SUM}</li>
                  </ul>
                  <span className="pb-lines" aria-hidden="true" />
                  <p className="pb-stamp"><span>{t("work.sign")}</span></p>
                </div>
              </div>
            </li>

            {/* B · Макет: the layout for a computer, the phone's over its right edge; the two findings pinned on it */}
            <li className="pb-obj pb-obj--layout" style={{ "--i": 1, "--tilt": "-0.4deg" } as CSSVars}>
              <div className="pb-obj__card">
                <p className="pb-tab">{t("work.2.k")}</p>
                <div className="pb-pic pb-lay" aria-hidden="true">
                  <div className="pb-lay__tilt">
                    <svg className="pb-lay__pc" viewBox="0 0 300 150" focusable="false">
                      <rect x="4" y="6" width="214" height="128" rx="6" className="pb-fill" />
                      <path d="M4 20h214" />
                      <circle cx="13" cy="13" r="1.75" />
                      <circle cx="20" cy="13" r="1.75" />
                      <circle cx="27" cy="13" r="1.75" />
                      <rect x="18" y="36" width="92" height="9" rx="2" className="pb-ink" />
                      <path d="M18 58h84M18 67h68" />
                      <rect x="18" y="82" width="44" height="14" rx="7" />
                      <rect x="122" y="34" width="44" height="62" rx="3" />
                      <path d="m126 90 12-14 8 8 6-6 10 12" />
                      <circle cx="152" cy="48" r="4" />
                    </svg>
                    <svg className="pb-lay__ph" viewBox="0 0 300 150" focusable="false">
                      <rect x="178" y="28" width="66" height="116" rx="10" className="pb-fill" />
                      <path d="M202 37h18" />
                      <rect x="189" y="52" width="40" height="7" rx="2" className="pb-ink" />
                      <path d="M189 70h44M189 78h34M189 86h40" />
                      <rect x="189" y="102" width="30" height="12" rx="6" />
                    </svg>
                    <Pin t={t} find={1} x={9} y={27} k={0} />
                    <Pin t={t} find={2} x={70} y={52} yp={66} side="l" k={1} />
                  </div>
                  <p className="pb-lay__k">
                    <span>{t("pb.pc")}</span>
                    <span>{t("pb.phone")}</span>
                  </p>
                </div>
                <Foot t={t} n={2} />
              </div>
            </li>

            {/* C · Сайт: the test address, the one dark object; the test request arrives (lime: the system's result) */}
            <li className="pb-obj pb-obj--test pb-obj--none" style={{ "--i": 2, "--tilt": "0.8deg" } as CSSVars}>
              <div className="pb-obj__card">
                <p className="pb-tab">{t("work.3.k")}</p>
                <div className="pb-pic pb-win" aria-hidden="true">
                  <p className="pb-win__bar">
                    <span className="pb-win__dots" />
                    <span className="pb-win__url">{t("pb.url")}</span>
                  </p>
                  {/* the site's first screen and its request form; the cursor on «send» */}
                  <svg className="pb-win__page" viewBox="0 0 200 92" preserveAspectRatio="xMinYMin meet" focusable="false">
                    <rect x="2" y="2" width="96" height="8" rx="2" className="pb-win__h" />
                    <path d="M2 21h80M2 30h62" />
                    <rect x="2" y="44" width="92" height="11" rx="3" />
                    <rect x="2" y="60" width="92" height="11" rx="3" />
                    <rect x="2" y="77" width="44" height="12" rx="6" />
                    <path d="m34 80 0 20 5.5-5.5 3.5 8 3.5-1.75-3.5-8h7.5z" className="pb-win__cur" />
                  </svg>
                  <p className="pb-toast">
                    <span className="pb-toast__ok">
                      <svg viewBox="0 0 24 24" focusable="false"><path d="m6 12.5 4 4L18 8" /></svg>
                    </span>
                    <span>{t("pb.toast")}</span>
                  </p>
                </div>
                <Foot t={t} n={3} />
              </div>
            </li>

            {/* D · Реклама: an ad in the search (the findings pinned on its query and its text), the report slip under it */}
            <li className="pb-obj pb-obj--ads" style={{ "--i": 3, "--tilt": "-0.6deg" } as CSSVars}>
              <div className="pb-obj__card">
                <p className="pb-tab">{t("work.4.k")}</p>
                <div className="pb-pic pb-ad" aria-hidden="true">
                  <div className="pb-ad__card">
                    <p className="pb-ad__q">
                      <svg viewBox="0 0 24 24" focusable="false"><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5" /></svg>
                      <span />
                    </p>
                    <p className="pb-ad__k">{t("pb.ads")}</p>
                    <span className="pb-ad__l pb-ad__l--h" />
                    <span className="pb-ad__l" />
                    <span className="pb-ad__l pb-ad__l--s" />
                  </div>
                  <div className="pb-slip">
                    <p className="pb-slip__k">{t("pb.report")}</p>
                    <span className="pb-slip__bar" style={{ "--b": 0.92 } as CSSVars} />
                    <span className="pb-slip__bar" style={{ "--b": 0.58 } as CSSVars} />
                    <span className="pb-slip__bar" style={{ "--b": 0.34 } as CSSVars} />
                  </div>
                  <Pin t={t} find={2} x={37} y={15} k={0} />
                  <Pin t={t} find={1} x={8} y={66} k={1} />
                </div>
                <Foot t={t} n={4} />
              </div>
            </li>

            {/* E · Ключі: everything in the client's name, a ring on a pin with the ember key and four tags */}
            <li className="pb-obj pb-obj--keys pb-obj--none" style={{ "--i": 4, "--tilt": "0.5deg" } as CSSVars}>
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
                    {TAGS.map(({ n, a }, k) => (
                      <span className="pb-tag" key={n} style={{ "--a": a, "--k": k } as CSSVars}>
                        <span className="pb-tag__sw">
                          <span className="pb-tag__in">{t(`pb.tag.${n}`)}</span>
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
