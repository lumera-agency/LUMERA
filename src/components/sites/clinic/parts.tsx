/* eslint-disable @next/next/no-img-element -- the sample's own photos inside the frame (fixed boxes, no next/image) */
/*
 * The clinic sample's shared parts: the button, the text link, the kicker, «Дані умовні», the headings set in line masks,
 * the photos with their curtain, the counting numbers, the section rail, the inner pages' head, the closing band.
 *
 * Rebuilt here from the public demos (behaviour only, no code taken):
 *   FlowButton · Kain Xu · MIT · 21st.dev/@xubohuah/components/flow-button — <Btn>: a rectangle with a square glaze arrow
 *     tile; on hover the fill sweeps in (scaleX) while the arrow leaves on the right and its twin comes in on the left.
 *   Underline Animation · Daniel Petho · MIT · 21st.dev/@danielpetho/components/underline-animation — <ULink>: the line
 *     draws in from the left on hover and leaves to the right.
 * Ported from React Bits (reactbits.dev, David Haz; licence below):
 *   SplitText — <SplitHeading>: each line rises out of its own mask, 70 ms apart (CSS transitions, once, on entering);
 *   CountUp — <CountUp>: the number counts up once as its block enters (GSAP, tabular figures in a fixed cell).
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
import { useRef, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import type { PhotoKey } from "./copy";
import { PH, two, useEnv, useIn, type Target } from "./env";

type Css = CSSProperties & Record<`--${string}`, string | number>;

export const Arrow = ({ className = "cl-ar" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" />
  </svg>
);
export const Tick = ({ className = "cl-tick" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path pathLength={1} d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

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

/** FlowButton: dark (petrol) or light (white), with the glaze arrow tile */
export function Btn({ variant = "dark", children, onClick, className = "" }: { variant?: "dark" | "light"; children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <span className={`cl-btn cl-btn--${variant} ${className}`} onClick={onClick}>
      <i className="cl-btn__fill" aria-hidden="true" />
      <span className="cl-btn__t">{children}</span>
      <span className="cl-btn__sq" aria-hidden="true">
        <Arrow className="cl-ar cl-ar--out" />
        <Arrow className="cl-ar cl-ar--in" />
      </span>
    </span>
  );
}

/** a text link whose underline draws on hover */
export function ULink({ children, onClick, className = "" }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <span className={`cl-ul ${className}`} onClick={onClick}>
      <span className="cl-ul__t">{children}</span>
      <Arrow />
      <i className="cl-ul__l" aria-hidden="true" />
    </span>
  );
}

export const Kicker = ({ n, children }: { n: number; children: ReactNode }) => (
  <span className="cl-kick">
    <b>({two(n)})</b>
    <span>{children}</span>
  </span>
);

export function Cond() {
  const { W } = useEnv();
  return <span className="cl-cond">{W.cond}</span>;
}

/**
 * A heading in line masks (SplitText): parts, one of them (key) in the italic serif. block: every part on its own line;
 * else the parts run on and wrap. en: the parts' English twins.
 */
export function SplitHeading({
  as: Tag = "h2",
  parts,
  keyIndex = -1,
  en,
  block = false,
  className = "",
}: {
  as?: "h1" | "h2" | "p";
  parts: readonly string[];
  keyIndex?: number;
  en?: readonly string[] | null;
  block?: boolean;
  className?: string;
}) {
  return (
    <Tag className={`cl-split${block ? " cl-split--blk" : ""} ${className}`}>
      {parts.map((p, i) => (
        <span key={i}>
          <span className={`cl-ln${i === keyIndex ? " cl-ln--key" : ""}`} style={{ "--i": i } as Css}>
            <span className="cl-ln__i">{i === keyIndex ? <em className="cl-key"><Lx a={p} b={en?.[i]} /></em> : <Lx a={p} b={en?.[i]} />}</span>
          </span>
          {i < parts.length - 1 && !block ? " " : null}
        </span>
      ))}
    </Tag>
  );
}

/** a photo: the phone loads its 640-px copy; a petrol curtain leaves it as its block enters, the image settling 1.1 → 1 */
export function Photo({ k, focus, className = "", eager = false }: { k: PhotoKey; focus?: string; className?: string; eager?: boolean }) {
  const { phone } = useEnv();
  return (
    <figure className={`cl-ph ${className}`}>
      <img
        src={`${PH}${phone ? "m/" : ""}${k}.jpg`}
        alt=""
        decoding="async"
        loading={phone && !eager ? "lazy" : undefined}
        style={focus ? { objectPosition: focus } : undefined}
      />
      <i className="cl-ph__cur" aria-hidden="true" />
    </figure>
  );
}

/** CountUp: the number counts from `from` up to its value once, as its block enters; reduced motion shows the value */
export function CountUp({ to, from = 0, delay = 0.25 }: { to: string; from?: number; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useIn(ref, ({ animate, delay: d0 }) => {
    const el = ref.current;
    if (!el || !animate) return;
    const end = parseInt(to, 10);
    const st = { v: from };
    el.textContent = String(from);
    gsap.to(st, {
      v: end,
      duration: 1.6,
      delay: delay + d0 / 1000,
      ease: "expo.out",
      onUpdate: () => {
        el.textContent = String(Math.round(st.v));
      },
    });
  });
  return (
    <span className="cl-count" style={{ "--w": `${to.length}ch` } as Css} ref={ref}>
      {to}
    </span>
  );
}

/** the section's rail: c1–c3 the index and the kicker, c4–c12 the heading and its lead */
export function Rail({ n, k, h, keyIndex = 1, lead, aside }: { n: number; k: string; h: readonly string[]; keyIndex?: number; lead?: string; aside?: ReactNode }) {
  return (
    <div className="cl-rail cl-grid">
      <div className="cl-rail__k" data-rv>
        <Kicker n={n}>{k}</Kicker>
      </div>
      <div className="cl-rail__b">
        <SplitHeading parts={h} keyIndex={keyIndex} />
        {lead || aside ? (
          <div className="cl-rail__lead" data-rv>
            {lead ? <p className="cl-lead">{lead}</p> : null}
            {aside}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** an inner page's head: the path, «0N / 04», the title, a mono list with «Дані умовні», the letterbox photo */
export function PageHead({ h, meta, photo, focus }: { h: readonly string[]; meta: readonly string[]; photo: PhotoKey; focus: string }) {
  const { page, tabs, E, go } = useEnv();
  return (
    <section className="cl-phead" data-sec>
      <div className="cl-grid">
        <div className="cl-phead__crumb cl-label" data-rv>
          <span className="cl-phead__home" onClick={() => go(0)}>
            {tabs[0]}
          </span>
          <i>/</i>
          <b>{tabs[page]}</b>
        </div>
        <div className="cl-phead__no cl-label" data-rv>
          {two(page + 1)} / {two(tabs.length)}
        </div>
        <SplitHeading as="h1" className="cl-phead__h" parts={h} keyIndex={1} en={E ? E.heads[page - 1] : null} />
        <ul className="cl-phead__meta cl-label" data-rv>
          {meta.map((m) => (
            <li key={m}>{m}</li>
          ))}
          <li>
            <Cond />
          </li>
        </ul>
      </div>
      <Photo k={photo} focus={focus} className="cl-phead__ph" eager />
    </section>
  );
}

/** the closing band: a petrol panel, the line and the light button */
export function Band({ parts, btn, to, anc }: { parts: readonly string[]; btn: string; to: [number, Target?]; anc?: string }) {
  const { go } = useEnv();
  return (
    <section className="cl-band" data-sec data-anc={anc}>
      <div className="cl-band__in cl-grid">
        <i className="cl-grain" aria-hidden="true" />
        <SplitHeading as="p" className="cl-band__h" parts={parts} keyIndex={1} />
        <div className="cl-band__a" data-rv>
          <Btn variant="light" onClick={() => go(...to)}>
            {btn}
          </Btn>
        </div>
      </div>
    </section>
  );
}

/** «● Зараз відчинено» / «Зараз зачинено»: the only pill */
export function Status({ dark = false }: { dark?: boolean }) {
  const { W, clock } = useEnv();
  return (
    <span className={`cl-status${clock.open ? " is-open" : ""}${dark ? " cl-status--d" : ""}`}>
      <i aria-hidden="true" />
      {clock.open ? W.contacts.open : W.closed}
    </span>
  );
}

/** the week's hours, today's row in bone */
export function Hours({ dark = false }: { dark?: boolean }) {
  const { W, clock } = useEnv();
  return (
    <ul className={`cl-hours${dark ? " cl-hours--d" : ""}`}>
      {W.contacts.week.map(([d, h], i) => (
        <li key={d} className={i === clock.todayRow ? "is-today" : undefined}>
          <span>
            {d}
            {i === clock.todayRow ? <em>{W.contacts.today}</em> : null}
          </span>
          <b>{h}</b>
        </li>
      ))}
    </ul>
  );
}
