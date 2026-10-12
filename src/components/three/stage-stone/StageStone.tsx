"use client";
/*
 * 5 · Підхід: the stone beside the stage deck — the same stone as the first screen on its own small
 * canvas in the deck's left lane. Its pose follows the deck's scroll (deckProgress(), approach/
 * stages.js), as it did on the first site's route (chapters.js): between two stages it turns a quarter
 * round its long axis and changes its lean (diagonal, lying, tipped towards you, standing at the
 * launch), with a small hop; the cracks gain a little chrome stage by stage. At rest it only breathes.
 * Renders only while it is on screen.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { createStoneGeometries } from "../lib/geometry";
import { CHROME_LIGHTS, createChromeEnvironment, createObsidianMaterial, createSilverMaterial, createStudioEnvironment } from "../lib/materials";
import { REST_TILT, SEAM_FACING, STONE_EXTENT } from "../hero/state";
import { Resume } from "../lib/Resume";
import { DECK_IN, DECK_REST, deckProgress } from "@/components/sections/approach/stages.js";

const FOV = 28;
const CAMERA_Z = 11;
const VIS_H = 2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));

/* The pose at each stage, as absolute angles in the first site's vocabulary: roll .62 is the hero's
   diagonal, 1.45 lying, .3 standing; a positive pitch tips the top towards you. */
const POSES = [
  { roll: REST_TILT, pitch: 0 }, // Задача: the hero's diagonal
  { roll: 1.45, pitch: 0.08 }, // Структура: lying
  { roll: 1.2, pitch: 0.25 }, // Дизайн: lying, its top tipped towards you, to be looked at
  { roll: REST_TILT, pitch: -0.12 }, // Розробка: the diagonal again
  { roll: 0.3, pitch: 0 }, // Запуск: standing up
];
const TURN = Math.PI / 2; // a quarter round the long axis per stage: the seam faces you again at the launch
const HOP = 0.14; // world units, the lift half-way through a change
type Pose = { roll: number; pitch: number; yaw: number; hop: number; stage: number };
const KEYS = ["roll", "pitch", "yaw", "hop", "stage"] as const;
const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

/** The pose at a point of the deck (0 … 5): each change runs while its card slides in and settles. */
function poseAt(progress: number): Pose {
  const pose: Pose = { roll: POSES[0].roll, pitch: POSES[0].pitch, yaw: 0, hop: 0, stage: 0 };
  for (let k = 1; k < POSES.length; k++) {
    const u = smooth((progress - (k + DECK_IN[0])) / (DECK_REST - DECK_IN[0]));
    pose.roll += (POSES[k].roll - POSES[k - 1].roll) * u;
    pose.pitch += (POSES[k].pitch - POSES[k - 1].pitch) * u;
    pose.yaw += TURN * u;
    pose.hop += Math.sin(Math.PI * u);
    pose.stage += u;
  }
  return pose;
}

export default function StageStone() {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reduced = useMemo(() => matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let inView = false;
    const sync = () => setVisible(inView && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return (
    <div ref={box} className="process__stone" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: FOV, near: 0.1, far: 100, position: [0, 0, CAMERA_Z] }}
        frameloop={reduced ? "demand" : visible ? "always" : "never"}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.12;
        }}
      >
        <Stone />
        <Resume running={visible || reduced} />
      </Canvas>
    </div>
  );
}

function Stone() {
  const { gl, scene, size } = useThree();
  const studio = useMemo(() => createStudioEnvironment(gl), [gl]);
  const geometry = useMemo(() => createStoneGeometries({ detail: 28, coreDetail: 22 }), []);
  const obsidian = useMemo(() => createObsidianMaterial({ vertexColors: true }), []);
  const silver = useMemo(() => {
    const s = createSilverMaterial();
    s.material.envMap = createChromeEnvironment(gl, CHROME_LIGHTS.signal);
    s.material.envMapIntensity = 0.85;
    return s;
  }, [gl]);
  const lean = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const rock = useRef<THREE.Mesh>(null);
  const rot = useMemo(() => new THREE.Matrix4(), []);
  const clock = useRef({ time: 0 });
  const pose = useRef<Pose | null>(null);

  useEffect(() => {
    scene.environment = studio;
    return () => {
      studio.dispose();
      silver.material.envMap?.dispose();
      for (const d of [geometry.rock, geometry.core, obsidian.material, silver.material]) d.dispose();
    };
  }, [scene, studio, geometry, obsidian, silver]);

  // the stone fills ~80% of the canvas height (or width, if narrower)
  useEffect(() => {
    const fit = Math.min(1, (size.width / Math.max(1, size.height)) * 0.95);
    tilt.current?.scale.setScalar((0.8 * fit * VIS_H) / STONE_EXTENT);
  }, [size]);

  useFrame((_, delta) => {
    if (!lean.current || !tilt.current || !spin.current || !rock.current) return;
    const dt = Math.min(0.05, delta);
    const c = clock.current;
    c.time += dt;
    // the deck's pose, with a little weight on top of its scrub
    const goal = poseAt(deckProgress());
    const now = pose.current ?? (pose.current = { ...goal });
    const follow = 1 - Math.exp(-6 * dt);
    for (const key of KEYS) now[key] += (goal[key] - now[key]) * follow;
    // at rest it only breathes
    lean.current.rotation.x = now.pitch + Math.sin(c.time * 0.5) * 0.035;
    lean.current.position.y = now.hop * HOP + Math.sin(c.time * 0.6) * 0.02;
    tilt.current.rotation.z = now.roll + Math.sin(c.time * 0.37) * 0.02;
    spin.current.rotation.y = SEAM_FACING + now.yaw + Math.sin(c.time * 0.28) * 0.05;
    silver.material.envMapIntensity = 0.85 + 0.08 * now.stage; // the cracks gain chrome stage by stage
    scene.environmentRotation.y = c.time * 0.05;
    silver.material.envMapRotation.copy(scene.environmentRotation);
    silver.uniforms.uTime.value = c.time;
    rock.current.updateWorldMatrix(true, false);
    obsidian.uniforms.uRot.value.setFromMatrix4(rot.extractRotation(rock.current.matrixWorld));
  });

  return (
    <>
      <directionalLight color={0xfff2e2} intensity={3.0} position={[-3, 4, 5]} />
      <directionalLight color={0xd6defa} intensity={2.6} position={[4, 1.5, -3]} />
      <directionalLight color={0xffffff} intensity={1.6} position={[1, 6, 1]} />
      <group ref={lean}>
        <group ref={tilt} rotation={[0, 0, REST_TILT]}>
          <group ref={spin}>
            <mesh ref={rock} geometry={geometry.rock} material={obsidian.material} />
            <mesh geometry={geometry.core} material={silver.material} />
          </group>
        </group>
      </group>
    </>
  );
}
