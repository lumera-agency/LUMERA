import type { getTranslations } from "next-intl/server";
import { studioName } from "@/config/site";
import { DOCS, DocBody, DocPic, num } from "./docs";

/*
 * TEMPORARY (the owner, 6 Nov: «собери 3 варианта, я хочу посмотреть»): three more ways to show block 2's five documents,
 * from motionsites.ai's sections, rebuilt on the page's tokens (transform and opacity only, once). Behind ?v=1|2|3 on
 * /pro-nas (?v=0 or none: the folder). Once the owner picks, the chosen one moves into AboutWork and this file goes.
 */

type T = Awaited<ReturnType<typeof getTranslations<"about">>>;
type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/** a tick, where a receipt would print a sum */
const TICK = <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 12.5 4 4L18 8" /></svg>;

/**
 * 1 · «Чек» (motionsites' «Outfit Receipt»): one paper slip, «Що ви отримуєте», printed out of a dark terminal. The five
 * things as its lines, a tick where a sum would be (the page has no numbers), the team's signature and a strip of bars
 * at its foot. Wide screens: the slip comes up out of the terminal's slot in a printer's short pushes, once (runtime:
 * [data-play]). Phones: the slip stands, its lines come in one after another.
 */
export function WorkReceipt({ t }: { t: T }) {
  return (
    <div className="about-rcpt" data-play="">
      <div className="about-rcpt__slot">
        <div className="about-rcpt__paper">
          <p className="about-rcpt__from">{studioName}</p>
          <p className="about-rcpt__title">{t("work.rcpt")}</p>
          <ol className="about-rcpt__list">
            {DOCS.map(({ n, pic }) => (
              <li className={`about-rcpt__row about-rcpt__row--${pic}`} data-in="" key={n}>
                <span className="about-rcpt__n" aria-hidden="true">{num(n)}</span>
                <div>
                  <h3 className="about-rcpt__h">{t(`work.${n}.h`)}</h3>
                  <p className="about-rcpt__d">{t(`work.${n}.d`)}</p>
                </div>
                <span className="about-rcpt__ok">{TICK}</span>
              </li>
            ))}
          </ol>
          <p className="about-rcpt__sign">{t("work.sign")}</p>
          <span className="about-rcpt__bars" aria-hidden="true" />
        </div>
      </div>
      <div className="about-rcpt__term" aria-hidden="true">
        <span>{studioName}</span>
        <span className="about-rcpt__led" />
      </div>
    </div>
  );
}

/**
 * 2 · «3D-стопка» (motionsites' «Animated Cards»): the five documents without the folder. Wide screens: they arrive as a
 * pile leaning back in the middle, hold, and lay themselves out in a row, one after another, once (runtime:
 * [data-play]); under the pointer the row leans back and the one under it stands up and comes forward. Phones: one under
 * another, each standing up from lying flat as it reaches the screen.
 */
export function WorkPile({ t }: { t: T }) {
  return (
    <div className="about-pile" data-play="">
      <ol className="about-docs">
        {DOCS.map(({ n, pic }) => (
          <li className={`about-doc about-doc--${pic}`} data-in="" key={n} style={{ "--i": n - 1 } as CSSVars}>
            <div className="card about-doc__sheet">
              <DocBody t={t} n={n} pic={pic} />
            </div>
          </li>
        ))}
      </ol>
      <p className="about-work__sign">{t("work.sign")}</p>
    </div>
  );
}

/**
 * 3 · «Стопка при прокрутці» (motionsites' «Projects Catalog»; the main page's phone «Підхід» works the same way): wide
 * documents, each with its large number, held under the header as the page scrolls; the next one comes up over it and
 * leaves a strip of the one before, so the numbers stack up 01 … 05. Plain position: sticky, nothing plays.
 */
export function WorkSticky({ t }: { t: T }) {
  return (
    <div className="about-sticky">
      <ol className="about-docs">
        {DOCS.map(({ n, pic }) => (
          <li className={`about-doc about-doc--${pic}`} key={n} style={{ "--i": n - 1 } as CSSVars}>
            <div className="card about-doc__sheet">
              <span className="about-sticky__n" aria-hidden="true">{num(n)}</span>
              <p className="about-doc__k">{t(`work.${n}.k`)}</p>
              <DocPic pic={pic} />
              <h3 className="about-doc__h">{t(`work.${n}.h`)}</h3>
              <p className="about-doc__d">{t(`work.${n}.d`)}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="about-work__sign">{t("work.sign")}</p>
    </div>
  );
}
