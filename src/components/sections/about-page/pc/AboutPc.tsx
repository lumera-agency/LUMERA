import "@/components/about/pc.css";
import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { splitWords } from "../words";
import { PcRail } from "./PcRail";
import { PcScenes } from "./PcScenes";
import { PcKeys } from "./PcKeys";
import { PcContact } from "./PcContact";
import type { CSSVars } from "./parts";

/** TEMPORARY · whole-page variant C (?p=c): the ids of its blocks for the topbar and the menu, in order (their words:
 *  about.pc.nav.<id>). The request block is #contact (PcContact). */
export const PC_NAV: readonly string[] = ["team", "work", "keys"];

/**
 * TEMPORARY · whole-page variant C of «Про нас» (?p=c), «Естафета: від ваших слів до ключів». The page reads as one
 * project's story in one frame (pc.css: .pc-frame, 12 columns): on wide screens a dark card stays on the left (the rail:
 * who works on the step being read, and the project's folder filling up), and the steps scroll on the right (the stage,
 * columns 5–12; 6–12 on tablets).
 * 1 Команда (a short first screen: who is behind it, the quiet way to the form) → 2 Як ми працюємо (five steps, one
 * document each) → 3 Ключі (the ivory block: the folder is yours) → 4 Заявка (the main page's form, addressed to the
 * role that answers requests). Motion: runtime/pc.js (the marker, the scenes, the flights), once each.
 */
export async function AboutPc() {
  const t = await getTranslations("about");
  return (
    <>
      <div className="pc-frame">
        <section className="section pc-hero" id="team" aria-labelledby="team-title">
          <header className="s-head">
            <p className="s-head__meta">
              <span className="s-head__index">1</span>
              <span>{t("team.meta")}</span>
            </p>
            <h1 className="s-head__title" id="team-title">
              <span className="tone">
                {splitWords(t.raw("team.title") as string, (w, i) => (
                  <span className="about-cut">
                    <span className="about-cut__w" style={{ "--i": i } as CSSVars}>{w}</span>
                  </span>
                ))}
              </span>
            </h1>
            <div className="s-head__intro pc-hero__intro">
              <p className="about-hero__lead">
                {splitWords(t.raw("team.lead") as string, (w, i) => <span className="about-gen" style={{ "--i": i } as CSSVars}>{w}</span>)}
              </p>
              {/* the quiet way down to the form (a link: the page's one lime button is the form's) */}
              <a className="about-down" href="#contact">
                <span>{t("team.down")}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg>
              </a>
            </div>
          </header>
        </section>

        <PcRail t={t} />

        <section className="section pc-work" id="work" aria-labelledby="work-title">
          <header className="s-head">
            <p className="s-head__meta">
              <span className="s-head__index">2</span>
              <span>{t("work.meta")}</span>
            </p>
            <h2 className="s-head__title" id="work-title" data-split="">
              <span className="tone">{t.rich("work.title", R)}</span>
            </h2>
            <p className="s-head__intro">{t("work.intro")}</p>
          </header>
          <PcScenes t={t} />
        </section>

        <PcKeys t={t} />
      </div>
      <PcContact index={4} />
    </>
  );
}
