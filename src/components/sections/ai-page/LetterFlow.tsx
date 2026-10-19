"use client";
/*
 * 2 · Як це працює: one letter's way through the program, as a live scheme (owner, 2026-10-15: block 2 better, on
 * React only). Four nodes — the letter, AI, the table, Telegram — joined by a wire a spark runs along (21st.dev's
 * Animated Beam); on phones the wire stands up and fills as the page scrolls (Aceternity's scroll timeline). Under
 * each node what happens there, after React Bits' agent micro-interactions: the AI «thinks» with a running clock
 * (Thought Line) and decodes the name, the budget and the date out of noise (Decrypted Text); the table's call fills
 * and ticks (Call Chip), then the new row slides in (Animated List); the manager's message drops in with a fuse
 * (Swipe Toast) and the call to Olena follows.
 *
 * GSAP (lib/gsap) on transform, opacity and text: once as the block comes into view (wide screens) or step by step
 * as the wire reaches each one (phones), again with «↻ Ще раз»; nothing runs at rest. Reduced motion: the final
 * frame. The markup is the final frame, so the page reads the same without the script.
 */
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import "./letter-flow.css";

if (typeof window !== "undefined") gsap.registerPlugin(ScrambleTextPlugin);

export type FlowCopy = {
  steps: { who: string; text: string; kind: "person" | "sys" }[];
  node: { mail: string; ai: string; table: string; tg: string };
  from: string;
  body: string;
  fields: { k: string; v: string }[];
  reading: string;
  read: string;
  writing: string;
  written: string;
  tgTitle: string;
  tgBody: string;
  now: string;
  call: string;
  sample: string;
  replay: string;
  replayLabel: string;
};

const CHARS = "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЮЯ0123456789";
const sec = (v: number) => `${v.toFixed(1).replace(".", ",")} с`;

const ICONS = {
  mail: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4.5 7 7.5 6 7.5-6" /></svg>
  ),
  ai: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.5l-1.9-5.7L4.5 10.9 10.1 9z" /><path d="M18.5 3.5v3M17 5h3" /></svg>
  ),
  table: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="4" y="4.5" width="16" height="15" rx="2" /><path d="M4 9.5h16M4 14.5h16M10 4.5v15" /></svg>
  ),
  tg: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M21 3 3 10.5l7 2.5 2.5 7z" /><path d="m10 13 4.5-4.5" /></svg>
  ),
};

export function LetterFlow({ copy }: { copy: FlowCopy }) {
  const root = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0); // «↻ Ще раз»: a new run of the whole scheme
  const keys = ["mail", "ai", "table", "tg"] as const;

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      mm.add(
        { wide: "(min-width: 861px)", narrow: "(max-width: 860px)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const { wide, reduce } = ctx.conditions as { wide: boolean; narrow: boolean; reduce: boolean };
          if (reduce) return;
          const replay = q(".flow__replay")[0];
          const clock = q(".flow__clock")[0];
          const ms = q(".flow__ms")[0];
          const values = q(".flow__v");

          // each step's own little scene
          const scene = (i: number) => {
            const step = q(".flow__step")[i];
            const s = gsap.utils.selector(step);
            const tl = gsap.timeline();
            tl.fromTo(s(".flow__node"), { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: "back.out(2)" })
              .fromTo(s(".flow__ring"), { scale: 0.6, opacity: 0.9 }, { scale: 1.9, opacity: 0, duration: 0.9, ease: "power2.out" }, "<0.1")
              .fromTo(s(".flow__cap"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, "<");
            if (i === 0) {
              // the letter drops in
              tl.fromTo(s(".flow__card"), { opacity: 0, y: -22, rotate: -3 }, { opacity: 1, y: 0, rotate: 0, duration: 0.8, ease: "expo.out" }, "<0.05");
            }
            if (i === 1) {
              // the AI reads: a running clock, then the three fields come out of noise one by one
              const t = { v: 0 };
              tl.fromTo(s(".flow__card"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }, "<0.05")
                .set(s(".flow__think"), { attr: { "data-state": "busy" } }, "<")
                .fromTo(s(".flow__spark-ico"), { rotate: 0 }, { rotate: 360, duration: 1.4, ease: "none" }, "<")
                .to(t, { v: 1.2, duration: 1.4, ease: "none", onUpdate: () => void (clock.textContent = sec(t.v)) }, "<");
              values.forEach((v, n) => {
                tl.fromTo(v, { opacity: 0.35 }, { opacity: 1, duration: 0.2 }, 0.75 + n * 0.32).to(
                  v,
                  { duration: 0.55, scrambleText: { text: v.dataset.text ?? "", chars: CHARS, speed: 0.6, revealDelay: 0.15 } },
                  "<",
                );
                tl.fromTo(s(".flow__mark")[n], { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power2.out" }, "<0.4");
              });
              tl.set(s(".flow__think"), { attr: { "data-state": "done" } });
            }
            if (i === 2) {
              // the table's call fills with its own clock and ticks; then the new row slides in
              const t = { v: 0 };
              tl.fromTo(s(".flow__card"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }, "<0.05")
                .set(s(".flow__chip"), { attr: { "data-state": "busy" } }, "<")
                .fromTo(s(".flow__chip-fill"), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power1.inOut" }, "<0.2")
                .to(t, { v: 340, duration: 0.9, ease: "power1.inOut", onUpdate: () => void (ms.textContent = `${Math.round(t.v)} мс`) }, "<")
                .set(s(".flow__chip"), { attr: { "data-state": "done" } })
                .fromTo(s(".flow__row--new"), { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.55, ease: "back.out(1.6)" })
                .fromTo(s(".flow__row-bar"), { scaleY: 0 }, { scaleY: 1, duration: 0.3, ease: "power2.out" }, "<0.15");
            }
            if (i === 3) {
              // the manager's message drops in, its fuse burns down; the call to Olena follows
              tl.fromTo(s(".flow__card"), { opacity: 0 }, { opacity: 1, duration: 0.3 }, "<0.05")
                .fromTo(s(".flow__toast"), { opacity: 0, y: -26, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: "back.out(1.5)" }, "<")
                .fromTo(s(".flow__fuse"), { scaleX: 1 }, { scaleX: 0, duration: 2.2, ease: "none" }, "<0.4")
                .fromTo(s(".flow__call"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, "<0.5")
                .fromTo(s(".flow__call svg"), { rotate: -14 }, { rotate: 14, duration: 0.09, repeat: 7, yoyo: true, ease: "sine.inOut" }, "<0.2")
                .set(s(".flow__call svg"), { rotate: 0 });
            }
            return tl;
          };

          // the wire from step i to the next: it fills, a spark runs ahead of the fill
          const wire = (i: number, along: "x" | "y") => {
            const step = q(".flow__step")[i];
            const s = gsap.utils.selector(step);
            const fill = s(".flow__fill");
            const spark = s(".flow__spark");
            const line = s(".flow__wire")[0] as HTMLElement;
            const tl = gsap.timeline();
            // the spark moves by transform (no layout work while it runs): from the wire's start to its end
            tl.fromTo(fill, along === "x" ? { scaleX: 0 } : { scaleY: 0 }, { ...(along === "x" ? { scaleX: 1 } : { scaleY: 1 }), duration: 0.7, ease: "power2.inOut" })
              .fromTo(spark, { opacity: 0, [along]: 0 }, { opacity: 1, [along]: () => (along === "x" ? line.offsetWidth : line.offsetHeight), duration: 0.7, ease: "power2.inOut" }, "<")
              .to(spark, { opacity: 0, duration: 0.2 });
            return tl;
          };

          // every part starts hidden (the start frame); the markup itself is the final frame
          gsap.set(q(".flow__node, .flow__cap, .flow__card, .flow__call, .flow__row--new"), { opacity: 0 });
          gsap.set(q(".flow__fill"), wide ? { scaleX: 0 } : { scaleY: 0 });
          gsap.set(q(".flow__mark, .flow__chip-fill"), { scaleX: 0 });
          // the texts the scenes write over: put back when this run is undone (a width change, a replay)
          const texts = [...values, clock, ms].map((node) => [node, node.textContent] as const);
          values.forEach((v) => (v.textContent = "· · ·"));
          clock.textContent = sec(0);
          ms.textContent = "0 мс";

          if (wide) {
            // one run, left to right, as the block comes into view
            const master = gsap.timeline({ paused: true, onComplete: () => replay?.classList.add("is-on") });
            master.add(scene(0)).add(wire(0, "x"), "-=0.2").add(scene(1), "-=0.15").add(wire(1, "x"), "-=0.1").add(scene(2), "-=0.15").add(wire(2, "x"), "-=0.1").add(scene(3), "-=0.15");
            if (run) master.play();
            else ScrollTrigger.create({ trigger: el, start: "top 72%", once: true, onEnter: () => void master.play() });
          } else {
            // phones: each step plays as it comes up; the wire below it fills with the scroll
            const steps = q(".flow__step");
            steps.forEach((step, i) => {
              const tl = scene(i).pause();
              if (run) gsap.delayedCall(i * 0.9, () => void tl.play());
              else ScrollTrigger.create({ trigger: step, start: "top 78%", once: true, onEnter: () => void tl.play() });
              if (i < steps.length - 1) {
                gsap.fromTo(
                  gsap.utils.selector(step)(".flow__fill"),
                  { scaleY: 0 },
                  { scaleY: 1, ease: "none", scrollTrigger: { trigger: step, start: "top 70%", end: "bottom 62%", scrub: 0.4 } },
                );
              }
              if (i === steps.length - 1) tl.eventCallback("onComplete", () => replay?.classList.add("is-on"));
              if (run) gsap.set(gsap.utils.selector(step)(".flow__fill"), { scaleY: 1 });
            });
          }
          return () => texts.forEach(([node, text]) => (node.textContent = text));
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [run] },
  );

  const card = (i: number) => {
    if (i === 0)
      return (
        <div className="flow__card flow__card--mail" aria-hidden="true">
          <p className="flow__from">{ICONS.mail}<span>{copy.from}</span></p>
          <p className="flow__body">{copy.body}</p>
        </div>
      );
    if (i === 1)
      return (
        <div className="flow__card flow__card--ai" aria-hidden="true">
          <p className="flow__think" data-state="done">
            <span className="flow__spark-ico">{ICONS.ai}</span>
            <span className="flow__think-t flow__think-t--busy">{copy.reading}</span>
            <span className="flow__think-t flow__think-t--done">{copy.read}</span>
            <span className="flow__clock">{sec(1.2)}</span>
          </p>
          <dl className="flow__fields">
            {copy.fields.map((f, n) => (
              <div className="flow__field" key={n}>
                <dt>{f.k}</dt>
                <dd><i className="flow__mark" /><span className="flow__v" data-text={f.v}>{f.v}</span></dd>
              </div>
            ))}
          </dl>
        </div>
      );
    if (i === 2)
      return (
        <div className="flow__card flow__card--table" aria-hidden="true">
          <p className="flow__chip" data-state="done">
            <i className="flow__chip-fill" />
            <span className="flow__chip-ico">{ICONS.table}</span>
            <span className="flow__chip-t flow__chip-t--busy">{copy.writing}</span>
            <span className="flow__chip-t flow__chip-t--done">{copy.written}</span>
            <span className="flow__ms">340 мс</span>
          </p>
          <div className="flow__table">
            <p className="flow__row"><i /><i /><i /></p>
            <p className="flow__row"><i /><i /><i /></p>
            <p className="flow__row flow__row--new"><b className="flow__row-bar" /><span>{copy.from}</span><span>20&nbsp;000&nbsp;₴</span><span>15.11</span></p>
          </div>
        </div>
      );
    return (
      <div className="flow__card flow__card--tg" aria-hidden="true">
        <div className="flow__toast">
          <span className="flow__toast-ico">{ICONS.tg}</span>
          <p className="flow__toast-t"><b>{copy.tgTitle}</b><span>{copy.tgBody}</span></p>
          <span className="flow__toast-now">{copy.now}</span>
          <i className="flow__fuse" />
        </div>
        <p className="flow__call">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.6 4.5h2.6l1.3 3.6-1.8 1.2a10.5 10.5 0 0 0 6 6l1.2-1.8 3.6 1.3v2.6a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.6 6.7a2 2 0 0 1 2-2.2z" /></svg>
          <span>{copy.call}</span>
        </p>
      </div>
    );
  };

  return (
    <div className="flow" ref={root}>
      <ol className="flow__steps">
        {copy.steps.map((step, i) => (
          <li className={`flow__step flow__step--${step.kind}`} key={i}>
            <div className="flow__rail" aria-hidden="true">
              <span className="flow__node">
                {ICONS[keys[i]]}
                <i className="flow__ring" />
                <span className="flow__n">{i + 1}</span>
              </span>
              <span className="flow__node-name">{copy.node[keys[i]]}</span>
              {i < copy.steps.length - 1 && (
                <span className="flow__wire">
                  <i className="flow__fill" />
                  <i className="flow__spark" />
                </span>
              )}
            </div>
            <div className="flow__main">
              <p className="flow__cap"><b className="flow__who">{step.who}</b> <span>{step.text}</span></p>
              {card(i)}
            </div>
          </li>
        ))}
      </ol>
      <div className="flow__end">
        <span className="ai-sample">{copy.sample}</span>
        <button className="ai-replay flow__replay" type="button" aria-label={copy.replayLabel} onClick={() => setRun((n) => n + 1)}>
          <span aria-hidden="true">↻</span> <span>{copy.replay}</span>
        </button>
      </div>
    </div>
  );
}
