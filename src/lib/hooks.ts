"use client";
import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";

export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** A media query as state (false on the server and in the first client render). */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
export const useFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)");

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
