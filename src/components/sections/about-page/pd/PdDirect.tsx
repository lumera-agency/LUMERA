import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { splitWords } from "../words";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/** the usual run's mark (21st.dev's Comparison Section: the old way's dash) and the ECLO run's tick */
const DASH = (
  <span className="pd-cmp__mk" aria-hidden="true">
    <svg viewBox="0 0 24 24" focusable="false"><path d="M7 12h10" /></svg>
  </span>
);
const TICK = (
  <span className="pd-cmp__mk" aria-hidden="true">
    <svg viewBox="0 0 24 24" focusable="false"><path d="m6.5 12.5 3.5 3.5 7.5-8" /></svg>
  </span>
);

/** a run's stops on its three columns (col: 1–3); the line between the first and the last, an arrow head before each
 *  stop after the first; a stop is a person: a lamp */
function Stops({ stops, arrows }: { stops: { text: string; col: number }[]; arrows: number[] }) {
  return (
    <div className="pd-stops">
      <span className="pd-stops__line" aria-hidden="true">
        {arrows.map((c) => <i key={c} style={{ "--c": c } as CSSVars} />)}
        <span className="pd-stops__pulse"><span /></span>
      </span>
      <ol className="pd-stops__list">
        {stops.map(({ text, col }, k) => (
          <li className="pd-stop" key={text} style={{ "--col": col, "--k": k } as CSSVars}>
            <span className="pd-stop__lamp" aria-hidden="true" />
            <span className="pd-stop__t">{text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * TEMPORARY · variant D, 3 · Напряму («Два запуски»): the same request run two ways, side by side, as 21st.dev's
 * Comparison Section by @mohammadshehadeh lays them out («The same afternoon, spent two ways»: the old way muted with
 * dashes, the new way ticked), each panel a small pipeline with its log. «Зазвичай»: you → a manager → the one who
 * does it, on a dashed line; its log a diff: the client's sentence struck out (−), the manager's line arriving instead
 * (+). «В ECLO»: you → the one who does it, straight across the column where the manager stood; the sentence arrives as
 * it was, a lime tick. «Приклад» under them. Scene «runs» (runtime/pd.js, once in view): the pulse runs the usual line,
 * the sentence is struck word by word at the manager, the other line arrives; then ECLO's run. Phones (≤600): a
 * two-button switch (aria-pressed) shows one run at a time; the scene plays «Зазвичай», then switches to «В ECLO» once.
 */
export async function PdDirect({ index }: { index: number }) {
  const t = await getTranslations("about");
  const msg = t("direct.msg");
  return (
    <section className="section pd-direct" id="direct" aria-labelledby="direct-title">
      <span className="pd-grid" aria-hidden="true" />
      <div className="container pd-c">
        <header className="s-head pd-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("direct.meta")}</span>
          </p>
          <h2 className="s-head__title" id="direct-title" data-split="">
            <span className="tone">{t.rich("direct.title", R)}</span>
          </h2>
          <p className="s-head__intro">{t("direct.intro")}</p>
        </header>

        <div className="pd-cmp" data-pd-cmp="" data-show="us">
          {/* phones: one run at a time */}
          <div className="pd-switch" role="group" aria-labelledby="direct-title">
            <button type="button" className="pd-switch__b" aria-pressed="false" aria-controls="pd-run-usual" data-run="usual">{t("direct.usual")}</button>
            <button type="button" className="pd-switch__b" aria-pressed="true" aria-controls="pd-run-us" data-run="us">{t("direct.us")}</button>
          </div>
          <div className="pd-cmp__runs">
            <figure className="pd-cmp__run pd-cmp__run--usual pd-frame" id="pd-run-usual">
              <figcaption className="pd-cmp__k">{DASH}<span>{t("direct.usual")}</span></figcaption>
              <Stops
                stops={[
                  { text: t("direct.you"), col: 1 },
                  { text: t("direct.manager"), col: 2 },
                  { text: t("direct.doer"), col: 3 },
                ]}
                arrows={[2, 3]}
              />
              <div className="pd-diff">
                <p className="pd-diff__l pd-diff__l--del">
                  <span className="pd-diff__g" aria-hidden="true">−</span>
                  <del>{splitWords(msg, (w, i) => <span className="pd-sw" style={{ "--w": i } as CSSVars}>{w}</span>)}</del>
                </p>
                <p className="pd-diff__l pd-diff__l--ins">
                  <span className="pd-diff__g" aria-hidden="true">+</span>
                  <ins>{t("direct.lost")}</ins>
                </p>
              </div>
            </figure>

            <figure className="pd-cmp__run pd-cmp__run--us pd-frame" id="pd-run-us">
              <figcaption className="pd-cmp__k">{TICK}<span>{t("direct.us")}</span></figcaption>
              <Stops
                stops={[
                  { text: t("direct.you"), col: 1 },
                  { text: t("direct.maker"), col: 3 },
                ]}
                arrows={[3]}
              />
              <div className="pd-diff">
                <p className="pd-diff__l pd-diff__l--ok">
                  <span className="pd-diff__g pd-diff__ok" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false"><path d="m6.5 12.5 3.5 3.5 7.5-8" /></svg>
                  </span>
                  <span>{msg}</span>
                </p>
              </div>
            </figure>
          </div>
          <p className="pd-cmp__cap">{t("direct.sample")}</p>
        </div>
      </div>
    </section>
  );
}
