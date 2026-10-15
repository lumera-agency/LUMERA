"use client";
import { useEffect } from "react";

/** Starts the page's behaviour (runtime/sites-runtime.js: the scenes, the formats' stages, the live sample sites, the
 *  calculator, block 4's board, the sticky bars) once the page is in. `strings`: the words it writes, in the page's
 *  language (the static page's flat keys: sites.pv.take …). */
export function SitesRuntime({ strings }: { strings: Record<string, string> }) {
  useEffect(() => {
    let alive = true;
    import("./runtime/sites-runtime.js").then(({ startSites }) => alive && startSites({ strings }));
    return () => {
      alive = false;
    };
  }, [strings]);
  return null;
}
