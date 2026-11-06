import { aiRich as R } from "@/components/ai/rich";
import { PICS } from "../docs";
import { Chip, type CSSVars, type T } from "./parts";

/** the five documents with their pictures (docs.tsx), each viewBox cropped to its drawing */
const CELLS = [
  { n: 1, pic: "plan", box: "40 2 80 92" },
  { n: 2, pic: "layout", box: "6 4 148 92" },
  { n: 3, pic: "test", box: "8 4 144 88" },
  { n: 4, pic: "ads", box: "6 2 150 92" },
  { n: 5, pic: "keys", box: "32 28 100 40" },
] as const;

/** the no-break space inside the key phrase, so «на вас» never parts at a line's end */
const glue = (chunks: React.ReactNode) => (Array.isArray(chunks) ? chunks : [chunks]).map((c) => (typeof c === "string" ? c.replace(/ /g, " ") : c));

/**
 * 3 · Ключі, the page's one ivory block and the story's end: the site, the domain, the hosting and the ad accounts are in
 * your name. The display sentence (about.work.5.d's first half, «на вас» in ember-deep with the marker's sweep behind it),
 * the open folder with its five documents on your side now (the rail's slots go empty as they fly here, pc.js), the
 * free fixes (its second half), and the team's signature. No stamp, no after-launch line (the main page's approach has
 * it). The ground is the block's own ::before, full bleed; the dark rail stays over it on wide screens.
 */
export function PcKeys({ t }: { t: T }) {
  return (
    <section className="section section--ivory pc-keys" id="keys" aria-labelledby="keys-title">
      <header className="s-head">
        <p className="s-head__meta">
          <span className="s-head__index">3</span>
          <span>{t("work.5.k")}</span>
        </p>
        <h2 className="s-head__title" id="keys-title" data-split="">
          <span className="tone">{t.rich("pc.keys.title", { ...R, hl: (chunks) => <em className="hl">{glue(chunks)}</em> })}</span>
        </h2>
      </header>
      <div className="pc-folder">
        <p className="pc-folder__tab">{t("work.folder")}</p>
        <ol className="pc-cells">
          {CELLS.map(({ n, pic, box }) => (
            <li className={n === 5 ? "pc-cell pc-cell--keys" : "pc-cell"} data-cell={n} style={{ "--i": n - 1 } as CSSVars} key={n}>
              <Chip t={t} n={n} dark />
              <svg className="pc-cell__pic" viewBox={box} aria-hidden="true" focusable="false">
                {PICS[pic]}
              </svg>
            </li>
          ))}
        </ol>
      </div>
      <div className="pc-keys__end">
        <p className="pc-keys__fix">{t("pc.keys.fix")}</p>
        <p className="pc-sign">
          <span className="pc-sign__mark" aria-hidden="true">
            <span className="pc-sign__line" />
            <span className="pc-sign__dot" />
          </span>
          <span className="pc-sign__t">{t("work.sign")}</span>
        </p>
      </div>
    </section>
  );
}
