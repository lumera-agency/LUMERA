/* eslint-disable @next/next/no-img-element -- the sample's own photos inside the frame (fixed boxes, no next/image) */
/*
 * The shop sample's shared parts: the English twin (Lx), the heading in line masks, the ink and ghost buttons, the text
 * link, the swatch, the photo with its colour wipe, the rolling number, the loading button, the number field, icons.
 *
 * Rebuilt here from the public demos (behaviour only, no code taken):
 *   Underline Animation · Daniel Petho · MIT · 21st.dev/@danielpetho/components/underline-animation — <ULink>: the line
 *     leaves to the right and draws back in from the left on hover (nav: it draws in from the left, leaves to the right).
 *   Sliding Number · Motion Primitives (Julien Thibeaut, ibelick) · MIT · 21st.dev/@ibelick/components/sliding-number —
 *     <Roll>: each digit is a column 0–9 that slides to its value (CSS transform), units keep their place.
 *   Loading Button · UI Beats (nikhils4) · MIT · uibeats.com/docs — <LoadBtn>: label → spinner → tick (and back, or it
 *     stays: «Замовлення прийнято»); the box keeps its width.
 *   Number Field · Mohammad Shehadeh · MIT · 21st.dev/@mohammadshehadeh/components/number-field — <NumberField>.
 * Ported from React Bits (reactbits.dev, David Haz; licence below):
 *   SplitText — <Lines>: each line rises out of its own mask, 80 ms apart (CSS transitions, once, on entering).
 *
 * ---------------------------------------------------------------------------------------------------------
 * MIT + Commons Clause License Condition v1.0
 *
 * Copyright (c) 2026 David Haz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * ## Commons Clause Restriction
 *
 * You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**
 *
 * ## No Warranty
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * ---------------------------------------------------------------------------------------------------------
 */
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { PH, useEnv } from "./env";
import { SW, type Col, type Shot } from "./products";

export type Css = CSSProperties & Record<`--${string}`, string | number>;

/* ---------- icons (1.5 px strokes, square ends) ---------- */
const Ico = ({ d, className = "sh-ico" }: { d: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);
export const Arrow = ({ className }: { className?: string }) => <Ico className={`sh-ico sh-ar ${className || ""}`} d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" />;
export const Up = () => <Ico d="M12 19.5v-15M6.5 10 12 4.5l5.5 5.5" />;
export const Chev = () => <Ico className="sh-ico sh-chev" d="m7 10 5 5 5-5" />;
export const Plus = () => <Ico d="M12 5.5v13M5.5 12h13" />;
export const Minus = () => <Ico d="M5.5 12h13" />;
export const Close = () => <Ico d="M6.5 6.5l11 11M17.5 6.5l-11 11" />;
export const SearchIco = () => <Ico d="M10.5 17.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM15.6 15.6 20.5 20.5" />;
export const Tick = ({ className = "sh-tick" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path pathLength={1} d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const SOC = [
  "M4.5 4.5h15v15h-15zM12 15.6a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2zM16.9 7.1h.01",
  "M20.5 4.5 3.5 11.2l5.6 2 2 5.8 3-3.6 4.6 3.4z",
  "M14 21v-8h3l.5-3.5H14V7.8c0-1 .3-1.8 1.8-1.8h1.8V3a24 24 0 0 0-2.6-.1c-2.6 0-4.4 1.6-4.4 4.5v2.1h-3V13h3v8",
] as const;
export { Ico };

/** a line and its English twin in one cell: «Друга мова» flips them (the frame's .pv-lx), nothing moves */
export function Lx({ a, b }: { a: ReactNode; b?: ReactNode | null }) {
  if (b == null) return <>{a}</>;
  return (
    <span className="pv-lx">
      <span className="pv-lx__a">{a}</span>
      <span className="pv-lx__b" lang="en">
        {b}
      </span>
    </span>
  );
}

/** SplitText: a heading set in line masks; each line rises once as its block enters */
export function Lines({ lines, en, as: Tag = "h2", className = "", children }: { lines: readonly string[]; en?: readonly string[] | null; as?: "h1" | "h2" | "p"; className?: string; children?: ReactNode }) {
  return (
    <Tag className={`sh-lines ${className}`}>
      {lines.map((l, i) => (
        <span key={i} className="sh-ln">
          <span className="sh-ln__i" style={{ "--i": i } as Css}>
            <Lx a={l} b={en?.[i]} />
            {i === lines.length - 1 ? children : null}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** the ink button (filled) or the ghost (1 px ink border); square */
export function Btn({ children, ghost = false, onClick, className = "", arrow = false }: { children: ReactNode; ghost?: boolean; onClick?: (e: MouseEvent) => void; className?: string; arrow?: boolean }) {
  return (
    <span className={`sh-btn${ghost ? " sh-btn--ghost" : ""} ${className}`} onClick={onClick}>
      <span className="sh-btn__t">
        {children}
        {arrow ? <Arrow /> : null}
      </span>
    </span>
  );
}

/** Underline Animation: a text link */
export function ULink({ children, onClick, arrow = false, className = "" }: { children: ReactNode; onClick?: (e: MouseEvent) => void; arrow?: boolean; className?: string }) {
  return (
    <span className={`sh-ul ${className}`} onClick={onClick}>
      <span className="sh-ul__t">{children}</span>
      {arrow ? <Arrow /> : null}
    </span>
  );
}

/** a glass swatch: the only colour in the interface */
export function Swatch({ c, on = false, onClick, onEnter, className = "", title }: { c: Col; on?: boolean; onClick?: (e: MouseEvent) => void; onEnter?: () => void; className?: string; title?: string }) {
  const [a, b] = SW[c];
  return (
    <span className={`sh-sw${on ? " is-on" : ""} ${className}`} style={{ "--a": a, "--b": b } as Css} onClick={onClick} onPointerEnter={onEnter} title={title} data-col={c}>
      <i />
    </span>
  );
}

export const srcOf = (k: string, phone: boolean) => `${PH}${phone ? "m/" : ""}${k}.jpg`;

/** a photo as a <img> with its focus and zoom */
export function Pic({ shot, className = "", eager = false }: { shot: Shot; className?: string; eager?: boolean }) {
  const { phone } = useEnv();
  const st: Css = { objectPosition: shot.f || "50% 50%" };
  if (shot.z) {
    st.transform = `scale(${shot.z})`;
    st.transformOrigin = shot.f || "50% 50%";
  }
  return (
    <img
      className={`sh-img${shot.mul ? " sh-img--mul" : ""} ${className}`}
      src={srcOf(shot.k, phone)}
      alt=""
      decoding="async"
      draggable={false}
      loading={phone && !eager ? "lazy" : undefined}
      style={st}
    />
  );
}

const shotKey = (s: Shot) => `${s.k}|${s.f || ""}|${s.z || ""}`;

/**
 * The colour wipe: a new photo comes up over the old one (its wrapper rises 100 → 0 % while the image inside goes
 * −100 → 0 %, so the picture itself stays put while it is uncovered), .7 s; reduced motion swaps at once.
 */
export function Wipe({ shot, className = "", eager = false }: { shot: Shot; className?: string; eager?: boolean }) {
  const k = shotKey(shot);
  // (the layer below keeps its element: the photo it shows is never decoded again)
  const [st, setSt] = useState({ k, layers: [{ id: 0, shot }] });
  if (st.k !== k) {
    const last = st.layers[st.layers.length - 1];
    setSt({ k, layers: [last, { id: last.id + 1, shot }] });
  }
  return (
    <span className={`sh-wipe ${className}`}>
      {st.layers.map((l, i) => (
        <span key={l.id} className={`sh-wipe__l${l.id && i === st.layers.length - 1 ? " is-new" : ""}`}>
          <span className="sh-wipe__i">
            <Pic shot={l.shot} eager={eager} />
          </span>
        </span>
      ))}
    </span>
  );
}

/** Sliding Number: digits roll to their value; the rest of the string stays (₴, spaces, brackets) */
export function Roll({ v, className = "" }: { v: string | number; className?: string }) {
  const s = String(v);
  const ch = [...s];
  return (
    <span className={`sh-roll ${className}`}>
      {ch.map((c, i) => {
        const k = ch.length - i;
        if (!/\d/.test(c)) return <span key={`c${k}`}>{c}</span>;
        return (
          <span key={`d${k}`} className="sh-roll__d">
            <span className="sh-roll__g">{c}</span>
            <span className="sh-roll__col" style={{ transform: `translateY(${-Number(c) * 10}%)` }} aria-hidden="true">
              {"0123456789".split("").map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

/**
 * Loading Button: the label gives way to a spinner (650 ms), then a tick with «done» (it goes back after 1.4 s, or stays);
 * the action runs when the tick shows.
 */
export function LoadBtn({
  children,
  done,
  action,
  ghost = false,
  stay = false,
  className = "",
  stop = true,
}: {
  children: ReactNode;
  done: ReactNode;
  action: () => void;
  ghost?: boolean;
  stay?: boolean;
  className?: string;
  stop?: boolean;
}) {
  const { rm } = useEnv();
  const [st, setSt] = useState<"idle" | "busy" | "done">("idle");
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const click = (e: MouseEvent) => {
    if (stop) e.stopPropagation();
    if (st !== "idle") return;
    setSt("busy");
    timers.current.push(
      window.setTimeout(
        () => {
          action();
          setSt("done");
          if (!stay) timers.current.push(window.setTimeout(() => setSt("idle"), 1400));
        },
        rm ? 0 : 650,
      ),
    );
  };
  return (
    <span className={`sh-btn sh-lb${ghost ? " sh-btn--ghost" : ""} is-${st} ${className}`} onClick={click}>
      <span className="sh-btn__t sh-lb__a">{children}</span>
      <span className="sh-lb__s" aria-hidden="true">
        <i />
      </span>
      <span className="sh-lb__d">
        <Tick />
        {done}
      </span>
    </span>
  );
}

/** Number Field: − n +, 1 to 9 */
export function NumberField({ n, set, className = "" }: { n: number; set: (n: number) => void; className?: string }) {
  return (
    <span className={`sh-num ${className}`}>
      <span className={`sh-num__b${n <= 1 ? " is-off" : ""}`} onClick={() => set(Math.max(1, n - 1))}>
        <Minus />
      </span>
      <b>
        <Roll v={n} />
      </b>
      <span className={`sh-num__b${n >= 9 ? " is-off" : ""}`} onClick={() => set(Math.min(9, n + 1))}>
        <Plus />
      </span>
    </span>
  );
}

/** the photo's entrance: a white curtain lifts off (translateY −101 %) while the image settles 1.06 → 1 */
export const Curtain = () => <i className="sh-cur" aria-hidden="true" />;
