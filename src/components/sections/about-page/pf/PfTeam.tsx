import { getTranslations } from "next-intl/server";
import { splitWords } from "../words";
import { Badge, Stack, type CSSVars, type Role } from "./PfParts";

const ROLES: readonly Role[] = [1, 2, 3];

/**
 * TEMPORARY · variant F, 1 · Команда, the first screen («Учасники чату»): the title rising out of its cut (Vertical Cut
 * Reveal), the lead's words coming up (Text Generate), the quiet way down to the form. Beside them, the project chat's
 * window: its header (the three badges stacked, «Команда ECLO») and its member list, one row per role: the role's
 * badge, the role (lead size), its duty as the status line (small). The rows pop in one after another from the first
 * paint (21st.dev's Animated List, CSS only: pf.css). At the window's foot the composer, its line the form's own
 * placeholder: a click takes the visitor down to the form (the accessible way down is the link under the lead).
 * Copy: about.team.* (title, lead, the three roles and duties, down), about.work.sign (the team's name),
 * contact.field.textarea.placeholder (the main page's form). No names, no faces, no count.
 */
export async function PfTeam() {
  const t = await getTranslations("about");
  const m = await getTranslations("contact");
  return (
    <section className="section pf-hero" id="team" aria-labelledby="team-title">
      <div className="container">
        <div className="pf-hero__grid">
          <p className="s-head__meta pf-hero__meta">
            <span className="s-head__index">1</span>
            <span>{t("team.meta")}</span>
          </p>
          <div className="pf-hero__head">
            <h1 className="s-head__title pf-hero__title" id="team-title">
              <span className="tone">
                {splitWords(t.raw("team.title") as string, (w, i) => (
                  <span className="about-cut">
                    <span className="about-cut__w" style={{ "--i": i } as CSSVars}>{w}</span>
                  </span>
                ))}
              </span>
            </h1>
            <p className="s-head__intro about-hero__lead pf-hero__lead">
              {splitWords(t.raw("team.lead") as string, (w, i) => <span className="about-gen" style={{ "--i": i } as CSSVars}>{w}</span>)}
            </p>
            {/* the quiet way down to the form (a link, not a button: the page's one lime button is the form's) */}
            <a className="about-down pf-hero__down" href="#contact">
              <span>{t("team.down")}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg>
            </a>
          </div>

          {/* the project chat's window: its header, the members, the composer */}
          <div className="pf-win" role="group" aria-labelledby="pf-win-name">
            <div className="pf-win__bar">
              <Stack />
              <p className="pf-win__name" id="pf-win-name">{t("work.sign")}</p>
            </div>
            <ul className="pf-crew" aria-labelledby="pf-win-name">
              {ROLES.map((n, i) => (
                <li className="pf-mem" key={n} style={{ "--i": i } as CSSVars}>
                  <Badge role={n} />
                  <p className="pf-mem__role">{t(`team.${n}.role`)}</p>
                  <p className="pf-mem__d">{t(`team.${n}.d`)}</p>
                </li>
              ))}
            </ul>
            {/* the composer: a picture of one, its click the way to the real form (kept out of the tab order and the
                screen reader: the link under the lead says it) */}
            <a className="pf-win__compose" href="#contact" tabIndex={-1} aria-hidden="true">
              <span>{m("field.textarea.placeholder")}</span>
              <span className="pf-win__send">
                <svg viewBox="0 0 24 24" focusable="false"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
