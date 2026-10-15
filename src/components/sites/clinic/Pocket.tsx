/*
 * The first screen's 3D pocket (only with the calculator's «3D-обʼєкт»): a porcelain shade guide, seven tabs fanned on a
 * steel rivet (ShadeGuide.tsx, React Three Fiber, loaded only here). Without WebGL, with Save-Data or little memory, and
 * with reduced motion: an inline SVG still of the open fan (no WebGL context at all). One context at a time: while the
 * page before this one is still fading out with its own fan, the new one waits for it to leave.
 * The pocket carries [data-obj]: the frame glides to it when 3D is switched on (the engine parks its own, hidden, object
 * there).
 */
import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { useEnv } from "./env";

const ShadeGuide = lazy(() => import("./ShadeGuide"));

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() {
    return { err: true };
  }
  render() {
    return this.state.err ? this.props.fallback : this.props.children;
  }
}

function canGL() {
  if (typeof window === "undefined" || typeof WebGL2RenderingContext === "undefined") return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData === true) return false;
  return !(nav.deviceMemory != null && nav.deviceMemory <= 2);
}

/* ---------- the still: the open fan in SVG (the tab outline of the 3D, its gradient, a white edge) ---------- */
const TAB = (() => {
  // the incisor-crown outline (height 1, width .72) in a 100-unit box: x × 64, y up from the neck
  const P = (x: number, y: number) => `${(x * 64).toFixed(1)} ${(-y * 64).toFixed(1)}`;
  return `M${P(-0.26, 0)}C${P(-0.3, 0.25)} ${P(-0.37, 0.55)} ${P(-0.36, 0.86)}Q${P(-0.355, 0.98)} ${P(-0.26, 1)}C${P(-0.08, 1.03)} ${P(0.12, 1.03)} ${P(0.24, 0.99)}Q${P(0.36, 0.95)} ${P(0.35, 0.8)}C${P(0.36, 0.52)} ${P(0.3, 0.24)} ${P(0.25, 0)}Q${P(0, -0.07)} ${P(-0.26, 0)}Z`;
})();
const SHADES = ["#F7F5EF", "#F4F0E6", "#F1EBDD", "#EEE6D5", "#EBE1CF", "#E8DECB", "#E6DCC8"];

export function ShadeStill() {
  return (
    <svg className="cl-still" viewBox="0 0 220 200" aria-hidden="true">
      <defs>
        <linearGradient id="clTabG" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".6" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#c9b892" stopOpacity=".18" />
        </linearGradient>
      </defs>
      <g transform="translate(110 186)">
        {SHADES.map((c, i) => {
          const a = (i - 3) * 11;
          return (
            <g key={c} transform={`rotate(${a})`}>
              <path d="M0 0V-82" stroke="#C9CED0" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M-3.2 -78h6.4v-5h-6.4z" fill="#B9C0C3" />
              <g transform="translate(0 -82)">
                <path d={TAB} fill={c} stroke="#fff" strokeWidth="1.1" />
                <path d={TAB} fill="url(#clTabG)" />
              </g>
            </g>
          );
        })}
        <ellipse cx="0" cy="0" rx="7" ry="6" fill="#F3F1EA" stroke="#fff" strokeWidth="1" />
        <circle cx="0" cy="0" r="2" fill="#C9CED0" />
      </g>
    </svg>
  );
}

export function Pocket() {
  const { three, rm, vp } = useEnv();
  const [gl] = useState(canGL);
  // the page before (a crossfade) may still hold its own fan: wait until it has left
  const [free, setFree] = useState(() => !vp.querySelector(".pv-site--old .cl-gl"));
  useEffect(() => {
    if (free) return;
    let t = 0;
    const check = () => {
      if (!vp.querySelector(".pv-site--old .cl-gl")) setFree(true);
      else t = window.setTimeout(check, 120);
    };
    t = window.setTimeout(check, 120);
    return () => clearTimeout(t);
  }, [free, vp]);
  if (!three) return null;
  const still = <ShadeStill />;
  return (
    <div className="cl-pocket">
      <i className="cl-pocket__pool" aria-hidden="true" />
      <div className="cl-pocket__obj" data-obj />
      {gl && !rm ? (
        free ? (
          <Boundary fallback={still}>
            <Suspense fallback={null}>
              <ShadeGuide vp={vp} />
            </Suspense>
          </Boundary>
        ) : null
      ) : (
        still
      )}
    </div>
  );
}
