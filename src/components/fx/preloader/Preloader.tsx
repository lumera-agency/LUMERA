/*
 * Preloader — a black sheet cut into five columns. What the studio does runs through it word by word
 * and lands on the last word with a lime dot; the counter and the lime line follow the real loading
 * (window.lumeraLoader.step, called by the page's boot). On leaving, the copy slips up out of its
 * masks and the columns lift left to right; finish() resolves as they start, so the next scene
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
  /** «fonts · scene · …»: what each loading stage is called (4 stages + done) */
  stages: string;
  /** ms the full version stays at least (the words get read) */
  minMs?: number;
};

const split = (s: string) => s.split("·").map((w) => w.trim()).filter(Boolean);
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/* Rendered as plain HTML, outside React's hydration: the clock changes the counter, the words and
   the classes before React starts, and removes the whole sheet when it is done. */
export function Preloader({ brand, note, words, last, stages, minMs = 1600 }: Props) {
  const list = split(words);
  const steps = split(stages);
  const config = JSON.stringify({ words: list, last, stages: steps, min: minMs }).replace(/</g, "\\u003c");
  const html = `<div class="preloader" data-preloader aria-hidden="true">
  <div class="preloader__cols"><i></i><i></i><i></i><i></i><i></i></div>
  <span class="preloader__glow" data-pl-fade></span>
  <div class="preloader__frame">
    <p class="preloader__brand" data-pl-fade><svg class="preloader__mark" viewBox="0 0 329 329" aria-hidden="true" focusable="false"><use href="#logo-mark"/></svg><span>${esc(brand)}</span></p>
    <p class="preloader__note" data-pl-fade>${esc(note)}</p>
    <p class="preloader__words"><span class="preloader__word" data-pl-word>${esc(list[0] ?? "")}</span></p>
    <p class="preloader__status" data-pl-fade><span data-pl-stage>${esc(steps[0] ?? "")}</span><span data-pl-of>1 / 4</span></p>
    <p class="preloader__count"><span data-pl-count>000</span><sup>%</sup></p>
    <span class="preloader__line"><i data-pl-line></i></span>
  </div>
</div>
<script>(${clock.toString()})(${config})</script>`;
  return <div style={{ display: "contents" }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}

/* The clock, serialised into the page as is (no imports, no closures): the counter and the line
   follow the milestones, creeping toward the next one but never reaching it on their own. */
function clock(cfg: { words: string[]; last: string; stages: string[]; min: number }) {
  const root = document.documentElement;
  const el = document.querySelector<HTMLElement>("[data-preloader]");
  if (!el || !root.classList.contains("js")) return;
  const motion = root.classList.contains("motion") && !!el.animate;
  const q = <T extends Element = HTMLElement>(s: string) => el.querySelector<T>(s)!;
  const count = q("[data-pl-count]"), line = q("[data-pl-line]"), word = q("[data-pl-word]");
  const stageEl = q("[data-pl-stage]"), ofEl = q("[data-pl-of]");
  const OUT = "cubic-bezier(0.16, 1, 0.3, 1)", IN = "cubic-bezier(0.7, 0, 0.84, 0)", IN_OUT = "cubic-bezier(0.87, 0, 0.13, 1)";
  const CEIL = [0.3, 0.55, 0.8, 0.95, 1];
  const MIN = cfg.min;
  let target = 0.04, creep = 0.04, shown = 0, stage = 0, done = false, last = performance.now();
  const setStage = (i: number) => {
    stage = Math.max(stage, i);
    stageEl.textContent = cfg.stages[stage] ?? "";
    ofEl.textContent = Math.min(stage + 1, 4) + " / 4";
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
    line.style.transform = "scaleX(" + shown.toFixed(4) + ")";
    if (shown < 1 || !done) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // the words: each slips up out of its mask and the next rises in
  let w = 0, landing = false, timer = 0;
  const swap = (html: string, then?: () => void) => {
    if (!motion) {
      word.innerHTML = html;
      then?.();
      return;
    }
    word.animate([{ transform: "translateY(0)" }, { transform: "translateY(-105%)" }], { duration: 180, easing: IN, fill: "forwards" }).finished.then(() => {
      word.innerHTML = html;
      const a = word.animate([{ transform: "translateY(105%)" }, { transform: "translateY(0)" }], { duration: 420, easing: OUT, fill: "forwards" });
      if (then) a.finished.then(then);
    });
  };
  const tick = () => {
    if (landing) return;
    w = (w + 1) % cfg.words.length;
    swap(cfg.words[w]);
    timer = window.setTimeout(tick, 290);
  };
  timer = window.setTimeout(tick, 380);

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
          return new Promise<void>((r) => swap(cfg.last + "<b>.</b>", r)).then(() => wait(260));
        })
        .then(() => {
          if (!motion) {
            el.style.transition = "opacity 0.3s ease";
            el.style.opacity = "0";
            setTimeout(() => el.remove(), 320);
            return;
          }
          // the copy slips up out of its masks, the line runs out to the right
          const out = [...el.querySelectorAll<HTMLElement>("[data-pl-fade]"), word, count.parentElement ?? count]; // the count with its «%»
          out.forEach((n, k) =>
            n.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-110%)", opacity: 0 }], { duration: 420, delay: k * 30, easing: IN, fill: "forwards" }),
          );
          line.style.transformOrigin = "100% 50%";
          line.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: 520, easing: IN_OUT, fill: "forwards" });
          // then the columns lift one after another, left to right
          const cols = [...el.querySelectorAll<HTMLElement>(".preloader__cols i")];
          const D = 950, S = 75, AT = 260;
          const lifts = cols.map(
            (c, k) => c.animate([{ transform: "translateY(0)" }, { transform: "translateY(-101%)" }], { duration: D, delay: AT + k * S, easing: IN_OUT, fill: "forwards" }).finished,
          );
          el.style.pointerEvents = "none";
          Promise.all(lifts).then(() => el.remove());
          return wait(AT + 320);
        });
      return finishing;
    },
  };
}
