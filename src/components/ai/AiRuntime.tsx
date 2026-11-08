"use client";
import { useEffect } from "react";
import { whenCurtainLifts } from "@/lib/curtain";

/** Starts the AI pages' behaviour (runtime/ai-runtime.js: the scenes, the service panels, the calculator, the film,
 *  the first screen's cover and stone) once the page is in. `strings`: the words the calculator writes. */
export function AiRuntime({ strings }: { strings: Record<string, string> }) {
  useEffect(() => {
    let alive = true;
    // (reached through the page curtain: its scenes start as it lifts, not behind it)
    void Promise.all([import("./runtime/ai-runtime.js"), whenCurtainLifts()]).then(([{ startAi }]) => alive && startAi({ strings }));
    return () => {
      alive = false;
    };
  }, [strings]);
  return null;
}
