import { getTranslations } from "next-intl/server";
import { PbMark } from "@/components/about/pb-3d/PbMark";
import { splitWords } from "../words";
import { GLYPH, ROLES } from "./crew";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/** what each role does for the client, besides its duty (about.team.<n>.d): three lines each, every one a line of the
 *  site's own copy (the main page's messages, both languages), named by its key */
const MORE = {
  // Супровід: the main page's «Що буде далі», its first two steps (contact.next.*)
  1: ["contact.next.b.1", "contact.next.span.1", "contact.next.span.2"],
  // Сайти, реклама, автоматизація: the plan's last check (approach.stage.checks.1.span.4), the ads service's title
  // (services.service.title.2) and the launch check on requests (prototype.checks.span.1)
  2: ["approach.stage.checks.1.span.4", "services.service.title.2", "prototype.checks.span.1"],
  // Дизайн і розробка: the design and build stages' checks (approach.stage.checks.3.span.2, .3.span.3, .4.span.3)
  3: ["approach.stage.checks.3.span.2", "approach.stage.checks.3.span.3", "approach.stage.checks.4.span.3"],
} as const;

/**
 * Variant B, 1 · Команда, the first screen: the title, the lead and the way down beside the studio's mark in chrome
 * (about/pb-3d: a live object on wide screens, its still elsewhere); then «Студія», a paragraph about the studio
 * (about.pb.studio.text: what the studio makes, from the site's own lines: meta.org, services.service.text.1 and .3,
 * why.sum.*, meta.description, faq.a.5, why.market.3; nothing the next blocks say), and the three roles as straight
 * cards: the role's glyph, the role, its duty and three lines of what it does for the client. No names, no faces, no
 * photos, no count (the owner, 15 Nov: no photos, no passes). Wide screens (1200+): the title, the way down and the
 * mark in cols 1–5; the paragraph and the cards in cols 7–16, the cards' feet on the mark's line; 861–1199: the title
 * beside the mark, the paragraph and the cards in a row under them; phones and small tablets (≤860): one under
 * another. The title rises out of its cut, the lead's words come up, the paragraph and the cards come up once (wide
 * screens: from the first paint, CSS only; phones: each card as it comes into view, runtime/pb.js).
 */
export async function PbTeam() {
  const t = await getTranslations("about");
  const tm = await getTranslations();
  return (
    <section className="section pb-hero" id="team" aria-labelledby="team-title">
      <div className="container pb-c">
        <div className="s-head pb-hero__grid">
          <p className="s-head__meta">
            <span className="s-head__index">1</span>
            <span>{t("team.meta")}</span>
          </p>
          <h1 className="s-head__title pb-hero__title" id="team-title">
            <span className="tone">
              {splitWords(t.raw("team.title") as string, (w, i) => (
                <span className="about-cut">
                  <span className="about-cut__w" style={{ "--i": i } as CSSVars}>{w}</span>
                </span>
              ))}
            </span>
          </h1>
          <p className="s-head__intro about-hero__lead pb-hero__lead">
            {splitWords(t.raw("team.lead") as string, (w, i) => <span className="about-gen" style={{ "--i": i } as CSSVars}>{w}</span>)}
          </p>
          <div className="pb-hero__obj">
            <PbMark />
          </div>
          <div className="pb-hero__side">
            <div className="pb-studio">
              <p className="pb-studio__k">{t("pb.studio.k")}</p>
              {/* a hyphenated word («AI-асистента») never breaks at its hyphen */}
              <p className="pb-studio__text">
                {t("pb.studio.text")
                  .split(/([^\s-]+-[^\s-]+)/)
                  .map((part, i) => (i % 2 ? <span className="pb-studio__nb" key={i}>{part}</span> : part))}
              </p>
            </div>
            <ul className="pb-roles" aria-label={t("work.sign")}>
              {ROLES.map((n, i) => (
                <li className="pb-role" key={n} style={{ "--i": i } as CSSVars}>
                  <div className="pb-role__card">
                    <svg className="pb-role__glyph" viewBox="0 0 48 48" aria-hidden="true" focusable="false">{GLYPH[n]}</svg>
                    <p className="pb-role__name">{t(`team.${n}.role`)}</p>
                    <p className="pb-role__d">{t(`team.${n}.d`)}</p>
                    <ul className="pb-role__more">
                      {MORE[n].map((k) => (
                        <li key={k}>{tm(k).replace(/\.$/, "")}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* the quiet way down to the form (a link, not a button: the page's one lime button is the form's) */}
          <a className="about-down pb-hero__down" href="#contact">
            <span>{t("team.down")}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg>
          </a>
        </div>
      </div>
    </section>
  );
}
