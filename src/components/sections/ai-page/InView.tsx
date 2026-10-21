"use client";
import { useEffect, useRef, useState } from "react";

/**
 * A looping demo's switch: its CSS animations run (.is-on) only while a quarter of it is on the screen, and wait
 * where they are off it (ai-page.css pauses them). With reduced motion the CSS shows the final frame and this does
 * nothing that matters.
 */
export function InView({ className, children, label }: { className: string; children: React.ReactNode; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOn(entry.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={on ? `${className} is-on` : className} role={label ? "img" : undefined} aria-label={label}>
      {children}
    </div>
  );
}
