import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { splitWords } from "../words";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/** the client's sentence cut at its quoted word (both languages quote the button's name «…»): before, the word with
 *  its quotes, after; a sentence without quotes stays whole */
function cutQuoted(msg: string): [string, string, string] {
  const m = /^(.*?)(«[^»]*»)(.*)$/.exec(msg);
  return m ? [m[1], m[2], m[3]] : [msg, "", ""];
}

/** the hand-drawn ring around the kept word (an open loop that overshoots its start, as a pen does) */
const RING = (
  <svg className="pb-ring__o" viewBox="0 0 120 48" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path d="M70 5.5C99 4 117 11 116 24c-1 14-27 20-58 19.5C27 43 4 36 4.5 23 5 11 27 4.5 55 4.5c14 0 27 1.5 36 4.5" />
  </svg>
);

/**
 * TEMPORARY · variant B, 3 · Напряму («Правка без пересказа»): two notes carry the client's sentence at h3 size, on the
 * mat (its dots, a ruler on top). «Зазвичай»: the route you → a manager → the one who does it; the manager's pen strikes
 * the sentence through word by word and writes his own line above it, the doer is left with a «?». «В ECLO»: you → the
 * one who does it, the sentence arrives as it was, an ember ring lands on the button's name, then a tick. The ECLO note
 * (ivory paper) lies half a module over the usual one (grey paper). «Приклад» under them: the sentence is an
 * illustration. Played once as the notes come into view (runtime/pb.js, scene «notes»; phones: one note at a time).
 */
export async function PbDirect({ index }: { index: number }) {
  const t = await getTranslations("about");
  const msg = t("direct.msg");
  const [before, word, after] = cutQuoted(msg);
  return (
    <section className="section pb-direct" id="direct" aria-labelledby="direct-title">
      <div className="container pb-c">
        <header className="s-head pb-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("direct.meta")}</span>
          </p>
          <h2 className="s-head__title" id="direct-title" data-split="">
            <span className="tone">{t.rich("direct.title", R)}</span>
          </h2>
          <p className="s-head__intro">{t("direct.intro")}</p>
        </header>

        <div className="pb-mat pb-mat--notes" data-pb-notes="">
          <span className="pb-ruler" aria-hidden="true" />
          <div className="pb-notes">
            <figure className="pb-note pb-note--usual" style={{ "--i": 0, "--tilt": "-1deg" } as CSSVars}>
              <figcaption className="pb-note__k">{t("direct.usual")}</figcaption>
              <div className="pb-note__route">
                <ol className="pb-route">
                  <li style={{ "--t": "300ms" } as CSSVars}>{t("direct.you")}</li>
                  <li style={{ "--t": "450ms" } as CSSVars}>{t("direct.manager")}</li>
                  <li style={{ "--t": "1300ms" } as CSSVars}>{t("direct.doer")}</li>
                </ol>
                <span className="pb-note__q" aria-hidden="true">?</span>
              </div>
              <div className="pb-note__body">
                <ins className="pb-note__now">{t("direct.lost")}</ins>
                <p className="pb-note__msg">
                  <del className="pb-strike">
                    {splitWords(msg, (w, i) => <span className="pb-sw" style={{ "--w": i } as CSSVars}>{w}</span>)}
                  </del>
                </p>
              </div>
            </figure>

            <figure className="pb-note pb-note--us" style={{ "--i": 1, "--tilt": "0.8deg" } as CSSVars}>
              <figcaption className="pb-note__k">{t("direct.us")}</figcaption>
              <div className="pb-note__route">
                <ol className="pb-route">
                  <li style={{ "--t": "300ms" } as CSSVars}>{t("direct.you")}</li>
                  <li style={{ "--t": "900ms" } as CSSVars}>{t("direct.maker")}</li>
                </ol>
                <span className="pb-note__ok" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false"><path d="m6 12.5 4 4L18 8" /></svg>
                </span>
                <span className="pb-beam" aria-hidden="true"><span /></span>
              </div>
              <div className="pb-note__body">
                <p className="pb-note__msg">
                  {before}
                  {word && (
                    <span className="pb-ring">
                      {word}
                      {RING}
                    </span>
                  )}
                  {after}
                </p>
              </div>
            </figure>
          </div>
          <p className="pb-notes__cap">{t("direct.sample")}</p>
        </div>
      </div>
    </section>
  );
}
