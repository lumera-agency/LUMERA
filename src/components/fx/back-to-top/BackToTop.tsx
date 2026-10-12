"use client";
/*
 * BackToTop: a round button in the bottom right corner that takes the page back to the top. No run
 * back through the page: it dims, jumps and comes up on the first screen (lib/scroll fadeJumpTo).
 * It comes up once the first screen is behind, its ring fills with the page's progress, and it steps
 * aside wherever something of the page's own sits in that corner (`quiet`: the ride's HUD, sticky
 * bars, the footer with its own link up).
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
};

const R = 23;
const RING = 2 * Math.PI * R;

export function BackToTop({ label, after = 1, quiet = "footer" }: Props) {
  const button = useRef<HTMLAnchorElement>(null);
  const ring = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = button.current;
    if (!el) return;
    let queued = 0;
    const check = () => {
      queued = 0;
      const de = document.documentElement;
      const max = de.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      ring.current?.style.setProperty("stroke-dashoffset", (RING * (1 - Math.min(1, Math.max(0, max > 0 ? y / max : 0)))).toFixed(1));
      const box = el.getBoundingClientRect();
      const pad = 12;
      const blocked = [...document.querySelectorAll<HTMLElement>(quiet)].some((q) => {
        if (!q.offsetParent && getComputedStyle(q).position !== "fixed") return false; // not shown
        const r = q.getBoundingClientRect();
        return r.width > 0 && r.left < box.right + pad && r.right > box.left - pad && r.top < box.bottom + pad && r.bottom > box.top - pad;
      });
      const on = y > window.innerHeight * after && !blocked;
      el.classList.toggle("is-on", on);
      el.tabIndex = on ? 0 : -1;
      el.setAttribute("aria-hidden", String(!on));
    };
    const queue = () => {
      if (!queued) queued = requestAnimationFrame(check);
    };
    queue();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(queued);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, [after, quiet]);

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
