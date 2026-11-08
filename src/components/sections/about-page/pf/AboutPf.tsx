import "@/components/about/pf.css";
import { PfTeam } from "./PfTeam";
import { PfWork } from "./PfWork";
import { PfDirect } from "./PfDirect";
import { PfContact } from "./PfContact";

/** The ids of the variant's blocks for the topbar, the menu and the footer, in order (their words: about.pf.nav.<id>,
 *  the same words as B's about.pb.nav: the blocks' own labels, about.team.meta / work.meta / direct.meta, shortened as
 *  B has them). The request block is #contact. Every other line on the page is an existing key (named in each block's
 *  comment): F adds no copy of its own. */
export const PF_NAV = ["team", "work", "direct"] as const;

/**
 * TEMPORARY · whole-page variant F (?p=f), «Розмова»: the page as the project's chat. 1 the chat's window and its member
 * list, one row per role → 2 the thread (the page's one light block): the five things the client gets arrive as
 * attachments, each signed by the role that sends it → 3 one chat moment, the client's sentence quoted unchanged by the
 * one who does it, beside the usual way (forwarded through a manager, retold) → 4 the request form as the chat's
 * composer, «Що буде далі» as system messages, the contacts. The grid: a chat app's, a head column (sticky on wide
 * screens) beside a thread column of about 40 rem; the team on the left, «Ви» on the right; hairlines, mono labels for
 * the roles and the system's notices. Ideas from motionsites (Interior Features, Social Hangouts) and 21st.dev
 * (Animated List, Order tracking, the AI chat category), rebuilt on CSS and a little vanilla JS.
 * Styles: about/pf.css (every rule under main.about[data-about-p="f"]); scenes: about/runtime/pf.js.
 */
export async function AboutPf() {
  return (
    <>
      <PfTeam />
      <PfWork index={2} />
      <PfDirect index={3} />
      <PfContact index={4} />
    </>
  );
}
