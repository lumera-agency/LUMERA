import { Fragment } from "react";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/**
 * (21st.dev's Animated Text, «useAnimatedText»: a text streams in, character by character or word by word, its cursor
 * on an ease-out) rebuilt for the page without framer-motion and without re-rendering: the text is split on the server
 * and every unit already takes its place, so nothing reflows (CLS 0); each unit only fades in at its own moment (CSS,
 * pb.css «pb-tw»: from the first paint, paused under the page curtain, the final frame with reduced motion).
 *
 * The moments follow the component's cursor, `floor(n * easeOut(t / T))`: unit `i` of `n` shows at
 * `T * (1 - sqrt(1 - i / n))` (framer-motion's easeOut taken as a quadratic ease-out), fast at first, then slowing.
 */
const at = (i: number, n: number, start: number, ms: number) => `${Math.round(start + ms * (1 - Math.sqrt(1 - i / n)))}ms`;

const unit = (node: React.ReactNode, key: string, t: string) => (
  <span className="pb-tw" key={key} style={{ "--t": t } as CSSVars}>
    {node}
  </span>
);

/** a plain text, character by character (spaces stay plain, so the lines break where they would) */
export function streamChars(text: string, start: number, ms: number): React.ReactNode[] {
  const chars = [...text];
  const n = chars.length;
  return chars.map((c, i) => (c === " " ? " " : unit(c, `c${i}`, at(i, n, start, ms))));
}

/** a message's rich output (t.rich), word by word: a tag's element (a link, a no-break word) is one unit */
export function streamWords(nodes: React.ReactNode, start: number, ms: number): React.ReactNode[] {
  const flat: React.ReactNode[] = [];
  const walk = (node: React.ReactNode) => (Array.isArray(node) ? node.forEach(walk) : flat.push(node));
  walk(nodes);
  const units: React.ReactNode[] = [];
  for (const node of flat) {
    if (typeof node === "string") {
      node.split(" ").forEach((w, k) => {
        if (k) units.push(" ");
        if (w) units.push(w);
      });
    } else if (node !== null && node !== undefined && node !== false && node !== true) {
      units.push(node);
    }
  }
  const n = units.filter((u) => u !== " ").length;
  let i = 0;
  return units.map((u, k) => (u === " " ? " " : <Fragment key={k}>{unit(u, `w${k}`, at(i++, n, start, ms))}</Fragment>));
}
