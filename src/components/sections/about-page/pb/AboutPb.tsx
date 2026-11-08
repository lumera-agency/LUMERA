import "@/components/about/pb.css";
import { PbTeam } from "./PbTeam";
import { PbWork } from "./PbWork";
import { PbWord } from "./PbWord";
import { PbContact } from "./PbContact";

/** The ids of the page's blocks for the topbar, the menu and the footer, in order (their words: about.pb.nav.<id>). The
 *  request block is #contact (PbContact). */
export const PB_NAV = ["team", "work", "word"] as const;

/**
 * «Про нас», «Робочий стіл» (whole-page variant B, the owner's pick of 7 Nov; hence «pb»): the page as the studio's work surface, a mat of
 * square modules (dots at their corners, a ruler on its edges) with the studio's real objects on it, every one that
 * carries text lying straight. 1 the team's role passes on a rail → 2 the desk with the five things the client gets
 * (the page's one light block) → 3 the team's word, one quote in a selection frame with its key phrases under the
 * marker, signed by the three roles → 4 the request form beside a slip and a business card.
 * Styles: about/pb.css (every rule under main.about[data-ai-page="about"]); scenes: about/runtime/pb.js.
 */
export async function AboutPb() {
  return (
    <>
      <PbTeam />
      <PbWork index={2} />
      <PbWord index={3} />
      <PbContact index={4} />
    </>
  );
}
