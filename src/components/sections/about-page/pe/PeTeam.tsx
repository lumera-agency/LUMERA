import { getTranslations } from "next-intl/server";
import { splitWords } from "../words";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/*
 * The orbit's geometry, in the map's own units (a 1000 × 760 box; pe.css gives the map that aspect, so the HTML parts
 * placed in % sit exactly on the SVG's lines). «Ви» at the centre, the ring round it; the three roles on the ring's
 * lower arc (160°, 90°, 20°), each straight under its label's column (pe.css: three equal columns inside a 1.37 % pad,
 * centred at 17.58 %, 50 % and 82.42 %); «Менеджер» (the usual way) between «Ви» and the roles, on the faint inner ring.
 */
const W = 1000;
const H = 760;
const C = { x: 500, y: 360 };
const R = 345;
const R_IN = 200;
const ROLES = [160, 90, 20].map((deg) => {
  const a = (deg * Math.PI) / 180;
  return { x: +(C.x + R * Math.cos(a)).toFixed(1), y: +(C.y + R * Math.sin(a)).toFixed(1) };
});
const M = { x: C.x, y: C.y + R_IN };
const pct = (v: number, of: number) => `${+((v / of) * 100).toFixed(3)}%`;
/** a line's own origin (where it is drawn from), in % of the map: the spokes grow out of their start */
const from = (p: { x: number; y: number }) => `${pct(p.x, W)} ${pct(p.y, H)}`;

/** the ring's ticks: one every 10°, a hair outside it */
const TICKS = Array.from({ length: 36 }, (_, k) => {
  const a = (k * 10 * Math.PI) / 180;
  const p = (r: number) => `${(C.x + r * Math.cos(a)).toFixed(1)} ${(C.y + r * Math.sin(a)).toFixed(1)}`;
  return `M${p(R + 6)}L${p(R + 16)}`;
}).join("");

/**
 * TEMPORARY · variant E, 1 · Команда, the first screen («Орбіта», you are at the centre): the title rises out of its
 * cut, the lead's words come up, the quiet way down to the form. Beside it the orbit (motionsites' Radial Diagram: one
 * circle cut by its spokes, a label at each cut outside the circle; its nodes as Atlas Lab Features' diamond has them):
 * «Ви» at the centre, a thin ring, the three roles as nodes on it, each with its duty under it, and three straight
 * spokes from «Ви» to them, on a square module with hairline axes and «+» joints (21st.dev's Interactive Values Grid).
 * Under it the two ways (about.direct): «В ECLO» (pressed) and «Зазвичай», real toggle buttons; «Зазвичай» puts the
 * manager between «Ви» and the roles (the spokes fade, one line runs to the manager and three from him), and
 * direct.intro says it under the switch. The spokes draw from the first paint, the nodes come in after them (pe.css,
 * no JS); the switch is runtime/pe.js. Phones and tablets (≤860): a tree, «Ви» on top, a trunk down and a branch into
 * each role's card; «Зазвичай» puts the manager on the trunk. No names, no faces, no count.
 */
export async function PeTeam() {
  const t = await getTranslations("about");
  const you = t("direct.you");
  return (
    <section className="section pe-hero" id="team" aria-labelledby="team-title">
      <div className="container pe-c">
        <div className="s-head pe-hero__grid">
          <p className="s-head__meta">
            <span className="s-head__index">1</span>
            <span>{t("team.meta")}</span>
          </p>
          <h1 className="s-head__title pe-hero__title" id="team-title">
            <span className="tone">
              {splitWords(t.raw("team.title") as string, (w, i) => (
                <span className="about-cut">
                  <span className="about-cut__w" style={{ "--i": i } as CSSVars}>{w}</span>
                </span>
              ))}
            </span>
          </h1>
          <p className="s-head__intro about-hero__lead pe-hero__lead">
            {splitWords(t.raw("team.lead") as string, (w, i) => <span className="about-gen" style={{ "--i": i } as CSSVars}>{w}</span>)}
          </p>
          {/* the quiet way down to the form (a link, not a button: the page's one lime button is the form's) */}
          <a className="about-down pe-hero__down" href="#contact">
            <span>{t("team.down")}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg>
          </a>

          <div className="pe-hero__side">
            <div className="pe-orbit" id="pe-orbit" data-mode="us" data-pe-orbit="">
              {/* the map: the module grid, the ring, the two sets of lines (both in the markup, the mode shows one), «Ви»,
                  the manager and the roles' nodes; on phones it is the tree's top, «Ви» and the stretch of trunk the
                  manager steps onto */}
              <div className="pe-map" aria-hidden="true">
                <span className="pe-grid pe-map__grid" />
                <svg className="pe-map__svg" viewBox={`0 0 ${W} ${H}`} focusable="false">
                  <g className="pe-ln pe-ln--ring">
                    <circle cx={C.x} cy={C.y} r={R} />
                    <path className="pe-ln__ticks" d={TICKS} />
                    <circle className="pe-ln__guide" cx={C.x} cy={C.y} r={R_IN} />
                  </g>
                  {/* each node's leader down to its label, a «+» where it meets it */}
                  <g className="pe-ln pe-ln--lead">
                    {ROLES.map((p, i) => (
                      <line key={i} x1={p.x} y1={p.y} x2={p.x} y2={H} style={{ "--i": i, "--o": from(p) } as CSSVars} />
                    ))}
                    <path className="pe-ln__plus" d={ROLES.map((p) => `M${p.x - 9} ${H}h18M${p.x} ${H - 9}v18`).join("")} />
                  </g>
                  {/* В ECLO: three spokes, each straight from «Ви» to a role */}
                  <g className="pe-ln pe-ln--us">
                    {ROLES.map((p, i) => (
                      <line key={i} x1={C.x} y1={C.y} x2={p.x} y2={p.y} style={{ "--i": i, "--o": from(C) } as CSSVars} />
                    ))}
                  </g>
                  {/* Зазвичай: one line from «Ви» to the manager, three from the manager to the roles */}
                  <g className="pe-ln pe-ln--usual">
                    <line className="pe-ln__you" x1={C.x} y1={C.y} x2={M.x} y2={M.y} style={{ "--o": from(C) } as CSSVars} />
                    {ROLES.map((p, i) => (
                      <line key={i} x1={M.x} y1={M.y} x2={p.x} y2={p.y} style={{ "--i": i, "--o": from(M) } as CSSVars} />
                    ))}
                  </g>
                </svg>
                <span className="pe-trunk" />
                <span className="pe-you" style={{ "--x": pct(C.x, W), "--y": pct(C.y, H) } as CSSVars}>{you}</span>
                <span className="pe-mgr" style={{ "--x": pct(M.x, W), "--y": pct(M.y, H) } as CSSVars}>{t("direct.manager")}</span>
                {ROLES.map((p, i) => (
                  <span className="pe-node" key={i} style={{ "--x": pct(p.x, W), "--y": pct(p.y, H), "--i": i } as CSSVars} />
                ))}
              </div>
              <ul className="pe-roles">
                {([1, 2, 3] as const).map((n, i) => (
                  <li className="pe-role" key={n} style={{ "--i": i } as CSSVars}>
                    <span className="pe-wire pe-wire--us" aria-hidden="true" />
                    <span className="pe-wire pe-wire--usual" aria-hidden="true" />
                    <p className="pe-role__name">{t(`team.${n}.role`)}</p>
                    <p className="pe-role__d">{t(`team.${n}.d`)}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* the two ways (about.direct): toggle buttons for the map above; the route said for screen readers */}
            <div className="pe-switch" role="group" aria-label={t("direct.meta")}>
              <span className="pe-switch__thumb" aria-hidden="true" />
              <button type="button" className="pe-switch__b" aria-pressed="true" aria-controls="pe-orbit" data-pe-mode="us">{t("direct.us")}</button>
              <button type="button" className="pe-switch__b" aria-pressed="false" aria-controls="pe-orbit" data-pe-mode="usual">{t("direct.usual")}</button>
            </div>
            <p className="pe-hero__intro">{t("direct.intro")}</p>
            <p
              className="visually-hidden"
              aria-live="polite"
              data-pe-route=""
              data-us={`${you} → ${t("direct.maker")}`}
              data-usual={`${you} → ${t("direct.manager")} → ${t("direct.doer")}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
