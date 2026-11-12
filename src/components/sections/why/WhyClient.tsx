"use client";
import { useLayoutEffect, useRef } from "react";
import { ScrollTrigger, refreshSoon } from "@/lib/gsap";
import { afterRoll } from "@/lib/boot";
import { switching } from "@/lib/place";
import { isLite } from "@/lib/lite";
import { scrollToY } from "@/lib/scroll";
import { topbarHeight } from "@/lib/css";

/** the contour's drawing, before the light starts round it (why-contour-fx.css) */
const INTRO = 2700;
/** step 1's table as a demo (why-contour-fx.css: --demo); then the time the lap's first reading of the table would
 *  take, which is left out right after the demo */
const DEMO = 7000;
const REST = 3200;
/** where the steps stand on the phones' row of steps, as a share of its loop's length (Why.tsx: STEP_LOOP); the last
 *  is the return, back at step 1 */
const STEP_AT = [0, 0.1453, 0.2905, 0.4358, 1];
/** node 1's height in the drawing (WhyFigure: a 760 × 780 field, node 1 at 380) */
const NODE_1_AT = 380 / 780;
/** the line under the contour comes as the manifesto's sentence does: ms between two words, a word's way in */
const WORD_STEP = 50;
const WORD_TIME = 1100;
const SOFT = "cubic-bezier(0.22, 1, 0.36, 1)";
/** where the steps are a row of cards (why-contour.css), and where the drawing stands beside step 1 */
const ROW = "(max-width: 1100px)";
const WIDE = "(min-width: 1101px)";

/**
 * The section box of block 4. It only says when; the moving is why-contour-fx.css.
 * Phones and tablets, where the steps are cards in a row: the page stops at the row and its scroll moves the row
 * sideways (the ride, .is-ride); the card in hand names the step (data-on, --fa, --on on the block; .is-on / .is-done
 * on the cards), the arrows and the steps' own buttons bring a card. With reduced motion there is no ride: the row
 * is swept by the thumb, the arrows and the buttons bring a card in one step.
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
    // (set below: the page stopped at the row, its scroll moving the row sideways)
    let ride: ScrollTrigger | null = null;
    const go = (i: number) => {
      const to = Math.max(0, Math.min(last, i));
      measure();
      if (at(to)) return take(to);
      bound = to;
      // (on the ride the page's scroll moves the row: one px down, one px sideways)
      if (ride) scrollToY(ride.start + stops[to], { duration: 0.8 });
      else row.scrollTo({ left: stops[to], behavior: still ? "auto" : "smooth" });
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
    // (the row is measured as the observer first reports it and whenever its size changes, never while the page is
    // being put together: a measurement there would have the browser lay the whole page out on the spot)
    // ---------- computers: step 1 stands where its table's top line meets the join from node 1 ----------
    // (the owner, 13 Nov 2026: «линия не сходится с первым пунктом»; step 1 is centred in its row, so where its line
    // falls depends on its words: it is moved by the difference, --join-dy, why-contour.css)
    const first = block.querySelector<HTMLElement>(".wv__link--1");
    const firstCard = first?.querySelector<HTMLElement>(".wv__card");
    const firstTable = first?.querySelector<HTMLElement>(".wv__mock");
    const drawing = block.querySelector<SVGSVGElement>(".wv__art > svg");
    const wide = matchMedia(WIDE);
    const meet = () => {
      if (!first || !firstCard || !firstTable || !drawing) return;
      if (!wide.matches) return first.style.removeProperty("--join-dy");
      const shift = parseFloat(first.style.getPropertyValue("--join-dy")) || 0;
      const field = drawing.getBoundingClientRect();
      // (the table's line by the layout's own offsets: the card may still be risen while the block comes in)
      const line = first.getBoundingClientRect().top + firstCard.offsetTop + firstTable.offsetTop + 0.5;
      const next = Math.round((shift + field.top + field.height * NODE_1_AT - line) * 2) / 2;
      if (next !== shift) first.style.setProperty("--join-dy", `${next}px`);
    };

    const resized = new ResizeObserver(() => {
      measure();
      read();
      meet();
    });
    const body = block.querySelector<HTMLElement>(".wv__body");
    resized.observe(row);
    for (const part of [body, first, drawing]) if (part) resized.observe(part);
    take(0);

    // ---------- motion ----------
    const observers: IntersectionObserver[] = [];
    if (!still) {
      block.classList.add("wv-fx");
      const marks = [...block.querySelectorAll(".wv__link, .wv__back")];
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

      // the line under the contour: out of a blur, from a little above, word by word, once, as it comes up the screen
      // (the manifesto's way; in LITE the line fades in as one). Passed already or seen a moment ago in the other
      // language: it simply stands
      const market = block.querySelector<HTMLElement>(".wv__market");
      if (market && typeof market.animate === "function") {
        market.classList.add("is-waiting");
        const ioMarket = new IntersectionObserver(
          (entries) => {
            const entry = entries[entries.length - 1];
            const passed = entry.boundingClientRect.bottom < 0;
            if (!entry.isIntersecting && !passed) return;
            ioMarket.disconnect();
            market.classList.remove("is-waiting");
            if (passed || switching()) return;
            if (isLite()) {
              market.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: "ease-out" });
              return;
            }
            market.querySelectorAll<HTMLElement>(".wv__word").forEach((word, index) =>
              word.animate(
                [
                  { opacity: 0, filter: "blur(8px)", transform: "translateY(-0.35em)" },
                  { opacity: 1, filter: "blur(0)", transform: "none" },
                ],
                { duration: WORD_TIME, delay: index * WORD_STEP, easing: SOFT, fill: "backwards" },
              ),
            );
          },
          { rootMargin: "0px 0px -12% 0px" },
        );
        ioMarket.observe(market);
        observers.push(ioMarket);
        offs.push(() => market.classList.remove("is-waiting"));
      }

      // phones and tablets: the page stops at the row and its scroll moves the row sideways, as the services ride
      // does on computers (the owner, 13 Nov 2026: «чтоб при скролле останавливался и скролился горизонтально»). The
      // row is held under the top bar, in the middle of the room left; one px of the page's scroll is one px sideways,
      // and a scroll that ends between two cards settles on the nearer. The thumb's own sideways sweep gives way to it
      const rowWidth = matchMedia(ROW);
      let distance = 0;
      const settle = (progress: number) => {
        if (!distance) return progress;
        return stops.reduce((best, stop) => (Math.abs(stop / distance - progress) < Math.abs(best - progress) ? stop / distance : best), 0);
      };
      const dropRide = () => {
        ride?.kill();
        ride = null;
        block.classList.remove("is-ride");
      };
      const makeRide = () => {
        dropRide();
        if (!body || !rowWidth.matches) return;
        block.classList.add("is-ride");
        ride = ScrollTrigger.create({
          trigger: body,
          pin: true,
          start: () => `top ${Math.round(topbarHeight() + Math.max(0, (window.innerHeight - topbarHeight() - body.offsetHeight) / 2))}`,
          end: () => {
            measure();
            distance = Math.max(0, row.scrollWidth - row.clientWidth);
            return `+=${distance}`;
          },
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // (after 3 · Послуги's ride and before 5 · Підхід's deck: the spacers go in in the page's order)
          refreshPriority: 1.5,
          snap: { snapTo: settle, duration: { min: 0.15, max: 0.45 }, delay: 0.06, ease: "power1.inOut" },
          onUpdate: (self) => {
            row.scrollLeft = self.progress * distance;
          },
        });
      };
      // (set up after the preloader's roll, as the other pinned blocks are, lib/boot; then every trigger below it is
      // measured again, once for all the blocks that start then: lib/gsap refreshSoon)
      let alive = true;
      afterRoll().then(() => {
        if (!alive) return;
        makeRide();
        refreshSoon();
        on(rowWidth, "change", () => {
          makeRide();
          refreshSoon();
        });
      });
      offs.push(() => {
        alive = false;
        dropRide();
      });
      // a pointer: the stone leans after it
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
      block.classList.remove("wv-fx", "wv-skip", "is-in", "is-run", "is-live", "is-swept", "is-demo", "is-demoed", "is-ride");
      first?.style.removeProperty("--join-dy");
      block.querySelectorAll(".is-seen, .is-on, .is-done, .is-reread").forEach((el) => el.classList.remove("is-seen", "is-on", "is-done", "is-reread"));
    };
  }, []);
  return (
    <section ref={root} className="section why wv" id="why" aria-labelledby="why-title">
      {children}
    </section>
  );
}
