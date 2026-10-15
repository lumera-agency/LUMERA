"use client";
import { useEffect } from "react";

/** Starts the AI pages' behaviour (runtime/ai-runtime.js: the scenes, the service panels, the calculator, the film,
 *  the first screen's cover and stone) once the page is in. `strings`: the words the calculator writes. */
export function AiRuntime({ strings }: { strings: Record<string, string> }) {
  useEffect(() => {
    let alive = true;
    import("./runtime/ai-runtime.js").then(({ startAi }) => alive && startAi({ strings }));
    return () => {
      alive = false;
    };
  }, [strings]);
  return null;
}
