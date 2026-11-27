"use client";
import { useEffect, useRef } from "react";

/** the pages whose list the visitor has shown whole, in this tab: a reload, the way back or the other language find it
 *  as they left it, so the place the page keeps (a pixel, or a share of a block) is measured on the same list */
const SHOWN_KEY = "eclo:faq-all";
const shownPages = () => {
  try {
    return (sessionStorage.getItem(SHOWN_KEY) ?? "").split(",").filter(Boolean);
  } catch {
    return [];
  }
};
const rememberShown = (page: string) => {
  try {
    sessionStorage.setItem(SHOWN_KEY, [...new Set([...shownPages(), page])].join(","));
  } catch {}
};

/**
 * The questions: a summary click animates the answer's height open or closed (WAAPI). `closedOnPhone`: on a phone they
 * start closed, as the page comes in.
 *
 * A list folded after its first questions (the sites page, the owner, 27 Nov 2026: «сократить до 4 вопросов, потом
 * кнопка показать остальные вопросы») keeps the rest in a closed <details class="faq__rest" data-fold="page">, its
 * summary the row «Показати інші питання»: it opens before and without any script, and the browser's find and links to
 * the words of an answer (Google's) open it too. Here: the row goes once it is open (CSS), the rest come in one after
 * another and the focus goes to the first of them (after a tap or a click without the ring a script's focus can draw in
 * Safari); the tab remembers it.
 */
export function FaqList({ children, closedOnPhone = false }: { children: React.ReactNode; closedOnPhone?: boolean }) {
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

  // phones: the questions start closed, as the page comes in (not later, over an answer the visitor has opened)
  useEffect(() => {
    if (!closedOnPhone || !matchMedia("(max-width: 600px)").matches) return;
    root.current?.querySelectorAll<HTMLDetailsElement>(".faq__item").forEach((item) => (item.open = false));
  }, [closedOnPhone]);

  // the folded rest
  useEffect(() => {
    const rest = root.current?.querySelector<HTMLDetailsElement>(".faq__rest");
    const row = rest?.querySelector<HTMLElement>(":scope > summary");
    if (!rest || !row) return;
    const page = rest.dataset.fold ?? "";
    /** how it was asked for: a pointer or the keyboard; null when it opens by itself (the tab's memory, the find) */
    let asked: "pointer" | "keys" | null = null;
    const click = (e: MouseEvent) => {
      if (!rest.open) asked = e.detail === 0 ? "keys" : "pointer";
    };
    const toggle = () => {
      if (!rest.open) return;
      if (page) rememberShown(page);
      const how = asked;
      asked = null;
      if (!how) return;
      const items = [...rest.querySelectorAll<HTMLElement>(":scope > .faq__item")];
      if (document.documentElement.classList.contains("motion") && typeof rest.animate === "function") {
        items.forEach((item, i) =>
          item.animate([{ opacity: 0, translate: "0 14px" }, { opacity: 1, translate: "0 0" }], { duration: 560, delay: Math.min(i, 6) * 45, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" }),
        );
      }
      const first = items[0]?.querySelector<HTMLElement>("summary");
      if (!first) return;
      if (how === "pointer") {
        first.classList.add("is-quiet");
        const loud = () => first.classList.remove("is-quiet");
        first.addEventListener("keydown", loud, { once: true });
        first.addEventListener("blur", loud, { once: true });
      }
      first.focus({ preventScroll: true });
    };
    row.addEventListener("click", click);
    rest.addEventListener("toggle", toggle);
    if (page && !rest.open && shownPages().includes(page)) rest.open = true;
    return () => {
      row.removeEventListener("click", click);
      rest.removeEventListener("toggle", toggle);
    };
  }, []);

  return (
    <div className="faq" data-faq="" ref={root}>
      {children}
    </div>
  );
}
