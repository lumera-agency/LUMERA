import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { rich } from "@/lib/rich";
import { WhyClient } from "./WhyClient";
import { WhyFigure } from "./WhyFigure";
import "./why.css";
import "./why-contour.css";
import "./why-contour-fx.css";

const STEPS = [1, 2, 3, 4] as const;
const THREE = [1, 2, 3] as const; // the table's columns and rows, the sentences of the line under the contour
/** the phones' row of steps: the way 1 → 4 along the top, the return under it; then the loop the light is moved along */
const STEP_GO = "M32 16H288";
const STEP_BACK = "M288 16A12 12 0 0 1 288 40H32A12 12 0 0 1 32 16";
const STEP_LOOP = "M32 16H288A12 12 0 0 1 288 40H32A12 12 0 0 1 32 16";

/** a cell of the sample table: its words, and under them the line that stands in for them until the demo has read
 *  that row (a price: the hollow mark before it, the flag that marks it); `col` its turn in the row, `line` that
 *  line's length, % */
const cell = (text: string, col: number, line: number, price = false) => (
  <span className="wv__c" style={{ "--c": col, "--sw": `${line}%` } as React.CSSProperties}>
    <i className="wv__sk" aria-hidden="true" />
    {price ? (
      <span className="wv__v wv__price">
        <i className="wv__flag" aria-hidden="true" />
        {text}
      </span>
    ) : (
      <span className="wv__v">{text}</span>
    )}
  </span>
);

/**
 * 4 · Чому ECLO: the competitors looked at first, then the site, the ads, the requests, and what the requests show
 * comes back into the first step: four steps on one closed way (the owner's brief, 10 Nov 2026; the words are his,
 * verbatim). The steps are an ordered list and the sample a real table; the way itself is drawn beside them
 * (WhyFigure on computers, a row of the steps on phones, where the steps are cards swept sideways). The table plays
 * once as a 7-second demo of the analysis (the owner, 11 Nov 2026): its rows are gathered one by one, the prices are
 * marked (none is a number), the promises fade (all alike), the conclusion comes. Under the contour the line about the
 * market, then the two notes: the 3D and motion, the open price.
 */
export async function Why() {
  const t = await getTranslations();
  return (
    <WhyClient>
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta" data-sr="">
            <span className="s-head__index">4</span>
            <span>{t("nav.why")}</span>
          </p>
          <h2 className="s-head__title s-head__title--stone" id="why-title" data-split="">
            <span className="tone">{t.rich("why.title", rich)}</span>
          </h2>
          <p className="s-head__intro" data-sr="">{t("why.intro")}</p>
        </header>

        {/* (phones and tablets: as tall as the row's way sideways, so the body stays held while the page scrolls it,
            WhyClient .is-ride; elsewhere a plain box) */}
        <div className="wv__ride">
          <div className="wv__body">
            <WhyFigure />
            {/* phones: the way as a row of the four steps; a tap on a step brings its card */}
            <div className="wv__step">
              <svg viewBox="0 0 320 56" aria-hidden="true" focusable="false">
                <path className="wv__step-go" d={STEP_GO} />
                <path className="wv__step-back" d={STEP_BACK} />
                <path className="wv__step-arrow" d="M165 35.5l-5.5 4.5 5.5 4.5" />
                <path className="wv__step-run wv__step-run--glow" pathLength={1} d={STEP_LOOP} />
                <path className="wv__step-run" pathLength={1} d={STEP_LOOP} />
              </svg>
              {STEPS.map((n) => (
                <button type="button" className="wv__step-n" data-go={n - 1} aria-label={t(`why.step.${n}.title`)} style={{ "--k": n - 1 } as React.CSSProperties} key={n}>
                  {n}
                </button>
              ))}
            </div>
            <div className="wv__loop">
              <ol className="wv__links" role="list">
                {STEPS.map((n) => (
                  // (it takes the keyboard's focus: on computers that lights its node, on phones brings its card)
                  <li className={`wv__link wv__link--${n}`} tabIndex={0} key={n}>
                    {/* (numbers as 1, 2, 3, never 01: the owner's rule, 3 Nov 2026, said again for this block on 13 Nov:
                        no large numeral before the title, the count on the rule «1 / 4») */}
                    <div className="wv__card">
                      <i className="wv__rule" data-k={`${n} / ${STEPS.length}`} aria-hidden="true" />
                      <h3 className="wv__t">{t(`why.step.${n}.title`)}</h3>
                      <p className="wv__p">{t(`why.step.${n}.text`)}</p>
                      {n === 1 && (
                        <figure className="wv__mock">
                          <div className="wv__tbl">
                            <table className="wv__table">
                              <caption>{t("why.table.caption")}</caption>
                              <thead>
                                <tr>
                                  {THREE.map((c) => (
                                    <th scope="col" key={c}>{t(`why.table.col.${c}`)}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {THREE.map((r) => (
                                  <tr key={r}>
                                    <th scope="row">{cell(t(`why.table.row.${r}.name`), 0, 66)}</th>
                                    <td>{cell(t(`why.table.row.${r}.price`), 1, [58, 50, 72][r - 1], true)}</td>
                                    <td>{cell(t(`why.table.row.${r}.promise`), 2, [62, 90, 70][r - 1])}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {/* the demo's own parts (why-contour-fx.css): the price column's band, the line that
                                reads the table, the mark that it is being read; then the lap's own reading line */}
                            <i className="wv__col" aria-hidden="true" />
                            <i className="wv__probe" aria-hidden="true" />
                            <i className="wv__live" aria-hidden="true" />
                            <i className="wv__scan" aria-hidden="true" />
                          </div>
                          <figcaption className="wv__out">
                            <i className="wv__wash" aria-hidden="true" />
                            <span className="wv__out-t">{t("why.table.out")}</span>
                          </figcaption>
                        </figure>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
              <p className="wv__back">
                <svg className="wv__back-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4.5h-4.5" />
                </svg>
                <span>{t("why.back")}</span>
              </p>
            </div>
            {/* phones: back and on (the row is swept by the thumb as well) */}
            <div className="wv__nav">
              <i className="wv__nav-bar" aria-hidden="true" />
              <button type="button" className="wv__nav-b" data-dir="-1" aria-label={t("why.nav.prev")}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M14.5 6l-6 6 6 6" />
                </svg>
              </button>
              <button type="button" className="wv__nav-b" data-dir="1" aria-label={t("why.nav.next")}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M9.5 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* each word its own box: the line comes in out of a blur word by word, as the manifesto does (WhyClient);
            split at plain spaces only, so the typesetting's no-break spaces keep their words together */}
        <p className="wv__market">
          {THREE.map((sentence) => (
            <span className={sentence === 2 ? "wv__say wv__say--key" : "wv__say"} key={sentence}>
              {t(`why.market.${sentence}`)
                .split(" ")
                .filter(Boolean)
                .map((word, index) => (
                  <Fragment key={index}>
                    <span className="wv__word">{word}</span>{" "}
                  </Fragment>
                ))}
            </span>
          ))}
        </p>

        <ul className="w5-sum" role="list">
          <li className="w5-sum__item" data-sr="">
            <h3 className="w5-sum__head">{t("why.sum.head.2")}</h3>
            <p className="w5-sum__text">{t("why.sum.text.2")}</p>
          </li>
          <li className="w5-sum__item w5-sum__item--bridge" data-sr="">
            <h3 className="w5-sum__head">{t("why.sum.head.3")}</h3>
            <p className="w5-sum__text">{t("why.sum.text.3")}</p>
          </li>
        </ul>
      </div>
    </WhyClient>
  );
}
