"use client";
import { useMediaQuery } from "@/lib/hooks";
import { HeroFlux } from "@/components/sites/hero-fx/HeroFlux";

/** The first screen's ground on wide screens only: the sibling pages' FluxLines, black and white, still under the
 *  pointer (the cards are what answers it). Phones and tablets get the plain page (the owner's pick of 26 Oct: the
 *  compact rows there, no lines), and no WebGL is started for them. */
export function AboutFlux() {
  const wide = useMediaQuery("(min-width: 861px)");
  return wide ? <HeroFlux under="#work" tone="mono" still /> : null;
}
