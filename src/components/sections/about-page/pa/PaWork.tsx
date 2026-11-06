import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { DOCS, DocPic } from "../docs";
import { splitWords } from "../words";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/**
 * The five things as one run-on line: each item's words are inline-block spans (so they can rise, and a line breaks
 * only between words), each dash glued to the word before it (a no-break space: no line starts with a dash). The
 * twin is the same line over it, its words in ember, each item shown by opacity alone (the reading pass, the hover).
 */
function IndexLine({ names, twin = false }: { names: string[]; twin?: boolean }) {
  return names.map((name, k) => {
    const words = name.split(" ");
    const more = k < names.length - 1;
    return (
      <Fragment key={k}>
        {k > 0 && " "}
        <span className="pa-it" data-i={k + 1} style={{ "--i": k } as CSSVars}>
          {words.map((w, j) => (
            <Fragment key={j}>
              {j > 0 && " "}
              <span className="pa-w">
                {w}
                {more && j === words.length - 1 && (
                  <>
                    {!twin && <span className="visually-hidden">,</span>}
                    {"\u00a0"}
                    <span className="pa-dash" aria-hidden="true">—</span>
                  </>
                )}
              </span>
            </Fragment>
          ))}
        </span>
      </Fragment>
    );
  });
}

/**
 * A · 2 · Як ми працюємо, the page's one light block (ivory): the team's way (first your field and competitors, then
 * the site and the ads on the same findings), then what the client keeps, set as a contents line of display type,
 * «План робіт — Макет і тексти — Тестова адреса — Реклама в Google — Усе на вас», with the five things one per column
 * under it (each its picture, name and text; no numbers). «Оглавление-строка» (runtime pa.js, once): the line's words
 * rise, an ember pass reads it item by item and lands each column (its hairline drawn down, its words up), and stops on
 * «Усе на вас», which stays ember. With a mouse, pointing at a thing keeps it and dims the rest. Phones: the line plays
 * alone, the five things are rows that come in one at a time.
 */
export async function PaWork({ index }: { index: number }) {
  const t = await getTranslations("about");
  const names = DOCS.map(({ n }) => t.raw(`work.${n}.h`) as string);
  return (
    <section className="section section--ivory pa-work" id="work" aria-labelledby="work-title" data-pa-work="">
      <div className="container pa-sheet pa-sheet--work">
        <span className="pa-edge" aria-hidden="true" />
        <p className="s-head__meta pa-meta">
          <span className="s-head__index">{index}</span>
          <span>{t("work.meta")}</span>
        </p>
        <h2 className="s-head__title pa-title" id="work-title" data-split="">
          <span className="tone">{t.rich("work.title", R)}</span>
        </h2>
        <p className="pa-gloss" data-gen="">
          {splitWords(t.raw("work.intro") as string, (w, i) => <span className="pa-gen" style={{ "--i": i } as CSSVars}>{w}</span>)}
        </p>
        <p className="pa-k pa-work__k" id="work-rcpt">{t("work.rcpt")}</p>
        <div className="pa-index" data-pa-index="">
          <p className="pa-index__line">
            <IndexLine names={names} />
          </p>
          <p className="pa-index__line pa-index__twin" aria-hidden="true">
            <IndexLine names={names} twin />
          </p>
        </div>
        <ol className="pa-notes" aria-labelledby="work-rcpt">
          {DOCS.map(({ n, pic }, k) => (
            <li className={`pa-note pa-note--${pic}`} data-i={n} data-in="" key={n} style={{ "--i": k } as CSSVars}>
              <span className="pa-note__line" aria-hidden="true" />
              <div className="pa-note__body">
                <DocPic pic={pic} />
                <h3 className="pa-note__h">{t(`work.${n}.h`)}</h3>
                <p className="pa-note__d">{t(`work.${n}.d`)}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="pa-work__foot">
          <p className="pa-note-s">{t("pa.work.note")}</p>
          <p className="pa-k pa-sign">{t("work.sign")}</p>
        </div>
      </div>
    </section>
  );
}
