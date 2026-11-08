import "@/components/about/pe.css";
import { PeTeam } from "./PeTeam";
import { PeWork } from "./PeWork";
import { PeContact } from "./PeContact";

/** The ids of the variant's blocks for the topbar, the menu and the footer, in order (their words: about.pe.nav.<id>:
 *  «Команда», «Як працюємо», the words of about.pb.nav). The request block is #contact (PeContact). */
export const PE_NAV = ["team", "work"] as const;

/**
 * TEMPORARY · whole-page variant E (?p=e), «Орбіта»: you are at the centre. The page is set on concentric and radial
 * diagrams, each on a square module with hairline axes and «+» joints (21st.dev's Interactive Values Grid): 1 the team
 * (the first screen, which also carries «Напряму»): «Ви» at the centre of a ring, the three roles on it, a straight
 * spoke from you to each (motionsites' Radial Diagram and Atlas Lab Features), and a switch that puts the usual
 * manager in between → 2 the five things the client gets as five stops on an orbit, the chosen one's card inside it
 * (21st.dev's Path to Resilience Orbital Timeline; the page's one light block) → 3 the request form beside «Що буде
 * далі» on a short arc and the contacts card, the rings echoed faintly behind. Three blocks: the FAQ, the prices and
 * the cases are the main page's and the service pages'.
 * Styles: about/pe.css (every rule under main.about[data-about-p="e"]); scenes: about/runtime/pe.js.
 * Copy: about.team, about.work, about.direct, about.pb.next2, the main page's contact; about.pe holds only the nav.
 */
export async function AboutPe() {
  return (
    <>
      <PeTeam />
      <PeWork index={2} />
      <PeContact index={3} />
    </>
  );
}
