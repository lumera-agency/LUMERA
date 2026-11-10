"use client";
/*
 * BackToTop: a round button in the bottom right corner that takes the page back to the top. No run
 * back through the page: it dims, jumps and comes up on the first screen (lib/scroll fadeJumpTo).
 * It comes up once the first screen is behind, its ring fills with the page's progress, and it steps
 * aside wherever something of the page's own sits in that corner (`quiet`: the ride's HUD, the request
 * form, the footer with its own link up). A bar pinned to the bottom (the phones' request bar, the sum
 * bars) does not hide it: it rises above the bar (the owner, 10 Nov 2026: on phones it was gone for
 * most of the page).
 */
import { useEffect, useRef } from "react";
import { fadeJumpTo } from "@/lib/scroll";
import "./back-to-top.css";

type Props = {
  /** accessible name (and tooltip) */
  label: string;
  /** shown after this many screen heights of scroll */
  after?: number;
  /** where it steps aside: anything matching that overlaps the button */
  quiet?: string;
  /** on phones (and phones on their side), where it steps aside instead of `quiet` */
  phoneQuiet?: string;
};

/** bars pinned to the bottom of the screen: the button rises above whichever is there */
const BARS = ".ai-sticky.is-on .btn, .st-sumbar.is-on, .cfg-bar:not(.is-hidden)";
const PHONE = "(max-width: 860px), (max-width: 932px) and (max-height: 500px)";
/** room between a bar and the button, px */
const BAR_GAP = 10;
/** ms between looks at the bars and the places it steps aside from while scrolling */
const PLACE_EVERY = 120;

const R = 23;
const RING = 2 * Math.PI * R;

export function BackToTop({ label, after = 1, quiet = "footer", phoneQuiet }: Props) {
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
    const phone = matchMedia(PHONE);
    let rest = { right: 0, bottom: 0, size: 0 };
    let max = 0;
    const measure = () => {
      // where the button rests without a lift (its own transitions and translate aside): from its CSS, per size
      const look = getComputedStyle(el);
      rest = { right: window.innerWidth - parseFloat(look.right), bottom: window.innerHeight - parseFloat(look.bottom), size: el.offsetWidth };
      max = document.documentElement.scrollHeight - window.innerHeight;
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
      const box = { left: right - size, right, top: bottom - lift - size, bottom: bottom - lift };
      const pad = 12;
      const where = phoneQuiet && phone.matches ? phoneQuiet : quiet;
      const early = y <= window.innerHeight * after; // (still on the first screen: nothing to look for)
      const blocked = !early && [...document.querySelectorAll<HTMLElement>(where)].some((q) => {
        if (!q.offsetParent && getComputedStyle(q).position !== "fixed") return false; // not shown
        const r = q.getBoundingClientRect();
        return r.width > 0 && r.left < box.right + pad && r.right > box.left - pad && r.top < box.bottom + pad && r.bottom > box.top - pad;
      });
      const on = !early && !blocked;
      if (lift !== shownLift) {
        shownLift = lift;
        el.style.setProperty("--to-top-lift", `${lift}px`);
      }
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
    // the page grows as its parts load (the height for the ring)
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
  }, [after, quiet, phoneQuiet]);

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
