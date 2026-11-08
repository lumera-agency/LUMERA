import "@/components/about/pd.css";
import { PdTeam } from "./PdTeam";
import { PdWork } from "./PdWork";
import { PdDirect } from "./PdDirect";
import { PdContact } from "./PdContact";

/** The ids of the variant's blocks for the topbar, the menu and the footer, in order (their words: about.pd.nav.<id>,
 *  the page's own words for its blocks, as about.pb.nav has them). The request block is #contact (PdContact). Every
 *  other line of the variant is an existing key: about.team / work / direct / lead / pb.next2, and the main page's
 *  approach, why, contact and footer.map.contacts. */
export const PD_NAV = ["team", "work", "direct"] as const;

/**
 * TEMPORARY · whole-page variant D (?p=d), «Конвеєр»: the project as a build pipeline, on a 12-column technical grid
 * drawn in hairlines (21st.dev's Build Pipeline by @ibrandify, motionsites' NexaCore Process and Technical
 * Specifications, 21st.dev's Comparison Section by @mohammadshehadeh; rebuilt on CSS, SVG and vanilla JS).
 * 1 the team as a run summary: three cells, the three roles → 2 the pipeline of the five things the client gets:
 * isometric cubes on one line, each passing in turn, a log panel under it (the page's one light block) → 3 two runs
 * side by side, the usual one through a manager (its log a diff) and ECLO's straight to the one who does it → 4 the
 * request form beside «Що буде далі» as a queued pipeline and the contacts card.
 * Styles: about/pd.css (every rule under main.about[data-about-p="d"]); scenes: about/runtime/pd.js.
 */
export async function AboutPd() {
  return (
    <>
      <PdTeam />
      <PdWork index={2} />
      <PdDirect index={3} />
      <PdContact index={4} />
    </>
  );
}
