"use client";
/*
 * The contents' head. On a computer a plain label over the list; on a phone a button that folds the list away (it is
 * folded from the first paint, so the short version comes up on the first screen) and opens it on a tap.
 */
import { useEffect, useRef, useState } from "react";

export function TocToggle({ label, list }: { label: string; list: string }) {
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    button.current?.closest(".lg-toc")?.classList.toggle("is-open", open);
  }, [open]);
  return (
    <>
      <p className="lg-toc__label" id="lg-toc">
        {label}
      </p>
      <button ref={button} type="button" className="lg-toc__toggle" aria-expanded={open} aria-controls={list} onClick={() => setOpen((now) => !now)}>
        <span>{label}</span>
        <svg className="lg-toc__chev" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 9.5l6 6 6-6" />
        </svg>
      </button>
    </>
  );
}
