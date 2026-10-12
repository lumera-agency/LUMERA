"use client";
import { forwardRef, type AnchorHTMLAttributes } from "react";

/** Back to the top without leaving a `#` in the address (a reload or a copied link opens at the top). */
export const ScrollTopLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function ScrollTopLink(props, ref) {
  return (
    <a
      ref={ref}
      href="#"
      {...props}
      onClick={(e) => {
        e.preventDefault();
        if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      }}
    />
  );
});
