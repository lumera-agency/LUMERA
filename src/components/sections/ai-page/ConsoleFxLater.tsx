"use client";
/*
 * ConsoleFx for a console that is not on screen as the page starts (the home page's configurator shows it once the
 * automation is picked): the same stage and the same still at once, the conductor's code fetched as this mounts, so it
 * is not in the page's first script (12 Nov 2026: about 7 KB of the AI page's console in every home page's start).
 */
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import type { ConsoleLine } from "./ConsoleFx";

type Props = { lines: ConsoleLine[]; children: ReactNode };

export function ConsoleFxLater(props: Props) {
  const [Conductor, setConductor] = useState<ComponentType<Props> | null>(null);
  useEffect(() => {
    let alive = true;
    void import("./ConsoleFx").then((module) => {
      if (alive) setConductor(() => module.ConsoleFx);
    });
    return () => {
      alive = false;
    };
  }, []);
  return Conductor ? <Conductor {...props} /> : <div className="ai-console__stage">{props.children}</div>;
}
