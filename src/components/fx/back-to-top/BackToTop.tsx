"use client";
/*
 * BackToTop: a round button in the bottom right corner that takes the page back to the top. No run
 * back through the page: it dims, jumps and comes up on the first screen (lib/scroll fadeJumpTo).
 * It comes up once the first screen is behind and stays, its ring filling with the page's progress, until
 * the footer's «Студія» column reaches it; on the way back up it is there again at once (the owner, 13 Nov
 * 2026: «так же как с самого начала не появляется, так и чуть в конце исчезает». It used to step aside over
 * the whole footer, the request form and the controls in that corner: it was gone long before the page's
 * end and came back late). Both edges are scroll positions measured when the page's size changes, so it
 * shows and hides on the frame the scroll crosses them. A bar pinned to the bottom (the phones' request bar,
 * the sum bars) does not hide it: it rises above the bar (the owner, 10 Nov 2026).
 */
import { useEffect, useRef } from "react";
import { fadeJumpTo } from "@/lib/scroll";
import "./back-to-top.css";

type Props = {
  /** accessible name (and tooltip) */
  label: string;
  /** shown after this many screen heights of scroll */
  after?: number;
};

/** bars pinned to the bottom of the screen: the button rises above whichever is there (the services ride's panel too:
 *  its «skip» sits in that corner for the whole ride) */
const BARS = ".ai-sticky.is-on .btn, .st-sumbar.is-on, .cfg-bar:not(.is-hidden), .ride.is-on .ride__hud";
/** where it goes at the page's end: as this reaches it (the footer's map, on every page) */
const LAST = ".footer__col--studio";
/** room between a bar and the button, px */
const BAR_GAP = 10;
/** ms between looks at the bars while scrolling */
const PLACE_EVERY = 120;

const R = 23;
const RING = 2 * Math.PI * R;

export function BackToTop({ label, after = 1 }: Props) {
  const button = useRef<HTMLAnchorElement>(null);
  const ring = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = button.current;
    if (!el) return;
    let queued = 0;
    // (every scroll frame: all the reads first, then only the writes that change something. A write between reads, or
    // the same value written again each frame, had the browser recompute the page's styles on every frame of a scroll)
    // (10 Nov 2026: still among the costliest scripts of a scroll on every page, so the ring alone follows each frame;
    // the page's height is measured when it changes, and the bars and the places it steps aside from, which need the
    // layout, are looked at about eight times a second while scrolling and once more as it stops)
    let rest = { right: 0, bottom: 0, size: 0 };
    let max = 0;
    // the scroll from which it is gone again: the footer's «Студія» column up at the button's top
    let goneFrom = Infinity;
    const measure = () => {
      // where the button rests without a lift (its own transitions and translate aside): from its CSS, per size
      const look = getComputedStyle(el);
      rest = { right: window.innerWidth - parseFloat(look.right), bottom: window.innerHeight - parseFloat(look.bottom), size: el.offsetWidth };
      max = document.documentElement.scrollHeight - window.innerHeight;
      const last = document.querySelector<HTMLElement>(LAST);
      goneFrom = last?.offsetParent ? last.getBoundingClientRect().top + window.scrollY - (rest.bottom - rest.size) : Infinity;
    };
    measure();
    let shownRing = "";
    let shownLift = -1;
    let shownOn: boolean | null = null;
    let placedAt = -Infinity;
    let settle = 0;
    const check = () => {
      queued = 0;
      const y = window.scrollY;
      const ringOffset = (RING * (1 - Math.min(1, Math.max(0, max > 0 ? y / max : 0)))).toFixed(1);
      if (ringOffset !== shownRing) {
        shownRing = ringOffset;
        ring.current?.style.setProperty("stroke-dashoffset", ringOffset);
      }
      show(y);
      const now = performance.now();
      if (now - placedAt < PLACE_EVERY) return;
      placedAt = now;
      place(y);
    };
    const place = (y: number) => {
      const { right, bottom, size } = rest;
      let lift = 0;
      for (const bar of document.querySelectorAll<HTMLElement>(BARS)) {
        const r = bar.getBoundingClientRect();
        const pinned = r.width > 0 && r.bottom > window.innerHeight - 64 && r.left < right && r.right > right - size;
        if (pinned) lift = Math.max(lift, bottom - r.top + BAR_GAP);
      }
      lift = Math.round(lift);
      if (lift !== shownLift) {
        shownLift = lift;
        el.style.setProperty("--to-top-lift", `${lift}px`);
      }
      show(y);
    };
    // (no layout read: past the first screen and short of the footer's «Студія»)
    const show = (y: number) => {
      const on = y > window.innerHeight * after && y < goneFrom;
      if (on !== shownOn) {
        shownOn = on;
        el.classList.toggle("is-on", on);
        el.tabIndex = on ? 0 : -1;
        el.setAttribute("aria-hidden", String(!on));
      }
    };
    const queue = () => {
      if (!queued) queued = requestAnimationFrame(check);
      // and once more as the scroll stops, where it came to rest
      clearTimeout(settle);
      settle = window.setTimeout(() => place(window.scrollY), PLACE_EVERY + 30);
    };
    const resized = () => {
      measure();
      placedAt = -Infinity;
      queue();
    };
    queue();
    // the page grows as its parts load (the height for the ring, where the footer stands)
    const grown = new ResizeObserver(resized);
    grown.observe(document.body);
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", resized);
    return () => {
      cancelAnimationFrame(queued);
      clearTimeout(settle);
      grown.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", resized);
    };
  }, [after]);

  return (
    <a
      ref={button}
      className="to-top"
      href="#"
      aria-label={label}
      title={label}
      tabIndex={-1}
      aria-hidden="true"
      onClick={(e) => {
        e.preventDefault();
        if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
        fadeJumpTo(0);
        button.current?.blur();
      }}
    >
      <svg className="to-top__ring" viewBox="0 0 50 50" aria-hidden="true" focusable="false">
        <circle className="to-top__track" cx="25" cy="25" r={R} />
        <circle ref={ring} className="to-top__fill" cx="25" cy="25" r={R} style={{ strokeDasharray: RING.toFixed(1), strokeDashoffset: RING.toFixed(1) }} />
      </svg>
      <span className="to-top__icon" aria-hidden="true">
        <svg className="to-top__arrow to-top__arrow--a" viewBox="0 0 24 24" focusable="false"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
        <svg className="to-top__arrow to-top__arrow--b" viewBox="0 0 24 24" focusable="false"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
      </span>
    </a>
  );
}
