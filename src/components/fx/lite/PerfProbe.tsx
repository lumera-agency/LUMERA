"use client";
/*
 * The page's own measures and the watch over FULL (lib/perf/monitor.ts): started once the page is in the browser,
 * stopped when the layout goes. For a test, ?lite=1 in the address makes the visit LITE and ?full=1 (or ?lite=0) FULL
 * (the layout's early script, lib/perf/early.ts; FULL is not watched then). In the console: ecloPerf().
 */
import { useEffect } from "react";
import { startMonitor } from "@/lib/perf/monitor";

export function PerfProbe() {
  useEffect(() => startMonitor(), []);
  return null;
}
