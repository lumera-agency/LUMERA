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
import { lockViewport } from "@/lib/viewport";
import { heroGlow, onHeroGlow } from "@/lib/hero-glow";
import { skipFarBlocks } from "@/lib/perf/far";

/**
 * `skip`: the page's blocks (selectors of children of the page) that are not rendered while far from the view, in FULL
 * (lib/perf/far). Never a pinned block or one that holds a pin, nor one whose height changes as its parts load.
 */
export function PageShell({ children, skip }: { children: React.ReactNode; skip?: string }) {
  const page = useRef<HTMLDivElement>(null);
  const bridge = useRef<HTMLDivElement>(null);
  const bridgeGlow = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const head = useRef<HTMLSpanElement>(null);

  useSpotlight(page, ".card");
  // every page's first screen is sized from the locked screen heights (tokens.css: --screen-l, --screen-s)
  useEffect(() => lockViewport(), []);

  // links to a block go there without a #id in the address; a reload comes back to the same place
  useEffect(() => {
    const offLinks = routeAnchorLinks();
    const offPlace = rememberPlace();
    return () => {
      offLinks();
      offPlace();
    };
  }, []);

  // the blocks far from the view are not rendered (FULL)
  useEffect(() => {
    const el = page.current;
    if (!el || !skip) return;
    return skipFarBlocks([...el.querySelectorAll<HTMLElement>(skip)].filter((block) => block.parentElement === el));
  }, [skip]);

  // the seam: the bridge draws the hero glow's light in page coordinates
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    const glow = document.querySelector<HTMLElement>("[data-glow]");
    const el = page.current;
    if (!hero || !el || !bridge.current) return;
    // measured once and on a resize: the hero's height, and the glow's centre where the CSS put it (in the hero's box,
    // its lift taken off); after that only numbers (lib/hero-glow), never the boxes
    let heroHeight = 0;
    let measuredX = 0;
    let measuredY = 0;
    let placed = "";
    const place = () => {
      const target = bridgeGlow.current;
      if (!target) return;
      const centerX = Number.isNaN(heroGlow.centerX) ? measuredX : heroGlow.centerX;
      const centerY = (Number.isNaN(heroGlow.centerY) ? measuredY : heroGlow.centerY) + heroGlow.lift - heroHeight;
      const transform = `translate3d(${centerX.toFixed(1)}px, ${centerY.toFixed(1)}px, 0) translate(-50%, -50%)`;
      if (transform === placed) return;
      placed = transform;
      target.style.transform = transform;
    };
    const sync = () => {
      const h = hero.getBoundingClientRect();
      heroHeight = h.height;
      el.style.setProperty("--hero-h", `${h.height}px`);
      if (!glow || !bridgeGlow.current) return;
      const g = glow.getBoundingClientRect();
      measuredX = g.left + g.width / 2 - h.left;
      measuredY = g.top + g.height / 2 - h.top - heroGlow.lift;
      bridgeGlow.current.style.width = `${g.width}px`;
      placed = "";
      place();
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(hero);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover) and (pointer: fine)").matches) return () => ro.disconnect();
    // the hero glow rides up with the hero's lift as the page scrolls: followed as its writers move it (in their own
    // frame), only while the seam is on screen. No frame loop of its own: one running at rest had the page's thread
    // restyle every CSS animation on every frame (lib/hero-glow)
    let visible = false;
    const io = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) place();
    });
    io.observe(bridge.current);
    const stopFollowing = onHeroGlow(() => visible && place());
    return () => {
      ro.disconnect();
      io.disconnect();
      stopFollowing();
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
      // a section head's meta is passed once its top is above 60% of the screen (and again not, scrolled back above).
      // An observer, not a trigger each (10 Nov 2026: seven of them looked at on every frame of every scroll); its
      // area reaches far above the screen, so a jump past one counts as passing it
      const passed = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle("is-passed", e.isIntersecting)), {
        rootMargin: "100000px 0px -40% 0px",
      });
      el.querySelectorAll(".s-head__meta").forEach((meta) => passed.observe(meta));
      return () => {
        io.disconnect();
        passed.disconnect();
      };
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
      <div className="spine" aria-hidden="true"><span className="spine__fill" data-spine ref={fill} /></div>
      <span className="spine__head" data-spine-head aria-hidden="true" ref={head} />
      {children}
      <ScrollReveals />
    </div>
  );
}
