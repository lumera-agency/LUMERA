"use client";
import { useLayoutEffect, useRef } from "react";
import { switching } from "@/lib/place";

/** the contour's drawing, before the light starts round it (why-contour-fx.css) */
const INTRO = 2700;
/** step 1's table as a demo (why-contour-fx.css: --demo); then the time the lap's first reading of the table would
 *  take, which is left out right after the demo */
const DEMO = 7000;
const REST = 3200;
/** where the steps stand on the phones' row of steps, as a share of its loop's length (Why.tsx: STEP_LOOP); the last
 *  is the return, back at step 1 */
const STEP_AT = [0, 0.1453, 0.2905, 0.4358, 1];

/**
 * The section box of block 4. It only says when; the moving is why-contour-fx.css.
 * Phones and tablets, where the steps are cards in a row swept sideways: the card in hand names the step (data-on,
 * --fa, --on on the block; .is-on / .is-done on the cards), the arrows and the steps' own buttons bring a card, and
 * once, as the row comes into view, it gives a small push sideways to show its way. This part works with reduced
 * motion as well (without the push, the row going in one step).
 * Motion: .wv-fx (allowed), .is-in once the block has come into view (the contour draws), .is-run when that is done
 * (the light goes round), .is-live while it is on the screen in a shown tab (off it everything waits), .is-seen on a
 * step and on the line under the contour as they come into view; .is-demo for the 7 seconds step 1's table plays
 * its demo, once, as it comes into view, .is-demoed after it. With a pointer the stone leans a little after it.
 */
export function WhyClient({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  // (before the first paint: after a language switch the block stands as it was, not empty for a frame)
  useLayoutEffect(() => {
    const block = root.current;
    const row = block?.querySelector<HTMLElement>(".wv__loop");
    if (!block || !row) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    const offs: (() => void)[] = [];
    const on = <T extends EventTarget>(target: T, type: string, fn: EventListener, options?: AddEventListenerOptions) => {
      target.addEventListener(type, fn, options);
      offs.push(() => target.removeEventListener(type, fn, options));
    };

    // ---------- the row of cards ----------
    const items = [...row.querySelectorAll<HTMLElement>(".wv__link, .wv__back")];
    const steps = [...block.querySelectorAll<HTMLButtonElement>(".wv__step-n")];
    const arrows = [...block.querySelectorAll<HTMLButtonElement>(".wv__nav-b")];
    const last = items.length - 1;
    // where the row stands with each card in hand (the last ones may share the row's end)
    let stops: number[] = [];
    const measure = () => {
      const end = Math.max(0, row.scrollWidth - row.clientWidth);
      stops = items.map((item) => Math.min(end, item.offsetLeft - items[0].offsetLeft));
    };
    let hand = -1; // the card in hand
    let bound = -1; // the card the row is on its way to (an arrow, a step's button)
    const take = (i: number) => {
      if (i === hand) return;
      const was = hand;
      hand = i;
      block.dataset.on = String(i + 1);
      block.style.setProperty("--fa", String(STEP_AT[i]));
      block.style.setProperty("--on", String(i + 1));
      items.forEach((item, k) => {
        item.classList.toggle("is-on", k === i);
        item.classList.toggle("is-done", k < i);
      });
      // (step 1 back in hand after its demo: its table is read through once more)
      items[0].classList.toggle("is-reread", i === 0 && was > 0 && block.classList.contains("is-demoed"));
      steps.forEach((step, k) => (k === i % steps.length ? step.setAttribute("aria-current", "step") : step.removeAttribute("aria-current")));
      arrows.forEach((arrow) => (arrow.disabled = arrow.dataset.dir === "-1" ? i === 0 : i === last));
    };
    const at = (i: number) => Math.abs(stops[i] - row.scrollLeft) < 4;
    const read = () => {
      if (bound >= 0 && at(bound)) {
        take(bound);
        bound = -1;
        return;
      }
      if (hand >= 0 && at(hand)) return;
      let near = 0;
      stops.forEach((stop, i) => {
        if (Math.abs(stop - row.scrollLeft) < Math.abs(stops[near] - row.scrollLeft)) near = i;
      });
      take(near);
    };
    const go = (i: number) => {
      const to = Math.max(0, Math.min(last, i));
      measure();
      if (at(to)) return take(to);
      bound = to;
      row.scrollTo({ left: stops[to], behavior: still ? "auto" : "smooth" });
    };
    on(row, "scroll", () => {
      if (row.scrollLeft > 90) block.classList.add("is-swept");
      read();
    }, { passive: true });
    on(row, "pointerdown", () => (bound = -1), { passive: true });
    on(block, "click", (e) => {
      const button = (e.target as Element).closest<HTMLElement>(".wv__step-n, .wv__nav-b");
      if (!button) return;
      block.classList.add("is-swept");
      go(button.dataset.go ? +button.dataset.go : hand + +(button.dataset.dir || 0));
    });
    const resized = new ResizeObserver(() => {
      measure();
      read();
    });
    resized.observe(row);
    measure();
    take(0);

    // ---------- motion ----------
    const observers: IntersectionObserver[] = [];
    if (!still) {
      block.classList.add("wv-fx");
      const marks = [...block.querySelectorAll(".wv__link, .wv__back, .wv__market")];
      // the light starts round once the contour is drawn, and not before the table's demo is done
      let starts = 0;
      let demoEnds = 0;
      const start = (ms: number) => {
        clearTimeout(starts);
        starts = window.setTimeout(() => block.classList.add("is-run"), ms);
        timers.push(starts);
      };
      const enter = () => {
        if (block.classList.contains("is-in")) return;
        block.classList.add("is-in");
        start(Math.max(INTRO, demoEnds - performance.now()));
      };
      const demo = () => {
        if (block.classList.contains("is-demo") || block.classList.contains("is-demoed")) return;
        // where the head row and the price column stand in the table (the reading line starts under the head, the
        // band covers the column)
        const table = block.querySelector<HTMLElement>(".wv__tbl");
        const head = table?.querySelector("thead");
        const price = head?.querySelector("th:nth-child(2)");
        if (table && head && price) {
          const t = table.getBoundingClientRect(), h = head.getBoundingClientRect(), c = price.getBoundingClientRect();
          table.style.setProperty("--head-top", `${(h.top - t.top).toFixed(1)}px`);
          table.style.setProperty("--head-bottom", `${(h.bottom - t.top).toFixed(1)}px`);
          table.style.setProperty("--col-x", `${(c.left - t.left).toFixed(1)}px`);
          table.style.setProperty("--col-w", `${c.width.toFixed(1)}px`);
        }
        block.classList.add("is-demo");
        demoEnds = performance.now() + DEMO;
        if (block.classList.contains("is-in") && !block.classList.contains("is-run")) start(DEMO);
        timers.push(
          window.setTimeout(() => {
            block.classList.remove("is-demo");
            block.classList.add("is-demoed");
          }, DEMO + REST),
        );
      };
      if (switching() && block.getBoundingClientRect().top < window.innerHeight) {
        // the page back in the other language: what was on screen stands as it was
        block.classList.add("wv-skip", "is-in", "is-run", "is-swept", "is-demoed");
        marks.forEach((el) => el.getBoundingClientRect().top < window.innerHeight && el.classList.add("is-seen"));
        timers.push(window.setTimeout(() => block.classList.remove("wv-skip"), 100));
      }
      // it has come into view: on computers the drawing, on phones (no drawing there) the row
      const fig = block.querySelector(".wv__fig");
      const ioFig = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && enter(), { threshold: 0.35 });
      const ioRow = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && enter(), { rootMargin: "0px 0px -30% 0px" });
      if (fig) ioFig.observe(fig);
      ioRow.observe(row);
      const ioSeen = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add("is-seen");
            ioSeen.unobserve(e.target);
          }),
        { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
      );
      marks.forEach((el) => ioSeen.observe(el));
      let onScreen = false;
      const live = () => block.classList.toggle("is-live", onScreen && !document.hidden);
      const ioLive = new IntersectionObserver((entries) => {
        onScreen = entries[entries.length - 1].isIntersecting;
        live();
      });
      ioLive.observe(block);
      on(document, "visibilitychange", live);
      // the push: a little to the side and back by itself (the snap would bring it home as well)
      const ioPush = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting) || getComputedStyle(row).overflowX !== "auto") return;
          ioPush.disconnect();
          if (block.classList.contains("is-swept")) return;
          timers.push(window.setTimeout(() => !row.scrollLeft && row.scrollTo({ left: 84, behavior: "smooth" }), 900));
          timers.push(window.setTimeout(() => row.scrollLeft < 120 && row.scrollTo({ left: 0, behavior: "smooth" }), 1750));
        },
        { threshold: 0.7 },
      );
      ioPush.observe(row);
      // the table has come into view: its demo, once
      const mock = block.querySelector(".wv__mock");
      const ioDemo = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          ioDemo.disconnect();
          demo();
        },
        { threshold: 0.6 },
      );
      if (mock) ioDemo.observe(mock);
      observers.push(ioFig, ioRow, ioSeen, ioLive, ioPush, ioDemo);
      // a pointer: the stone leans after it
      const body = block.querySelector<HTMLElement>(".wv__body");
      if (body && matchMedia("(hover: hover) and (pointer: fine)").matches) {
        let frame = 0;
        on(body, "pointermove", (e) => {
          const { clientX, clientY } = e as PointerEvent;
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => {
            const r = body.getBoundingClientRect();
            body.style.setProperty("--px", ((clientX - r.left) / r.width - 0.5).toFixed(3));
            body.style.setProperty("--py", ((clientY - r.top) / r.height - 0.5).toFixed(3));
          });
        });
        on(body, "pointerleave", () => {
          cancelAnimationFrame(frame);
          body.style.setProperty("--px", "0");
          body.style.setProperty("--py", "0");
        });
        offs.push(() => cancelAnimationFrame(frame));
      }
    }
    return () => {
      resized.disconnect();
      observers.forEach((observer) => observer.disconnect());
      offs.forEach((off) => off());
      timers.forEach(clearTimeout);
      block.classList.remove("wv-fx", "wv-skip", "is-in", "is-run", "is-live", "is-swept", "is-demo", "is-demoed");
      block.querySelectorAll(".is-seen, .is-on, .is-done, .is-reread").forEach((el) => el.classList.remove("is-seen", "is-on", "is-done", "is-reread"));
    };
  }, []);
  return (
    <section ref={root} className="section why wv" id="why" aria-labelledby="why-title">
      {children}
    </section>
  );
}
