"use client";
import { useEffect } from "react";
import { whenCurtainLifts } from "@/lib/curtain";

/** Starts the page's behaviour (runtime/sites-runtime.js: the scenes, the formats' stages, the live sample sites, the
 *  calculator, block 4's board, the sticky bars) once the page is in. `strings`: the words it writes, in the page's
 *  language (the static page's flat keys: sites.pv.take …). */
export function SitesRuntime({ strings }: { strings: Record<string, string> }) {
  useEffect(() => {
    let alive = true;
    // (reached through the page curtain: its scenes start as it lifts, not behind it)
    void Promise.all([import("./runtime/sites-runtime.js"), whenCurtainLifts()]).then(([{ startSites }]) => alive && startSites({ strings }));
    return () => {
      alive = false;
    };
  }, [strings]);
  return null;
}
