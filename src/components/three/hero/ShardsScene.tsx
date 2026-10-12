"use client";
/*
 * The shards behind the stone: small fractured fragments on their own canvas, blurred by CSS
 * (.hero__shards) — a cheap depth of field, so a 1× buffer is indistinguishable. They ignore the
 * pointer: each drifts on its own slow path (two sines per axis, never quite repeating; nearer ones
 * wider). Fades in with heroState.shards.
 */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Resume } from "../lib/Resume";
import { createShardGeometry } from "../lib/geometry";
import { createObsidianMaterial, createStudioEnvironment } from "../lib/materials";
import { CAMERA_Z, FOV, VIS_H, heroClock, heroState } from "./state";

/** Positions in hero fractions; `s` = size as a fraction of the hero's height; null = not on phones. */
const SHARDS = [
  { seed: 3, depth: 1.0, desktop: { x: 0.415, y: 0.845, s: 0.12 }, mobile: { x: 0.1, y: 0.4, s: 0.07 } },
  { seed: 5, depth: 1.2, desktop: { x: 0.585, y: 0.965, s: 0.11 }, mobile: null },
  { seed: 8, depth: 0.7, desktop: { x: 0.915, y: 0.615, s: 0.085 }, mobile: { x: 0.94, y: 0.56, s: 0.06 } },
  { seed: 13, depth: 1.3, desktop: { x: 0.958, y: 0.93, s: 0.14 }, mobile: { x: 0.9, y: 0.97, s: 0.08 } },
  { seed: 21, depth: 0.45, desktop: { x: 0.8, y: 0.29, s: 0.04 }, mobile: null },
  { seed: 34, depth: 0.4, desktop: { x: 0.5, y: 0.5, s: 0.035 }, mobile: null },
];
/** silver dust on the shards: a light shimmer (0 for none) */
const SHARD_DUST = 0.02;

export default function ShardsScene({ running, reducedMotion }: { running: boolean; reducedMotion: boolean }) {
  return (
    <Canvas
      className="hero__shards"
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
      dpr={1}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: FOV, near: 0.1, far: 100, position: [0, 0, CAMERA_Z] }}
      frameloop={reducedMotion ? "demand" : running ? "always" : "never"}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
      }}
    >
      <Shards />
      <Resume running={running || reducedMotion} />
    </Canvas>
  );
}

function Shards() {
  const { gl, scene, camera, size } = useThree();
  const env = useMemo(() => createStudioEnvironment(gl), [gl]);
  const material = useMemo(() => createObsidianMaterial({ grain: 1.4, smooth: true, dust: SHARD_DUST }).material, []);
  const geometries = useMemo(() => SHARDS.map((d) => createShardGeometry(d.seed)), []);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const bases = useMemo(() => SHARDS.map(() => new THREE.Vector3()), []);
  const key = useMemo(() => {
    const light = new THREE.DirectionalLight(0xfff2e2, 1.6);
    light.position.set(-3, 4, 5);
    return light;
  }, []);
  const lastOpacity = useRef(-1);

  useEffect(() => {
    scene.environment = env;
    scene.environmentIntensity = 0.9;
    scene.add(key);
    return () => {
      scene.remove(key);
      env.dispose();
      material.dispose();
      geometries.forEach((g) => g.dispose());
    };
  }, [scene, env, key, material, geometries]);

  // layout: hero fractions → world, per breakpoint
  useEffect(() => {
    const W = Math.max(1, size.width);
    const H = Math.max(1, size.height);
    const mobile = matchMedia("(max-width: 860px)").matches || W / H < 0.85;
    SHARDS.forEach((def, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;
      const at = mobile ? def.mobile : def.desktop;
      mesh.visible = Boolean(at);
      if (!at) return;
      bases[i].set((at.x - 0.5) * VIS_H * (W / H), -(at.y - 0.5) * VIS_H, 0);
      mesh.scale.setScalar((at.s * VIS_H) / 2);
    });
  }, [size, bases]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const time = heroClock.time;
    const canvas = gl.domElement.parentElement?.parentElement; // R3F's wrapper: the .hero__shards box
    if (canvas && Math.abs(heroState.shards - lastOpacity.current) > 0.001) {
      canvas.style.opacity = heroState.shards.toFixed(3);
      lastOpacity.current = heroState.shards;
    }
    scene.environmentRotation.y = time * 0.05;
    SHARDS.forEach((def, i) => {
      const mesh = meshes.current[i];
      if (!mesh?.visible) return;
      const phase = i * 1.7;
      mesh.rotation.x += (0.05 + (i % 3) * 0.03) * dt;
      mesh.rotation.y += (0.08 + (i % 2) * 0.05) * dt;
      const t = time * 0.3 + phase;
      const b = bases[i];
      mesh.position.set(
        b.x + (Math.sin(t) * 0.16 + Math.sin(t * 0.43 + 2.1) * 0.08) * def.depth,
        b.y + (Math.cos(t * 0.77 + 0.9) * 0.12 + Math.sin(t * 0.31) * 0.06) * def.depth + Math.sin(time * 0.5 + phase) * 0.06,
        0,
      );
    });
    if (heroState.shards > 0.001) gl.render(scene, camera);
  }, 1);

  return (
    <>
      {SHARDS.map((def, i) => (
        <mesh
          key={def.seed}
          ref={(m) => {
            meshes.current[i] = m;
          }}
          geometry={geometries[i]}
          material={material}
          rotation={[i * 1.3, i * 0.7, i * 2.1]}
        />
      ))}
    </>
  );
}
