import "@/components/about/pb.css";
import { PbTeam } from "./PbTeam";
import { PbWork } from "./PbWork";
import { PbDirect } from "./PbDirect";
import { PbContact } from "./PbContact";

/** TEMPORARY · whole-page variant B (?p=b): the ids of its blocks for the topbar and the menu, in order (their words:
 *  about.pb.nav.<id>). The request block is #contact (PbContact). */
export const PB_NAV: readonly string[] = ["team", "work", "direct"];

/**
 * TEMPORARY · whole-page variant B of «Про нас» (?p=b), «Робочий стіл»: the page as the studio's work surface, a mat of
 * square modules (dots at their corners, a ruler on its edges) with the studio's real objects on it. 1 the team's role
 * passes on a rail → 2 the desk with the five things the client gets (the page's one light block) → 3 two notes with
 * the client's sentence, struck through and retold, or kept → 4 the request form beside a slip and a business card.
 * Styles: about/pb.css (every rule under main.about[data-about-p="b"]); scenes: about/runtime/pb.js.
 */
export async function AboutPb() {
  return (
    <>
      <PbTeam />
      <PbWork index={2} />
      <PbDirect index={3} />
      <PbContact index={4} />
    </>
  );
}
