import { aiRich as R } from "@/components/ai/rich";
import { PICS } from "../docs";
import { Key, PERSON, TICK, Win, type CSSVars, type T } from "./parts";

const ROWS = [1, 2, 3, 4] as const;
/** S5's report: its columns' heights, a share of the strip (a drawing, no figures) */
const COLS = [0.56, 0.42, 0.7, 0.5, 0.64, 0.46, 0.68, 0.54] as const;

/** the phones' picture for a scene without a window (S2, S5): docs.tsx's thin-line drawing */
function Pic({ pic }: { pic: keyof typeof PICS }) {
  return (
    <svg className="pc-pic" viewBox="0 0 160 96" aria-hidden="true" focusable="false" data-pc-view="">
      {PICS[pic]}
    </svg>
  );
}

/** a scene's words: its h3 and one line */
function Cap({ id, h, d }: { id: string; h: React.ReactNode; d: string }) {
  return (
    <div className="pc-cap">
      <h3 className="pc-cap__h" id={id}>{h}</h3>
      <p className="pc-cap__d">{d}</p>
    </div>
  );
}

/**
 * S1 · Напряму (no index: it makes no document): «Зазвичай» the request goes through a manager and comes out changed,
 * and that lane is struck out once; «В ECLO» the same words go straight to the one who does the work and arrive as they
 * were. Built on AboutDirect's nodes, bubbles and run lines; plays once (pc.js, .is-pre → .is-play).
 */
function SceneDirect({ t }: { t: T }) {
  return (
    <article className="pc-scene pc-scene--direct" data-pc-scene="1" data-role="3" aria-labelledby="pc-s1-h">
      <Key t={t} k={t("direct.meta")} role="3" />
      {/* the h3 without its ember mark: the block title's «потім сайт» is the key word half a screen up */}
      <Cap id="pc-s1-h" h={t.rich("direct.title", { ...R, hl: (chunks) => <>{chunks}</> })} d={t("direct.intro")} />
      <Win t={t} className="pc-win--direct">
        <div className="pc-d">
          <p className="pc-d__tag pc-d__tag--usual">{t("direct.usual")}</p>
          {/* the usual detour: an arch over the straight line, the manager on it, the retold words struck once */}
          <div className="pc-d__ghost">
            <span className="pc-d__arch" aria-hidden="true" />
            <span className="pc-d__stub" aria-hidden="true" />
            <div className="pc-d__mgr">
              <span className="pc-d__node pc-d__node--mgr" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">{PERSON}</svg>
              </span>
              <span className="pc-d__said">
                <span className="pc-d__who pc-d__who--mgr">
                  {t("direct.manager")}
                  <span className="pc-d__strike" aria-hidden="true" />
                </span>
                <s className="pc-d__msg pc-d__msg--lost">
                  {t("direct.lost")}
                  <span className="pc-d__strike" aria-hidden="true" />
                </s>
              </span>
            </div>
          </div>
          {/* the straight way, ours: a hairline, the ember run drawing over it */}
          <span className="pc-d__line" aria-hidden="true">
            <span className="pc-d__run" />
          </span>
          <p className="pc-d__tag pc-d__tag--us">{t("direct.us")}</p>
          <span className="pc-d__node pc-d__node--you" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">{PERSON}</svg>
          </span>
          <span className="pc-d__node pc-d__node--maker" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">{PERSON}</svg>
            <span className="pc-d__ok">
              <svg viewBox="0 0 24 24" focusable="false">{TICK}</svg>
            </span>
          </span>
          <p className="pc-d__who pc-d__who--you">{t("direct.you")}</p>
          <p className="pc-d__who pc-d__who--maker">{t("direct.maker")}</p>
          <p className="pc-d__msg pc-d__msg--you">{t("direct.msg")}</p>
          {/* the same words, arrived (they ride along the line from «Ви») */}
          <p className="pc-d__msg pc-d__msg--rider">{t("direct.msg")}</p>
        </div>
      </Win>
    </article>
  );
}

/** S2 · 01 Розбір: what the clients search and the competitors, boxed by the annotations; then the plan's four rows */
function ScenePlan({ t }: { t: T }) {
  return (
    <article className="pc-scene pc-scene--plan" data-pc-scene="2" data-role="2" data-slot="1" aria-labelledby="pc-s2-h">
      <Key t={t} n={1} k={t("work.1.k")} role="2" />
      <Cap id="pc-s2-h" h={t("work.1.h")} d={t("work.1.d")} />
      <Win t={t} n={1} className="pc-win--plan">
        <div className="pc-s2">
          <div className="pc-s2__look">
            <div className="pc-ann" style={{ "--k": 0 } as CSSVars}>
              <p className="pc-ann__k">{t("pc.s2.search")}</p>
              <div className="pc-ann__box" aria-hidden="true">
                <span className="pc-s2__search">
                  <svg viewBox="0 0 24 24" focusable="false"><circle cx="11" cy="11" r="6" /><path d="m20 20-4.5-4.5" /></svg>
                  <i />
                </span>
                <span className="pc-s2__res"><i /><i /><i /></span>
              </div>
            </div>
            <div className="pc-ann" style={{ "--k": 1 } as CSSVars}>
              <p className="pc-ann__k">{t("pc.s2.rivals")}</p>
              <div className="pc-ann__box pc-s2__rivals" aria-hidden="true">
                <span className="pc-thumb"><i /><i /><i /></span>
                <span className="pc-thumb"><i /><i /><i /></span>
              </div>
            </div>
          </div>
          <ul className="pc-s2__plan">
            {ROWS.map((n) => (
              <li style={{ "--i": n - 1 } as CSSVars} key={n}>
                <svg className="pc-s2__tick" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
                  {TICK}
                </svg>
                <span>{t(`pc.s2.row.${n}`)}</span>
                <i aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>
      </Win>
      <Pic pic="plan" />
    </article>
  );
}

/** a layout's wireframe (S3, S4): a top strip, the heading, two lines of text, the button (its slot, then the client's
 *  word as an ember button) */
function Frame({ kind, btn, ann }: { kind: "desk" | "phone"; btn: string; ann?: React.ReactNode }) {
  return (
    <span className={`pc-wf pc-wf--${kind}`}>
      <i className="pc-wf__nav" aria-hidden="true" />
      {ann}
      <i className="pc-wf__h" aria-hidden="true" />
      <i className="pc-wf__t" aria-hidden="true" />
      <i className="pc-wf__t pc-wf__t--s" aria-hidden="true" />
      <span className="pc-wf__slot" aria-hidden="true">
        <span className="pc-btn">
          <span className="pc-btn__f" />
          <span className="pc-btn__w">{btn}</span>
        </span>
      </span>
    </span>
  );
}

/** S3 · 02 Макет: your sentence on a note; its word becomes the button on the computer's and the phone's layouts */
function SceneLayout({ t }: { t: T }) {
  const msg = t("direct.msg");
  const btn = t("pc.s3.btn");
  const at = msg.indexOf(btn);
  return (
    <article className="pc-scene pc-scene--layout" data-pc-scene="3" data-role="3" data-slot="2" aria-labelledby="pc-s3-h">
      <Key t={t} n={2} k={t("work.2.k")} role="3" />
      <Cap id="pc-s3-h" h={t("work.2.h")} d={t("work.2.d")} />
      <Win t={t} n={2} className="pc-win--layout">
        <div className="pc-s3">
          <div className="pc-s3__note">
            <p className="pc-s3__k">{t("pc.s3.words")}</p>
            <p className="pc-s3__msg">
              {at < 0 ? (
                msg
              ) : (
                <>
                  {msg.slice(0, at)}
                  <span className="pc-s3__word">{btn}</span>
                  {msg.slice(at + btn.length)}
                </>
              )}
            </p>
          </div>
          <div className="pc-s3__frames">
            <div className="pc-s3__at pc-s3__at--desk">
              <Frame
                kind="desk"
                btn={btn}
                ann={
                  <span className="pc-s3__ann">
                    <span className="pc-s3__ann-k">{t("pc.s3.note")}</span>
                    <span className="pc-s3__ann-line" aria-hidden="true" />
                  </span>
                }
              />
              <p className="pc-s3__lbl">{t("pc.s3.desk")}</p>
            </div>
            <div className="pc-s3__at pc-s3__at--phone">
              <Frame kind="phone" btn={btn} />
              <p className="pc-s3__lbl">{t("pc.s3.phone")}</p>
            </div>
          </div>
        </div>
      </Win>
    </article>
  );
}

/** S4 · 03 Сайт: the layout on the test address turns into the working site; you click through, the test request comes */
function SceneSite({ t }: { t: T }) {
  const page = (ink: boolean) => (
    <span className={ink ? "pc-s4__pg pc-s4__pg--ink" : "pc-s4__pg"} aria-hidden="true">
      <i className="pc-s4__h" />
      <i className="pc-s4__h pc-s4__h--s" />
      <i className="pc-s4__t" />
      <i className="pc-s4__t pc-s4__t--s" />
      <span className="pc-s4__btn">
        {ink ? <span className="pc-s4__btn-w">{t("pc.s3.btn")}</span> : null}
        {ink ? (
          <span className="pc-s4__cur">
            <svg viewBox="0 0 24 24" focusable="false"><path d="M5.5 3.5 19 10.2l-5.9 1.9-1.9 5.9z" /></svg>
            <b>{t("direct.you")}</b>
          </span>
        ) : null}
      </span>
      <i className="pc-s4__img" />
    </span>
  );
  return (
    <article className="pc-scene pc-scene--site" data-pc-scene="4" data-role="you" data-slot="3" aria-labelledby="pc-s4-h">
      <Key t={t} n={3} k={t("work.3.k")} role="you" />
      <Cap id="pc-s4-h" h={t("work.3.h")} d={t("work.3.d")} />
      <Win t={t} n={3} className="pc-win--site">
        <div className="pc-s4">
          <p className="pc-s4__url">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="6" y="11" width="12" height="9" rx="2" /><path d="M9 11V8a3 3 0 0 1 6 0v3" /></svg>
            <span>{t("pc.s4.url")}</span>
          </p>
          <div className="pc-s4__view">
            {page(false)}
            {/* the reveal: the wrapper moves in as the page inside it counter-moves, so the site stands still */}
            <span className="pc-s4__wipe">
              <span className="pc-s4__in">{page(true)}</span>
              <span className="pc-s4__scan" aria-hidden="true" />
            </span>
            <p className="pc-s4__toast">
              <i aria-hidden="true" />
              <span>{t("pc.s4.toast")}</span>
            </p>
          </div>
        </div>
      </Win>
    </article>
  );
}

/** S5 · 04 Реклама: the plan's first row, tied to the ad; under it the report, which ad brings the requests */
function SceneAds({ t }: { t: T }) {
  return (
    <article className="pc-scene pc-scene--ads" data-pc-scene="5" data-role="2" data-slot="4" aria-labelledby="pc-s5-h">
      <Key t={t} n={4} k={t("work.4.k")} role="2" />
      <Cap id="pc-s5-h" h={t("work.4.h")} d={t("work.4.d")} />
      <Win t={t} n={4} className="pc-win--ads">
        <div className="pc-s5">
          <div className="pc-s5__top">
            <p className="pc-s5__plan">{t("pc.s2.row.1")}</p>
            <span className="pc-s5__tie" aria-hidden="true" />
            <div className="pc-s5__ad">
              <p className="pc-s5__ad-k">{t("pc.s5.ad")}</p>
              <span className="pc-s5__ad-b" aria-hidden="true"><i /><i /><i /></span>
            </div>
            <p className="pc-s5__ann">{t("pc.s5.same")}</p>
          </div>
          <div className="pc-s5__rep">
            <p className="pc-s5__rk">
              <span className="pc-s5__rk-k">{t("pc.s5.report")}</span>
              <span>{t("pc.s5.reportH")}</span>
            </p>
            <p className="pc-s5__row">
              <i className="pc-s5__dot" aria-hidden="true" />
              <span className="pc-s5__src">
                {t("pc.s5.src")} <span aria-hidden="true">→</span> {t("pc.s5.req")}
              </span>
              <span className="pc-s5__bar" aria-hidden="true"><i /></span>
            </p>
            {/* the requests over time, as columns with no figures (an illustration: «Приклад») */}
            <span className="pc-s5__cols" aria-hidden="true">
              {COLS.map((h, i) => (
                <i style={{ "--h": h, "--i": i } as CSSVars} key={i} />
              ))}
            </span>
          </div>
        </div>
      </Win>
      <Pic pic="ads" />
    </article>
  );
}

/**
 * Block 2's five steps, one document each (no pin, no paging: the page scrolls as usual). Each is an article with its
 * key line (the role at work), its words and its window; each plays once as its window comes into view (pc.js) and
 * hands its document's chip to the rail's folder. Phones: one under another; S2 and S5 show their picture instead of a
 * window.
 */
export function PcScenes({ t }: { t: T }) {
  return (
    <>
      <SceneDirect t={t} />
      <ScenePlan t={t} />
      <SceneLayout t={t} />
      <SceneSite t={t} />
      <SceneAds t={t} />
    </>
  );
}
