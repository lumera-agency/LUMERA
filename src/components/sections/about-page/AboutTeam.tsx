import { getTranslations } from "next-intl/server";
import { AboutFlux } from "./AboutFlux";
import { splitWords } from "./words";

const MEMBERS = [1, 2, 3] as const;

/**
 * 1 · Команда, the first screen: who the visitor will talk to. No photos and no names yet (the owner, 3 Nov: «поки без
 * фотографій»; the product director: no empty avatars), so each card is a role's poster: its number on a hairline (the
 * section labels' grammar), the role large, one line of what they do. The owner's pick of 26 Oct stays:
 * · wide screens, «Віяло»: the title in the middle over the sibling pages' lines (FluxLines, black and white); the three
 *   cards come in as a fanned pile and spread into a row (React Bits' Bounce Cards); under the pointer one lifts, the
 *   others step aside, and a glare crosses it (Glare Hover).
 * · phones and tablets, «Розкол»'s rows: one card under another, the number beside the words; the rows below the fold
 *   come in one after another (Animated List).
 * The title's words rise out of a cut (21st.dev's Vertical Cut Reveal); on wide screens the lead's words then come up one
 * after another (Text Generate), both from the first paint.
 */
export async function AboutTeam() {
  const t = await getTranslations("about");
  return (
    <section className="section about-hero" id="team" aria-labelledby="team-title">
      <div className="ai-hero__bg about-hero__bg" aria-hidden="true">
        <AboutFlux />
      </div>
      <div className="container">
        <header className="s-head about-center">
          <p className="s-head__meta">
            <span className="s-head__index">1</span>
            <span>{t("team.meta")}</span>
          </p>
          <h1 className="s-head__title" id="team-title">
            <span className="tone">
              {splitWords(t.raw("team.title") as string, (w, i) => (
                <span className="about-cut">
                  <span className="about-cut__w" style={{ "--i": i } as React.CSSProperties}>{w}</span>
                </span>
              ))}
            </span>
          </h1>
          <div className="s-head__intro">
            <p className="about-hero__lead">
              {splitWords(t.raw("team.lead") as string, (w, i) => <span className="about-gen" style={{ "--i": i } as React.CSSProperties}>{w}</span>)}
            </p>
            {/* the quiet way down to the request (a link, not a button: the page's one lime button is block 3's) */}
            <a className="about-down" href="#direct">
              <span>{t("team.down")}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg>
            </a>
          </div>
        </header>
        <ul className="about-fan">
          {MEMBERS.map((n) => (
            <li className="card about-m" data-in="" key={n}>
              <span className="about-m__k" aria-hidden="true">{n}</span>
              <h3 className="about-m__role">{t(`team.${n}.role`)}</h3>
              <p className="about-m__d">{t(`team.${n}.d`)}</p>
              <span className="about-glare" aria-hidden="true" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
