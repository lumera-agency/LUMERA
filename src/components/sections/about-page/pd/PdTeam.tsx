import { getTranslations } from "next-intl/server";
import { splitWords } from "../words";
import { PdCube } from "./PdCube";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/**
 * TEMPORARY · variant D, 1 · Команда, the first screen («Зведення»): the title and the lead over the run summary of
 * 21st.dev's Build Pipeline, rebuilt as the team's panel. A dark card on the page's 12-column hairline grid: its label
 * row («Команда ECLO», about.work.sign) and the three roles as the summary's three cells, each four columns wide, its
 * dividers on the grid's lines: the role at lead size, its duty small under it, a small ember lamp (the person). No
 * names, no faces, no count, no mapping of the roles onto the pipeline's stages. Wide screens: the title on cols 1–8,
 * the lead and the way down on 9–12, the panel across; phones: one under another, the cells as rows. The title rises
 * out of its cut (Vertical Cut Reveal), the lead's words come up (Text Generate, wide screens), the panel's hairline
 * draws and the cells come in one after another, each lamp lighting once: CSS from the first paint (pd.css).
 */
export async function PdTeam() {
  const t = await getTranslations("about");
  return (
    <section className="section pd-hero" id="team" aria-labelledby="team-title">
      <span className="pd-grid" aria-hidden="true" />
      <div className="container pd-c">
        <div className="s-head pd-hero__grid">
          <p className="s-head__meta">
            <span className="s-head__index">1</span>
            <span>{t("team.meta")}</span>
          </p>
          <h1 className="s-head__title pd-hero__title" id="team-title">
            <span className="tone">
              {splitWords(t.raw("team.title") as string, (w, i) => (
                <span className="about-cut">
                  <span className="about-cut__w" style={{ "--i": i } as CSSVars}>{w}</span>
                </span>
              ))}
            </span>
          </h1>
          <p className="s-head__intro about-hero__lead pd-hero__lead">
            {splitWords(t.raw("team.lead") as string, (w, i) => <span className="about-gen" style={{ "--i": i } as CSSVars}>{w}</span>)}
          </p>
          {/* the quiet way down to the form (a link, not a button: the page's one lime button is the form's) */}
          <a className="about-down pd-hero__down" href="#contact">
            <span>{t("team.down")}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg>
          </a>

          {/* the run summary: the team's three roles (a list; the label row is the panel's caption) */}
          <div className="pd-sum pd-frame">
            <p className="pd-sum__bar" id="pd-sum-k">
              <PdCube hollow className="pd-sum__mark" />
              <span>{t("work.sign")}</span>
              <span className="pd-sum__hatch" aria-hidden="true" />
            </p>
            <ul className="pd-sum__cells" aria-labelledby="pd-sum-k">
              {[1, 2, 3].map((n, i) => (
                <li className="pd-cell" key={n} style={{ "--i": i } as CSSVars}>
                  <span className="pd-lamp" aria-hidden="true" />
                  <p className="pd-cell__role">{t(`team.${n}.role`)}</p>
                  <p className="pd-cell__d">{t(`team.${n}.d`)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
