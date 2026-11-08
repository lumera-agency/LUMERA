/**
 * TEMPORARY · variant D: one isometric cube of the pipeline (21st.dev's Build Pipeline stage cubes, redrawn in SVG):
 * the top, left and right faces of a cube seen from above (viewBox 86.6 × 100: a side of 50 at 30°), hairline edges
 * that keep their width at any size. `icon`: the thing's pictogram, drawn in a unit square and laid onto a face by
 * that face's own affine matrix, so it lies flat on the cube (no words, decorative). The pale lime top (`__done`) is
 * the passed stage's mark; it fades in as the stage passes (pd.css). An opaque base under the faces, so a waiting
 * (dimmed) cube never shows the line behind it. `hollow`: a queued stage, edges only.
 */

/** the faces' outlines */
const TOP = "0,25 43.3,0 86.6,25 43.3,50";
const LEFT = "0,25 43.3,50 43.3,100 0,75";
const RIGHT = "43.3,50 86.6,25 86.6,75 43.3,100";
const BASE = "43.3,0 86.6,25 86.6,75 43.3,100 0,75 0,25";

/** the unit square onto the left face: (u, v) → its upper corner + u along its top edge + v down its side */
const ON_LEFT = "matrix(43.3 25 0 50 0 25)";

/** the five things' pictograms in the unit square (u right, v down): the plan's list, the two screens of the layout,
 *  the test site's window with its button, the ad's magnifier, the key */
const ICONS: Record<number, React.ReactNode> = {
  1: <path d="M.2 .28h.1M.42 .28h.38M.2 .5h.1M.42 .5h.38M.2 .72h.1M.42 .72h.24" />,
  2: (
    <>
      <path d="M.14 .24h.48v.42h-.48z" />
      <path d="M.7 .38h.18v.36h-.18z" />
      <path d="M.24 .38h.22M.24 .5h.14" />
    </>
  ),
  3: (
    <>
      <path d="M.16 .22h.68v.56h-.68z" />
      <path d="M.16 .36h.68" />
      <path d="M.28 .58h.26v.1h-.26z" />
    </>
  ),
  4: (
    <>
      <path d="M.6 .45a.17 .17 0 1 1-.34 0a.17 .17 0 1 1 .34 0z" />
      <path d="M.56 .57l.24 .2" />
    </>
  ),
  5: (
    <>
      <path d="M.44 .5a.13 .13 0 1 1-.26 0a.13 .13 0 1 1 .26 0z" />
      <path d="M.44 .5h.4M.72 .5v.12M.82 .5v.09" />
    </>
  ),
};

export function PdCube({ icon, hollow = false, className = "" }: { icon?: number; hollow?: boolean; className?: string }) {
  return (
    <svg className={`pd-cube${hollow ? " pd-cube--hollow" : ""} ${className}`} viewBox="-1 -1 88.6 102" aria-hidden="true" focusable="false">
      {!hollow && <polygon className="pd-cube__base" points={BASE} />}
      <g className="pd-cube__faces">
        <polygon className="pd-cube__l" points={LEFT} />
        <polygon className="pd-cube__r" points={RIGHT} />
        <polygon className="pd-cube__t" points={TOP} />
        {!hollow && <polygon className="pd-cube__done" points={TOP} />}
        {icon && !hollow ? <g className="pd-cube__ico" transform={ON_LEFT}>{ICONS[icon]}</g> : null}
      </g>
    </svg>
  );
}
