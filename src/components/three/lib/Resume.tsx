"use client";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

/** R3F stops its frame loop when every canvas is paused; switching `frameloop` back to "always"
 *  doesn't restart it on its own. Mounted inside a <Canvas>, this kicks the loop when it resumes. */
export function Resume({ running }: { running: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (running) invalidate();
  }, [running, invalidate]);
  return null;
}
