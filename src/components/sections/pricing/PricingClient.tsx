"use client";
import { useLayoutEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { ScrollTrigger } from "@/lib/gsap";
import { dpx, topbarHeight } from "@/lib/css";

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
 */
export function PricingClient() {
  const host = useRef<HTMLDivElement>(null);
  const lang = useLocale();
  useLayoutEffect(() => {
    const el = host.current;
    if (!el) return;
    let height = el.offsetHeight;
    let timer = 0;
    const ro = new ResizeObserver(() => {
      if (el.offsetHeight === height) return;
      height = el.offsetHeight;
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
    let api: { destroy(): void } | undefined;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const abs = (p: string) => new URL(p, document.baseURI).href;
    (async () => {
      const [{ mountConfigurator }, { initPresets, presetReady, keepWhole }, form] = await Promise.all([
        import("./configurator/configurator.js"),
        import("./presets.js"),
        import("@/components/sections/contact/lead-form.js"),
      ]);
      if (!alive) return; // left before the modules were in
      stopPresets = initPresets(reducedMotion);
      // the island's own API (configurator.js, JSDoc-typed loosely)
      const mount = mountConfigurator as unknown as (host: HTMLElement, options: Record<string, unknown>) => { destroy(): void };
      api = mount(el, {
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
      (presetReady as (api: unknown) => void)(api);
      const sum = el.querySelector(".cfg-sum");
      if (sum) fitRo.observe(sum);
      fit();
    })();
    return () => {
      alive = false;
      ro.disconnect();
      fitRo.disconnect();
      window.removeEventListener("resize", fit);
      head?.style.removeProperty("--cfg-head-top");
      el.style.removeProperty("--cfg-top");
      el.style.removeProperty("--sum-h");
      clearTimeout(timer);
      stopPresets?.();
      api?.destroy();
    };
  }, [lang]);
  return <div data-cfg="" ref={host} />;
}
