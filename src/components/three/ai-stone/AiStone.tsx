"use client";
/*
 * The AI page's first screen: the main page's stone, far behind the title (owner, 2026-10-12/15: «как 3D-объект, как
 * на главной», «реагировать на движение и на мобильной, и на десктопной версии»). The same geometry, obsidian and
 * liquid chrome as the hero's (three/lib), without its orbit and dust. It sways slowly; it leans toward the cursor; on
 * phones toward the finger and, where the browser gives it without asking (Android), the phone's tilt; on every device
 * it turns a little as the first screen scrolls away.
 *
 * It renders only while it can be seen: off screen, once the next block has slid over the first screen, and in a
 * hidden tab its loop stops. The still under it is this stone's own first frame (img/ai/stone-still*.webp, rendered
 * from this component: same pose, same light, the phone's from the phone's simpler render), so it starts fully lit and
 * dissolves in over the still with nothing to see but the start of the sway (the owner, 21 Oct 2026: «сначала
 * картинка, потом 3D»). Never with reduced motion (the still stays): AiStoneSlot decides.
 */
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Resume } from "../lib/Resume";
import { createStoneGeometries } from "../lib/geometry";
import { CHROME_LIGHTS, createChromeEnvironment, createObsidianMaterial, createSilverMaterial, createStudioEnvironment } from "../lib/materials";
import { CAMERA_Z, FOV, REST_TILT, SEAM_FACING, STONE_EXTENT, SWAY, VIS_H, damp } from "../hero/state";

const SHARE = 0.68; // the stone's height as a share of the (square) canvas: room for the sway and the lean

/** Where the stone is pulled: -1…1 each way (the cursor, the finger or the phone's tilt), and the first screen's scroll. */
const input = { x: 0, y: 0, tx: 0, ty: 0, scroll: 0 };

export default function AiStone({ host }: { host: HTMLElement }) {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  // shown yet? Until the cross-fade starts the stone holds its first frame (the still's pose): no sway, no lean
  const shown = useRef(false);
  const coarse = useMemo(() => matchMedia("(pointer: coarse)").matches, []);

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
    const sheet = host.closest(".ai-hero")?.nextElementSibling;
    const cover = sheet
      ? new IntersectionObserver(
          ([e]) => {
            covered = e.isIntersecting || e.boundingClientRect.bottom < 0;
            sync();
          },
          { rootMargin: "0px 0px -90% 0px" },
        )
      : null;
    if (sheet) cover?.observe(sheet);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      cover?.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [host]);

  // what moves it: the cursor, a finger, the phone's tilt, the scroll
  useEffect(() => {
    const point = (x: number, y: number) => {
      input.tx = (x / window.innerWidth) * 2 - 1;
      input.ty = (y / window.innerHeight) * 2 - 1;
    };
    const onPointer = (e: PointerEvent) => point(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) point(t.clientX, t.clientY);
    };
    let base: { beta: number; gamma: number } | null = null;
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      base ??= { beta: e.beta, gamma: e.gamma };
      input.tx = THREE.MathUtils.clamp((e.gamma - base.gamma) / 25, -1, 1);
      input.ty = THREE.MathUtils.clamp((e.beta - base.beta) / 25, -1, 1);
    };
    const hero = host.closest<HTMLElement>(".ai-hero");
    const onScroll = () => {
      input.scroll = hero ? THREE.MathUtils.clamp(window.scrollY / Math.max(1, hero.offsetHeight), 0, 1) : 0;
    };
    onScroll();
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    if (coarse) {
      window.addEventListener("touchmove", onTouch, { passive: true });
      window.addEventListener("deviceorientation", onTilt, { passive: true });
    }
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, [host, coarse]);

  return (
    <div ref={box} className="ai-hero__canvas" aria-hidden="true">
      <Canvas
        dpr={[1, coarse ? 1.5 : 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: FOV, near: 0.1, far: 100, position: [0, 0, CAMERA_Z] }}
        frameloop={visible ? "always" : "never"}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.12;
        }}
      >
        <Stone
          coarse={coarse}
          shown={shown}
          onLive={() =>
            stillSettled(host).then(() => {
              shown.current = true;
              host.classList.add("is-live");
            })
          }
        />
        <Resume running={visible} />
      </Canvas>
    </div>
  );
}

/** The still's own entrance (CSS ai-stone-in) has to end before the cross-fade: started during it, the entrance would
 *  run straight to the new opacity and drop the still at once, while the live stone is only beginning to fade in. */
function stillSettled(host: HTMLElement) {
  const still = host.querySelector<HTMLElement>(".ai-hero__stone");
  const running = still?.getAnimations().filter((a) => a.playState === "running") ?? [];
  return Promise.all(running.map((a) => a.finished.catch(() => undefined))).then(() => undefined);
}

function Stone({ coarse, shown, onLive }: { coarse: boolean; shown: RefObject<boolean>; onLive: () => void }) {
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
  // fully lit from its first frame: that frame is the still under it (no dip into darkness at the swap)
  const clock = useRef({ time: 0, reveal: 1, ready: false, frames: 0 });

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
    // its clock starts with the cross-fade: the first frame anyone sees is the still's pose
    if (shown.current) c.time += dt;
    // (a reveal out of darkness, as the main page's stone has, would start from 0 here: this one starts lit)
    c.reveal = Math.min(1, c.reveal + dt / 1.5);
    const lit = 1 - Math.pow(1 - c.reveal, 3);
    if (++c.frames === 2) onLive(); // the picture under it can go
    if (shown.current) {
      input.x = damp(input.x, input.tx, 2.6, dt);
      input.y = damp(input.y, input.ty, 2.6, dt);
    }
    const t = c.time;
    const s = input.scroll;
    spin.current.rotation.y = SEAM_FACING + Math.sin(t * 0.19) * SWAY + s * 0.9;
    spin.current.rotation.x = Math.sin(t * 0.23) * 0.08;
    tilt.current.rotation.set(input.y * 0.16 + s * 0.2, input.x * 0.26, REST_TILT - input.x * 0.04);
    stage.current.position.set(input.x * 0.12, -input.y * 0.08 + Math.sin(t * 0.7) * 0.05 + s * 0.35, 0);

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
