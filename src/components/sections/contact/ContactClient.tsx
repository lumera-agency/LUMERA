"use client";
import { useLayoutEffect } from "react";

/**
 * Starts the form (lead-form.js) once the block is in the page, and takes it down when the block goes (a language
 * switch renders the page anew). A layout effect: after a switch the module is in already, so the form is live before
 * the page is painted.
 */
export function ContactClient() {
  useLayoutEffect(() => {
    let alive = true;
    let form: { destroy(): void } | undefined;
    import("./lead-form.js").then(({ startForm }) => {
      if (alive) form = startForm(matchMedia("(prefers-reduced-motion: reduce)").matches);
    });
    return () => {
      alive = false;
      form?.destroy();
    };
  }, []);
  return null;
}
