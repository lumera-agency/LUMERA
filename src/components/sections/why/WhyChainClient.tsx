"use client";
import { useLayoutEffect, useRef } from "react";
import { switching } from "@/lib/place";

/**
 * The section box for the chain (WhyChain): as the page scrolls, the link whose node has crossed 60 % of the screen
 * lights (.is-active, where the page's spine lights its nodes too), the ones before it stay lit a little (.is-past),
 * the line fills down to that same height and the link's glyph plays its story (why-orbit.js). Writes only a
 * transform and a class or two per frame; nothing runs out of view.
 */
export function WhyChainClient({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  // (before the first paint: after a language switch the chain is lit as it was, not dark for a frame)
  useLayoutEffect(() => {
    const chain = root.current?.querySelector<HTMLElement>("[data-chain]");
    if (!chain) return;
    const steps = [...chain.querySelectorAll<HTMLElement>("[data-step]")];
    const nodes = steps.map((s) => s.querySelector<HTMLElement>(".wc__node")!);
    const rail = chain.querySelector<HTMLElement>(".wc__rail")!;
    const fill = rail.querySelector<HTMLElement>(".wc__fill")!;
    let playStory: ((svg: Element | null, link: string) => unknown) | null = null;
    import("./why-orbit.js").then((m) => (playStory = m.playStory as typeof playStory));
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // the line from the first node's middle to the last one's
    let length = 1;
    const middle = (node: HTMLElement) => {
      const r = node.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };
    const layout = () => {
      const box = chain.getBoundingClientRect();
      const a = middle(nodes[0]), b = middle(nodes[nodes.length - 1]);
      length = Math.max(1, b.y - a.y);
      rail.style.cssText = `top:${(a.y - box.top).toFixed(1)}px;height:${length.toFixed(1)}px;left:${(a.x - box.left).toFixed(1)}px`;
      frame();
    };

    let active = -2;
    const light = (i: number) => {
      if (i === active) return;
      const was = active;
      active = i;
      steps.forEach((s, k) => {
        s.classList.toggle("is-active", k === i);
        s.classList.toggle("is-past", k < i);
      });
      // its glyph tells its story once, as it comes on (not when the chain is scrolled back up past it, nor as the page
      // comes back in the other language)
      if (i > was && i >= 0 && !still && !switching()) playStory?.(steps[i].querySelector(".w5-glyph svg"), steps[i].dataset.link!);
    };

    const frame = () => {
      const line = window.innerHeight * 0.6;
      const reach = Math.min(length, Math.max(0, line - rail.getBoundingClientRect().top));
      let i = -1;
      nodes.forEach((node, k) => {
        if (middle(node).y <= line + 1) i = k;
      });
      light(i);
      fill.style.transform = `scaleY(${(reach / length).toFixed(4)})`;
    };

    let queued = 0;
    // near the screen from the start (a language switch lands here): the observer's first word comes only later
    const box = chain.getBoundingClientRect();
    let near = box.bottom > -window.innerHeight / 2 && box.top < window.innerHeight * 1.5;
    const onScroll = () => {
      if (near && !queued) queued = requestAnimationFrame(() => ((queued = 0), frame()));
    };
    const io = new IntersectionObserver(
      ([e]) => {
        near = e.isIntersecting;
        if (near) layout();
      },
      { rootMargin: "50% 0px" },
    );
    io.observe(chain);
    const ro = new ResizeObserver(() => near && layout());
    ro.observe(chain);
    window.addEventListener("scroll", onScroll, { passive: true });
    layout();
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(queued);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return (
    <section ref={root} className="section why" id="why" aria-labelledby="why-title">
      {children}
    </section>
  );
}
