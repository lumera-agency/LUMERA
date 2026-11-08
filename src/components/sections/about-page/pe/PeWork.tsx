import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/** the five stops on the ring, clockwise from the top, one per thing the client gets (about.work.<n>): each one's angle */
const STOPS = [1, 2, 3, 4, 5].map((n) => ({ n, a: -90 + (n - 1) * 72 }));
const LAST = STOPS[STOPS.length - 1];

/** the result's tick (the system's lime, small: the run ends on it) */
const TICK = (
  <svg viewBox="0 0 24 24" focusable="false"><path d="m6.5 12.5 3.75 3.75L17.5 8.5" /></svg>
);

/**
 * TEMPORARY · variant E, 2 · Як ми працюємо, the page's one light block («Орбіта» of the five things): 21st.dev's Path
 * to Resilience Orbital Timeline (stops on an orbit, the chosen stop's card at its centre), on the Interactive Values
 * Grid's hairline module with «+» at its joints. A large ring with a dial's ticks, five stops on it, one per thing the
 * client gets, each a tab with its one word (about.work.<n>.k: Розбір, Макет, Сайт, Реклама, Ключі); inside the ring
 * the chosen stop's card (its title and its line, about.work.<n>.h / .d) under «Що ви отримуєте». The hand points at
 * the chosen stop. Scene «orbit» (runtime/pe.js), once as the block comes into view: the hand runs the ring, each stop
 * lights as it passes and shows its card, and the run ends on «Ключі» → «Усе на вас» with a lime tick; then it rests,
 * and the visitor picks any stop (a click, or the arrow keys on the tabs). The CSS default is the run's end. Wide
 * screens: the ring on the left, the head on the right; tablets: the head above; phones (≤860): a smaller ring with
 * the card under it.
 */
export async function PeWork({ index }: { index: number }) {
  const t = await getTranslations("about");
  return (
    <section className="section section--ivory pe-work" id="work" aria-labelledby="work-title">
      <div className="container pe-c">
        <div className="s-head pe-work__grid">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("work.meta")}</span>
          </p>
          <h2 className="s-head__title pe-work__title" id="work-title" data-split="">
            <span className="tone">{t.rich("work.title", R)}</span>
          </h2>
          <p className="s-head__intro pe-work__intro">{t("work.intro")}</p>

          <div className="pe-dial" data-pe-dial="">
            <div className="pe-dial__stage">
              <span className="pe-grid pe-dial__grid" aria-hidden="true" />
              <span className="pe-dial__ring" aria-hidden="true" />
              <span className="pe-dial__ticks" aria-hidden="true" />
              {/* the hand: it turns about the centre to the chosen stop (its angle in --arm; the CSS default is the last stop) */}
              <span className="pe-dial__arm" aria-hidden="true" style={{ "--arm": `${LAST.a}deg` } as CSSVars}>
                <span className="pe-dial__hand" />
                <span className="pe-dial__mark" />
              </span>
              <span className="pe-dial__hub" aria-hidden="true" />
              <div className="pe-dial__tabs" role="tablist" aria-labelledby="pe-rcpt">
                {STOPS.map(({ n, a }) => (
                  <button
                    type="button"
                    role="tab"
                    className="pe-tab"
                    id={`pe-tab-${n}`}
                    key={n}
                    aria-selected={n === LAST.n}
                    aria-controls={`pe-panel-${n}`}
                    tabIndex={n === LAST.n ? 0 : -1}
                    data-pe-stop={n}
                    data-a={a}
                    style={{ "--a": `${a}deg`, "--k": n - 1 } as CSSVars}
                  >
                    <span className="pe-tab__dot" aria-hidden="true" />
                    <span className="pe-tab__k">{t(`work.${n}.k`)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* the chosen stop's card: inside the ring on wide screens, under it on phones; the five cards share one
                cell, so the card never changes its size as they swap */}
            <div className="pe-dial__card">
              <p className="pe-dial__k" id="pe-rcpt">{t("work.rcpt")}</p>
              <div className="pe-dial__panels">
                {STOPS.map(({ n }) => (
                  <div
                    role="tabpanel"
                    className="pe-panel"
                    id={`pe-panel-${n}`}
                    key={n}
                    aria-labelledby={`pe-tab-${n}`}
                    tabIndex={0}
                    data-on={n === LAST.n ? "" : undefined}
                  >
                    <h3 className="pe-panel__h">
                      {t(`work.${n}.h`)}
                      {n === LAST.n && <span className="pe-panel__ok" aria-hidden="true">{TICK}</span>}
                    </h3>
                    <p className="pe-panel__d">{t(`work.${n}.d`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
