"use client";
/*
 * WebGLGate: 3D only where it may run. In LITE (lib/perf/mode.ts), without WebGL (an old GPU, acceleration off, a
 * policy) or when a scene throws, the canvas stays out (or `fallback` shows) and the page carries on without it;
 * `onSkip` lets whoever waits for the scene stop waiting. The children are not rendered then, so a scene loaded with
 * next/dynamic is never fetched. The page going LITE while a scene runs takes the scene down the same way.
 */
import { Component, useEffect, type ReactNode } from "react";
import { useWebGLAllowed } from "@/lib/perf/mode";

type BoundaryProps = { fallback: ReactNode; onError: () => void; children: ReactNode };

class SceneBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("3D scene left out:", error);
    this.props.onError();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function WebGLGate({ children, fallback = null, onSkip }: { children: ReactNode; fallback?: ReactNode; onSkip?: () => void }) {
  // the server and the hydrating render show the fallback alike; the browser's answer comes right after
  const allowed = useWebGLAllowed();
  useEffect(() => {
    if (allowed === false) onSkip?.();
  }, [allowed, onSkip]);
  if (!allowed) return fallback;
  return <SceneBoundary fallback={fallback} onError={() => onSkip?.()}>{children}</SceneBoundary>;
}
