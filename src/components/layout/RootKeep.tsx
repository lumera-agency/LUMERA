"use client";
import { useLayoutEffect } from "react";
import { restoreRoot } from "@/lib/place";

/** First in the body: after a language switch puts <html>'s classes and inline style back before anything else reads
 *  them (lib/place keepRoot / restoreRoot). */
export function RootKeep() {
  useLayoutEffect(() => restoreRoot());
  return null;
}
