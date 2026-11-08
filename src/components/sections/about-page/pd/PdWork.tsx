import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { PdCube } from "./PdCube";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/** a log line: a check of the main page's stage (its name `b`, its line `s`), or one plain line; `you`: the client's
 *  own part (an ember lamp in place of the tick: the person) */
type Line = { b?: string; s: string; you?: boolean };

const STAGES = [1, 2, 3, 4, 5] as const;

/** a passed stage's tick (lime: the system's result) */
const TICK = (
  <span className="pd-ok" aria-hidden="true">
    <svg viewBox="0 0 24 24" focusable="false"><path d="m6.5 12.5 3.5 3.5 7.5-8" /></svg>
  </span>
);

/** a stage's log lines */
function Lines({ lines }: { lines: Line[] }) {
  return (
    <ul className="pd-lines">
      {lines.map((l, k) => (
        <li className={`pd-ln${l.you ? " pd-ln--you" : ""}`} key={l.s} style={{ "--k": k } as CSSVars}>
          {l.you ? <span className="pd-lamp pd-lamp--s" aria-hidden="true" /> : TICK}
          <span className="pd-ln__t">
            {l.b ? <b>{l.b}</b> : null}
            {l.b ? <span className="visually-hidden">: </span> : null}
            <span>{l.s}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * TEMPORARY · variant D, 2 · Як ми працюємо, the page's one light block («Конвеєр»): the five things the client gets
 * (about.work.1–5) as the stages of 21st.dev's Build Pipeline, isometric cubes on one line joined by a hairline with
 * arrow heads, each stage's word (Розбір … Ключі) and its thing under its cube; over them the run's bar (about.work.rcpt
 * and five segments, one per stage), under them the log panel (the pipeline's log box; motionsites' Technical
 * Specifications: tabs over one panel). The cubes are the tabs (role="tablist", the arrow keys, Home and End); the
 * panel shows the chosen stage's thing, its line and its log: the main page's own lines for that stage, ticked.
 * Scene «pipeline» (runtime/pd.js, once as the block comes into view): a pulse runs along the line, each cube passes in
 * turn (lifts, its tick pops, its top turns pale lime), the panel follows the stage passing and the run rests on the
 * last one («Усе на вас»); then the visitor picks. Phones (≤600): the pipeline stands up, the cubes in a column joined
 * by a vertical line, each stage's thing, line and log beside its cube, no tabs; each stage passes as it reaches the
 * screen, one at a time.
 */
export async function PdWork({ index }: { index: number }) {
  const t = await getTranslations("about");
  const m = await getTranslations();
  // a log line ends without its full stop (the main page's lines have it or not)
  const bare = (s: string) => s.replace(/\.$/, "");
  const check = (c: number, i: number): Line => ({ b: m(`approach.stage.checks.${c}.b.${i}`), s: bare(m(`approach.stage.checks.${c}.span.${i}`)) });
  /** each stage's log, from the main page's copy: Розбір = approach «Задача»'s four checks; Макет = «Структура» and
   *  «Дизайн»'s checks that the thing's own line does not already say, and «Ви погоджуєте» (approach.stage.you.2);
   *  Сайт = «Розробка»'s checks, and «Ви все перевіряєте» (approach.stage.you.4); Реклама = why.sys.1, why.sys.4 and
   *  contact.get.4; Ключі = contact.get.1–3 («Що ви отримуєте») */
  const LOG: Record<(typeof STAGES)[number], Line[]> = {
    1: [1, 2, 3, 4].map((i) => check(1, i)),
    2: [check(2, 1), check(3, 1), check(2, 3), { s: m("approach.stage.you.2.m"), you: true }],
    3: [check(4, 2), check(4, 3), { s: m("approach.stage.you.4.m"), you: true }],
    4: [{ s: bare(m("why.sys.1")) }, { s: bare(m("why.sys.4")) }, { s: bare(m("contact.get.4")) }],
    5: [1, 2, 3].map((i) => ({ s: bare(m(`contact.get.${i}`)) })),
  };
  return (
    <section className="section section--ivory pd-work" id="work" aria-labelledby="work-title">
      <span className="pd-grid" aria-hidden="true" />
      <div className="container pd-c">
        <header className="s-head pd-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("work.meta")}</span>
          </p>
          <h2 className="s-head__title" id="work-title" data-split="">
            <span className="tone">{t.rich("work.title", R)}</span>
          </h2>
          <p className="s-head__intro">{t("work.intro")}</p>
        </header>

        <div className="pd-pipe pd-frame" data-pd-run="">
          {/* the run's bar: what it is, and a segment per stage that fills as the stage passes */}
          <p className="pd-pipe__bar">
            <span id="pd-pipe-k">{t("work.rcpt")}</span>
            <span className="pd-segs" aria-hidden="true">
              {STAGES.map((n, i) => <i key={n} style={{ "--i": i } as CSSVars} />)}
            </span>
          </p>

          {/* from 601: the line of cubes (the tabs) and the log panel under it */}
          <div className="pd-run">
            <div className="pd-run__row">
              <div className="pd-line" aria-hidden="true">
                <span className="pd-line__arrows">
                  {[1, 2, 3, 4].map((k) => <i key={k} style={{ "--k": k } as CSSVars} />)}
                </span>
                <span className="pd-pulse"><span /></span>
              </div>
              <div className="pd-stages" role="tablist" aria-labelledby="pd-pipe-k">
                {STAGES.map((n, i) => (
                  <button
                    type="button"
                    role="tab"
                    className="pd-stage"
                    id={`pd-tab-${n}`}
                    aria-controls={`pd-log-${n}`}
                    aria-selected={n === 5}
                    tabIndex={n === 5 ? 0 : -1}
                    key={n}
                    style={{ "--i": i } as CSSVars}
                  >
                    <span className="pd-stage__lift">
                      <span className="pd-stage__floor" aria-hidden="true" />
                      <PdCube icon={n} />
                    </span>
                    <span className="pd-stage__k">{TICK}<span>{t(`work.${n}.k`)}</span></span>
                    <span className="pd-stage__h">{t(`work.${n}.h`)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="pd-log">
              <span className="pd-log__caret" aria-hidden="true" />
              {STAGES.map((n) => (
                <div
                  className="pd-log__panel"
                  role="tabpanel"
                  id={`pd-log-${n}`}
                  aria-labelledby={`pd-tab-${n}`}
                  tabIndex={0}
                  data-on={n === 5 ? "" : undefined}
                  key={n}
                >
                  <div className="pd-log__head">
                    <p className="pd-log__k">{TICK}<span>{t(`work.${n}.k`)}</span></p>
                    <h3 className="pd-log__h">{t(`work.${n}.h`)}</h3>
                    <p className="pd-log__d">{t(`work.${n}.d`)}</p>
                  </div>
                  <Lines lines={LOG[n]} />
                </div>
              ))}
            </div>
          </div>

          {/* phones: the pipeline stands up, each stage's log beside its cube */}
          <ol className="pd-col" aria-labelledby="pd-pipe-k">
            {STAGES.map((n) => (
              <li className="pd-col__item" key={n}>
                <span className="pd-col__cube">
                  <span className="pd-stage__floor" aria-hidden="true" />
                  <PdCube icon={n} />
                </span>
                <div className="pd-col__body">
                  <p className="pd-log__k">{TICK}<span>{t(`work.${n}.k`)}</span></p>
                  <h3 className="pd-col__h">{t(`work.${n}.h`)}</h3>
                  <p className="pd-col__d">{t(`work.${n}.d`)}</p>
                  <Lines lines={LOG[n]} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
