"use client";
import { useEffect } from "react";

/** Starts the form (lead-form.js) once the block is in the page. */
export function ContactClient() {
  useEffect(() => {
    let alive = true;
    import("./lead-form.js").then(({ startForm }) => alive && startForm(matchMedia("(prefers-reduced-motion: reduce)").matches));
    return () => {
      alive = false;
    };
  }, []);
  return null;
}
