"use client";
/*
 * The hero's stone, in React Three Fiber: a black coal stone with a liquid-chrome seam, lit out of
 * darkness by the intro (heroState), turning slowly, leaning toward the pointer, with the orbit of
 * services and silver dust around it. The blurred shards behind are a second canvas (ShardsScene).
 * Loaded on the client only (next/dynamic), after the first paint.
 */
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Resume } from "../lib/Resume";
import { createStoneGeometries } from "../lib/geometry";
import { CHROME_LIGHTS, createChromeEnvironment, createObsidianMaterial, createSilverMaterial, createStudioEnvironment } from "../lib/materials";
import { createOrbit, loadOrbitFont } from "./orbit";
import { createDust } from "./dust";
import { createStoneMask } from "./stoneMask";
import { CAMERA_Z, FOV, REST_TILT, SEAM_FACING, STONE_EXTENT, SWAY, VIS_H, damp, heroClock, heroLayout, heroPointer, heroState } from "./state";
import { boot } from "@/lib/boot";

type Props = {
  /** the hero section: its box is the scene's frame */
  heroRef: RefObject<HTMLElement | null>;
  /** the background glow that trails the stone (moved by transform each frame) */
  glowRef: RefObject<HTMLElement | null>;
  /** the services on the orbit, «A · B · C» */
  orbitLabel: string;
  running: boolean;
  reducedMotion: boolean;
};

export default function HeroScene({ running, reducedMotion, ...rest }: Props) {
  const coarse = useMemo(() => typeof window !== "undefined" && matchMedia("(pointer: coarse)").matches, []);
  return (
    <Canvas
      className="hero__canvas"
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
      dpr={[1, coarse ? 1.5 : 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: FOV, near: 0.1, far: 100, position: [0, 0, CAMERA_Z] }}
      frameloop={reducedMotion ? "demand" : running ? "always" : "never"}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
      }}
    >
      <Stone coarse={coarse} reducedMotion={reducedMotion} {...rest} />
      <Resume running={running || reducedMotion} />
    </Canvas>
  );
}

function Stone({ heroRef, glowRef, orbitLabel, reducedMotion, coarse }: Omit<Props, "running"> & { coarse: boolean }) {
  const { gl, scene, camera, size, invalidate } = useThree();

  const studio = useMemo(() => createStudioEnvironment(gl), [gl]);
  const chrome = useMemo(() => createChromeEnvironment(gl, CHROME_LIGHTS.signal), [gl]);
  const geometry = useMemo(() => createStoneGeometries({ detail: coarse ? 26 : 36, coreDetail: coarse ? 20 : 28 }), [coarse]);
  const obsidian = useMemo(() => createObsidianMaterial({ vertexColors: true }), []);
  const silver = useMemo(() => {
    const s = createSilverMaterial();
    s.material.envMap = chrome; // the chrome gets its own, brighter studio: it reads as liquid metal
    return s;
  }, [chrome]);
  const orbit = useMemo(() => createOrbit(gl, orbitLabel), [gl, orbitLabel]);
  const dust = useMemo(() => createDust(coarse ? 120 : 260), [coarse]);
  const mask = useMemo(() => createStoneMask(gl), [gl]);

  const stage = useRef<THREE.Group>(null); // placement + parallax
  const tilt = useRef<THREE.Group>(null); // resting diagonal + pointer tilt
  const spin = useRef<THREE.Group>(null); // constant rotation
  const rock = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const top = useRef<THREE.DirectionalLight>(null);
  const rot = useMemo(() => new THREE.Matrix4(), []);

  // the scene's studio light, the stone on the mask's layer, the orbit's font
  useEffect(() => {
    scene.environment = studio;
    scene.environmentIntensity = 0;
    rock.current?.layers.enable(1);
    core.current?.layers.enable(1);
    orbit.material.uniforms.uMask.value = mask.texture;
    dust.material.uniforms.uPixelRatio.value = gl.getPixelRatio();
    let alive = true;
    loadOrbitFont(orbitLabel)
      .then(() => {
        if (!alive) return;
        orbit.redraw();
        invalidate();
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [scene, studio, mask, orbit, dust, gl, orbitLabel, invalidate]);

  // shaders compiled in the background: the intro waits for this, so its first frames don't stall
  useEffect(() => {
    let done = false;
    gl.compileAsync(scene, camera)
      .catch(() => {})
      .then(() => {
        if (done) return;
        boot.sceneReady.resolve();
      });
    return () => {
      done = true;
    };
  }, [gl, scene, camera]);

  // layout: where the stone sits and how big, from the hero's box (phones: between header and headline).
  // Only on a new width or height: R3F's size also carries the canvas's place on the page and changes
  // with every scroll, and the headline measured mid-scroll (held by the lift) put the stone lower
  const { width: sizeW, height: sizeH } = size;
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const W = Math.max(1, sizeW);
    const H = Math.max(1, sizeH);
    const mobile = matchMedia("(max-width: 860px)").matches || W / H < 0.85;
    let cx: number;
    let cy: number;
    let s: number;
    if (!mobile) {
      cx = W * 0.655;
      cy = H * 0.54;
      s = Math.min(H * 0.74, W * 0.46);
    } else {
      // places in the layout (offsets), not on screen: a transform (the lift) does not move them
      const top = (el: HTMLElement | null) => {
        let y = 0;
        for (let n: HTMLElement | null = el; n && n !== hero; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
        return y;
      };
      const header = hero.querySelector<HTMLElement>(".header");
      const title = hero.querySelector<HTMLElement>("h1");
      const headerBottom = header ? top(header) + header.offsetHeight : 0;
      const bottom = title ? top(title) : H * 0.6;
      cx = W * 0.6;
      cy = headerBottom + (bottom - headerBottom) * 0.5;
      s = THREE.MathUtils.clamp(bottom - headerBottom, W * 0.55, W * 1.0);
    }
    const aspect = W / H;
    heroLayout.base.set((cx / W - 0.5) * VIS_H * aspect, -(cy / H - 0.5) * VIS_H, 0);
    heroLayout.baseScale = (s * (VIS_H / H)) / STONE_EXTENT;
    Object.assign(heroLayout, { mobile, glowX: cx, glowY: cy, width: W, height: H });
    mask.setSize(W, H);
    const buffer = gl.getDrawingBufferSize(new THREE.Vector2());
    orbit.material.uniforms.uViewport.value.copy(buffer);
    if (reducedMotion) invalidate();
  }, [sizeW, sizeH, heroRef, mask, orbit, gl, reducedMotion, invalidate]);

  // the pointer, -1…1 across the window (the stone leans toward it)
  useEffect(() => {
    if (reducedMotion) return;
    const move = (e: PointerEvent) => {
      heroPointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      heroPointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) heroClock.time = 1.5;
  }, [reducedMotion]);

  useEffect(
    () => () => {
      for (const d of [studio, chrome, obsidian.material, silver.material, geometry.rock, geometry.core, dust.geometry, dust.material]) d.dispose();
      orbit.dispose();
      mask.dispose();
    },
    [studio, chrome, obsidian, silver, geometry, dust, orbit, mask],
  );

  useFrame((_, delta) => {
    const dt = reducedMotion ? 0 : Math.min(delta, 1 / 20);
    heroClock.time += dt;
    const time = heroClock.time;
    const s = heroState;
    const p = heroPointer;
    p.x = damp(p.x, p.tx, 2.6, dt);
    p.y = damp(p.y, p.ty, 2.6, dt);
    if (!stage.current || !tilt.current || !spin.current || !rock.current || !key.current || !rim.current || !top.current) return;

    // the stone: lit out of darkness, settling into its pose
    const intro = s.stoneIntro;
    spin.current.rotation.y = SEAM_FACING + Math.sin(time * 0.19) * SWAY - (1 - intro) * 1.6;
    spin.current.rotation.x = Math.sin(time * 0.23) * 0.08;
    tilt.current.rotation.set(p.y * 0.16, p.x * 0.26, REST_TILT - p.x * 0.04);
    const { base, baseScale } = heroLayout;
    stage.current.position.set(base.x + p.x * 0.12, base.y - p.y * 0.08 + Math.sin(time * 0.7) * 0.05 - (1 - intro) * 0.45, 0);
    stage.current.scale.setScalar(baseScale * (0.9 + 0.1 * intro));

    scene.environmentIntensity = s.stoneReveal;
    scene.environmentRotation.y = time * 0.05 + p.x * 0.35;
    silver.material.envMapIntensity = 0.85 * s.stoneReveal;
    silver.material.envMapRotation.copy(scene.environmentRotation);
    key.current.intensity = 3.0 * s.stoneReveal;
    rim.current.intensity = 2.6 * s.stoneReveal;
    top.current.intensity = 1.6 * s.stoneReveal;
    key.current.position.set(-3 + p.x * 2.5, 4 - p.y * 1.5, 5);
    silver.uniforms.uTime.value = time;
    rock.current.updateWorldMatrix(true, false);
    obsidian.uniforms.uRot.value.setFromMatrix4(rot.extractRotation(rock.current.matrixWorld));
    dust.material.uniforms.uTime.value = time;
    dust.material.uniforms.uOpacity.value = s.dots;

    // the orbit draws in, then its text keeps running; it follows the key light and the reveal
    const u = orbit.material.uniforms;
    u.uProgress.value = s.ringProgress;
    u.uShift.value = orbit.shiftAt(time);
    u.uKey.value.copy(key.current.position).normalize();
    u.uReveal.value = s.stoneReveal;

    // the background glow trails the stone and the pointer (transform only)
    const glow = glowRef.current;
    if (glow) {
      const gx = heroLayout.glowX + p.x * 40;
      const gy = heroLayout.glowY + p.y * 30;
      glow.style.transform = `translate3d(${gx.toFixed(1)}px, ${gy.toFixed(1)}px, 0) translate(-50%, -50%)`;
    }

    mask.render(scene, camera);
    gl.render(scene, camera);
  }, 1);

  return (
    <>
      <directionalLight ref={key} color={0xfff2e2} intensity={0} position={[-3, 4, 5]} />
      <directionalLight ref={rim} color={0xd6defa} intensity={0} position={[4, 1.5, -3]} />
      {/* grazing light from above: picks out the upper edges of the blocks */}
      <directionalLight ref={top} color={0xffffff} intensity={0} position={[1, 6, 1]} />
      <group ref={stage}>
        <group ref={tilt}>
          <group ref={spin}>
            <mesh ref={rock} geometry={geometry.rock} material={obsidian.material} />
            <mesh ref={core} geometry={geometry.core} material={silver.material} />
          </group>
        </group>
        {/* tilted into an ellipse first, then leaning as in the layout; a little above the stone's middle */}
        <group rotation={[-1.32, 0, 0.42, "ZYX"]} position={[0, 0.22, 0]}>
          <mesh geometry={orbit.geometry} material={orbit.material} />
        </group>
        <points geometry={dust.geometry} material={dust.material} frustumCulled={false} />
      </group>
    </>
  );
}
