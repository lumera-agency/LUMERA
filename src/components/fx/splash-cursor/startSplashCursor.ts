"use client";
/** SplashCursor — smoke that follows the mouse over an area (a GPU fluid, fluid.js). Knobs mirror React
 *  Bits' <SplashCursor />. Mouse-only and motion-friendly devices; a no-op anywhere else.
 *  `quiet`: an element inside the area where the pointer stirs nothing (the header). */
export async function startSplashCursor(canvas: HTMLCanvasElement, area: HTMLElement, options: Record<string, unknown> = {}) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover) and (pointer: fine)").matches) return null;
  const root = document.documentElement;
  try {
    const { createSplashCursor } = await import("./fluid.js");
    root.classList.add("has-fluid"); // the canvas needs its layout size before the GL buffers are sized
    const fluid = (createSplashCursor as (c: HTMLCanvasElement, a: HTMLElement, o: Record<string, unknown>) => { dispose(): void } | null)(canvas, area, options);
    if (!fluid) root.classList.remove("has-fluid");
    return fluid;
  } catch (error) {
    root.classList.remove("has-fluid");
    console.warn("[hero] smoke cursor unavailable.", error);
    return null;
  }
}
