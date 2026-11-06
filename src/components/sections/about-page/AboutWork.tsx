import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { DOCS, DocBody } from "./docs";
import { WorkPile, WorkReceipt, WorkSticky } from "./AboutWorkVariants";

/** TEMPORARY: block 2's ways to show the documents while the owner chooses (0 the folder; 1–3: AboutWorkVariants) */
export type WorkVariant = "0" | "1" | "2" | "3";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

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
export async function AboutWork({ index, variant = "0" }: { index: number; variant?: WorkVariant }) {
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

        {variant === "1" ? (
          <WorkReceipt t={t} />
        ) : variant === "2" ? (
          <WorkPile t={t} />
        ) : variant === "3" ? (
          <WorkSticky t={t} />
        ) : (
          <div className="about-folder" data-folder="">
            <p className="about-folder__tab">{t("work.folder")}</p>
            <ol className="about-docs">
              {DOCS.map(({ n, pic }) => (
                <li className={`about-doc about-doc--${pic}`} data-in="" key={n} style={{ "--i": n - 1 } as CSSVars}>
                  <div className="card about-doc__sheet">
                    <DocBody t={t} n={n} pic={pic} />
                  </div>
                </li>
              ))}
            </ol>
            <p className="about-folder__lip">{t("work.sign")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
