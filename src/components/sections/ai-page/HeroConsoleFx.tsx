"use client";
/*
 * The AI page's first screen · «Пульт» (the owner's pick, 26 Oct 2026, of four art-directed designs of the live flow):
 * the console's conductor. While the first screen
 * may run (useHeroRun), one request takes a 2.6 s turn (P1 → P4, then again): the queue advances (CSS transitions on
 * the cards' data-slot), the lime packet runs the track station by station, the curve to its place lights, the place's
 * dot turns ember and its count ticks, a log line slides in on top and the day's counters roll (digit strips). Two
 * setTimeout steps a turn (the queue at 0, everything else at 420 ms as WAAPI one-shots with delays), kept across
 * pauses. On a computer the console leans up to 2.5° to the pointer (a small rAF lerp that stops once settled) and its
 * edge lights under it; on a phone a tap starts the next turn once the packet has gone. Nothing runs at rest, covered,
 * off screen, in a hidden tab or with reduced motion: then the server's still stays.
 */
import { useEffect, useRef } from "react";
import { useHeroRun } from "./useHeroRun";

export type ConsoleLine = { src: string; res: string; srcS: string; resS: string };

/** one request's turn; its second step (the packet leaves station 1) */
const TURN = 2600;
const FIRE = 420;
/** when, in a turn, the packet reaches each station; the stations go dark over its last 100 ms */
const LIT = [420, 1150, 1800];
/** a tap starts the next turn only after this (the packet has gone) */
const TAP = 1900;
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_IN_OUT = "cubic-bezier(0.87, 0, 0.13, 1)";
/** the first live log line: 08:02, then +1 and +2 minutes in turn */
const CLOCK = 8 * 60 + 2;

const hhmm = (m: number) => {
  const d = ((m % 1440) + 1440) % 1440;
  return `${String(Math.floor(d / 60)).padStart(2, "0")}:${String(d % 60).padStart(2, "0")}`;
};

/** new words into a node, keeping its text node when it has just one (React's own) */
function setText(el: Element | null | undefined, s: string) {
  if (!el) return;
  const n = el.firstChild;
  if (n && n.nodeType === Node.TEXT_NODE && !n.nextSibling) n.nodeValue = s;
  else el.textContent = s;
}

/** a counter +1: the changed digits roll (rightmost first, 40 ms apart); a new leading digit fades in */
function bump(num: HTMLElement | undefined, delay: number, into: Animation[]) {
  if (!num) return;
  const ds = Array.from(num.querySelectorAll<HTMLElement>(".ai-console__nd"));
  const slots = ds.length;
  const v = Number(num.dataset.v) || 0;
  const n = (v + 1) % 10 ** slots;
  num.dataset.v = String(n);
  const a = String(v).padStart(slots, "0");
  const b = String(n).padStart(slots, "0");
  const lead = (s: string) => Math.min(slots - 1, s.length - s.replace(/^0+/, "").length);
  const la = lead(a);
  const lb = lead(b);
  const o: KeyframeAnimationOptions = { duration: 320, easing: EASE_OUT, fill: "backwards" };
  let k = 0;
  for (let i = slots - 1; i >= 0; i--) {
    if (a[i] === b[i]) continue;
    const strip = ds[i].firstElementChild as HTMLElement | null;
    if (!strip) continue;
    const from = Number(a[i]);
    const to = Number(b[i]);
    // 9 → 0 rolls on to the strip's last cell (a second 0), then rests on its first
    strip.style.transform = `translateY(-${to}em)`;
    into.push(strip.animate([{ transform: `translateY(-${from}em)` }, { transform: `translateY(-${from === 9 && to === 0 ? 10 : to}em)` }], { ...o, delay: delay + k * 40 }));
    k++;
  }
  for (let i = 0; i < slots; i++) {
    const was = i < la;
    const is = i < lb;
    if (was === is) continue;
    ds[i].classList.toggle("is-z", is);
    if (!is) into.push(ds[i].animate([{ opacity: 0 }, { opacity: 1 }], { ...o, delay }));
  }
  // a left-aligned counter sits shifted left by its hidden zeros: one fewer, it slides right
  if (la !== lb && num.classList.contains("ai-console__n--start")) {
    const inner = num.firstElementChild as HTMLElement | null;
    const dw = parseFloat(getComputedStyle(num).getPropertyValue("--dw")) || 0.6;
    num.style.setProperty("--hide", String(lb));
    if (inner) into.push(inner.animate([{ transform: `translateX(${-la * dw}em)` }, { transform: `translateX(${-lb * dw}em)` }], { ...o, delay }));
  }
}

type Conductor = { resume: () => void; pause: () => void; tap: () => void; stop: () => void };

function conduct(stage: HTMLElement, lines: ConsoleLine[]): Conductor | null {
  const all = <T extends Element = HTMLElement>(s: string) => Array.from(stage.querySelectorAll<T>(s));
  const box = stage.querySelector<HTMLElement>(".ai-console__box");
  const packet = stage.querySelector<HTMLElement>(".ai-console__packet");
  const strip = stage.querySelector<HTMLElement>(".ai-console__strip");
  const cards = all(".ai-console__card");
  const fills = all(".ai-console__stf");
  const inks = all(".ai-console__stl > .is-ink");
  const hots = all<SVGPathElement>(".ai-console__hot");
  const dests = all(".ai-console__dest");
  const [done, tg, rec] = all(".ai-console__cell .ai-console__n");
  if (!box || !packet || !strip || cards.length !== 4 || dests.length !== 4 || fills.length !== 3 || typeof packet.animate !== "function") return null;

  let head = 0; // the card at the head of the queue = the request in this turn (P1 = 0)
  let next: "advance" | "fire" = "fire"; // P1 is already at the head: the first turn starts at its packet
  let timer = 0;
  let due = 0;
  let left = -1; // time left to the next step while paused; -1: not started yet
  let start = 0; // when this turn began
  let pausedAt = 0;
  let clock = CLOCK;
  let odd = false;
  let turn: Animation[] = []; // this turn's one-shots (a tap finishes them)
  let marks: Animation[] = []; // the places' dots: they decay into the next turn, a tap leaves them be
  let shift: Animation[] | null = null; // the log's last slide (held until the next line comes)

  const at = (ms: number) => {
    due = performance.now() + ms;
    timer = window.setTimeout(step, ms);
  };
  const play = (el: Element | null | undefined, kf: Keyframe[], o: KeyframeAnimationOptions, into = turn) => {
    if (el) into.push(el.animate(kf, o));
  };
  /** the hold of a light: on in 80 ms, off over the turn's last 100 ms */
  const hold = (from: number, to: number, peak = 1): Keyframe[] => {
    const d = to - from;
    return [{ opacity: 0 }, { opacity: peak, offset: 80 / d }, { opacity: peak, offset: (to - 100 - from) / d }, { opacity: 0 }];
  };

  /** 0 ms: the head card leaves to the right, the ghosts move up into its place */
  const advance = () => {
    start = performance.now();
    const old = head;
    head = (head + 1) % 4;
    cards.forEach((c, k) => {
      c.dataset.slot = k === old ? "out" : String((k - head + 4) % 4);
    });
    box.dataset.p = String(head + 1);
  };

  /** 420 ms: the rest of the turn, as one-shots with delays (times in the comments are from the turn's start) */
  const fire = () => {
    const p = head;
    turn = [];
    marks = marks.filter((a) => a.playState !== "finished");
    // the card that left goes back behind the queue unseen (opacity 0 on both ends)
    for (const c of cards) if (c.dataset.slot === "out") c.dataset.slot = "3";
    // the log: last turn's slide is over; its words move down one line (the lines themselves stay put: a line moved
    // in the DOM counts as a layout shift), and the top line takes this turn's words
    if (shift) {
      for (const a of shift) a.cancel();
      shift = null;
      // (fresh copies of the line above: a box whose words change would move its neighbour, a new box never counts)
      const rows = Array.from(strip.children);
      for (let i = rows.length - 1; i > 0; i--) rows[i].replaceChildren(...Array.from(rows[i - 1].cloneNode(true).childNodes));
    }
    const line = strip.firstElementChild;
    const l = lines[p];
    if (line && l) {
      setText(line.querySelector("time"), hhmm(clock));
      const [fs, fr] = Array.from(line.querySelectorAll(".ai-console__lf > *"));
      const [ss, sr] = Array.from(line.querySelectorAll(".ai-console__ls > *"));
      setText(fs, l.src);
      setText(fr, `→ ${l.res}`);
      setText(ss, l.srcS);
      setText(sr, `→ ${l.resS}`);
    }
    clock += odd ? 2 : 1;
    odd = !odd;

    // 420–1900: the packet: on at station 1, to 2 (700–1150), to 3 (1350–1800), gone by 1900
    const D = 1480;
    play(packet, [
      { offset: 0, opacity: 0, transform: "translateX(-100%)" },
      { offset: 80 / D, opacity: 1 },
      { offset: 280 / D, transform: "translateX(-100%)", easing: EASE_IN_OUT },
      { offset: 730 / D, transform: "translateX(-50%)" },
      { offset: 930 / D, transform: "translateX(-50%)", easing: EASE_IN_OUT },
      { offset: 1380 / D, opacity: 1, transform: "translateX(0%)" },
      { offset: 1, opacity: 0, transform: "translateX(0%)" },
    ], { duration: D });
    // each station lights as the packet reaches it; all go dark at 2500–2600
    LIT.forEach((t, i) => {
      const o: KeyframeAnimationOptions = { duration: TURN - t, delay: t - FIRE, fill: "backwards" };
      play(fills[i], hold(t, TURN), o);
      play(inks[i], hold(t, TURN), o);
    });
    // 1880–2600: the curve to its place, ember at 0.8
    play(hots[p], [{ opacity: 0 }, { opacity: 0.8, offset: 160 / 720 }, { opacity: 0.8, offset: 520 / 720 }, { opacity: 0 }], { duration: 720, delay: 1880 - FIRE, fill: "backwards" });
    // 1960–4600: the place's dot turns ember (and its name bright), holds, decays to mute from 3200
    const DD = 2640;
    const dest = dests[p];
    const o: KeyframeAnimationOptions = { duration: DD, delay: 1960 - FIRE, fill: "backwards" };
    play(dest.querySelector(".ai-console__dot > i"), [
      { opacity: 0, transform: "scale(0.5)", easing: EASE_OUT },
      { opacity: 1, transform: "scale(1)", offset: 260 / DD },
      { opacity: 1, transform: "scale(1)", offset: 1240 / DD },
      { opacity: 0, transform: "scale(1)" },
    ], o, marks);
    play(dest.querySelector(".ai-console__name > .is-ink"), [{ opacity: 0 }, { opacity: 1, offset: 260 / DD }, { opacity: 1, offset: 1240 / DD }, { opacity: 0 }], o, marks);
    // 2000: its count +1
    bump(dest.querySelector<HTMLElement>(".ai-console__n") ?? undefined, 2000 - FIRE, turn);
    // 2020–2440: the log slides down a line: the new line fades in on top, the fourth fades out under the window
    const so: KeyframeAnimationOptions = { duration: 420, delay: 2020 - FIRE, easing: EASE_OUT, fill: "both" };
    const out = strip.lastElementChild;
    shift = [strip.animate([{ transform: "translateY(-1.75em)" }, { transform: "translateY(0)" }], so)];
    if (line) shift.push(line.animate([{ opacity: 0 }, { opacity: 1 }], so));
    if (out) shift.push(out.animate([{ opacity: 1 }, { opacity: 0 }], { ...so, duration: 300 }));
    turn.push(...shift);
    // 2080: the day's counters roll
    bump(done, 2080 - FIRE, turn);
    if (p === 0) bump(tg, 2080 - FIRE, turn);
    if (p === 3) bump(rec, 2080 - FIRE, turn);
  };

  function step() {
    timer = 0;
    if (next === "advance") {
      advance();
      next = "fire";
      at(FIRE);
    } else {
      fire();
      next = "advance";
      at(TURN - FIRE);
    }
  }

  /** the first packet comes 1.5 s into the console's entrance (it rises 600–1300 ms) */
  const firstDelay = () => {
    const fig = stage.querySelector(".ai-console__fig");
    const a = fig?.getAnimations().find((x) => (x as CSSAnimation).animationName === "ai-console-in");
    const t = a?.currentTime;
    return typeof t === "number" ? Math.max(200, 1500 - t) : 300;
  };

  return {
    resume() {
      if (timer) return;
      const now = performance.now();
      if (left < 0) {
        const d = firstDelay();
        start = now + d - FIRE;
        left = 0;
        at(d);
        return;
      }
      start += now - pausedAt;
      at(left);
    },
    pause() {
      if (!timer) return;
      clearTimeout(timer);
      timer = 0;
      pausedAt = performance.now();
      left = Math.max(0, due - pausedAt);
    },
    tap() {
      // mid-turn (until the packet has gone) a tap is ignored; after it, the landing ends now and the next turn starts
      if (!timer || next !== "advance" || performance.now() - start < TAP) return;
      for (const a of turn) a.finish();
      clearTimeout(timer);
      step();
    },
    stop() {
      clearTimeout(timer);
      timer = 0;
      for (const a of [...turn, ...marks]) a.cancel();
    },
  };
}

/** the pointer: on a computer the tilt and the edge light; on a phone the tap. Returns the stop. */
function pointer(stage: HTMLElement, c: Conductor) {
  const fig = stage.querySelector<HTMLElement>(".ai-console__fig");
  const tilt = stage.querySelector<HTMLElement>(".ai-console__tilt");
  const ring = stage.querySelector<HTMLElement>(".ai-console__ring");
  const hero = stage.closest<HTMLElement>(".ai-console");
  if (!fig || !tilt || !ring || !hero) return () => {};
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) {
    fig.addEventListener("click", c.tap);
    return () => fig.removeEventListener("click", c.tap);
  }
  const blob = ring.firstElementChild as HTMLElement | null;
  let raf = 0;
  let x = 0;
  let y = 0;
  let tx = 0;
  let ty = 0;
  const draw = () => {
    x += (tx - x) * 0.1;
    y += (ty - y) * 0.1;
    const settled = Math.abs(tx - x) + Math.abs(ty - y) < 0.002;
    if (settled) {
      x = tx;
      y = ty;
    }
    tilt.style.transform = x || y ? `perspective(1600px) rotateX(${(-y * 2.5).toFixed(3)}deg) rotateY(${(x * 2.5).toFixed(3)}deg)` : "";
    raf = settled ? 0 : requestAnimationFrame(draw);
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(draw);
  };
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));
  const move = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    const r = fig.getBoundingClientRect();
    if (!r.width || !r.height) return;
    tx = clamp((e.clientX - r.left - r.width / 2) / (r.width / 2));
    ty = clamp((e.clientY - r.top - r.height / 2) / (r.height / 2));
    if (blob) blob.style.transform = `translate3d(${(e.clientX - r.left).toFixed(1)}px, ${(e.clientY - r.top).toFixed(1)}px, 0)`;
    kick();
  };
  const leave = () => {
    tx = 0;
    ty = 0;
    ring.classList.remove("is-on");
    kick();
  };
  const enter = () => ring.classList.add("is-on");
  const out = () => ring.classList.remove("is-on");
  hero.addEventListener("pointermove", move);
  hero.addEventListener("pointerleave", leave);
  tilt.addEventListener("pointerenter", enter);
  tilt.addEventListener("pointerleave", out);
  return () => {
    hero.removeEventListener("pointermove", move);
    hero.removeEventListener("pointerleave", leave);
    tilt.removeEventListener("pointerenter", enter);
    tilt.removeEventListener("pointerleave", out);
    cancelAnimationFrame(raf);
    raf = 0;
    tilt.style.transform = "";
    ring.classList.remove("is-on");
  };
}

export function HeroConsoleFx({ lines, children }: { lines: ConsoleLine[]; children: React.ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const running = useHeroRun(stage);
  const ctl = useRef<Conductor | null>(null);
  const words = useRef(lines);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const c = conduct(el, words.current);
    ctl.current = c;
    return () => {
      c?.stop();
      ctl.current = null;
    };
  }, []);

  useEffect(() => {
    const el = stage.current;
    const c = ctl.current;
    if (!running || !el || !c) return;
    c.resume();
    const off = pointer(el, c);
    return () => {
      off();
      c.pause();
    };
  }, [running]);

  return (
    <div ref={stage} className="ai-console__stage">
      {children}
    </div>
  );
}
