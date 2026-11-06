import { getTranslations } from "next-intl/server";
import { countWords, splitWords } from "../words";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

const MEMBERS = [1, 2, 3] as const;
const ROLL = [1, 2, 3, 4] as const;

/** The title as a stair: line 1 up to the word before the key word, line 2 that word and the key word («за ECLO»).
 *  Breaks at a plain space only (the typesetting glues «за» to the name with a no-break space). */
function stair(raw: string): [string, string] {
  const at = raw.indexOf("<hl>");
  const cut = at > 0 ? raw.slice(0, at).trimEnd().lastIndexOf(" ") : -1;
  return cut > 0 ? [raw.slice(0, cut), raw.slice(cut + 1)] : [raw, ""];
}

/** a title's word rising out of its own cut (about.css: Vertical Cut Reveal, from the first paint) */
const cut = (w: string, i: number) => (
  <span className="about-cut">
    <span className="about-cut__w" style={{ "--i": i } as CSSVars}>{w}</span>
  </span>
);

/**
 * A · 1 · Команда, the first screen: who the visitor will talk to, as a film's credits (no names, faces or counts). The
 * title is a stair: «Хто стоїть» from the margin rail, «за ECLO» stepped in to the third column. The lead sits in the
 * empty band left of the second line; its last word rolls like a slot drum, сайти → рекламу → автоматизацію, and lands
 * on «роботу.», underlined in ember («Барабан»: CSS from the first paint, its default the final frame; screen readers
 * get about.team.lead whole). Under it the credits: the duty first, the role in ember mono (ember is the people), on
 * hairlines and the four column lines, the only lines of this block. The rail: the list's label, the team's note and
 * the page's one way down to the form.
 */
export async function PaTeam() {
  const t = await getTranslations("about");
  const [l1, l2] = stair(t.raw("team.title") as string);
  return (
    <section className="section pa-hero" id="team" aria-labelledby="team-title">
      <div className="container pa-sheet pa-sheet--team">
        <span className="pa-edge" aria-hidden="true" />
        <p className="s-head__meta pa-meta">
          <span className="s-head__index">1</span>
          <span>{t("team.meta")}</span>
        </p>
        <h1 className="s-head__title pa-h1" id="team-title">
          <span className="tone">
            <span className="pa-h1__l">{splitWords(l1, cut)}</span>{" "}
            {l2 && <span className="pa-h1__l pa-h1__l--2">{splitWords(l2, cut, countWords(l1))}</span>}
          </span>
        </h1>
        {/* «Барабан»: the window keeps the widest word's width and one line's height (the sizer), the column of
            words rolls inside it */}
        <p className="pa-lead">
          <span className="pa-lead__show" aria-hidden="true">
            {t("pa.team.head")}{" "}
            <span className="pa-roll">
              <span className="pa-roll__size">
                {ROLL.map((n) => (
                  <span key={n}>{t(`pa.team.roll.${n}`)}</span>
                ))}
              </span>
              <span className="pa-roll__col">
                {ROLL.map((n) => (
                  <span className="pa-roll__w" key={n}>{t(`pa.team.roll.${n}`)}</span>
                ))}
              </span>
            </span>
          </span>
          <span className="visually-hidden">{t("team.lead")}</span>
        </p>
        <p className="pa-k pa-team__k" id="team-credits">{t("pa.team.credits")}</p>
        <ol className="pa-credits" aria-labelledby="team-credits">
          {MEMBERS.map((n, i) => (
            <li className="pa-credit" key={n} style={{ "--i": i } as CSSVars}>
              {/* (the inner spans sit on the column lines: the lines stop at the words) */}
              <p className="pa-credit__d"><span>{t(`team.${n}.d`)}</span></p>
              <p className="pa-credit__r"><span>{t(`team.${n}.role`)}</span></p>
            </li>
          ))}
        </ol>
        <div className="pa-team__foot">
          <p className="pa-note-s">{t("pa.team.note")}</p>
          {/* the quiet way down to the form (a link: the page's one lime button is the form's) */}
          <a className="about-down pa-down" href="#contact">
            <span>{t("team.down")}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg>
          </a>
        </div>
      </div>
    </section>
  );
}
