"use client";
import { useEffect, useRef } from "react";

/** The section box; starts the glyphs' relay (why-orbit.js) and, on phones, the strip of cards. */
export function WhyClient({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = matchMedia("(max-width: 600px)");
    let alive = true;
    let cleanup = () => {};
    (async () => {
      const [{ mountWhy }, { mountHScroll }, { ScrollTrigger }] = await Promise.all([import("./why-orbit.js"), import("./why-phone.js"), import("@/lib/gsap")]);
      if (!alive) return;
      // ≤ 600 px the strip of cards is the picture and the table's relay waits
      const api = (mountWhy as unknown as (root: HTMLElement, o: { reducedMotion: boolean; idle: () => boolean }) => { sync(): void; destroy?(): void } | null)(el, { reducedMotion, idle: () => phone.matches });
      let strip = false;
      const mountStrip = () => {
        if (strip || !phone.matches) return;
        strip = true;
        mountHScroll(el, { reducedMotion });
      };
      mountStrip();
      requestAnimationFrame(() => ScrollTrigger.refresh());
      const onChange = () => {
        api?.sync();
        mountStrip();
        requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      phone.addEventListener("change", onChange);
      cleanup = () => {
        phone.removeEventListener("change", onChange);
        api?.destroy?.();
      };
    })();
    return () => {
      alive = false;
      cleanup();
    };
  }, []);
  return (
    <section ref={root} className="section why" id="why" aria-labelledby="why-title">
      {children}
    </section>
  );
}
