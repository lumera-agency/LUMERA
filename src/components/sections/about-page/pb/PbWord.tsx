import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { GLYPH, Mark, PHOTOS, ROLES } from "./crew";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/** the quote cut into its plain runs and its key phrases (`<hl>…</hl>`), each key phrase into its words (so each word
 *  carries its own stroke of the marker and the sweep follows any wrap); `k` counts the phrases, `w` the words in one.
 *  The stop that follows a key phrase (its comma, colon, full stop) stays on its last word's line, outside the stroke */
function Quote({ raw }: { raw: string }) {
  const parts = raw.split(/(<hl>[\s\S]*?<\/hl>)/);
  let k = 0;
  return parts.map((part, p) => {
    const hl = /^<hl>([\s\S]*)<\/hl>$/.exec(part);
    if (!hl) {
      // the stop already taken by the key phrase before it
      const rest = p > 0 && /^<hl>/.test(parts[p - 1]) ? part.replace(/^[.,:;!?…»)]+/, "") : part;
      return rest && <span className="pb-q__rest" key={p}>{rest}</span>;
    }
    const phrase = k++;
    const stop = /^[.,:;!?…»)]+/.exec(parts[p + 1] ?? "")?.[0];
    const words = hl[1].split(" ").filter(Boolean);
    return (
      <mark className="pb-q__key" key={p} style={{ "--k": phrase } as CSSVars}>
        {words.map((w, i) => {
          const end = i === words.length - 1;
          const word = <span className={`pb-q__w${end ? " is-end" : ""}`} style={{ "--w": i } as CSSVars}>{w}</span>;
          return (
            <Fragment key={i}>
              {i > 0 && " "}
              {stop && end ? (
                <span className="pb-q__nb">
                  {word}
                  <span className="pb-q__rest">{stop}</span>
                </span>
              ) : (
                word
              )}
            </Fragment>
          );
        })}
      </mark>
    );
  });
}

/**
 * Variant B, 3 · Слово команди: the team's word, one quote on the mat (B's dots and ruler, dark ground) at display size
 * on wide screens and h3 on phones, held in a thin ember selection frame with a square handle at each corner (21st.dev,
 * Ali Imam's «dot-pattern» quote: its mixed weights, the frame and its handles on a dot ground). The key phrases in
 * full ink, the rest in a lighter one; once, as the quote comes into view, an ember marker stroke runs behind each key
 * phrase from its left, one phrase after another (21st.dev, Daniel Petho's «Text Highlighter»; runtime/pb.js, scene
 * «word»; the CSS default is the drawn stroke). Under the frame, the signature: the mark and «Команда ECLO», and the
 * three roles, each on a round avatar that reads crew.tsx's PHOTOS (as the first screen's passes do; empty: the
 * role's glyph on the ember duotone).
 *
 * The quote (about.pb.word.quote) is the main page's own lines, put together for this block at the owner's request:
 * the manifesto («Сайт працює, коли клієнти пишуть першими»: manifesto.glitch / .and / .mark), the chain's four links
 * as the whole way (why.link.1–4: Пошук → Сайт → Заявка → Звідки заявка) and the services' title («Сайт, реклама й
 * заявки в одному проєкті»: services.title).
 */
export async function PbWord({ index }: { index: number }) {
  const t = await getTranslations("about");
  return (
    <section className="section pb-word" id="word" aria-labelledby="word-title">
      <div className="container pb-c">
        {/* the block's label, shown; its name for screen readers is the heading under it (the quote is the visual head) */}
        <div className="s-head pb-head pb-head--word">
          <p className="s-head__meta" aria-hidden="true">
            <span className="s-head__index">{index}</span>
            <span>{t("pb.word.meta")}</span>
          </p>
          <h2 className="visually-hidden" id="word-title">{t("pb.word.meta")}</h2>
        </div>

        <div className="pb-mat pb-mat--word" data-pb-word="">
          <span className="pb-ruler" aria-hidden="true" />
          <figure className="pb-say">
            <div className="pb-say__sel">
              <span className="pb-say__hd" aria-hidden="true" />
              <blockquote className="pb-q">
                <p>
                  <Quote raw={t.raw("pb.word.quote") as string} />
                </p>
              </blockquote>
            </div>
            <figcaption className="pb-say__by">
              <p className="pb-say__team">
                <Mark className="pb-say__mark" />
                <span>{t("work.sign")}</span>
              </p>
              <ul className="pb-say__roles">
                {ROLES.map((n, i) => {
                  const photo = PHOTOS[n];
                  return (
                    <li key={n} style={{ "--i": i } as CSSVars}>
                      <span className={`pb-ava${photo ? " has-photo" : ""}`} aria-hidden="true">
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element -- a fixed round frame; the role is said beside it
                          <img src={photo} width={96} height={96} alt="" loading="lazy" decoding="async" />
                        ) : (
                          <svg viewBox="0 0 48 48" focusable="false">{GLYPH[n]}</svg>
                        )}
                      </span>
                      <span>{t(`team.${n}.role`)}</span>
                    </li>
                  );
                })}
              </ul>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
