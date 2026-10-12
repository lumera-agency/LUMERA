"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useHoverReveal } from "@/components/fx/hover-reveal/useHoverReveal";

type Row = { n: number; service: string; name: string; desc: string; image: string };

/**
 * The list: names rise out of their masks as it comes in; over a row the others step back (CSS) and
 * its picture follows the cursor (HoverReveal). A row fires `services:go` — the services' ride or
 * phone switcher takes it there; with nobody listening the anchor works as usual.
 */
export function WhatList({ rows }: { rows: Row[] }) {
  const list = useRef<HTMLOListElement>(null);
  useHoverReveal(list, { rows: "[data-what-row]", images: rows.map((r) => r.image) });

  useGSAP(
    () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const names = gsap.utils.toArray<HTMLElement>(".what__name-in");
      const rest = gsap.utils.toArray<HTMLElement>(".what__num, .what__desc, .what__arrow");
      gsap.set(names, { yPercent: 108 });
      gsap.set(rest, { autoAlpha: 0, y: 14 });
      gsap.timeline({ scrollTrigger: { trigger: list.current, start: "top 82%", once: true } })
        .to(names, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.09, clearProps: "transform" }, 0)
        .to(rest, { autoAlpha: 1, y: 0, duration: 1.0, ease: "expo.out", stagger: 0.04, clearProps: "transform,opacity,visibility" }, 0.25);
    },
    { scope: list },
  );

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const event = new CustomEvent("services:go", { detail: { id }, cancelable: true });
    if (!document.dispatchEvent(event)) e.preventDefault();
  };

  return (
    <ol className="what__list" data-what-list="" ref={list}>
      {rows.map((r) => (
        <li className="what__item" key={r.n}>
          <a className="what__row" href={`#${r.service}`} data-what-row="" data-n={r.n} onClick={(e) => go(e, r.service)}>
            <span className="what__num">0{r.n}</span>
            <span className="what__name">
              <span className="what__name-in">{r.name}</span>
            </span>
            <span className="what__desc">{r.desc}</span>
            <span className="what__arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false"><path d="M7 17 17 7M8.5 7H17v8.5" /></svg>
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element -- a 4:5 thumbnail shown on touch screens only */}
            <img className="what__thumb" src={r.image} alt="" width={680} height={850} loading="lazy" decoding="async" />
          </a>
        </li>
      ))}
    </ol>
  );
}
