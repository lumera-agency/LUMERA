"use client";
/*
 * The passage between the site's pages, through black (the owner, 7 Nov 2026: the next page's title was seen for a
 * moment before its entrance; a curtain of the menu's columns, falling and then passing on, was «слишком быстрая»). A
 * link to another page of the site fades this one into black, then the browser goes; the next page comes up under the
 * black and comes out of it as its entrance starts (lib/curtain). Reduced motion: links as they are.
 * The fades are the browser's own animations, on the compositor: the next page builds itself (its 3D, its scripts)
 * while it shows, and a busy main thread would stall them.
 */
import { useEffect, useRef } from "react";
import { wait } from "@/lib/hooks";
import { CURTAIN, CURTAIN_KEY, curtainFree, curtainLifting } from "@/lib/curtain";
import "./page-curtain.css";

/** The longest the next page keeps it over itself (its 3D still compiling on a slow phone): then it goes anyway. */
const MAX_HOLD = 2500;
/** Left this long after the browser was sent on and still here (a stop, a link the browser kept in the page): it goes. */
const STUCK = 8000;
/** Into the black (ms, cubic in-out) and the next page out of it (cubic out: most of it shows at once, then settles) */
const DARKEN = { duration: 250, easing: "cubic-bezier(0.65, 0, 0.35, 1)" };
const REVEAL = { duration: 450, easing: "cubic-bezier(0.33, 1, 0.68, 1)" };

export function PageCurtain() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sheet = ref.current;
    if (!sheet) return;
    const root = document.documentElement;
    let leaving = false;
    let stuck = 0;
    let gone = false;
    let moving: Animation | null = null;
    const play = (animation: Animation | null) => {
      moving?.cancel();
      moving = animation;
      if (!animation) return Promise.resolve(false);
      return animation.finished.then(
        () => moving === animation,
        () => false,
      );
    };

    // out of the black: the page's scripts start first, still under it; two frames on, once they have laid the page out
    // and are through their first long run, its entrance starts with the black going (started with the scripts, the
    // entrance's moves on the compositor fell behind its steps on the main thread: «р» typed before «Дизайн» had risen)
    const raise = () => {
      Object.assign(sheet.style, { visibility: "visible", pointerEvents: "none" });
      curtainLifting();
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          root.classList.remove(CURTAIN, "is-leaving");
          void play(sheet.animate([{ opacity: 1 }, { opacity: 0 }], { ...REVEAL, fill: "both" })).then((done) => {
            if (!done) return;
            Object.assign(sheet.style, { visibility: "", pointerEvents: "" });
            void play(null);
          });
        }),
      );
    };

    // into the black. Drawn clear without the animation, and black once it is done: a browser that paints a frame
    // before an animation's first or after its last never shows the black at once
    const cover = () => {
      Object.assign(sheet.style, { opacity: "0", visibility: "visible", pointerEvents: "auto" });
      return play(sheet.animate([{ opacity: 0 }, { opacity: 1 }], { ...DARKEN, fill: "both" })).then((done) => {
        if (done) {
          sheet.style.opacity = "";
          void play(null);
        }
        return done;
      });
    };

    // arriving under it: out once the page's faces are in and nothing holds it (the page's parts take their holds in
    // this same commit, before the first await is through)
    if (root.classList.contains(CURTAIN)) {
      void Promise.race([document.fonts.ready.then(() => curtainFree()), wait(MAX_HOLD)]).then(() => {
        if (!gone) requestAnimationFrame(raise);
      });
    }

    // left: to another page of the site, by a plain click the page itself did not take
    const onClick = (event: MouseEvent) => {
      if (leaving || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href]");
      if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      // (a file, a .pdf, opens as it would)
      if (url.origin !== location.origin || url.pathname === location.pathname || /\.\w+$/.test(url.pathname)) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      event.preventDefault();
      leaving = true;
      root.classList.add("is-leaving");
      void cover().then((done) => {
        if (!done) return;
        try {
          sessionStorage.setItem(CURTAIN_KEY, String(Date.now()));
        } catch {}
        location.assign(url.href);
        stuck = window.setTimeout(() => {
          leaving = false;
          raise();
        }, STUCK);
      });
    };
    // back to this page from the browser's memory of it (the back button): it was left black
    const onShow = (event: PageTransitionEvent) => {
      if (!event.persisted || !leaving) return;
      clearTimeout(stuck);
      leaving = false;
      raise();
    };
    const onHide = () => clearTimeout(stuck);
    window.addEventListener("click", onClick);
    window.addEventListener("pageshow", onShow);
    window.addEventListener("pagehide", onHide);
    return () => {
      gone = true;
      clearTimeout(stuck);
      moving?.cancel();
      window.removeEventListener("click", onClick);
      window.removeEventListener("pageshow", onShow);
      window.removeEventListener("pagehide", onHide);
    };
  }, []);

  return (
    <div className="page-curtain" aria-hidden="true" ref={ref} />
  );
}
