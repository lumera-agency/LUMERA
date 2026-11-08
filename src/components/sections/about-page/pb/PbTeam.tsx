import { getTranslations } from "next-intl/server";
import { PbMark } from "@/components/about/pb-3d/PbMark";
import { splitWords } from "../words";
import { GLYPH, Mark, PHOTOS, ROLES } from "./crew";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/** what each role does for the client, besides its duty (about.team.<n>.d): three lines each, every one a line of the
 *  site's own copy (the main page's messages, both languages), named by its key */
const MORE = {
  // Супровід: the main page's «Що буде далі», its first two steps (contact.next.*)
  1: ["contact.next.b.1", "contact.next.span.1", "contact.next.span.2"],
  // Сайти, реклама, автоматизація: the plan's last check (approach.stage.checks.1.span.4), the chain's search and
  // request links (why.sys.1, why.sys.3)
  2: ["approach.stage.checks.1.span.4", "why.sys.1", "why.sys.3"],
  // Дизайн і розробка: the design and build stages' checks (approach.stage.checks.3.span.2, .3.span.3, .4.span.3)
  3: ["approach.stage.checks.3.span.2", "approach.stage.checks.3.span.3", "approach.stage.checks.4.span.3"],
} as const;

/**
 * Variant B, 1 · Команда, the first screen («Пропуска на рейке»): the team as three ID passes hanging from a rail that
 * is also a ruler (21st.dev's Team Lanyard Rail: its photo badges, without the names, the flip and the sway). Each
 * pass, straight: the band (the mark, «Команда ECLO»), the photo frame (crew.tsx's PHOTOS; empty: a finished duotone
 * frame with the role's glyph and «Фото»), the role, its duty and three lines of what it does for the client, a code
 * strip at the foot. No names, no faces, no count. Beside them the studio's mark in chrome (about/pb-3d: a live object
 * on wide screens, its still elsewhere). Wide screens (1200+): the title, the way down and the mark in cols 1–5, the
 * rail from the label's line (col 6) out to the screen's edge, the passes on it, their feet on one line (each strap as
 * long as its pass is short, so they hang at their own heights); 861–1199: the title beside the mark, the passes in a row under them; phones and small tablets (≤860):
 * the rail stands up at the content's left edge and the passes hang from it one under another, each compact (the
 * photo beside the role and its duty, the three lines under them). The passes drop and settle once (wide screens: from
 * the first paint, CSS only; phones: each as it comes into view, runtime/pb.js), the title rises out of its cut, the
 * lead's words come up.
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
          <div className="pb-crew">
            {/* the rail (a ruler at the module pitch) */}
            <span className="pb-rail" aria-hidden="true" />
            <ul className="pb-crew__list" aria-label={t("work.sign")}>
              {ROLES.map((n, i) => {
                const role = t(`team.${n}.role`);
                const photo = PHOTOS[n];
                return (
                  <li className="pb-pass" key={n} style={{ "--i": i } as CSSVars}>
                    <span className="pb-pass__strap" aria-hidden="true" />
                    <div className="pb-pass__card">
                      <span className="pb-pass__clip" aria-hidden="true" />
                      <p className="pb-pass__band" aria-hidden="true">
                        <Mark className="pb-pass__mark" />
                        <span>{t("work.sign")}</span>
                      </p>
                      <div className={`pb-pass__photo${photo ? " has-photo" : ""}`}>
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element -- a fixed 4:5 frame, as the sites page's pictures
                          <img className="pb-pass__img" src={photo} width={800} height={1000} alt={role} decoding="async" />
                        ) : (
                          <span className="pb-pass__empty" aria-hidden="true">
                            <span className="pb-pass__seal">
                              <svg viewBox="0 0 48 48" focusable="false">{GLYPH[n]}</svg>
                            </span>
                            {/* about.pb.photo «Фото»: the frame's own label (the brief's word for it) */}
                            <span className="pb-pass__ph">{t("pb.photo")}</span>
                          </span>
                        )}
                      </div>
                      <div className="pb-pass__who">
                        <p className="pb-pass__role">{role}</p>
                        <p className="pb-pass__d">{t(`team.${n}.d`)}</p>
                      </div>
                      <ul className="pb-pass__more">
                        {MORE[n].map((k) => (
                          <li key={k}>{tm(k).replace(/\.$/, "")}</li>
                        ))}
                      </ul>
                      <span className="pb-pass__code" aria-hidden="true" />
                    </div>
                  </li>
                );
              })}
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
