import "@/components/about/pa.css";
import { PaTeam } from "./PaTeam";
import { PaWork } from "./PaWork";
import { PaDirect } from "./PaDirect";
import { PaContact } from "./PaContact";

/** TEMPORARY · whole-page variant A (?p=a): the ids of its blocks for the topbar and the menu, in order (their words:
 *  about.pa.nav.<id>). The request block is #contact (PaContact). */
export const PA_NAV: readonly string[] = ["team", "work", "direct"];

/**
 * TEMPORARY · whole-page variant A of «Про нас» (?p=a), «Разворот»: the page set as a magazine spread. One «sheet» grid
 * on every block (a margin rail for the notes, then five columns; phones: a hanging grid), the lines drawn only where
 * the content stands on them. The picture is the type: 1 the team as credits under a stair title, the lead's last word
 * rolling like a slot drum («Барабан»); 2 the five things the client gets as one run-on line, read once by an ember
 * pass that lands each thing in its column («Оглавление-строка»); 3 the broken telephone as an editor's correction,
 * struck and written over, then the same sentence arriving whole («Правка редактора»); 4 the main page's form.
 */
export async function AboutPa() {
  return (
    <>
      <PaTeam />
      <PaWork index={2} />
      <PaDirect index={3} />
      <PaContact index={4} />
    </>
  );
}
