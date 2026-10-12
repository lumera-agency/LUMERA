"use client";
import { useEffect, useRef } from "react";

/** The questions: a summary click animates the answer's height open or closed (WAAPI). */
export function FaqList({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const offs: (() => void)[] = [];
    for (const item of el.querySelectorAll<HTMLDetailsElement>(".faq__item")) {
      const summary = item.querySelector("summary");
      const body = item.querySelector<HTMLElement>(".faq__body");
      if (!summary || !body) continue;
      let anim: Animation | null = null;
      let closing = false;
      const click = (e: Event) => {
        e.preventDefault();
        // a closed answer still has a layout height where ::details-content exists: closed = 0
        const from = item.open ? body.offsetHeight : 0;
        anim?.cancel();
        if (item.open && !closing) {
          closing = true;
          item.classList.add("is-closing");
          anim = body.animate([{ height: `${from}px`, opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 320, easing: "cubic-bezier(0.4, 0, 0.2, 1)" });
          anim.onfinish = () => {
            item.open = false;
            item.classList.remove("is-closing");
            closing = false;
            anim = null;
          };
        } else {
          closing = false;
          item.classList.remove("is-closing");
          item.open = true;
          const to = body.scrollHeight;
          anim = body.animate([{ height: `${from}px`, opacity: from ? 1 : 0 }, { height: `${to}px`, opacity: 1 }], { duration: 420, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
          anim.onfinish = () => (anim = null);
        }
      };
      summary.addEventListener("click", click);
      offs.push(() => summary.removeEventListener("click", click));
    }
    return () => offs.forEach((off) => off());
  }, []);
  return (
    <div className="faq" data-faq="" ref={root}>
      {children}
    </div>
  );
}
