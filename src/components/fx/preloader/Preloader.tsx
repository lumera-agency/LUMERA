/*
 * Preloader — a black sheet. In the middle the studio's pictures are dealt one by one onto a loose
 * stack, each at its own angle (after Codrops' «Image Stack Intro Animation»); under it what the
 * studio does runs word by word and lands on the last word with a lime dot; top right the percentage
 * follows the real loading
 * (window.lumeraLoader.step, called by the page's boot). On leaving, the copy slips up out of its
 * masks, the other pictures sink away and the top one squares up, grows to the whole screen and, letting go,
 * opens the page through a window in the sheet that grows with it (Osmo's «Willem»); finish() resolves as
 * it starts to grow, so the next scene
 * starts under them. It plays in full on every load.
 *
 * Server component: the markup and an inline script that starts the clock before any bundle runs.
 * Props are plain strings, so the same component works for any site (words · separated).
 */
import "./preloader.css";

type Props = {
  brand: string;
  note: string;
  /** «A · B · C»: the words that run through it */
  words: string;
  /** the word it lands on (gets the lime dot) */
  last: string;
  /** «fonts · scene · …»: the loading stages (4 + done); they set how far the count may creep */
  stages: string;
  /** ms the full version stays at least (the words get read) */
  minMs?: number;
  /** pictures dealt onto the stack (4:5; a few, light: they load with the page) */
  images?: string[];
};

const split = (s: string) => s.split("·").map((w) => w.trim()).filter(Boolean);
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/* Rendered as plain HTML, outside React's hydration: the clock changes the counter, the words and
   the classes before React starts, and removes the whole sheet when it is done. */
export function Preloader({ brand, note, words, last, stages, minMs = 3000, images = [] }: Props) {
  const list = split(words);
  const steps = split(stages);
  const config = JSON.stringify({ words: list, last, stages: steps, min: minMs }).replace(/</g, "\\u003c");
  const html = `<div class="preloader" data-preloader aria-hidden="true">
  <span class="preloader__bg"></span>
  <span class="preloader__glow" data-pl-fade></span>
  <div class="preloader__frame">
    <p class="preloader__brand" data-pl-fade><svg class="preloader__mark" viewBox="0 0 329 329" aria-hidden="true" focusable="false"><use href="#logo-mark"/></svg><span>${esc(brand)}</span></p>
    <p class="preloader__count"><span data-pl-count>000</span><sup>%</sup></p>
    <div class="preloader__center">
      ${images.length ? `<div class="preloader__stack">${images.map((src) => `<span class="preloader__card"><img src="${esc(src)}" alt="" width="680" height="850" decoding="async" fetchpriority="low"></span>`).join("")}</div>` : ""}
      <p class="preloader__words"><span class="preloader__word" data-pl-word>${esc(list[0] ?? "")}</span></p>
    </div>
    <p class="preloader__note" data-pl-fade>${esc(note)}</p>
  </div>
</div>
<script>(${clock.toString()})(${config})</script>`;
  return <div style={{ display: "contents" }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}

/* The clock, serialised into the page as is (no imports, no closures): the counter follows the
   milestones, creeping toward the next one but never reaching it on their own. */
function clock(cfg: { words: string[]; last: string; stages: string[]; min: number }) {
  const root = document.documentElement;
  const el = document.querySelector<HTMLElement>("[data-preloader]");
  if (!el || !root.classList.contains("js")) return;
  const motion = root.classList.contains("motion") && !!el.animate;
  const q = <T extends Element = HTMLElement>(s: string) => el.querySelector<T>(s)!;
  const count = q("[data-pl-count]"), box = q(".preloader__words");
  // soft curves: arrivals that ease in as well as out, so nothing pops
  const ARRIVE = "cubic-bezier(0.22, 1, 0.36, 1)", SMOOTH = "cubic-bezier(0.65, 0, 0.35, 1)", OPEN_EASE = "cubic-bezier(0.76, 0, 0.24, 1)";
  const BEAT = 750; // one picture and one word per beat
  const CEIL = [0.3, 0.55, 0.8, 0.95, 1];
  const MIN = cfg.min;
  let target = 0.04, creep = 0.04, shown = 0, stage = 0, done = false, last = performance.now();
  const setStage = (i: number) => {
    stage = Math.min(Math.max(stage, i), cfg.stages.length - 1, CEIL.length - 1);
  };
  const frame = (now: number) => {
    const dt = Math.min(64, now - last);
    last = now;
    const ceil = done ? 1 : CEIL[stage] - 0.03;
    creep += (ceil - creep) * (1 - Math.exp(-dt / 1400));
    const goal = done ? 1 : Math.max(target, Math.min(creep, ceil));
    shown += (goal - shown) * (1 - Math.exp(-dt / (done ? 90 : 220)));
    if (goal - shown < 0.002) shown = goal;
    count.textContent = ("00" + Math.round(shown * 100)).slice(-3);
    if (shown < 1 || !done) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // the words: the old one slides up out of the mask while the next rises into it, in one move
  let wordEl = q("[data-pl-word]");
  const swap = (html: string, then?: () => void) => {
    if (!motion) {
      wordEl.innerHTML = html;
      then?.();
      return;
    }
    const next = wordEl.cloneNode(false) as HTMLElement;
    next.innerHTML = html;
    box.append(next);
    const old = wordEl;
    wordEl = next;
    const timing = { duration: 700, easing: SMOOTH, fill: "forwards" as const };
    old.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-100%)", opacity: 0 }], timing).finished.then(() => old.remove());
    const rise = next.animate([{ transform: "translateY(100%)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], timing);
    if (then) rise.finished.then(then);
  };

  // the stack: on each beat a picture is dealt onto the others, at its own place and angle, and the
  // word moves on with it; once all are down, the words go on alone until the page is ready
  const cards = [...el.querySelectorAll<HTMLElement>(".preloader__card")];
  const SLOTS = [[-15, 4, -7], [13, -5, 5], [-4, -9, -3], [9, 7, 6]]; // x %, y % of a card, degrees
  const slot = (k: number) => {
    const [x, y, r] = SLOTS[k % SLOTS.length];
    return "translate(" + x + "%, " + y + "%) rotate(" + r + "deg)";
  };
  let w = 0, dealt = 0, beats = 0, landing = false, timer = 0;
  const lay = (k: number) => {
    if (landing) return;
    const card = cards[k];
    card.style.zIndex = String(k + 1);
    if (!motion) {
      card.style.transform = slot(k);
      card.style.opacity = "1";
      return;
    }
    card.animate(
      [
        { transform: slot(k) + " translateY(14%) rotate(4deg) scale(0.95)", opacity: 0 },
        { opacity: 1, offset: 0.45 },
        { transform: slot(k), opacity: 1 },
      ],
      { duration: 1400, easing: ARRIVE, fill: "forwards" },
    );
  };
  const deal = () => {
    if (dealt >= cards.length) return;
    const k = dealt++;
    const img = cards[k].querySelector("img");
    // a picture not in yet comes when it is (still in its own place in the pile), or not at all
    if (!img || (img.complete && img.naturalWidth)) lay(k);
    else if (!img.complete) img.addEventListener("load", () => lay(k), { once: true });
  };
  const beat = () => {
    if (landing) return;
    if (beats++ > 0) {
      w = (w + 1) % cfg.words.length;
      swap(cfg.words[w]);
    }
    deal();
    timer = window.setTimeout(beat, BEAT);
  };
  timer = window.setTimeout(beat, motion ? 400 : 0);

  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  const until = (test: () => boolean) => new Promise<void>((r) => {
    const poll = () => (test() ? r() : requestAnimationFrame(poll));
    poll();
  });
  let finishing: Promise<void> | null = null;
  (window as unknown as { lumeraLoader: unknown }).lumeraLoader = {
    step(p: number, i?: number) {
      target = Math.max(target, p);
      if (i != null) setStage(i);
    },
    finish() {
      if (finishing) return finishing;
      finishing = wait(Math.max(0, MIN - performance.now()))
        .then(() => {
          done = true;
          return until(() => shown >= 1);
        })
        .then(() => {
          setStage(4);
          landing = true;
          clearTimeout(timer);
          if (!motion) return;
          return new Promise<void>((r) => swap(cfg.last + "<b>.</b>", r)).then(() => wait(450));
        })
        .then(() => {
          if (!motion) {
            el.style.transition = "opacity 0.3s ease";
            el.style.opacity = "0";
            setTimeout(() => el.remove(), 320);
            return;
          }
          el.style.pointerEvents = "none";
          // the copy goes
          const out = [...el.querySelectorAll<HTMLElement>("[data-pl-fade]"), box, count.parentElement ?? count];
          out.forEach((n, k) =>
            n.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-40%)", opacity: 0 }], { duration: 650, delay: k * 50, easing: SMOOTH, fill: "forwards" }),
          );
          // the pile: the others sink away, the top picture squares up in the middle
          const down = cards.filter((c) => getComputedStyle(c).opacity !== "0");
          const top = down.reduce<HTMLElement | null>((a, c) => (!a || +c.style.zIndex > +a.style.zIndex ? c : a), null);
          down.forEach((c) => {
            if (c !== top) c.animate([{ transform: slot(cards.indexOf(c)), opacity: 1 }, { transform: slot(cards.indexOf(c)) + " translateY(5%) scale(0.92)", opacity: 0 }], { duration: 650, easing: SMOOTH, fill: "forwards" });
          });
          const SQUARE = 700, OPEN = 1400;
          const bg = q(".preloader__bg");
          const W = window.innerWidth, H = window.innerHeight;
          if (!top) {
            // no picture: the sheet just wipes up
            bg.animate([{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 0 100% 0)" }], { duration: OPEN, delay: 300, easing: OPEN_EASE, fill: "forwards" }).finished.then(() => el.remove());
            return wait(450);
          }
          top.animate([{ transform: slot(cards.indexOf(top)) }, { transform: "none" }], { duration: SQUARE, easing: SMOOTH, fill: "forwards" });
          // then it grows to the whole screen and, letting go, opens the page: the black behind it has a
          // window of the same size (a clip-path with a hole) that grows with it (Osmo's «Willem» loader)
          return wait(SQUARE).then(() => {
            const r = top.getBoundingClientRect();
            const hole = (l: number, t: number, rt: number, b: number) =>
              `polygon(evenodd, 0px 0px, ${W}px 0px, ${W}px ${H}px, 0px ${H}px, 0px 0px, ${l}px ${t}px, ${rt}px ${t}px, ${rt}px ${b}px, ${l}px ${b}px, ${l}px ${t}px)`;
            bg.animate([{ clipPath: hole(r.left, r.top, r.right, r.bottom) }, { clipPath: hole(-2, -2, W + 2, H + 2) }], { duration: OPEN, easing: OPEN_EASE, fill: "forwards" });
            // the picture: a copy fixed at the card's place, so it can grow past the stack
            const pic = top.cloneNode(true) as HTMLElement;
            pic.style.cssText = "position:fixed;margin:0;z-index:3;opacity:1;transform:none;left:" + r.left + "px;top:" + r.top + "px;width:" + r.width + "px;height:" + r.height + "px";
            el.append(pic);
            top.style.visibility = "hidden";
            pic.animate(
              [
                { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px", borderRadius: "0.875rem" },
                { left: "0px", top: "0px", width: W + "px", height: H + "px", borderRadius: "0px" },
              ],
              { duration: OPEN, easing: OPEN_EASE, fill: "forwards" },
            );
            pic.animate([{ opacity: 1 }, { opacity: 1, offset: 0.25 }, { opacity: 0, offset: 0.8 }, { opacity: 0 }], { duration: OPEN, fill: "forwards" });
            pic.querySelector("img")?.animate([{ transform: "scale(1)" }, { transform: "scale(1.1)" }], { duration: OPEN, easing: OPEN_EASE, fill: "forwards" });
            setTimeout(() => el.remove(), OPEN + 60);
            return wait(220);
          });
        });
      return finishing;
    },
  };
}
