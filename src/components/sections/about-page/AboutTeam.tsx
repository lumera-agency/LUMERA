import { getTranslations } from "next-intl/server";
import { AboutFlux } from "./AboutFlux";
import { PersonMark } from "./AboutMarks";
import { splitWords } from "./words";

const MEMBERS = [1, 2, 3] as const;

/**
 * 1 · Команда, the first screen: who is behind the studio (the owner's brief: three people, a photo's place each, the
 * name, the role, one line). The owner's pick of 26 Oct out of three layouts (Dribbble / Awwwards about pages; effects
 * after React Bits):
 * · wide screens, «Віяло»: the title in the middle over the sibling pages' lines (FluxLines, black and white); the three
 *   cards come in as a fanned pile and spread into a row (Bounce Cards); under the pointer one lifts and the others step
 *   aside.
 * · phones and tablets, «Розкол»'s rows: one card under another, the photo's square on the left, the words beside it;
 *   each rises in as it reaches the screen (Animated Content).
 * Each card: the photo's place (a square, the card's radius), the name small, the role at the reading size, one line of
 * what they do; the main page's card (.card: its border, its light under the pointer), and a glare that crosses it once
 * under the pointer (React Bits' Glare Hover). The title's words rise out of a cut one after another (21st.dev's
 * Vertical Cut Reveal), from the first paint.
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
            <p>{t("team.lead")}</p>
            {/* the quiet way down to the contacts (a link, not a button: the page's one lime button is the contacts') */}
            <a className="link about-down" href="#contacts">
              <span>{t("team.down")}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg>
            </a>
          </div>
        </header>
        <ul className="about-fan">
          {MEMBERS.map((n) => (
            <li className="card about-m" data-in="" key={n}>
              <div className="about-ph" aria-hidden="true">
                <PersonMark />
              </div>
              <div className="about-m__body">
                <p className="about-m__name">{t(`team.${n}.name`)}</p>
                <h3 className="about-m__role">{t(`team.${n}.role`)}</h3>
                <p className="about-m__d">{t(`team.${n}.d`)}</p>
              </div>
              <span className="about-glare" aria-hidden="true" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
