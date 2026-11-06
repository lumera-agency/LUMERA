import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { splitWords } from "../words";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/** a word of the client's sentence, carrying its own line (the strike, or the ember underline), drawn in its turn */
const word = (w: string, k: number) => <span className="pa-sw" style={{ "--k": k } as CSSVars}>{w}</span>;

/**
 * A · 3 · Напряму: the broken telephone told with type, as an editor's correction («Правка редактора»). The client's
 * sentence is set large twice. «Зазвичай» (you → a manager → the one who does it): a strike runs through it, a
 * proofreader's caret marks the spot and the manager's retelling is written in above it, grey. «В ECLO» (you → the one
 * who does it): the same sentence arrives whole, underlined in ember, with a tick. The rail spells out who passes the
 * words on; «Приклад» captions the whole figure. In the markup the client's words come first (<del>), then the
 * retelling (<ins>), so a screen reader hears the original first; the grid shows the retelling above.
 * Runtime pa.js plays it once as it comes into view: one scene on wide screens, row by row on phones.
 */
export async function PaDirect({ index }: { index: number }) {
  const t = await getTranslations("about");
  const msg = t.raw("direct.msg") as string;
  return (
    <section className="section pa-direct" id="direct" aria-labelledby="direct-title">
      <div className="container pa-sheet pa-sheet--direct">
        <span className="pa-edge" aria-hidden="true" />
        <p className="s-head__meta pa-meta">
          <span className="s-head__index">{index}</span>
          <span>{t("direct.meta")}</span>
        </p>
        <h2 className="s-head__title pa-title" id="direct-title" data-split="">
          <span className="tone">{t.rich("direct.title", R)}</span>
        </h2>
        <p className="pa-gloss">{t("direct.intro")}</p>

        <figure className="pa-edit" data-pa-edit="">
          <figcaption className="pa-k pa-edit__cap">{t("direct.sample")}</figcaption>
          <div className="pa-row pa-row--usual" data-pa-row="">
            <div className="pa-row__side">
              <p className="pa-k pa-row__k">{t("direct.usual")}</p>
              <ol className="pa-chain">
                <li style={{ "--t": "0ms" } as CSSVars}>{t("direct.you")}</li>
                <li style={{ "--t": "250ms" } as CSSVars}>
                  <span aria-hidden="true">→ </span>
                  {t("direct.manager")}
                </li>
                <li style={{ "--t": "1500ms" } as CSSVars}>
                  <span aria-hidden="true">→ </span>
                  {t("direct.doer")}
                  <span className="pa-q" aria-hidden="true">?</span>
                </li>
              </ol>
            </div>
            <div className="pa-row__main">
              <p className="pa-sent">
                <del className="pa-del">{splitWords(msg, word)}</del>
                <ins className="pa-ins">
                  <svg className="pa-caret" viewBox="0 0 16 12" aria-hidden="true" focusable="false"><path d="M1.5 11 8 1.5l6.5 9.5" /></svg>
                  <span className="pa-ins__t">{t("direct.lost")}</span>
                </ins>
                <span className="pa-mark pa-mark--x" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false"><path d="m8 8 8 8M16 8l-8 8" /></svg>
                </span>
              </p>
            </div>
          </div>
          <div className="pa-row pa-row--us" data-pa-row="">
            <div className="pa-row__side">
              <p className="pa-k pa-row__k">{t("direct.us")}</p>
              <ol className="pa-chain">
                <li style={{ "--t": "0ms" } as CSSVars}>{t("direct.you")}</li>
                <li className="pa-chain__maker" style={{ "--t": "250ms" } as CSSVars}>
                  <span aria-hidden="true">→ </span>
                  {t("direct.maker")}
                </li>
              </ol>
            </div>
            <div className="pa-row__main">
              <p className="pa-sent pa-sent--ok">
                <span className="pa-ok">{splitWords(msg, word)}</span>
                <span className="pa-mark pa-mark--ok" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false"><path d="m6.5 12.5 3.75 3.75L17.5 8.5" /></svg>
                </span>
              </p>
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
}
