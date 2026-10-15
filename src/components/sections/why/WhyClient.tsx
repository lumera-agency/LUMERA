"use client";
import { useEffect, useRef } from "react";

/** The section box; starts the glyphs' relay (why-orbit.js) and, on phones, the accordion (why-phone.js). */
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
      const [{ mountWhy }, { mountAccordion }, { ScrollTrigger }] = await Promise.all([import("./why-orbit.js"), import("./why-phone.js"), import("@/lib/gsap")]);
      if (!alive) return;
      // ≤ 600 px the accordion is the picture and the table's relay waits
      const api = (mountWhy as unknown as (root: HTMLElement, o: { reducedMotion: boolean; idle: () => boolean }) => { sync(): void; destroy?(): void } | null)(el, { reducedMotion, idle: () => phone.matches });
      const accordion = mountAccordion(el, { reducedMotion });
      requestAnimationFrame(() => ScrollTrigger.refresh());
      const onChange = () => {
        api?.sync();
        requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      phone.addEventListener("change", onChange);
      cleanup = () => {
        phone.removeEventListener("change", onChange);
        api?.destroy?.();
        accordion?.destroy();
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
