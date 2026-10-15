"use client";
/*
 * Scripted scrolls that glide like the wheel: through Lenis when it runs (fx/smooth-scroll), else the
 * browser's smooth scroll. One place, so a button, a link and the wheel never fight over the page.
 */
import type Lenis from "lenis";

let lenis: Lenis | null = null;
export const setLenis = (instance: Lenis | null) => void (lenis = instance);
export const getLenis = () => lenis;

export function scrollToY(y: number, { immediate = false, duration = 1.1 } = {}) {
  const top = Math.max(0, Math.round(y));
  const reduced = typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (lenis) lenis.scrollTo(top, { immediate: immediate || reduced, duration });
  else window.scrollTo({ top, behavior: immediate || reduced ? "instant" : "smooth" });
}

let jumping = false;
/**
 * To a far place without the run there (a glide through the whole page would play every block on
 * the way): the page dims to its own black, jumps, and comes up again where it lands.
 */
export function fadeJumpTo(y: number, { dim = 380, rise = 750 } = {}) {
  if (jumping) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !document.body.animate) return scrollToY(y, { immediate: true });
  jumping = true;
  const veil = document.createElement("div");
  veil.setAttribute("aria-hidden", "true");
  // above the topbar and the page's floating buttons, under the menu and the preloader
  veil.style.cssText = "position:fixed;inset:0;z-index:150;background:var(--bg,#0a0a0a);opacity:0;pointer-events:none";
  document.body.append(veil);
  veil
    .animate([{ opacity: 0 }, { opacity: 1 }], { duration: dim, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" })
    .finished.then(() => {
      scrollToY(y, { immediate: true });
      return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    })
    .then(() => veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: rise, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }).finished)
    .finally(() => {
      veil.remove();
      jumping = false;
    });
}

/** Where a block sits for a link to it: its top, less its scroll-margin (under the topbar). */
export function blockY(el: Element) {
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  return el.getBoundingClientRect().top + window.scrollY - margin;
}

/** To a block on the page: a glide when it is near, a dim and jump when it is far (a long run
 *  through the whole page would play every block on the way). */
export function goToBlock(el: Element) {
  const y = blockY(el);
  const screens = Math.abs(y - window.scrollY) / window.innerHeight;
  if (screens > 3) return fadeJumpTo(y);
  scrollToY(y, { duration: Math.min(1.4, Math.max(0.8, 0.45 * screens)) });
}

/**
 * The keyboard's place follows a link to a block, as with a plain anchor: Tab goes on from the block,
 * a screen reader reads from it. A block that takes no focus of its own takes it until it loses it,
 * without a ring (it is a place, not a control: base.css).
 */
export function focusBlock(el: HTMLElement) {
  if (!el.hasAttribute("tabindex") && !el.matches("a[href], button, input, select, textarea, summary")) {
    el.setAttribute("tabindex", "-1");
    el.setAttribute("data-link-target", "");
    el.addEventListener("blur", () => (el.removeAttribute("tabindex"), el.removeAttribute("data-link-target")), { once: true });
  }
  el.focus({ preventScroll: true });
}

/**
 * Links to a block on this page (href="#id") go there without writing the #id into the address:
 * the address stays the page's own, so a reload brings the visitor back where they were (lib/boot)
 * rather than to the last block they clicked. A link a script has handled already (the services'
 * ride, the configurator's presets) and the skip link are left alone.
 */
export function routeAnchorLinks() {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
    if (!a || a.matches(".skip-link, [data-cfg-preset]")) return;
    const id = decodeURIComponent((a.getAttribute("href") ?? "").slice(1));
    const el = id ? document.getElementById(id) : null;
    if (!el) return;
    e.preventDefault();
    if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
    goToBlock(el);
    focusBlock(el);
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}
