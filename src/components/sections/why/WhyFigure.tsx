/* eslint-disable @next/next/no-img-element -- the stone is the site's own still (img/stone.webp), the same file that masks its light in why-contour.css */
/*
 * The contour's drawing (decorative, computers only: the list beside it says it all): a tall capsule in a 760 × 780
 * field, the way from node 1 up its left side, over the top and down its right side through nodes 2, 3, 4, the dashed
 * return round its foot back up into node 1; the stone inside it, on its stand under a lamp. From each node a line
 * leads to its step's words. The motion is why-contour-fx.css.
 */

/** the way 1 → 4, and the return 4 → 1 (together: the loop the light goes round) */
const MAIN = "M80 380V170A100 100 0 0 1 280 170V510";
const BACK = "M280 510V590A100 100 0 0 1 80 590V380";
const LOOP = MAIN + BACK.replace(/^M[\d. ]+/, "");
/** how many tails the light draws behind it */
const TAILS = 4;

/** a node: two rings that leave it, its disc and number, the same lit */
const node = (x: number, y: number, n: number) => {
  const r = n === 1 ? 21 : 17;
  return (
    <g className={n === 1 ? "wv-node wv-node--1" : "wv-node"} data-n={n} transform={`translate(${x} ${y})`}>
      <circle className="wv-node__ping" r={r} />
      <circle className="wv-node__ping wv-node__ping--2" r={r} />
      <g className="wv-node__in">
        <circle className="wv-node__halo" r={r + 10} />
        <circle className="wv-node__ring" r={r} />
        <text className="wv-node__n" y="4.5" textAnchor="middle">{n}</text>
        <g className="wv-node__lit">
          <circle r={r} />
          <text y="4.5" textAnchor="middle">{n}</text>
        </g>
      </g>
    </g>
  );
};

export function WhyFigure() {
  return (
    <div className="wv__fig" aria-hidden="true">
      <div className="wv__art">
        <i className="wv__aura" />
        <i className="wv__cone" />
        <svg viewBox="0 0 760 780" focusable="false">
          <defs>
            {/* the return is dashed: it is drawn through a mask that the same path uncovers */}
            <mask id="wv-back" maskUnits="userSpaceOnUse" x="-60" y="-60" width="900" height="900">
              <path className="wv-mask" d={BACK} pathLength={1} />
            </mask>
          </defs>
          <path className="wv-l wv-l--tube" d={LOOP} />
          <path className="wv-l wv-l--edge" d="M65 170A115 115 0 0 1 295 170V590A115 115 0 0 1 65 590Z" />
          <path className="wv-l wv-l--edge" d="M95 170A85 85 0 0 1 265 170V590A85 85 0 0 1 95 590Z" />
          <path className="wv-l wv-l--ruler" d="M313 170V590M47 170V590" />
          <ellipse className="wv-l wv-l--ped" cx="180" cy="486" rx="66" ry="13" />
          <ellipse className="wv-l wv-l--ped wv-l--ped2" cx="180" cy="486" rx="44" ry="8.5" />
          <path className="wv-l wv-l--join" d="M59 380H-34" />
          <path className="wv-pulse" pathLength={1} d="M59 380H-34" />
          <path className="wv-l wv-l--halo" pathLength={1} d={MAIN} />
          <path className="wv-l wv-l--main" pathLength={1} d={MAIN} />
          <path className="wv-l wv-l--back" d={BACK} mask="url(#wv-back)" />
          <path className="wv-l wv-l--arrow" d="M72 421l8-12 8 12" />
          <path className="wv-l wv-l--lead" d="M297 170H368M297 340H368M297 510H368" />
          <path className="wv-l wv-l--lead wv-l--lead-back" d="M251 661H368" />
          <circle className="wv-spark" cx="80" cy="250" r="4" />
          {Array.from({ length: TAILS }, (_, k) => (
            <path className="wv-run wv-run--tail" data-k={k} d={LOOP} pathLength={1} key={k} />
          ))}
          <path className="wv-run wv-run--glow" d={LOOP} pathLength={1} />
          <path className="wv-run wv-run--dot" d={LOOP} pathLength={1} />
          {node(80, 380, 1)}
          {node(280, 170, 2)}
          {node(280, 340, 3)}
          {node(280, 510, 4)}
        </svg>
        {/* the stone: its ground light under it, the light of the passing runner on its face (masked by its own shape) */}
        <div className="wv__rock">
          <div className="wv__rock-in">
            <i className="wv__pool" />
            <img className="wv__stone" src="/img/stone.webp" width={520} height={626} alt="" loading="lazy" decoding="async" />
            <i className="wv__shine">
              <i />
            </i>
          </div>
        </div>
      </div>
    </div>
  );
}
