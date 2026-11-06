import { getTranslations } from "next-intl/server";
import { splitWords } from "../words";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/** the three passes: each one's resting tilt (--r, about its clip) and its strap's length in modules (--s), so the
 *  bottoms stagger */
const PASSES = [
  { n: 1, r: "-1.5deg", s: 1 },
  { n: 2, r: "1.2deg", s: 1.5 },
  { n: 3, r: "-0.8deg", s: 1.25 },
] as const;

/**
 * TEMPORARY · variant B, 1 · Команда, the first screen («Пропуска на рейке»): the team as three role passes hanging
 * from a rail that is also a ruler (21st.dev's Team Lanyard Rail, without the photos, the names, the flip and the
 * sway). Each pass: the band «Команда ECLO», the role, its duty, a hatch strip at the foot. No names, no faces, no
 * count. Wide screens: the title on the left (cols 1–7), the rail from col 8 out to the screen's right edge, the passes
 * on it; 861–1199: the passes in a row under the title; phones: the rail stands up at the content's left edge, the
 * passes are rows on short straps. The passes drop and settle once from the first paint (pb.css, html.motion: no JS),
 * the title rises out of its cut (Vertical Cut Reveal), the lead's words come up (Text Generate, wide screens).
 */
export async function PbTeam() {
  const t = await getTranslations("about");
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
          <div className="pb-crew">
            {/* the rail (a ruler at the module pitch); on phones it stands up, its one label at the top */}
            <span className="pb-rail" aria-hidden="true" />
            <p className="pb-crew__k" aria-hidden="true">{t("work.sign")}</p>
            <ul className="pb-crew__list">
              {PASSES.map(({ n, r, s }, i) => (
                <li className="pb-pass" key={n} style={{ "--tilt": r, "--s": s, "--i": i } as CSSVars}>
                  <span className="pb-pass__strap" aria-hidden="true" />
                  <div className="pb-pass__card">
                    <span className="pb-pass__clip" aria-hidden="true" />
                    <p className="pb-pass__band" aria-hidden="true">{t("work.sign")}</p>
                    <p className="pb-pass__role">{t(`team.${n}.role`)}</p>
                    <p className="pb-pass__d">{t(`team.${n}.d`)}</p>
                    <span className="pb-pass__hatch" aria-hidden="true" />
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
