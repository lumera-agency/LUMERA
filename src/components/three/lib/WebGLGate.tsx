"use client";
/*
 * WebGLGate: 3D only where it can run. Without WebGL (an old GPU, acceleration off, a policy) or when
 * a scene throws, the canvas stays out (or `fallback` shows) and the page carries on without it;
 * `onSkip` lets whoever waits for the scene stop waiting.
 */
import { Component, useEffect, useSyncExternalStore, type ReactNode } from "react";

let support: boolean | undefined;

/** Whether this browser can open a WebGL context (asked once; the probe context is released). */
export function hasWebGL() {
  if (support !== undefined) return support;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    support = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    support = false;
  }
  return support;
}

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

const noSubscribe = () => () => {};

export function WebGLGate({ children, fallback = null, onSkip }: { children: ReactNode; fallback?: ReactNode; onSkip?: () => void }) {
  // the server and the hydrating render show the fallback alike; the browser's answer comes right after
  const ok = useSyncExternalStore(noSubscribe, hasWebGL, () => null);
  useEffect(() => {
    if (ok === false) onSkip?.();
  }, [ok, onSkip]);
  if (!ok) return fallback;
  return <SceneBoundary fallback={fallback} onError={() => onSkip?.()}>{children}</SceneBoundary>;
}
