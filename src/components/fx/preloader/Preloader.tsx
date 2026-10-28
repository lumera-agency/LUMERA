/*
 * Preloader — a black sheet. In the middle the studio's pictures are dealt one by one onto a loose
 * stack, each at its own angle (after Codrops' «Image Stack Intro Animation»); under it what the
 * studio does runs word by word (and, if given, lands on a last word with a lime dot); top right the percentage
 * follows the real loading
 * (window.ecloLoader.step, called by the page's boot). On leaving, the copy slips up out of its
 * masks, the other pictures sink away and the top one grows to the whole screen straight from its place,
 * straightening on the way, and, letting go, opens the page through a window in the sheet that grows with
 * it fading away (after Osmo's «Willem»); one move, no stop, transform and opacity only; finish() resolves
 * as it starts to grow, so the next scene
 * starts under them. It plays in full on every load.
 *
 * Once per visit (sessionStorage): opened again in the same tab the page comes up at once, unless the
 * language was switched. While it runs the page can't be scrolled (html.is-loading).
 * Server component: the markup and an inline script that starts the clock before any bundle runs.
 * Props are plain strings, so the same component works for any site (words · separated).
 */
import "./preloader.css";

type Props = {
  brand: string;
  note: string;
  /** «A · B · C»: the words that run through it */
  words: string;
  /** a word to land on before leaving (gets a lime dot); none: it leaves straight from the run */
  last?: string;
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
export function Preloader({ brand, note, words, last = "", stages, minMs = 3000, images = [] }: Props) {
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
   milestones, creeping toward the next one but never reaching it on their own, and never ahead of the
   time (it counts evenly through the preloader's length instead of racing to 95 and waiting). */
function clock(cfg: { words: string[]; last: string; stages: string[]; min: number }) {
  const root = document.documentElement;
  const el = document.querySelector<HTMLElement>("[data-preloader]");
  if (!el || !root.classList.contains("js")) return;
  // once per visit: the page reached again in this tab (back from another page, the browser's back)
  // comes up at once; a reload and a language switch (LangSwitch leaves the scroll behind) play it again
  let again = false;
  try {
    const nav = performance.getEntriesByType?.("navigation")?.[0] as PerformanceNavigationTiming | undefined;
    const reload = nav?.type === "reload";
    again = !reload && sessionStorage.getItem("eclo:seen") === "1" && sessionStorage.getItem("eclo:lang-scroll") == null;
    sessionStorage.setItem("eclo:seen", "1");
  } catch {}
  if (again) {
    el.remove();
    return;
  }
  // the page holds still under it (base.css; SmoothScroll stops Lenis); let go as it opens the page
  root.classList.add("is-loading");
  const release = () => root.classList.remove("is-loading");
  setTimeout(release, 9000); // with the sheet's own fallback (preloader.css)
  const motion = root.classList.contains("motion") && !!el.animate;
  const q = <T extends Element = HTMLElement>(s: string) => el.querySelector<T>(s)!;
  const count = q("[data-pl-count]"), box = q(".preloader__words");
  // soft curves: arrivals that ease in as well as out, so nothing pops
  const ARRIVE = "cubic-bezier(0.22, 1, 0.36, 1)", SMOOTH = "cubic-bezier(0.65, 0, 0.35, 1)";
  // the way out starts moving at once (no slow start that reads as a wait) and settles softly
  const LEAVE = "cubic-bezier(0.25, 0.1, 0.25, 1)", OPEN_EASE = "cubic-bezier(0.45, 0, 0.15, 1)";
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
    // the time's share of the run, eased out a little: a fast load still counts at an even pace
    const t = Math.min(1, now / MIN);
    const timeCap = 0.97 * (1 - Math.pow(1 - t, 1.6));
    const goal = done ? 1 : Math.min(timeCap, Math.max(target, Math.min(creep, ceil)));
    shown += (goal - shown) * (1 - Math.exp(-dt / (done ? 140 : 220)));
    if (goal - shown < 0.002) shown = goal;
    count.textContent = ("00" + Math.round(shown * 100)).slice(-3);
    if (shown < 1 || !done) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // the words: the old one slides up out of the mask while the next rises into it, in one move
  let wordEl = q("[data-pl-word]");
  let swappedAt = 0; // when the word on screen came in
  const swap = (html: string, then?: () => void) => {
    swappedAt = performance.now();
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
  // word moves on with it (word k names picture k); once all are down the last pair stays (without
  // pictures the words go round until the page is ready)
  const cards = [...el.querySelectorAll<HTMLElement>(".preloader__card")];
  const SLOTS = [[-15, 4, -7], [13, -5, 5], [-4, -9, -3], [9, 7, 6]]; // x %, y % of a card, degrees
  const slot = (k: number) => {
    const [x, y, r] = SLOTS[k % SLOTS.length];
    return "translate(" + x + "%, " + y + "%) rotate(" + r + "deg)";
  };
  let w = 0, dealt = 0, beats = 0, landing = false, timer = 0;
  let landWith: (() => void) | null = null; // set once loaded: the next beat lands on the last word
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
    if (landWith) {
      // the last word comes on the beat, like the others
      landing = true;
      swap(cfg.last + "<b>.</b>", landWith);
      return;
    }
    const allDown = cards.length > 0 && dealt >= cards.length;
    if (beats++ > 0 && !allDown) {
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
  (window as unknown as { ecloLoader: unknown }).ecloLoader = {
    step(p: number, i?: number) {
      target = Math.max(target, p);
      if (i != null) setStage(i);
    },
    finish() {
      if (finishing) return finishing;
      finishing = wait(Math.max(0, MIN - performance.now()))
        .then(() => {
          done = true;
          // it leaves the moment the count reads 100, not after it has crept the last fraction there
          return until(() => shown >= 0.995).then(() => void (shown = 1));
        })
        .then(() => {
          setStage(4);
          if (!motion || !cfg.last) {
            // no last word: it leaves from the run once the count is full and the word on screen has
            // had its beat, like the ones before it
            landing = true;
            clearTimeout(timer);
            return motion ? wait(Math.max(0, swappedAt + BEAT + 250 - performance.now())) : undefined;
          }
          // the next beat lands on it; it stays a moment to be read
          return new Promise<void>((r) => (landWith = r)).then(() => wait(750));
        })
        .then(() => {
          if (!motion) {
            el.style.transition = "opacity 0.3s ease";
            el.style.opacity = "0";
            release();
            setTimeout(() => el.remove(), 320);
            return;
          }
          el.style.pointerEvents = "none";
          // the copy goes
          const out = [...el.querySelectorAll<HTMLElement>("[data-pl-fade]"), box, count.parentElement ?? count];
          out.forEach((n, k) =>
            n.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-40%)", opacity: 0 }], { duration: 600, delay: k * 40, easing: LEAVE, fill: "forwards" }),
          );
          // the pile: the others sink away from wherever they are; the top picture grows to the whole
          // screen straight from its place and angle, straightening on the way, and, letting go, opens
          // the page as the black behind it fades (after Osmo's «Willem» loader). One move, no stop
          // between (the transforms are read as they are, mid-arrival or not)
          const down = cards.filter((c) => getComputedStyle(c).opacity !== "0");
          const top = down.reduce<HTMLElement | null>((a, c) => (!a || +c.style.zIndex > +a.style.zIndex ? c : a), null);
          down.forEach((c) => {
            if (c === top) return;
            const at = getComputedStyle(c);
            c.animate([{ transform: at.transform, opacity: at.opacity }, { transform: at.transform + " translateY(5%) scale(0.92)", opacity: 0 }], { duration: 600, easing: LEAVE, fill: "forwards" });
          });
          const OPEN = 1500;
          const bg = q(".preloader__bg");
          const W = window.innerWidth, H = window.innerHeight;
          release();
          if (!top) {
            // no picture: the sheet just wipes up
            bg.animate([{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 0 100% 0)" }], { duration: OPEN, delay: 300, easing: OPEN_EASE, fill: "forwards" }).finished.then(() => el.remove());
            return wait(450);
          }
          const r = q(".preloader__stack").getBoundingClientRect(); // the card's own box, before its turn (the cards fill the stack)
          const at = getComputedStyle(top);
          const from = at.transform === "none" ? "translate(0px, 0px)" : at.transform;
          const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          // the black lets go under the growing picture (opacity: run by the compositor, like the
          // picture's transform, so nothing stutters while the hero starts underneath)
          bg.animate([{ opacity: 1 }, { opacity: 1, offset: 0.2 }, { opacity: 0, offset: 0.78 }, { opacity: 0 }], { duration: OPEN, fill: "forwards" });
          // the picture itself grows (no copy, no swap): by transform alone, evenly, keeping its own
          // proportions, from where it lies to where it covers the screen, straightening on the way;
          // the compositor runs it, so the hero starting underneath can't make it stutter
          const dx = W / 2 - cx, dy = H / 2 - cy;
          const cover = Math.max(W / r.width, H / r.height) * 1.03;
          top.style.zIndex = "9";
          top.animate([{ transform: from }, { transform: "translate(" + dx + "px, " + dy + "px) scale(" + cover + ")" }], { duration: OPEN, easing: OPEN_EASE, fill: "forwards" });
          top.animate([{ opacity: at.opacity }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.3 }, { opacity: 0, offset: 0.82 }, { opacity: 0 }], { duration: OPEN, fill: "forwards" });
          top.querySelector("img")?.animate([{ transform: "scale(1)" }, { transform: "scale(1.06)" }], { duration: OPEN, easing: OPEN_EASE, fill: "forwards" });
          setTimeout(() => el.remove(), OPEN + 60);
          return wait(220);
        });
      return finishing;
    },
  };
}
