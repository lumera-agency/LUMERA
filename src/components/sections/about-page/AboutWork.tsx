import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/** each document's picture, in the page's thin line (viewBox 160 × 96): the plan, the layout on a computer and a phone,
 *  the test address in a browser, an ad in the search with its report, the keys */
const PICS = {
  plan: (
    <>
      <rect x="44" y="6" width="72" height="84" rx="5" />
      <path d="M56 18h30" />
      <rect x="56" y="31" width="8" height="8" rx="1.5" />
      <rect x="56" y="49" width="8" height="8" rx="1.5" />
      <rect x="56" y="67" width="8" height="8" rx="1.5" />
      <path d="m57.75 35 1.75 1.75 3-3.5M57.75 53l1.75 1.75 3-3.5" />
      <path d="M72 35h32M72 53h24M72 71h28" />
    </>
  ),
  layout: (
    <>
      <rect x="10" y="8" width="108" height="70" rx="5" />
      <path d="M10 19h108M20 32h52M20 41h38M20 54h24" />
      <rect x="112" y="30" width="38" height="62" rx="6" className="about-doc__fill" />
      <path d="M120 44h22M120 51h16M120 62h12" />
    </>
  ),
  test: (
    <>
      <rect x="12" y="8" width="136" height="80" rx="5" />
      <rect x="24" y="17" width="112" height="12" rx="6" />
      <circle cx="31" cy="23" r="2" />
      <path d="M38 23h40M28 44h60M28 53h44M28 66h28" />
      <path d="m104 52 0 22 6-6 4 9 4-2-4-9h8z" className="about-doc__fill" />
    </>
  ),
  ads: (
    <>
      <rect x="10" y="6" width="140" height="16" rx="8" />
      <circle cx="21" cy="14" r="3.5" />
      <path d="m23.5 16.5 2.5 2.5" />
      <rect x="10" y="33" width="20" height="9" rx="2" />
      <path d="M36 37.5h60M10 52h76M10 61h56" />
      <path d="M112 90V72M124 90V62M136 90V66M148 90V50M106 90h46" />
    </>
  ),
  keys: (
    <>
      <circle cx="52" cy="48" r="17" />
      <circle cx="52" cy="48" r="6" />
      <path d="M69 48h60M117 48v12M129 48v9" />
    </>
  ),
} as const;

const DOCS = [
  { n: 1, pic: "plan" },
  { n: 2, pic: "layout" },
  { n: 3, pic: "test" },
  { n: 4, pic: "ads" },
  { n: 5, pic: "keys" },
] as const;

/**
 * 2 · Як ми працюємо (the owner, 4 Nov: the team's word, «конкретно що клієнт отримує»; his pick, «Папка проєкту»):
 * the page's one light block. The team's way in one line (first your field and your competitors, then the site and the
 * ads on the same findings), then five documents, the things the client keeps: the plan, the layout and texts, the test
 * address, the ads with their report, and the keys (everything in the client's name, ember: the person). All of it is
 * the site's own copy (main: contact, approach; sites; ads). The documents stand in a dark folder: its tab names it,
 * its front carries the team's signature.
 * Wide screens: as the folder reaches the screen, the documents rise out of it one after another, once (runtime: scene
 * «folder»). Phones and tablets: one under another, each coming in as it reaches the screen (Animated List).
 */
export async function AboutWork({ index }: { index: number }) {
  const t = await getTranslations("about");
  return (
    <section className="section section--ivory about-work" id="work" aria-labelledby="work-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("work.meta")}</span>
          </p>
          <h2 className="s-head__title" id="work-title" data-split="">
            <span className="tone">{t.rich("work.title", R)}</span>
          </h2>
          <p className="s-head__intro">{t("work.intro")}</p>
        </header>

        <div className="about-folder" data-folder="">
          <p className="about-folder__tab">{t("work.folder")}</p>
          <ol className="about-docs">
            {DOCS.map(({ n, pic }) => (
              <li className={`about-doc about-doc--${pic}`} data-in="" key={n} style={{ "--i": n - 1 } as CSSVars}>
                <div className="card about-doc__sheet">
                  <p className="about-doc__k">
                    <span aria-hidden="true">{String(n).padStart(2, "0")}</span>
                    <span>{t(`work.${n}.k`)}</span>
                  </p>
                  <svg className="about-doc__pic" viewBox="0 0 160 96" aria-hidden="true" focusable="false">
                    {PICS[pic]}
                  </svg>
                  <h3 className="about-doc__h">{t(`work.${n}.h`)}</h3>
                  <p className="about-doc__d">{t(`work.${n}.d`)}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="about-folder__lip">{t("work.sign")}</p>
        </div>
      </div>
    </section>
  );
}
