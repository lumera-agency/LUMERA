import { getTranslations } from "next-intl/server";
import { PbMark } from "@/components/about/pb-3d/PbMark";
import { splitWords } from "../words";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/**
 * The team's photos, one per role (the owner sends real ones; the same files serve variant F). Put a path here, e.g.
 * `1: "/img/about/team-1.jpg"`, and that card shows the photo (cover-cropped to the frame's 4:5, the role as its alt);
 * `null`: the card's finished empty frame. Nothing else changes, the frame keeps its size either way.
 */
const PHOTOS: Record<1 | 2 | 3, string | null> = { 1: null, 2: null, 3: null };

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

/** the three passes: each one's resting tilt (--tilt, about its clip) and its strap's length in modules (--s), so the
 *  bottoms stagger */
const PASSES = [
  { n: 1, r: "-1.2deg", s: 0.6 },
  { n: 2, r: "0.9deg", s: 0.95 },
  { n: 3, r: "-0.6deg", s: 0.78 },
] as const;

/** each role's glyph in its empty photo frame (thin line, no people): two speech bubbles (the first conversation), a
 *  route through three stops (a project from the first talk to the launch), the pen's nib over a screen (design and
 *  build) */
const GLYPH: Record<1 | 2 | 3, React.ReactNode> = {
  1: (
    <>
      <path d="M8 13.5c0-3 2.4-5.5 5.5-5.5h13c3 0 5.5 2.5 5.5 5.5v7c0 3-2.5 5.5-5.5 5.5H18l-6 4.5v-4.6A5.5 5.5 0 0 1 8 20.5z" />
      <path d="M36 19h3.5c2.5 0 4.5 2 4.5 4.5v6c0 2.5-2 4.5-4.5 4.5H39v4l-5.2-4H29c-2.5 0-4.5-2-4.5-4.5V30" />
      <path d="M15 16.5h11M15 20.5h7" />
    </>
  ),
  2: (
    <>
      <circle cx="10" cy="36" r="3.5" />
      <circle cx="26" cy="15" r="3.5" />
      <circle cx="40" cy="34" r="3.5" />
      <path d="M12.5 33.5c3-6 7-12 11-16M28.5 17.5c3.5 4 6.5 8.5 9.4 13.6" strokeDasharray="0.1 3.2" />
      <path d="M40 30.5V9.5M40 9.5h-7l2 3-2 3h7" />
    </>
  ),
  3: (
    <>
      <rect x="6" y="9" width="36" height="25" rx="3" />
      <path d="M6 15h36M18 40h12M24 34v6" />
      <path d="m27 30.5 9.5-9.5 4.3 4.3-9.5 9.5-5.6 1.3z" />
      <path d="m33.8 23.7 4.3 4.3" />
    </>
  ),
};

/** the studio's mark, small, on each pass's band (public/img/logo-mark.svg) */
const MARK = (
  <svg className="pb-pass__mark" viewBox="0 0 329 329" aria-hidden="true" focusable="false">
    <path d="M119 269.5C119 302.361 92.3609 329 59.5 329C26.6391 329 0 302.361 0 269.5C0 253.546 6.27877 239.059 16.5 228.375C26.7212 217.691 53 193.038 53 164.5C53 135.962 26.7212 111.309 16.5 100.625C6.27877 89.9406 0 75.4536 0 59.5C0 26.6391 26.6391 0 59.5 0C92.3609 0 119 26.6391 119 59.5C119 75.4536 112.721 89.9406 102.5 100.625C92.2788 111.309 66 135.962 66 164.5C66 193.038 92.2788 217.691 102.5 228.375C112.721 239.059 119 253.546 119 269.5Z" />
    <path d="M59.5 329C26.6391 329 0 302.361 0 269.5C0 236.639 26.6391 210 59.5 210C75.4536 210 89.9406 216.279 100.625 226.5C111.309 236.721 135.962 263 164.5 263C193.038 263 217.691 236.721 228.375 226.5C239.059 216.279 253.546 210 269.5 210C302.361 210 329 236.639 329 269.5C329 302.361 302.361 329 269.5 329C253.546 329 239.059 322.721 228.375 312.5C217.691 302.279 193.038 276 164.5 276C135.962 276 111.309 302.279 100.625 312.5C89.9406 322.721 75.4536 329 59.5 329Z" />
    <circle cx="270" cy="59" r="59" />
  </svg>
);

/**
 * TEMPORARY · variant B, 1 · Команда, the first screen («Пропуска на рейке»): the team as three ID passes hanging from
 * a rail that is also a ruler (21st.dev's Team Lanyard Rail: its photo badges, without the names, the flip and the
 * sway). Each pass: the band (the mark, «Команда ECLO»), the photo frame (PHOTOS; empty: a finished duotone frame with
 * the role's glyph and «Фото»), the role, its duty and three lines of what it does for the client, a code strip at the
 * foot. No names, no faces, no count. Beside them the studio's mark in chrome (about/pb-3d: a live object on wide
 * screens, its still elsewhere). Wide screens (1200+): the title, the way down and the mark in cols 1–5, the rail from
 * the label's line (col 6) out to the screen's edge, the passes on it; 861–1199: the title beside the mark, the passes
 * in a row under them; phones and small tablets: the mark beside the title, the passes in a row that slides sideways
 * along its rail (scroll-snap). The passes drop and settle once from the first paint (pb.css, CSS only), the title
 * rises out of its cut, the lead's words come up.
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
            {/* a row that slides sideways on phones (runtime/pb.js makes it reachable by the keyboard there) */}
            <ul className="pb-crew__list" aria-label={t("work.sign")}>
              {PASSES.map(({ n, r, s }, i) => {
                const role = t(`team.${n}.role`);
                const photo = PHOTOS[n];
                return (
                  <li className="pb-pass" key={n} style={{ "--tilt": r, "--s": s, "--i": i } as CSSVars}>
                    <span className="pb-pass__strap" aria-hidden="true" />
                    <div className="pb-pass__card">
                      <span className="pb-pass__clip" aria-hidden="true" />
                      <p className="pb-pass__band" aria-hidden="true">
                        {MARK}
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
                      <p className="pb-pass__role">{role}</p>
                      <p className="pb-pass__d">{t(`team.${n}.d`)}</p>
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
