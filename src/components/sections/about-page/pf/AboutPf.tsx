import "@/components/about/pf.css";
import { PfTeam } from "./PfTeam";
import { PfWork } from "./PfWork";
import { PfDirect } from "./PfDirect";
import { PfContact } from "./PfContact";

/** The ids of the variant's blocks for the topbar, the menu and the footer, in order (their words: about.pf.nav.<id>,
 *  the same words as B's about.pb.nav: the blocks' own labels, about.team.meta / work.meta / direct.meta, shortened as
 *  B has them). The request block is #contact. Every line on the page is an existing key (named in each block's
 *  comment) but a few short labels under about.pf, each a word of a line the site already has:
 *  · photo «Фото» (the photo frames' empty state; approach.stage.checks.3.span.3 «…шрифти й фото…»);
 *  · brand «Ваш бренд» (services.mh.brand, the site's mock-up client), service «ваша послуга» (services.site.token);
 *  · tg «Telegram» (why.sys.3 «Заявка одразу приходить у Telegram або CRM»);
 *  · camp «Кампанії» (ads.case.ac.shots.cmp), leads «Заявки» (services.tags.li.7), cpl «Ціна заявки»
 *    (services.ads.col.cpl): the report's heads;
 *  · on «Оформлені на вас» (about.work.5.d «…оформлені на вас»). */
export const PF_NAV = ["team", "work", "direct"] as const;

/**
 * TEMPORARY · whole-page variant F (?p=f), «Розмова»: the page as the project's chat. 1 the chat's window and its
 * members' profile cards, one per role, a photo frame each (the photos come later: PfTeam's PHOTOS), over a slow
 * ember light (pf-bg/fold.js) → 2 the thread (the page's one light block): the five things the client gets arrive as
 * the real things (the plan as a page, the site's layouts, the site live and its test request in Telegram, the Google
 * Ads report, the keys as access cards), each signed by the role that sends it → 3 one chat moment, the client's sentence quoted unchanged by the
 * one who does it, beside the usual way (forwarded through a manager, retold) → 4 the request form as the chat's
 * composer, «Що буде далі» as system messages, the contacts. The grid: a chat app's, a head column (sticky on wide
 * screens) beside a thread column of about 40 rem; the team on the left, «Ви» on the right; hairlines, mono labels for
 * the roles and the system's notices. Ideas from motionsites (Interior Features, Social Hangouts) and 21st.dev
 * (Animated List, Order tracking, the AI chat category, Team Section with Duotone Portraits, the Glass Fold shader),
 * rebuilt on CSS, a little vanilla JS and one small WebGL2 shader.
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
