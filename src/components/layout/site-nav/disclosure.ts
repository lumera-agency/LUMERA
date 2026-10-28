"use client";
/*
 * The header's and the topbar's panels (NavPanel) as a disclosure navigation (not a menu role): a trigger button
 * opens its panel on 150 ms of hover or on a click, the panel stays while the pointer is on the trigger, the panel or
 * the strip between them, and closes 220 ms after it leaves. A click keeps it open until a click outside, Esc, the
 * trigger again, focus leaving or 48 px of scroll. Moving to the other trigger swaps the content in the same frame.
 * Opening: the four columns drop like the preloader's, the pictures rise, each card's lines unmask. Reduced motion:
 * fades only. Everything runs on transform and opacity; a closed panel is display: none.
 */
import { gsap } from "@/lib/gsap";

export type NavPanelId = "services" | "cases";
export type NavDisclosure = { close(): void; destroy(): void };

const INTENT = 150;
const GRACE = 220;
const SCROLL_CLOSE = 48;

/** `ready`: hover waits for it (the main page's intro); clicks never do. */
export function navDisclosure(root: HTMLElement, { ready = () => true }: { ready?: () => boolean } = {}): NavDisclosure {
  const ac = new AbortController();
  const on = { signal: ac.signal };
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const triggers = [...root.querySelectorAll<HTMLButtonElement>("[data-navp-trigger]")];
  const panels = [...root.querySelectorAll<HTMLElement>("[data-navp]")];
  const panel = (id: NavPanelId) => root.querySelector<HTMLElement>(`[data-navp="${id}"]`);
  const scrim = root.querySelector<HTMLElement>("[data-navp-scrim]");
  const shown = (el: HTMLElement) => el.offsetParent !== null;
  /** The trigger that answers for a panel: its own, else (the topbar has «Послуги» only) the first one in sight. */
  const owner = (id: NavPanelId) => triggers.find((t) => t.dataset.navpTrigger === id && shown(t)) ?? triggers.find(shown);

  let open: NavPanelId | null = null;
  let by: "hover" | "click" = "click";
  let openedAt = 0;
  let fromY = 0;
  let tOpen = 0;
  let tClose = 0;
  let warmed = false;
  let tl: gsap.core.Timeline | null = null;

  const parts = (p: HTMLElement) => ({
    cols: [...p.querySelectorAll<HTMLElement>(".navp__cols i")],
    pics: [...p.querySelectorAll<HTMLElement>("[data-pic]")],
    lines: [...p.querySelectorAll<HTMLElement>("[data-line]")],
    strip: [...p.querySelectorAll<HTMLElement>(".navp__strip")],
    body: [...p.querySelectorAll<HTMLElement>(".navp__grid, .navp__strip")],
  });
  /** card by card, and in a card line by line */
  const lineDelay = (_: number, el: Element) => {
    const card = el.closest(".navp__card");
    const cards = [...(card?.parentElement?.parentElement?.children ?? [])];
    const lines = card ? [...card.querySelectorAll("[data-line]")] : [];
    return cards.findIndex((li) => li.contains(el)) * 0.04 + lines.indexOf(el) * 0.03;
  };

  const expand = (id: NavPanelId | null) => {
    const t = id && owner(id);
    triggers.forEach((b) => b.setAttribute("aria-expanded", String(b === t)));
  };
  const fadeScrim = (to: 0 | 1) => scrim && gsap.to(scrim, { autoAlpha: to, duration: to ? 0.3 : 0.25, ease: "power1.out", overwrite: "auto" });

  /** The pictures are decoded before the first panel opens (hover intent covers it). */
  const warm = () => {
    if (warmed) return;
    warmed = true;
    root.querySelectorAll<HTMLImageElement>("[data-navp] img").forEach((img) => void (new Image().src = img.src));
  };

  function animOpen(id: NavPanelId) {
    const p = panel(id);
    if (!p) return;
    p.hidden = false;
    const { cols, pics, lines, strip } = parts(p);
    tl?.kill();
    fadeScrim(1);
    if (reduced()) {
      gsap.set([...cols, ...pics, ...lines, ...strip], { clearProps: "all" });
      tl = gsap.timeline().fromTo(p, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 });
      return;
    }
    gsap.set(p, { clearProps: "opacity,visibility" });
    tl = gsap
      .timeline({ defaults: { overwrite: "auto" } })
      .fromTo(cols, { yPercent: -101 }, { yPercent: 0, duration: 0.55, ease: "expo.out", stagger: 0.04 }, 0)
      .fromTo(pics, { yPercent: 8, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: "expo.out", stagger: 0.04 }, 0.12)
      .fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 0.55, ease: "expo.out", stagger: lineDelay }, 0.16)
      .fromTo(strip, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out" }, 0.3)
      .set([...pics, ...lines, ...strip], { clearProps: "transform,opacity,visibility" });
  }

  function animClose(id: NavPanelId) {
    const p = panel(id);
    // a swap still under way leaves the other panel out: it goes at once
    panels.forEach((other) => other !== p && !other.hidden && settle(other));
    fadeScrim(0);
    if (!p) return;
    const { cols, pics, lines, strip } = parts(p);
    tl?.kill();
    tl = reduced()
      ? gsap.timeline({ onComplete: () => settle(p) }).to(p, { autoAlpha: 0, duration: 0.15 })
      : gsap
          .timeline({ onComplete: () => settle(p) })
          .to([...pics, ...lines, ...strip], { autoAlpha: 0, duration: 0.14, ease: "power1.in" }, 0)
          .to(cols, { yPercent: -101, duration: 0.38, ease: "power3.in", stagger: { each: 0.03, from: "end" } }, 0.06);
  }

  /** A panel out of sight, back to its resting state. */
  function settle(p: HTMLElement) {
    p.hidden = true;
    const { pics, lines, strip, body } = parts(p);
    gsap.killTweensOf([p, ...pics, ...lines, ...strip, ...body]);
    gsap.set([p, ...pics, ...lines, ...strip, ...body], { clearProps: "opacity,visibility,transform" });
  }

  /** Послуги ↔ Кейси in the same frame: the content slides the way the pointer went. */
  function swap(from: NavPanelId, to: NavPanelId) {
    const a = panel(from);
    const b = panel(to);
    if (!a || !b) return;
    tl?.kill();
    const dir = to === "cases" ? 1 : -1;
    const A = parts(a);
    const B = parts(b);
    b.hidden = false;
    gsap.set(B.cols, { yPercent: 0 });
    gsap.set([b, ...B.pics, ...B.lines, ...B.strip], { clearProps: "opacity,visibility,transform" });
    const move = reduced() ? 0 : 24;
    const outT = reduced() ? 0.12 : 0.18;
    gsap.to(A.body, { x: -move * dir, autoAlpha: 0, duration: outT, ease: "power2.in", overwrite: "auto", onComplete: () => settle(a) });
    gsap.fromTo(B.body, { x: move * dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: reduced() ? 0.12 : 0.34, ease: "expo.out", delay: 0.1, overwrite: "auto", clearProps: "transform,opacity,visibility" });
  }

  function show(id: NavPanelId, how: "hover" | "click") {
    clearTimeout(tClose);
    if (open === id) return;
    if (open) {
      swap(open, id);
      open = id;
      expand(id);
      return;
    }
    open = id;
    by = how;
    openedAt = performance.now();
    fromY = window.scrollY;
    expand(id);
    root.classList.add("is-navp-open");
    animOpen(id);
  }

  function hide() {
    clearTimeout(tOpen);
    clearTimeout(tClose);
    if (!open) return;
    const id = open;
    open = null;
    expand(null);
    root.classList.remove("is-navp-open");
    animClose(id);
  }

  const later = () => {
    clearTimeout(tClose);
    if (open && by === "hover") tClose = window.setTimeout(hide, GRACE);
  };
  const pointer = (e: PointerEvent) => e.pointerType === "mouse" || e.pointerType === "pen";

  for (const t of triggers) {
    const id = t.dataset.navpTrigger as NavPanelId;
    t.addEventListener(
      "pointerenter",
      (e) => {
        if (!pointer(e) || !ready()) return;
        warm();
        clearTimeout(tClose);
        clearTimeout(tOpen);
        tOpen = window.setTimeout(() => show(id, "hover"), open ? 0 : INTENT);
      },
      on,
    );
    t.addEventListener("pointerleave", () => (clearTimeout(tOpen), later()), on);
    t.addEventListener(
      "click",
      () => {
        clearTimeout(tOpen);
        if (open && owner(open) === t) {
          // opened by the hover a moment ago: the click keeps it
          if (by === "hover" && performance.now() - openedAt < 400) by = "click";
          else hide();
          return;
        }
        warm();
        show(id, "click");
        by = "click";
      },
      on,
    );
    t.addEventListener(
      "keydown",
      (e) => {
        if (e.key !== "ArrowDown") return;
        e.preventDefault();
        warm();
        if (!open) {
          show(id, "click");
          by = "click";
        }
        requestAnimationFrame(() => open && panel(open)?.querySelector<HTMLElement>("a[href], button")?.focus());
      },
      on,
    );
  }
  for (const p of panels) {
    p.addEventListener("pointerenter", () => clearTimeout(tClose), on);
    p.addEventListener("pointerleave", later, on);
    p.addEventListener(
      "click",
      (e) => {
        const swapTo = (e.target as Element).closest<HTMLElement>("[data-navp-swap]")?.dataset.navpSwap as NavPanelId | undefined;
        if (swapTo) return void show(swapTo, by);
        if ((e.target as Element).closest("a[href]")) hide();
      },
      on,
    );
  }
  root.querySelectorAll("[data-navp-plain]").forEach((a) => a.addEventListener("pointerenter", later, on));
  root.addEventListener("focusin", warm, on);
  root.addEventListener(
    "focusout",
    (e) => {
      const next = e.relatedTarget as Node | null;
      if (open && next && !root.contains(next)) hide();
    },
    on,
  );
  scrim?.addEventListener("click", hide, on);
  document.addEventListener(
    "pointerdown",
    (e) => {
      if (open && !root.contains(e.target as Node)) hide();
    },
    on,
  );
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key !== "Escape" || !open) return;
      const back = root.contains(document.activeElement) ? owner(open) : null;
      hide();
      back?.focus();
    },
    on,
  );
  window.addEventListener(
    "scroll",
    () => {
      if (open && Math.abs(window.scrollY - fromY) > SCROLL_CLOSE) hide();
    },
    { passive: true, signal: ac.signal },
  );

  return {
    close: hide,
    destroy() {
      ac.abort();
      clearTimeout(tOpen);
      clearTimeout(tClose);
      tl?.kill();
    },
  };
}
