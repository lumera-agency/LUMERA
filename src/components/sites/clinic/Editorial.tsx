/* eslint-disable @next/next/no-img-element -- the sample's own photos inside the frame (fixed boxes, no next/image) */
/*
 * The clinic's editorial photography (round 2 of «Петроль», the owner: «photos laid out in an interesting editorial grid»):
 *   - «Клініка зсередини» (Головна): an asymmetric grid on the 12 columns (a tall portrait over two rows, a wide frame at
 *     the top, a portrait overlapping its bottom edge, a square pushed down, a pull line in the free cell, a wide frame at
 *     the foot), mono captions under each photo;
 *   - «Кабінети зблизька» (Про нас): three staggered columns (the middle one lower);
 *   - the contact sheet (Послуги): four frames on staggered baselines, each with its index.
 * Motion, once each and only when it can be seen: every photo is a block of its own ([data-sec]): as it comes into the
 * frame it slides in from its side of the grid (left column from the left, right from the right, centre from below, one
 * from above), its petrol curtain leaving the same way while the image settles 1.12 → 1, then its caption rises; photos
 * entering together go in reading order (stage.ts staggers them). CSS transitions, transform and opacity only. While the frame moves (the
 * tour or the visitor), the images drift ±4cqw inside their frames: a rAF loop that runs only while the block is in the
 * frame and .pv-scroll's translate is changing, stopping after a few unchanged frames (an IntersectionObserver with fine
 * thresholds, the wheel and a finger wake it). With a mouse: the image leans in (1.04) and a round «Дивитися» follows the
 * pointer (transform only). A click opens the lightbox inside the frame: the photo grows from its place (FLIP, transform
 * and opacity), a petrol backdrop fades in; arrows, Esc and the close button; it closes as it opened, back into its photo,
 * and on its own when the visitor gives the frame back to the tour. Phones: two offset columns, no drift, no cursor.
 * Own components (no third-party code).
 */
import { createContext, useContext, useEffect, useLayoutEffect, useRef, type CSSProperties, type RefObject } from "react";
import { gsap } from "gsap";
import { SHOTS, type ShotDef } from "./copy";
import { PH, two, useEnv } from "./env";
import { useMoveLoop } from "./loop";
import { Arrow, Rail, SplitHeading } from "./parts";

type Css = CSSProperties & Record<`--${string}`, string | number>;
export type Shot = ShotDef & { cap: string };
export type LbState = { set: Shot[]; i: number; items: () => HTMLElement[] } | null;
type Open = (set: Shot[], i: number, items: () => HTMLElement[]) => void;
export const LbCtx = createContext<Open>(() => {});

const src = (k: string, phone: boolean) => `${PH}${phone ? "m/" : ""}${k}.jpg`;

/** the drift: images move ±4cqw inside their frames as the frame's page moves (loop.ts: only while it moves) */
function useDrift(ref: RefObject<HTMLElement | null>) {
  const { vp, phone, rm } = useEnv();
  useMoveLoop(
    ref,
    vp,
    (v, cq) => {
      const vc = v.top + v.height / 2;
      ref.current?.querySelectorAll<HTMLElement>("[data-par]").forEach((el) => {
        const r = (el.parentElement || el).getBoundingClientRect();
        const c = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vc) / (v.height / 2 + r.height / 2)));
        el.style.transform = `translate3d(0, ${(-c * 4 * cq).toFixed(2)}px, 0)`;
      });
    },
    !phone && !rm,
  );
}

/** a mouse over the photos: the round «Дивитися» follows it (transform only) */
function useCursor(ref: RefObject<HTMLElement | null>, cur: RefObject<HTMLElement | null>) {
  const { phone } = useEnv();
  useEffect(() => {
    const sec = ref.current;
    const c = cur.current;
    if (!sec || !c || phone || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let on = false;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const shot = e.target instanceof Element ? e.target.closest("[data-shot]") : null;
      const r = sec.getBoundingClientRect();
      c.style.transform = `translate3d(${(e.clientX - r.left).toFixed(1)}px, ${(e.clientY - r.top).toFixed(1)}px, 0)`;
      if (!!shot !== on) {
        on = !!shot;
        c.classList.toggle("is-on", on);
      }
    };
    const leave = () => {
      on = false;
      c.classList.remove("is-on");
    };
    sec.addEventListener("pointermove", move);
    sec.addEventListener("pointerleave", leave);
    return () => {
      sec.removeEventListener("pointermove", move);
      sec.removeEventListener("pointerleave", leave);
    };
  }, [ref, cur, phone]);
}

/** where a photo comes in from: l(eft), r(ight), u(p from below), d(own from above) — its place in the grid */
export type Dir = "l" | "r" | "u" | "d";

function ShotItem({ s, i, cls, ar, dir, onOpen }: { s: Shot; i: number; cls: string; ar?: string; dir: Dir; onOpen: () => void }) {
  const { phone } = useEnv();
  return (
    <figure className={`cl-eg__i ${cls}`} data-shot={i} data-dir={dir} data-sec data-mv style={(ar ? { "--ar": ar } : {}) as Css} onClick={onOpen}>
      <div className="cl-eg__ph">
        <div className="cl-par" data-par>
          <div className="cl-zoom">
            <img src={src(s.k, phone)} alt="" decoding="async" loading={phone ? "lazy" : undefined} style={{ objectPosition: s.f }} />
          </div>
        </div>
        <i className="cl-ph__cur" aria-hidden="true" />
      </div>
      <figcaption className="cl-label">
        {two(i + 1)} — {s.cap}
      </figcaption>
    </figure>
  );
}

const HOME_DIR: Dir[] = ["l", "d", "u", "u", "r", "r"];

const listShots = (el: HTMLElement | null) => [...(el?.querySelectorAll<HTMLElement>("[data-shot]") ?? [])];

/** Головна: «Клініка зсередини» */
export function Inside() {
  const { W } = useEnv();
  const G = W.gallery;
  const set: Shot[] = SHOTS.home.map((d, i) => ({ ...d, cap: G.home[i] }));
  const ref = useRef<HTMLElement>(null);
  const cur = useRef<HTMLSpanElement>(null);
  const open = useContext(LbCtx);
  useDrift(ref);
  useCursor(ref, cur);
  return (
    <section className="cl-sec cl-in" data-sec data-anc="inside" ref={ref}>
      <Rail n={3} k={G.k} h={G.h} />
      <div className="cl-grid cl-eg">
        {set.map((s, i) => (
          <ShotItem key={s.k} s={s} i={i} cls={`cl-eg__i--${i + 1}`} dir={HOME_DIR[i]} onOpen={() => open(set, i, () => listShots(ref.current))} />
        ))}
        <SplitHeading as="p" className="cl-eg__pull" parts={[G.pull]} keyIndex={0} />
      </div>
      <span className="cl-cur" ref={cur} aria-hidden="true">
        <span className="cl-cur__i">{G.look}</span>
      </span>
    </section>
  );
}

const AR_ABOUT = ["3 / 2", "4 / 5", "3 / 4", "1 / 1", "4 / 5", "3 / 2"];

/** Про нас: «Кабінети зблизька», three staggered columns */
export function Space({ n }: { n: number }) {
  const { W } = useEnv();
  const G = W.gallery;
  const set: Shot[] = SHOTS.about.map((d, i) => ({ ...d, cap: G.about[i] }));
  const ref = useRef<HTMLElement>(null);
  const cur = useRef<HTMLSpanElement>(null);
  const open = useContext(LbCtx);
  useDrift(ref);
  useCursor(ref, cur);
  return (
    <section className="cl-sec cl-ag" data-sec data-anc="space" ref={ref}>
      <Rail n={n} k={G.aboutK} h={G.aboutH} />
      <div className="cl-grid cl-ag__g">
        {[0, 1, 2].map((c) => (
          <div key={c} className={`cl-ag__col cl-ag__col--${c + 1}`}>
            {[c * 2, c * 2 + 1].map((i) => (
              <ShotItem key={set[i].k} s={set[i]} i={i} cls="cl-ag__i" ar={AR_ABOUT[i]} dir={(["l", "u", "r"] as const)[c]} onOpen={() => open(set, i, () => listShots(ref.current))} />
            ))}
          </div>
        ))}
      </div>
      <span className="cl-cur" ref={cur} aria-hidden="true">
        <span className="cl-cur__i">{G.look}</span>
      </span>
    </section>
  );
}

const STRIP_H = [20, 28, 16, 24];
const STRIP_DIR: Dir[] = ["l", "u", "d", "r"];

/** Послуги: the contact sheet, four frames on staggered baselines */
export function Strip() {
  const { W, phone } = useEnv();
  const G = W.gallery;
  const set: Shot[] = SHOTS.strip.map((d, i) => ({ ...d, cap: G.strip[i] }));
  const ref = useRef<HTMLElement>(null);
  const open = useContext(LbCtx);
  return (
    <section className="cl-strip" data-sec ref={ref}>
      <div className="cl-grid cl-strip__g">
        {set.map((s, i) => (
          <figure key={s.k + i} className={`cl-strip__f cl-strip__f--${i + 1}`} data-shot={i} data-dir={STRIP_DIR[i]} data-sec style={{ "--h": `${STRIP_H[i]}cqw` } as Css} onClick={() => open(set, i, () => listShots(ref.current))}>
            <span className="cl-strip__n cl-label">
              <b>{two(i + 1)}</b>
              <span>{two(i + 1)}A</span>
            </span>
            <div className="cl-eg__ph cl-strip__ph">
              <i className="cl-ph__cur" aria-hidden="true" />
              <img src={src(s.k, phone)} alt="" decoding="async" loading={phone ? "lazy" : undefined} style={{ objectPosition: s.f }} />
            </div>
            <figcaption className="cl-label">{s.cap}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/** the lightbox inside the frame: grows from its photo (FLIP), arrows, Esc, close; back into its photo when it closes */
export function Lightbox({ state, setState }: { state: LbState; setState: (s: LbState) => void }) {
  const { W, phone, rm } = useEnv();
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const shownSet = useRef<Shot[] | null>(null);
  const busy = useRef(false);

  // where the frame stands: centred, the photo's whole aspect, within the frame's free area
  const place = (i: number, items: () => HTMLElement[]) => {
    const el = box.current;
    const f = frame.current;
    if (!el || !f) return null;
    const W0 = el.clientWidth;
    const H0 = el.clientHeight;
    const cq = W0 / 100;
    const img = items()[i]?.querySelector("img");
    const ar = img && img.naturalWidth ? img.naturalWidth / img.naturalHeight : 4 / 3;
    const top = (phone ? 16 : 5) * cq;
    const bottom = (phone ? 30 : 9) * cq;
    const maxW = W0 * (phone ? 0.89 : 0.72);
    const maxH = H0 - top - bottom;
    let w = maxW;
    let h = w / ar;
    if (h > maxH) {
      h = maxH;
      w = h * ar;
    }
    const x = (W0 - w) / 2;
    const y = top + (maxH - h) / 2;
    Object.assign(f.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
    return { x, y, w, h };
  };
  const fromRect = (i: number, items: () => HTMLElement[]) => {
    const ph = items()[i]?.querySelector(".cl-eg__ph");
    const el = box.current;
    if (!ph || !el) return null;
    const r = ph.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height };
  };

  useLayoutEffect(() => {
    if (!state || !box.current || !frame.current) return;
    const to = place(state.i, state.items);
    const ui = box.current.querySelectorAll(".cl-lb__ui");
    const bg = box.current.querySelector(".cl-lb__bg");
    if (shownSet.current === state.set) {
      // an arrow: the next photo fades in where it is
      if (!rm) gsap.fromTo(frame.current, { opacity: 0, scale: 0.985 }, { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" });
      return;
    }
    shownSet.current = state.set;
    const from = fromRect(state.i, state.items);
    if (rm || !from || !to) return;
    const s = from.w / to.w;
    gsap.fromTo(
      frame.current,
      { x: from.x + from.w / 2 - (to.x + to.w / 2), y: from.y + from.h / 2 - (to.y + to.h / 2), scale: s, opacity: 0.35 },
      { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.65, ease: "expo.out" },
    );
    gsap.fromTo(bg, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" });
    gsap.fromTo(ui, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.25, ease: "expo.out", stagger: 0.05 });
  });

  const close = () => {
    if (!state || busy.current) return;
    const f = frame.current;
    const el = box.current;
    const from = fromRect(state.i, state.items);
    if (rm || !f || !el || !from) {
      shownSet.current = null;
      setState(null);
      return;
    }
    busy.current = true;
    const r = f.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    const to = { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height };
    const tl = gsap.timeline({
      onComplete: () => {
        busy.current = false;
        shownSet.current = null;
        setState(null);
      },
    });
    tl.to(el.querySelectorAll(".cl-lb__ui"), { opacity: 0, duration: 0.2 }, 0)
      .to(f, { x: from.x + from.w / 2 - (to.x + to.w / 2), y: from.y + from.h / 2 - (to.y + to.h / 2), scale: from.w / to.w, opacity: 0, duration: 0.45, ease: "power3.inOut" }, 0)
      .to(el.querySelector(".cl-lb__bg"), { opacity: 0, duration: 0.4 }, 0.05);
  };
  const step = (d: number) => {
    if (!state || busy.current) return;
    const n = state.set.length;
    setState({ ...state, i: (state.i + d + n) % n });
  };
  const closeRef = useRef(close);
  const stepRef = useRef(step);
  useLayoutEffect(() => {
    closeRef.current = close;
    stepRef.current = step;
  });

  // while open: Esc and the arrows; the wheel stays here; the tour taking the frame back closes it
  const open = !!state;
  useEffect(() => {
    const el = box.current;
    if (!open || !el) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      else if (e.key === "ArrowRight") stepRef.current(1);
      else if (e.key === "ArrowLeft") stepRef.current(-1);
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const pvw = el.closest<HTMLElement>(".pvw");
    const mo = pvw ? new MutationObserver(() => { if (!pvw.dataset.user) closeRef.current(); }) : null;
    if (pvw) mo?.observe(pvw, { attributes: true, attributeFilter: ["data-user"] });
    document.addEventListener("keydown", key);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      document.removeEventListener("keydown", key);
      el.removeEventListener("wheel", wheel);
      mo?.disconnect();
    };
  }, [open]);

  if (!state) return null;
  const s = state.set[state.i];
  return (
    <div className="cl-lb" ref={box}>
      <i className="cl-lb__bg" onClick={close} />
      <div className="cl-lb__frame" ref={frame}>
        <img key={s.k + state.i} src={src(s.k, phone)} alt="" decoding="async" />
      </div>
      <div className="cl-lb__bar cl-lb__ui">
        <span className="cl-label cl-lb__no">
          {two(state.i + 1)} / {two(state.set.length)}
        </span>
        <span className="cl-lb__cap">{s.cap}</span>
        <span className="cl-lb__btn cl-lb__btn--p" onClick={() => step(-1)}>
          <Arrow />
        </span>
        <span className="cl-lb__btn" onClick={() => step(1)}>
          <Arrow />
        </span>
      </div>
      <span className="cl-lb__x cl-lb__ui" onClick={close}>
        <span className="cl-label">{W.gallery.close}</span>
        <i aria-hidden="true" />
      </span>
    </div>
  );
}
