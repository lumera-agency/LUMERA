"use client";
import { forwardRef, type AnchorHTMLAttributes } from "react";
import { fadeJumpTo } from "@/lib/scroll";

/** Back to the top without leaving a `#` in the address (a reload or a copied link opens at the top).
 *  No run back through the page: it dims, jumps and comes up on the first screen (lib/scroll). */
export const ScrollTopLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function ScrollTopLink(props, ref) {
  return (
    <a
      ref={ref}
      href="#"
      {...props}
      onClick={(e) => {
        e.preventDefault();
        if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
        fadeJumpTo(0);
      }}
    />
  );
});
