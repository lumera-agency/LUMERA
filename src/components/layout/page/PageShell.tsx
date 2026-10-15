"use client";
/*
 * The page below the hero: the seam (the hero's light and grain carry on, then fade into the page),
 * the system line down the left edge (the "spine": it fills with the scroll, each section's node
 * lights as it passes 60% of the view), and the page-wide effects: scroll reveals, the card
 * spotlight, off-screen marks, and the reading anchor on a width change.
 */
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ScrollReveals } from "@/components/fx/scroll-reveal/ScrollReveals";
import { useSpotlight } from "@/components/fx/spotlight/useSpotlight";
import { rememberPlace } from "@/lib/boot";
import { routeAnchorLinks } from "@/lib/scroll";

export function PageShell({ children }: { children: React.ReactNode }) {
  const page = useRef<HTMLDivElement>(null);
  const bridge = useRef<HTMLDivElement>(null);
  const bridgeGlow = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const head = useRef<HTMLSpanElement>(null);

  useSpotlight(page, ".card");

  // links to a block go there without a #id in the address; a reload comes back to the same place
  useEffect(() => {
    const offLinks = routeAnchorLinks();
    const offPlace = rememberPlace();
    return () => {
      offLinks();
      offPlace();
    };
  }, []);

  // the seam: the bridge draws the hero glow's light in page coordinates
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    const glow = document.querySelector<HTMLElement>("[data-glow]");
    const el = page.current;
    if (!hero || !el || !bridge.current) return;
    const sync = () => {
      const h = hero.getBoundingClientRect();
      el.style.setProperty("--hero-h", `${h.height}px`);
      if (!glow || !bridgeGlow.current) return;
      const g = glow.getBoundingClientRect();
      const x = g.left + g.width / 2 - h.left;
      const y = g.top + g.height / 2 - h.bottom;
      bridgeGlow.current.style.width = `${g.width}px`;
      bridgeGlow.current.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(hero);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover) and (pointer: fine)").matches) return () => ro.disconnect();
    // the hero glow drifts with the pointer: follow it only while the seam is on screen
    let frame = 0;
    let visible = false;
    const loop = () => {
      sync();
      frame = visible ? requestAnimationFrame(loop) : 0;
    };
    const io = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(loop);
    });
    io.observe(bridge.current);
    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  // the spine, the section nodes, off-screen marks
  useGSAP(
    () => {
      const el = page.current!;
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.target.classList.toggle("is-offscreen", !e.isIntersecting)),
        { rootMargin: "25% 0px" },
      );
      el.querySelectorAll("section[id]").forEach((s) => io.observe(s));
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(fill.current, { scaleY: 1 });
        return () => io.disconnect();
      }
      gsap.to(fill.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 60%", end: "bottom 60%", scrub: true, onToggle: (self) => head.current?.classList.toggle("is-on", self.isActive) },
      });
      for (const meta of el.querySelectorAll(".s-head__meta")) {
        ScrollTrigger.create({ trigger: meta, start: "top 60%", onEnter: () => meta.classList.add("is-passed"), onLeaveBack: () => meta.classList.remove("is-passed") });
      }
      return () => io.disconnect();
    },
    { scope: page },
  );

  // a width change re-lays the page: the visitor stays at the block they were reading
  useEffect(() => {
    const el = page.current;
    if (!el) return;
    const blocks = [...el.querySelectorAll<HTMLElement>("section[id]"), ...document.querySelectorAll<HTMLElement>(".footer")];
    const line = () => window.innerHeight / 3;
    let anchor: { el: HTMLElement; at: number } | null = null;
    let width = window.innerWidth;
    let timer = 0;
    const record = () => {
      const y = line();
      anchor = null;
      for (const b of blocks) {
        const r = b.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) {
          anchor = { el: b, at: (y - r.top) / r.height };
          return;
        }
      }
    };
    const onScroll = () => {
      clearTimeout(timer);
      timer = window.setTimeout(record, 200);
    };
    const onRefresh = () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      if (!anchor) return;
      const r = anchor.el.getBoundingClientRect();
      window.scrollTo({ top: window.scrollY + r.top + anchor.at * r.height - line(), behavior: "instant" });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    ScrollTrigger.addEventListener("refresh", onRefresh);
    record();
    return () => {
      window.removeEventListener("scroll", onScroll);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
    };
  }, []);

  return (
    <div className="page" data-page ref={page}>
      <div className="page__bridge" data-bridge aria-hidden="true" ref={bridge}>
        <span className="page__bridge-glow" data-bridge-glow ref={bridgeGlow} />
      </div>
      <div className="page__grain" aria-hidden="true" />
      <div className="spine" aria-hidden="true"><span className="spine__fill" data-spine ref={fill} /></div>
      <span className="spine__head" data-spine-head aria-hidden="true" ref={head} />
      {children}
      <ScrollReveals />
    </div>
  );
}
