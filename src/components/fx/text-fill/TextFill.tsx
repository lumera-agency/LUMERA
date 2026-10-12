"use client";
/*
 * TextFill — a paragraph whose words light up as you read down (text fill on scroll): each word
 * starts dim and fills to full as the paragraph passes from 82% to 48% of the view, scrubbed.
 * Words are split on ordinary spaces only, so a no-break pair («і в») lights up as one.
 * The dim start is CSS ([data-statement] .w, services.css) — reduced motion shows it lit.
 */
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export function TextFill({ as = "p", className, children, start = "top 82%", end = "bottom 48%" }: { as?: "p" | "div" | "span" | "h2" | "h3"; className?: string; children: string; start?: string; end?: string }) {
  const ref = useRef<HTMLElement>(null);
  const Tag = as as "p";
  useGSAP(
    () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(ref.current!.querySelectorAll(".w"), { opacity: 1 });
        return;
      }
      gsap.to(ref.current!.querySelectorAll(".w"), { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: ref.current, start, end, scrub: 0.6 } });
    },
    { scope: ref },
  );
  const parts = children.split(/([ \t\r\n]+)/).filter(Boolean);
  return (
    <Tag ref={ref as React.RefObject<HTMLParagraphElement>} className={className} data-statement="">
      {parts.map((p, i) => (/^[ \t\r\n]+$/.test(p) ? " " : <span className="w" key={i}>{p}</span>))}
    </Tag>
  );
}
