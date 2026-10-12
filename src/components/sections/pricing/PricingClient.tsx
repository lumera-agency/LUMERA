"use client";
import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";

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
 * hands «Обговорити» to the form in 8 · Заявка with the chosen plan and its items.
 */
export function PricingClient() {
  const host = useRef<HTMLDivElement>(null);
  const lang = useLocale();
  useEffect(() => {
    const el = host.current;
    if (!el || el.dataset.mounted) return;
    el.dataset.mounted = "1";
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const abs = (p: string) => new URL(p, document.baseURI).href;
    (async () => {
      const [{ mountConfigurator }, { initPresets, presetReady, keepWhole }, form] = await Promise.all([
        import("./configurator/configurator.js"),
        import("./presets.js"),
        import("@/components/sections/contact/lead-form.js"),
      ]);
      initPresets(reducedMotion);
      // the island's own API (configurator.js, JSDoc-typed loosely)
      const mount = mountConfigurator as unknown as (host: HTMLElement, options: Record<string, unknown>) => unknown;
      const lead = form.leadForm() as unknown as { setPlan(plan: string, details: string[]): void };
      const api = mount(el, {
        lang,
        reducedMotion,
        assets: {
          cube: { light: ASSETS.cube.light.map(abs), dark: ASSETS.cube.dark.map(abs) },
          cubesLight: abs(ASSETS.cubesLight),
          cubesDark: abs(ASSETS.cubesDark),
        },
        onDiscuss: (plan: string, { details = [] }: { details?: string[] } = {}) => {
          lead.setPlan(keepWhole(plan), details);
          form.goToForm(reducedMotion);
        },
      });
      (presetReady as (api: unknown) => void)(api);
    })();
  }, [lang]);
  return <div data-cfg="" ref={host} />;
}
