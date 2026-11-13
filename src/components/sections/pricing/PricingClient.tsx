"use client";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { ScrollTrigger } from "@/lib/gsap";
import { afterRoll } from "@/lib/boot";
import { dpx, topbarHeight } from "@/lib/css";
import { scrollCalm, watchSection } from "@/lib/perf/sections";

/** the configurator's code is in (a language switch finds it so and mounts at once, before the paint) */
let fetched = false;

/** The configurator's stills (the live 3D cube's, transparent), fetched only after an intent toward 3D. */
const ASSETS = {
  cube: {
    light: ["/img/cfg/cube-light-320.webp", "/img/cfg/cube-light-640.webp"],
    dark: ["/img/cfg/cube-dark-320.webp", "/img/cfg/cube-dark-640.webp"],
  },
  cubesLight: "/img/cfg/cubes-light.webp",
  cubesDark: "/img/cfg/cubes-dark.webp",
};

/**
 * Mounts the configurator into its host (browser only), wires the page's preset links to it, and
 * hands «Обговорити» to the form in 8 · Заявка with the chosen plan and its items. Whenever its height changes (mounted,
 * «Налаштувати» folded or unfolded) the scroll scenes below it are measured again: the blocks under it reveal where they
 * are now (22 Oct: after «−» the questions stayed hidden for 1300 px).
 * A layout effect: after a language switch the modules are in already and resolve before the page is painted, so the
 * block never shows empty first. Leaving (a switch renders the page anew) takes it all down again.
 * Fetched as the visitor comes within three screens of the block (lib/perf/sections.ts) and mounted in the next pause
 * of the scroll, or a screen before the block at the latest (mounting takes one long frame: in a moving scroll it showed
 * as a hitch, 267 ms on a processor four times slower), not with the page: its
 * code, the sample sites' and their styles were fetched in the page's first fifth of a second and the configurator
 * started under the preloader, about 340 ms of the main thread on a processor four times slower (11 Nov 2026). It
 * changes the page's height as it mounts, so a jump to a block below it and a kept place wait for it (settleLayout). A
 * preset link clicked before it is in keeps its preset (html[data-cfg-pending], which presets.js applies) and fetches it.
 * `robot` and `ads` (the owner, 9 Nov 2026): the AI page's robot console and the ads page's way of a request, rendered
 * on the server (Pricing.tsx); they go into the configurator's frame (its slots) for when the automation, or ads or
 * analytics, are chosen.
 */
type Slots = { robot: HTMLElement | null; ads: HTMLElement | null };
export function PricingClient({ robot, ads }: { robot?: ReactNode; ads?: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const lang = useLocale();
  const [slots, setSlots] = useState<Slots | null>(null);
  const api = useRef<{ schemesReady?(): void } | null>(null);
  useLayoutEffect(() => {
    const el = host.current;
    if (!el) return;
    let height = el.offsetHeight;
    let timer = 0;
    // (during the preloader's roll the pinned blocks are not set up yet, they measure everything themselves after it:
    // lib/boot afterRoll)
    let rolled = false;
    void afterRoll().then(() => void (rolled = true));
    const ro = new ResizeObserver(() => {
      if (el.offsetHeight === height) return;
      height = el.offsetHeight;
      if (!rolled) return;
      clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    ro.observe(el);
    // the block's title stays 24 px under the topbar as the presets scroll on (approach/stages.js stops the scroll
    // there too), the column with the sample and the price right under it, the sample sized to leave both on screen:
    // for configurator.css the head's sticky top (its label tucked under the bar), the column's and the price card's
    // height. Measured from the places things take unstuck: the head is its container's first child
    const section = el.closest("section");
    const head = section?.querySelector<HTMLElement>(".cfg-head");
    const fit = () => {
      const title = head?.querySelector<HTMLElement>(".s-head__title");
      const body = el.querySelector<HTMLElement>(".cfg__body");
      const side = el.querySelector<HTMLElement>(".cfg__side");
      const sum = el.querySelector<HTMLElement>(".cfg-sum");
      if (!head?.parentElement || !title || !body || !side || !sum) return;
      const top = topbarHeight() + dpx(24);
      const titleIn = title.getBoundingClientRect().top - head.getBoundingClientRect().top;
      const titleAt = head.parentElement.getBoundingClientRect().top + (parseFloat(getComputedStyle(head).marginTop) || 0) + titleIn;
      const under = body.getBoundingClientRect().top - titleAt + (parseFloat(getComputedStyle(side).marginTop) || 0);
      head.style.setProperty("--cfg-head-top", `${Math.round(top - titleIn)}px`);
      el.style.setProperty("--cfg-top", `${Math.round(top + under)}px`);
      el.style.setProperty("--sum-h", `${sum.offsetHeight}px`);
    };
    const fitRo = new ResizeObserver(fit);
    if (head) fitRo.observe(head);
    window.addEventListener("resize", fit);
    let alive = true;
    let stopPresets: (() => void) | undefined;
    let mounted: { destroy(): void; schemesReady?(): void } | undefined;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const abs = (p: string) => new URL(p, document.baseURI).href;
    let started: Promise<void> | null = null;
    const start = () => (started ??= (async () => {
      const [{ mountConfigurator }, { initPresets, presetReady, keepWhole }, form] = await Promise.all([
        import("./configurator/configurator.js"),
        import("./presets.js"),
        import("@/components/sections/contact/lead-form.js"),
      ]);
      if (!alive) return; // left before the modules were in
      await scrollCalm(el);
      if (!alive) return;
      stopPresets = initPresets(reducedMotion);
      // the island's own API (configurator.js, JSDoc-typed loosely)
      const mount = mountConfigurator as unknown as (host: HTMLElement, options: Record<string, unknown>) => { destroy(): void; schemesReady?(): void };
      mounted = mount(el, {
        lang,
        reducedMotion,
        assets: {
          cube: { light: ASSETS.cube.light.map(abs), dark: ASSETS.cube.dark.map(abs) },
          cubesLight: abs(ASSETS.cubesLight),
          cubesDark: abs(ASSETS.cubesDark),
        },
        onDiscuss: (plan: string, { details = [] }: { details?: string[] } = {}) => {
          // the form of the moment (asked for here, not at the mount: the contact block may start after this one)
          const lead = form.leadForm() as unknown as { setPlan(plan: string, details: string[]): void };
          lead.setPlan(keepWhole(plan), details);
          form.goToForm(reducedMotion);
        },
      });
      (presetReady as (api: unknown) => void)(mounted);
      api.current = mounted;
      setSlots({ robot: el.querySelector<HTMLElement>('[data-ref="robot-slot"]'), ads: el.querySelector<HTMLElement>('[data-ref="ads-slot"]') });
      const sum = el.querySelector(".cfg-sum");
      if (sum) fitRo.observe(sum);
      fit();
      fetched = true;
    })());
    const onEarlyPreset = (event: MouseEvent) => {
      if (started) return;
      const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>("a[data-cfg-preset]");
      if (!link || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      document.documentElement.dataset.cfgPending = link.dataset.cfgPreset ?? "";
      link.closest("dialog")?.close();
      void start();
    };
    document.addEventListener("click", onEarlyPreset);
    let stopWatching = () => {};
    if (fetched || !section) void start();
    else stopWatching = watchSection(section, { preload: start }, { name: "pricing", near: 3, layout: true });
    return () => {
      alive = false;
      stopWatching();
      document.removeEventListener("click", onEarlyPreset);
      ro.disconnect();
      fitRo.disconnect();
      window.removeEventListener("resize", fit);
      head?.style.removeProperty("--cfg-head-top");
      el.style.removeProperty("--cfg-top");
      el.style.removeProperty("--sum-h");
      clearTimeout(timer);
      stopPresets?.();
      api.current = null;
      setSlots(null);
      mounted?.destroy();
    };
  }, [lang]);
  // the schemes are in their slots: the configurator sizes them to the frame and starts the ads' play
  useEffect(() => {
    if (slots) api.current?.schemesReady?.();
  }, [slots]);
  return (
    <>
      <div data-cfg="" ref={host} />
      {slots?.robot && robot ? createPortal(robot, slots.robot) : null}
      {slots?.ads && ads ? createPortal(ads, slots.ads) : null}
    </>
  );
}
