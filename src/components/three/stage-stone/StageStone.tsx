"use client";
/*
 * 5 · Підхід: the stone beside the stage deck — the same stone as the first screen on its own small
 * canvas in the deck's left lane. It turns slowly all the time, and a quarter turn more for every
 * stage the deck flips to (deckTurns(), approach/stages.js). Renders only while it is on screen.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { createStoneGeometries } from "../lib/geometry";
import { CHROME_LIGHTS, createChromeEnvironment, createObsidianMaterial, createSilverMaterial, createStudioEnvironment } from "../lib/materials";
import { REST_TILT, SEAM_FACING, STONE_EXTENT } from "../hero/state";
import { Resume } from "../lib/Resume";
import { deckTurns } from "@/components/sections/approach/stages.js";

const FOV = 28;
const CAMERA_Z = 11;
const VIS_H = 2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
const SPIN = 0.22; // rad per second, the constant turn
const STEP = Math.PI / 2; // the extra turn per stage

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
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const rock = useRef<THREE.Mesh>(null);
  const rot = useMemo(() => new THREE.Matrix4(), []);
  const clock = useRef({ time: 0, angle: deckTurns() * STEP });

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
    if (!spin.current || !rock.current) return;
    const dt = Math.min(0.05, delta);
    const c = clock.current;
    c.time += dt;
    // ease towards the deck's turn, so a flip reads as one smooth quarter turn
    c.angle += (deckTurns() * STEP - c.angle) * (1 - Math.exp(-5 * dt));
    spin.current.rotation.y = SEAM_FACING + c.angle + c.time * SPIN;
    spin.current.rotation.x = Math.sin(c.time * 0.23) * 0.08;
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
      <group ref={tilt} rotation={[0, 0, REST_TILT]}>
        <group ref={spin}>
          <mesh ref={rock} geometry={geometry.rock} material={obsidian.material} />
          <mesh geometry={geometry.core} material={silver.material} />
        </group>
      </group>
    </>
  );
}
