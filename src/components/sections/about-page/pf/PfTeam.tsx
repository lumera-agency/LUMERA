/* eslint-disable @next/next/no-img-element -- the team's photos, when they come, are shown as they are in a fixed 4:5 frame (no layout of their own to optimise) */
import { getTranslations } from "next-intl/server";
import { splitWords } from "../words";
import { RoleGlyph, Stack, type CSSVars, type Role } from "./PfParts";

const ROLES: readonly Role[] = [1, 2, 3];

/**
 * The team's photos. We have none yet: the owner will send real ones. Put each file in public/img/about/ and its path
 * here (e.g. `1: "/img/about/team-1.jpg"`); the card shows it in its 4:5 frame (any size, cropped to cover, the role as
 * its alt). While a role's entry is null, its frame shows the role's glyph (no face, no silhouette, no stock photo).
 * The frame keeps its size either way, so a photo drops in with no change to the layout.
 */
const PHOTOS: Record<Role, string | null> = { 1: null, 2: null, 3: null };

/** the frame's size in the markup (4:5: the photo is cropped to it) */
const PHOTO_W = 800;
const PHOTO_H = 1000;

type T = Awaited<ReturnType<typeof getTranslations>>;
/** a line from the site's copy without its closing full stop (the card's lines are a list) */
const bare = (s: string) => s.replace(/\.$/, "");

/**
 * What each role does for the client, two or three short lines from the site's own copy (the main page's messages):
 * · «Супровід» (answers the requests, the first conversation): contact.next.b.1 «Відповімо протягом робочого дня»,
 *   contact.next.span.1 «Уточнимо задачу й зручний час» («Що буде далі»), approach.guarantee «Помилки після запуску
 *   виправляємо безкоштовно» (after the launch);
 * · «Сайти, реклама, автоматизація» (leads the project to its launch): approach.stage.v.1.text «Обговорюємо бізнес і
 *   цілі, складаємо план робіт», why.sys.1 «Реклама в Google приводить тих, хто шукає вашу послугу», why.sys.3
 *   «Заявка одразу приходить у Telegram або CRM»;
 * · «Дизайн і розробка» (makes the sites): approach.stage.checks.3.span.2 «Окремий макет для кожного екрана»,
 *   checks.3.span.3 «Кольори, шрифти й фото під ваш бізнес», approach.stage.v.4.text «Сайт працює на тестовій адресі,
 *   ви можете все перевірити».
 */
const MORE: Record<Role, (t: T) => string[]> = {
  1: (t) => [t("contact.next.b.1"), t("contact.next.span.1"), t.markup("approach.guarantee", { sig: (c) => c })],
  2: (t) => [t("approach.stage.v.1.text"), t("why.sys.1"), t("why.sys.3")],
  3: (t) => [t("approach.stage.checks.3.span.2"), t("approach.stage.checks.3.span.3"), t("approach.stage.v.4.text")],
};

/**
 * TEMPORARY · variant F, 1 · Команда, the first screen («Учасники чату»): the title rising out of its cut (Vertical Cut
 * Reveal), the lead's words coming up (Text Generate), the quiet way down to the form. Beside them (under them below
 * 1200), the project chat «Команда ECLO»: its header, then one messenger profile card per role (21st.dev's «Team
 * Section with Duotone Portraits» / «Meet the crew», motionsites' Social Hangouts): a 4:5 photo frame (PHOTOS above;
 * empty: a dark ember duotone with a fine halftone, the role's glyph, viewfinder corners and the mono «Фото»), the
 * role as the name line, its duty as the status line, then what the role does for the client. The cards pop in one
 * after another from the first paint (21st.dev's Animated List, CSS only: pf.css); on phones they are a row to swipe,
 * one card and the next one's edge in view. At the window's foot the composer, its line the form's own placeholder: a
 * click takes the visitor down to the form (the accessible way down is the link under the lead).
 * Behind it all, the slow ember folds of light (pf-bg/fold.js, mounted by runtime/pf.js after the page is in, over the
 * CSS poster in .pf-hero__bg).
 * Copy: about.team.* (title, lead, the roles and duties, down), about.work.sign (the team's name), about.pf.photo
 * («Фото»), contact.field.textarea.placeholder and the lines in MORE (the main page's). No names, no faces, no count.
 */
export async function PfTeam() {
  const t = await getTranslations("about");
  const m = await getTranslations("contact");
  const all = await getTranslations();
  return (
    <section className="section pf-hero" id="team" aria-labelledby="team-title">
      {/* the slow light behind the first screen: its CSS poster now, the shader over it once the page is in */}
      <div className="pf-hero__bg" data-pf-bg="" aria-hidden="true" />
      <div className="container">
        <div className="pf-hero__grid">
          <div className="pf-hero__head">
            <p className="s-head__meta pf-hero__meta">
              <span className="s-head__index">1</span>
              <span>{t("team.meta")}</span>
            </p>
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

          {/* the project chat's window: its header, the members' profile cards, the composer */}
          <div className="pf-win" role="group" aria-labelledby="pf-win-name">
            <div className="pf-win__bar">
              <Stack />
              <p className="pf-win__name" id="pf-win-name">{t("work.sign")}</p>
            </div>
            {/* (phones: a row to swipe; runtime/pf.js puts it in the tab order only while it scrolls) */}
            <ul className="pf-crew" aria-labelledby="pf-win-name" data-pf-crew="">
              {ROLES.map((n, i) => {
                const photo = PHOTOS[n];
                const role = t(`team.${n}.role`);
                return (
                  <li className="pf-prof" key={n} style={{ "--i": i } as CSSVars}>
                    <div className="pf-photo" data-role={n} data-empty={photo ? undefined : ""}>
                      {photo ? (
                        <img className="pf-photo__img" src={photo} alt={role} width={PHOTO_W} height={PHOTO_H} loading="eager" decoding="async" />
                      ) : (
                        <span className="pf-photo__empty" aria-hidden="true">
                          <RoleGlyph role={n} />
                          <span className="pf-photo__k">
                            <svg viewBox="0 0 24 24" focusable="false">
                              <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.5-2h5.6l1.5 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5Z" />
                              <circle cx="12" cy="12.75" r="3.25" />
                            </svg>
                            {t("pf.photo")}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="pf-prof__id">
                      <h2 className="pf-prof__name">{role}</h2>
                      <p className="pf-prof__status">{t(`team.${n}.d`)}</p>
                    </div>
                    <ul className="pf-prof__more">
                      {MORE[n](all).map((line) => (
                        <li key={line}>{bare(line)}</li>
                      ))}
                    </ul>
                  </li>
                );
              })}
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
