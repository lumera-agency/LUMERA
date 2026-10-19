"use client";
/* eslint-disable react-hooks/immutability -- React Three Fiber: the scene is mutated per frame by design (as src/components/three/**, where this rule is off) */
/*
 * «Дизайн і сайти»: the first screen's stone, a copy of the AI page's (three/ai-stone/AiStone.tsx, untouched) changed for
 * this page (the owner, 19 Oct 2026: «объект увеличивается при скролле; он должен быть чуть побольше и не должен
 * увеличиваться при скролле вниз»). The AI stone swings 0.6 rad around its pose, turns another 0.9 rad and rises as the
 * first screen scrolls, and on phones leans after the finger (a scroll is a finger moving): it turned its broad side to
 * the screen and looked as if it grew. Here:
 *   - it rests in a pose with its broad face and the chrome seam toward the screen (it reads larger) and sways around
 *     it, never as far as its narrow edge (the owner, 19 Oct, after a still pose: «маленький и неподвижный»);
 *   - the scroll does nothing to it, and neither does a finger scrolling the page; a finger (or the mouse) dragged
 *     sideways on the stone itself turns it, and it eases back to its pose when let go; the cursor on a computer leans
 *     it, and the phone's tilt where the browser gives it without asking (Android);
 *   - it is lit from the first frame (the still under it is a frame of this same pose: hero-stone.webp), so when the
 *     live stone takes over, nothing changes on screen (sites-hero.css: no cross-fade);
 *   - it takes over only once the still's entrance has ended, never in the middle of it, and until then it holds the
 *     still's pose exactly (no breath, no lean, no drag): the cursor's lean eases in only after the swap (QA 19 Oct, N-01).
 * It renders only while it can be seen and at most 30 frames a second, like the lines behind it (N-05): it rests once
 * less than ~20 px of the first screen shows under the topbar.
 */
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Resume } from "@/components/three/lib/Resume";
import { createStoneGeometries } from "@/components/three/lib/geometry";
import { CHROME_LIGHTS, createChromeEnvironment, createObsidianMaterial, createSilverMaterial, createStudioEnvironment } from "@/components/three/lib/materials";
import { CAMERA_Z, FOV, REST_TILT, SEAM_FACING, STONE_EXTENT, VIS_H, damp } from "@/components/three/hero/state";

const FPS = 30; // (the breath is slow: 30 frames a second look the same, at half the work)
/** The first screen counts as covered once less than this much of it shows under the topbar (px). */
const COVER_EDGE = 20;
const SHARE = 0.72; // the stone's height as a share of the (square) canvas (the AI stone: 0.68; this one a little larger)
/** (this page) the rest pose: turned from the seam's yaw toward its broad face; the breath around it (rad) */
const POSE_YAW = -0.4;
const BREATH = 0.3; // the sway around the pose (rad): from -0.7 to -0.1, all broad faces

/** Where the stone is pulled: -1…1 each way (the cursor or the phone's tilt). */
const input = { x: 0, y: 0, tx: 0, ty: 0, turn: 0, vel: 0, dragging: false };

export default function SitesStone({ host }: { host: HTMLElement }) {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const coarse = useMemo(() => matchMedia("(pointer: coarse)").matches, []);
  /** true once the live stone shows (host.is-live): until then it holds the still's pose */
  const live = useRef(false);

  // runs only while the first screen can be seen and is not covered by the block sliding over it
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let inView = false;
    let covered = false;
    const sync = () => setVisible(inView && !covered && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      sync();
    });
    io.observe(el);
    // (N-05) covered: the block sliding over the pinned first screen has left less than COVER_EDGE px of it under the
    // topbar (or has passed it); checked on scroll, as the lines behind it are (HeroFlux)
    const sheet = host.closest(".ai-hero")?.nextElementSibling;
    const bar = document.querySelector<HTMLElement>("[data-topbar]");
    let raf = 0;
    const check = () => {
      raf = 0;
      if (!sheet) return;
      const edge = Math.max(0, bar?.getBoundingClientRect().bottom ?? 0) + COVER_EDGE;
      const now = sheet.getBoundingClientRect().top <= edge;
      if (now === covered) return;
      covered = now;
      sync();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [host]);

  // what moves it: the cursor (a computer), the phone's tilt, a sideways drag on the stone; never the scroll
  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      input.tx = (e.clientX / window.innerWidth) * 2 - 1;
      input.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    let base: { beta: number; gamma: number } | null = null;
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      base ??= { beta: e.beta, gamma: e.gamma };
      input.tx = THREE.MathUtils.clamp((e.gamma - base.gamma) / 25, -1, 1) * 0.6;
      input.ty = THREE.MathUtils.clamp((e.beta - base.beta) / 25, -1, 1) * 0.6;
    };
    // a sideways drag on the stone turns it (the page keeps vertical swipes: touch-action pan-y on its box)
    const area = host.closest<HTMLElement>(".st-hg__stone");
    let id = -1;
    let lastX = 0;
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      id = e.pointerId;
      lastX = e.clientX;
      input.dragging = true;
      input.vel = 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      const d = ((e.clientX - lastX) / Math.max(1, area?.offsetWidth ?? 300)) * 3.2;
      lastX = e.clientX;
      input.turn = THREE.MathUtils.clamp(input.turn + d, -0.6, 0.6); // (never round to its narrow edge)
      input.vel = d;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = -1;
      input.dragging = false;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    if (coarse) window.addEventListener("deviceorientation", onTilt, { passive: true });
    area?.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("pointercancel", up, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onTilt);
      area?.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [coarse, host]);

  // the live stone takes over once the still's entrance (CSS ai-stone-in) has ended: the two are the same picture then
  const takeOver = () => {
    const still = host.querySelector<HTMLImageElement>(".ai-hero__stone");
    const running = still?.getAnimations().filter((a) => a.playState === "running") ?? [];
    Promise.all(running.map((a) => a.finished.catch(() => {}))).then(() => {
      live.current = true;
      host.classList.add("is-live");
    });
  };

  return (
    <div ref={box} className="ai-hero__canvas" aria-hidden="true">
      <Canvas
        dpr={[1, coarse ? 1.5 : 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: FOV, near: 0.1, far: 100, position: [0, 0, CAMERA_Z] }}
        frameloop={visible ? "demand" : "never"}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.12;
        }}
      >
        <Stone coarse={coarse} onLive={takeOver} live={live} />
        <Pace running={visible} />
        <Resume running={visible} />
      </Canvas>
    </div>
  );
}

/** (N-05) at most FPS frames a second: the canvas renders on demand, asked for on every other frame of a 60 Hz screen
 *  (every fourth at 120 Hz) while it can be seen; nothing runs while it rests. */
function Pace({ running }: { running: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!running) return;
    const gap = 1000 / FPS - 2; // (a hair under: a 60 Hz screen's frames land every 16.7 ms)
    let last = -Infinity;
    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < gap) return;
      last = now;
      invalidate();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, invalidate]);
  return null;
}

function Stone({ coarse, onLive, live }: { coarse: boolean; onLive: () => void; live: RefObject<boolean> }) {
  const { gl, scene, camera } = useThree();
  const studio = useMemo(() => createStudioEnvironment(gl), [gl]);
  const chrome = useMemo(() => createChromeEnvironment(gl, CHROME_LIGHTS.signal), [gl]);
  const geometry = useMemo(() => createStoneGeometries({ detail: coarse ? 26 : 36, coreDetail: coarse ? 20 : 28 }), [coarse]);
  const obsidian = useMemo(() => createObsidianMaterial({ vertexColors: true }), []);
  const silver = useMemo(() => {
    const s = createSilverMaterial();
    s.material.envMap = chrome; // its own, brighter studio: it reads as liquid metal (the main page's hero)
    return s;
  }, [chrome]);
  const stage = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const rock = useRef<THREE.Mesh>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const top = useRef<THREE.DirectionalLight>(null);
  const rot = useMemo(() => new THREE.Matrix4(), []);
  const clock = useRef({ time: 0, reveal: 0, ready: false, frames: 0 });

  useEffect(() => {
    scene.environment = studio;
    scene.environmentIntensity = 0;
    stage.current?.scale.setScalar((SHARE * VIS_H) / STONE_EXTENT);
    // shaders compiled before the stone is lit: the first frames don't stall
    let alive = true;
    gl.compileAsync(scene, camera)
      .catch(() => {})
      .then(() => {
        if (alive) clock.current.ready = true;
      });
    return () => {
      alive = false;
      for (const d of [studio, chrome, obsidian.material, silver.material, geometry.rock, geometry.core]) d.dispose();
    };
  }, [gl, scene, camera, studio, chrome, obsidian, silver, geometry]);

  useFrame((_, delta) => {
    const c = clock.current;
    if (!c.ready || !stage.current || !tilt.current || !spin.current || !rock.current || !key.current || !rim.current || !top.current) return;
    const dt = Math.min(delta, 1 / 20);
    // (N-01) until it shows, it holds the still's pose: the time stands at 0, no lean, no drag; then the breath starts
    // from that pose and the lean eases in from 0 (the damping below), so the swap itself changes nothing on screen
    const on = live.current;
    if (on) c.time += dt;
    else {
      input.turn = 0;
      input.vel = 0;
    }
    // lit from the first frame: the still under it shows this same pose, lit
    c.reveal = 1;
    const lit = 1;
    if (++c.frames === 2) onLive(); // the picture under it can go (once its entrance has ended)
    input.x = damp(input.x, on ? input.tx : 0, 2.6, dt);
    input.y = damp(input.y, on ? input.ty : 0, 2.6, dt);
    const t = c.time;
    // the pose: its broad face and the chrome seam toward the screen; a breath of a few degrees, never a turn
    // a drag's turn coasts, then springs back to the pose
    if (!input.dragging) {
      input.turn = THREE.MathUtils.clamp(input.turn + input.vel, -0.6, 0.6);
      input.vel *= 0.9;
      input.turn = damp(input.turn, 0, 1.6, dt);
    }
    spin.current.rotation.y = SEAM_FACING + POSE_YAW + Math.sin(t * 0.19) * BREATH + input.turn;
    spin.current.rotation.x = Math.sin(t * 0.23) * 0.08;
    tilt.current.rotation.set(input.y * 0.16, input.x * 0.26, REST_TILT - input.x * 0.04);
    stage.current.position.set(input.x * 0.12, -input.y * 0.08 + Math.sin(t * 0.7) * 0.05, 0);

    scene.environmentIntensity = lit;
    scene.environmentRotation.y = t * 0.05 + input.x * 0.35;
    silver.material.envMapIntensity = 0.85 * lit;
    silver.material.envMapRotation.copy(scene.environmentRotation);
    key.current.intensity = 3.0 * lit;
    rim.current.intensity = 2.6 * lit;
    top.current.intensity = 1.6 * lit;
    key.current.position.set(-3 + input.x * 2.5, 4 - input.y * 1.5, 5);
    silver.uniforms.uTime.value = t;
    rock.current.updateWorldMatrix(true, false);
    obsidian.uniforms.uRot.value.setFromMatrix4(rot.extractRotation(rock.current.matrixWorld));
  });

  return (
    <>
      <directionalLight ref={key} color={0xfff2e2} intensity={0} position={[-3, 4, 5]} />
      <directionalLight ref={rim} color={0xd6defa} intensity={0} position={[4, 1.5, -3]} />
      <directionalLight ref={top} color={0xffffff} intensity={0} position={[1, 6, 1]} />
      <group ref={stage}>
        <group ref={tilt}>
          <group ref={spin}>
            <mesh ref={rock} geometry={geometry.rock} material={obsidian.material} />
            <mesh geometry={geometry.core} material={silver.material} />
          </group>
        </group>
      </group>
    </>
  );
}
