"use client";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { createRoot, type Root } from "react-dom/client";
import dynamic from "next/dynamic";
import { boot, loader, sceneRun, useSceneRunning } from "@/lib/boot";
import { useReducedMotion } from "@/lib/hooks";
import { heroGlow, heroGlowMoved } from "@/lib/hero-glow";
import { isLite, useLite } from "@/lib/lite";
import { canRunFull } from "@/lib/perf/mode";
import { playAlphaFilm } from "@/components/fx/alpha-film/alpha-film";
import { WebGLGate } from "@/components/three/lib/WebGLGate";
import { stonePlace } from "@/components/three/hero/state";
import { useBoot } from "./useBoot";
import { HeroOrbit } from "./HeroOrbit";
import "./hero.css";

// three.js and the scenes load after the first paint; the page works without them. In LITE (lib/lite) and on a phone
// they are never asked for: the stone is a film over a still, its orbit in CSS (below)
const HeroScene = dynamic(
  () =>
    import("@/components/three/hero/HeroScene").then((m) => {
      boot.sceneLoaded.resolve();
      return m;
    }),
  { ssr: false },
);

/**
 * The blurred shards behind the stone, as pictures (the owner, 12 Nov 2026: taken from LITE's way of doing it; they
 * were a second three.js scene that drew only through the intro and then stood still, «статичные как картинка», the
 * owner, 10 Nov 2026). Each is its own picture of the scene's shard at the pose the intro left it in
 * (tools/capture-shards.mjs and shards-cut.py in the optimization folder), placed as the scene placed it: x a share of
 * the hero's width, y and the height shares of its height, the drift it had made by then in hero heights; a phone's
 * layout has fewer and smaller (phone). The scene's CSS blur stays on their box (hero.css); not in LITE.
 */
const SHARD_PICTURES = [
  { seed: 3, x: 0.415, y: 0.845, height: 0.1387, driftX: 0.0427, driftY: -0.0103, phone: { x: 0.1, y: 0.4, height: 0.0809 } },
  { seed: 5, x: 0.585, y: 0.965, height: 0.0693, driftX: -0.004, driftY: 0.0003, phone: null },
  { seed: 8, x: 0.915, y: 0.615, height: 0.096, driftX: -0.028, driftY: 0.001, phone: { x: 0.94, y: 0.56, height: 0.0678 } },
  { seed: 13, x: 0.958, y: 0.93, height: 0.1333, driftX: -0.0035, driftY: -0.0527, phone: { x: 0.9, y: 0.97, height: 0.0762 } },
  { seed: 21, x: 0.8, y: 0.29, height: 0.04, driftX: 0.012, driftY: -0.014, phone: null },
  { seed: 34, x: 0.5, y: 0.5, height: 0.0587, driftX: -0.0027, driftY: 0.0173, phone: null },
];

/* The page rides over the first screen: the hero holds still (sticky, hero.css) and dims, and the blocks slide over
   it. On every screen since 12 Nov 2026 (the owner: «давай сделай стики на компьютере»): on a computer a script held
   the content back to 0.7 of the scroll, a frame behind the browser's own scroll once the glide was off, so the
   content jumped as the page came over it. */

/**
 * A phone (a finger and a small screen, either way up): its stone is LITE's film, not the live 3D, the rest of the page
 * as it is (the owner, 13 Nov 2026, «делай 1»: under the live stone the phone's graphics fell behind, the stone's
 * entrance and the text of block 2 sliding over it «подлагивает»; measured with a slow graphics stand-in, block 2's
 * text drew 98 to 122 frames of 180 over the live stone, 167 over the film). The robot and the droplet were films on a
 * phone already. hero.css shows the still from the first paint by the same test.
 */
const PHONE = "(hover: none) and (pointer: coarse) and (max-width: 699px), (hover: none) and (pointer: coarse) and (max-height: 699px)";
const onPhone = () => matchMedia(PHONE).matches;

/** No 3D here: the start-up doesn't wait for a scene that won't come. */
const skipScene = () => {
  boot.sceneLoaded.resolve();
  boot.sceneReady.resolve();
};

/**
 * LITE's stone (lib/lite), and a phone's (PHONE): a short film of the live stone, its orbit of services running round
 * it in CSS (HeroOrbit).
 * The owner, 12 Nov 2026: the long film «тормозит» (20 s with the orbit's words in it, 4.9 MB), a still with a light
 * along its chrome did not look right, this one «норм». An 8 s loop of the live scene with its transparency, the
 * orbit's words left out and no rise and fall (the page floats the film and the orbit together, hero.css), the stone
 * turning about ±10° (NO_ORBIT=1 FILM_SCALE=2 FILM_SWAY=0.29 FILM_BOB=0 tools/record-film.mjs, then encode-film.sh crf
 * 25, in the optimization folder): 2.0 MB at 1600 px a half for a computer (softer was rejected), 0.6 MB at 912 for a
 * phone, one film for both languages. Under it from the first paint a still of its own first frame (tools/film-still.py),
 * which stays alone where no graphics card draws the page: there every frame of the film would fall on the processor.
 * STILL_FRAME is how far both reach from the stone's centre, in stone heights: they are laid by it where the live stone
 * would stand (stonePlace), on a wide screen and on a phone alike. ORBIT is the ring as the scene sets it: its centre
 * 0.22 of the scene's units above the stone's (the stone is 3.1 high), and the camera's distance in hero heights (FOV
 * 28, CAMERA_Z 11), for CSS perspective from the hero's centre as the camera looks.
 */
const STILL_FRAME = { left: 0.86, right: 0.86, up: 0.6, down: 0.6 };
const ORBIT = { lift: 0.22 / 3.1, depth: 2.0054 };
/** LITE's stone stands this many stone heights right of the orbit's centre: the ring leans and is seen from the hero's
 *  centre, to the stone's left, so it reaches further right than left and the stone looked off to its left (the owner,
 *  12 Nov 2026: «чуть отцентрируем камень по сравнению к бегущей строке»); its seen middle is 0.040 to 0.043 right */
const STONE_RIGHT = 0.04;
const WIDE = "(min-width: 701px)";
/* The loop starts where the stone turns, so it sets off the long way at once (the owner, 13 Nov 2026: it went a little
   to one side for 0.4 s, then turned, which looked jerky on a slow computer): frame 13 of the recording first. ?v: a
   new cut under the same name (the pictures and films are cached for a week, next.config) */
const FILM = {
  wide: "/img/hero/stone-film-lite-d.mp4?v=2",
  narrow: "/img/hero/stone-film-lite.mp4?v=2",
  stillWide: "/img/hero/stone-film-lite-d.webp?v=2",
  stillNarrow: "/img/hero/stone-film-lite.webp?v=2",
};

/**
 * The 3D lives in a React root of its own, outside the page's: a language switch renders the page anew in the other
 * language (LangSwitch, the router), this shell with it, and the canvases would start over. Instead the new shell
 * takes the same root over, moves its box into its own hero before it is drawn and renders it with its own words (the
 * orbit's); the stone moves on as it was (the owner, 3 Nov). Left without a shell (another page), it is let go.
 */
let island: { box: HTMLDivElement; root: Root; drop: number } | null = null;
/** The hero and its glow as the scenes see them: whichever shell holds the island now. */
const heroBox: { current: HTMLDivElement | null } = { current: null };
const glowBox: { current: HTMLDivElement | null } = { current: null };
/** A value the page never changes once loaded (the graphics card): nothing to listen to. */
const noSubscribe = () => () => {};

/**
 * The first screen's stage: background light, the 3D canvases and the boot sequence.
 * The copy, header and rail come in as children (server-rendered).
 */
export function HeroShell({ orbitLabel, children }: { orbitLabel: string; children: React.ReactNode }) {
  const hero = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const still = useRef<HTMLImageElement>(null);
  const lite = useLite();
  const reducedMotion = useReducedMotion();
  const started = useSceneRunning();
  const [visible, setVisible] = useState(true);
  // the scenes are built (a few hundred ms of the main thread, in long blocks) only once the preloader's roll has
  // played, so they can't stall it; their code is fetched at once («сначала появление, потом ждать, пока догрузится»)
  // Already built (a language switch): taken over at once
  const [build, setBuild] = useState(() => island != null);

  useBoot(hero, reducedMotion);
  useEffect(() => {
    // LITE and a phone: no scene to wait for, nothing of it fetched (read from the page, not from the render: this runs
    // before the render that knows the mode)
    if (isLite() || onPhone()) return skipScene();
    let alive = true;
    void import("@/components/three/hero/HeroScene");
    // with processor to spare (8 threads and more) built alongside the roll: measured on 10 Nov 2026, the roll ran as
    // smoothly there and the page opened about 0.6 s sooner. A slower one keeps the order above: on a processor four
    // times slower the roll's words (drawn on the main thread) stalled while the scenes were built
    const spare = (navigator.hardwareConcurrency || 0) >= 8;
    (spare ? Promise.resolve() : (loader()?.rolled ?? Promise.resolve())).then(() => alive && setBuild(true));
    return () => {
      alive = false;
    };
  }, []);

  // pause the canvases off-screen, under the page (the hero is sticky, never off-screen, only covered) and in a
  // background tab; the hero's height for its sticky top (hero.css)
  useEffect(() => {
    const el = hero.current;
    if (!el) return;
    const page = document.querySelector<HTMLElement>("[data-page]");
    let inView = true;
    let covered = false;
    const sync = () => {
      const away = !inView || covered;
      setVisible(!away && !document.hidden);
      el.classList.toggle("is-away", away);
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    let queued = 0;
    const onScroll = () => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        const now = Boolean(page && page.getBoundingClientRect().top <= 0);
        if (now !== covered) {
          covered = now;
          sync();
        }
      });
    };
    const ro = new ResizeObserver(() => el.style.setProperty("--hero-height", `${el.offsetHeight}px`));
    ro.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", sync);
    onScroll();
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(queued);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  // On a computer, as numbers only: how far the sticky hero is held, for the page's seam that carries its glow on
  // (PageShell, lib/hero-glow), and its dimming where the browser has no scroll timelines to run it (hero.css). Nothing
  // on screen waits for this. A touch screen's seam does not follow the glow.
  useEffect(() => {
    const el = hero.current;
    if (!el || reducedMotion || matchMedia("(hover: none) and (pointer: coarse)").matches) return;
    const dimByScript = !CSS.supports("animation-timeline: scroll()");
    let queued = 0;
    // (the sizes from a resize observer, not read each frame: a read after the page's other writes in the same frame
    // had the browser lay the page out again on every frame of a scroll)
    let height = el.offsetHeight || 1;
    // a hero taller than the screen first scrolls to its foot, then holds (its sticky top, hero.css)
    let before = 0;
    let shownDim = -1;
    const apply = () => {
      queued = 0;
      const y = Math.max(window.scrollY, 0);
      const lift = Math.max(0, y - before);
      if (lift !== heroGlow.lift) {
        heroGlow.lift = lift;
        heroGlowMoved();
      }
      if (!dimByScript) return;
      const dim = Math.min(y / height, 1);
      if (dim === shownDim) return;
      shownDim = dim;
      el.style.setProperty("--lift-dim", (0.55 * dim).toFixed(3));
    };
    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(apply);
    };
    const sized = new ResizeObserver(() => {
      height = el.offsetHeight || 1;
      const screen = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hero-min")) || window.innerHeight;
      before = Math.max(0, height - screen);
      shownDim = -1;
      onScroll();
    });
    sized.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    apply();
    return () => {
      cancelAnimationFrame(queued);
      sized.disconnect();
      window.removeEventListener("scroll", onScroll);
      heroGlow.lift = 0;
      heroGlowMoved();
    };
  }, [reducedMotion]);

  const running = started && visible;

  // the stone as a film (LITE, a phone) rather than the live 3D
  // (asked of the browser only: the server knows neither the screen nor the graphics card, and renders the still)
  const phone = useSyncExternalStore(noSubscribe, onPhone, () => false);
  const filmStone = lite || phone;
  // that stone moves (its film plays, it floats with its orbit, the orbit turns: hero.css) only where a graphics card
  // draws the page; without one the film's frames and the compositor's work fall on the processor (12 Nov 2026: the
  // orbit alone took 31% of a core there), so the still of the film's first frame stands, the orbit too
  const film = useSyncExternalStore(noSubscribe, () => (lite || onPhone()) && canRunFull(), () => false);
  const filmCanvas = useRef<HTMLCanvasElement>(null);
  // its first frame drawn: shown over the still from then on (state, not a class set by hand: React writes the block's
  // class anew as the stone comes in, and on a phone the film is often up before that, under the preloader)
  const [filmShown, setFilmShown] = useState(false);
  /** tells the film to hold while the hero is off screen or under the page (set by the film once it plays) */
  const holdFilm = useRef<(held: boolean) => void>(() => {});
  const seen = useRef(visible);
  useEffect(() => {
    seen.current = visible;
    holdFilm.current(!visible);
  }, [visible]);
  // the film, asked for once the page has loaded and the browser is idle (never in the first screen's way), shown over
  // the still of its first frame from that frame on
  useEffect(() => {
    const host = hero.current;
    const canvas = filmCanvas.current;
    const frame = canvas?.closest<HTMLElement>(".hero__still");
    if (!film || !host || !canvas || !frame) return;
    let stop = () => {};
    let cancelWait = () => {};
    const start = () => {
      stop = playAlphaFilm({
        canvas,
        // (a phone on its side as well: its stone is small there, the phone's cut is sharp enough)
        src: matchMedia(WIDE).matches && !onPhone() ? FILM.wide : FILM.narrow,
        watch: host,
        onShown: () => setFilmShown(true),
        // (no WebGL, or the browser will not play it: the still of its first frame stays)
        onFail: () => {},
        hold: (set) => {
          holdFilm.current = set;
          set(!seen.current);
          return () => {
            holdFilm.current = () => {};
          };
        },
      });
    };
    const whenIdle = () => {
      if (typeof requestIdleCallback === "function") {
        const handle = requestIdleCallback(start, { timeout: 3000 });
        cancelWait = () => cancelIdleCallback(handle);
      } else {
        const timer = window.setTimeout(start, 800);
        cancelWait = () => clearTimeout(timer);
      }
    };
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
    return () => {
      window.removeEventListener("load", whenIdle);
      cancelWait();
      stop();
      setFilmShown(false);
    };
  }, [film]);

  // the film's stone (LITE, a phone): the still laid where the stone would stand, its orbit round it and the glow
  // behind it; again on a new size and once the headline's font is in (on a phone the stone stands between the header
  // and the headline)
  useEffect(() => {
    const host = hero.current;
    const picture = still.current;
    const frame = picture?.closest<HTMLElement>(".hero__still");
    if (!filmStone || !host || !picture || !frame) return;
    const place = () => {
      const { centerX, centerY, size } = stonePlace(host, host.offsetWidth, host.offsetHeight);
      const stoneX = centerX + STONE_RIGHT * size;
      // the still and the film over it
      for (const layer of [picture, filmCanvas.current]) {
        if (!layer) continue;
        layer.style.left = `${(stoneX - STILL_FRAME.left * size).toFixed(1)}px`;
        layer.style.top = `${(centerY - STILL_FRAME.up * size).toFixed(1)}px`;
        layer.style.width = `${((STILL_FRAME.left + STILL_FRAME.right) * size).toFixed(1)}px`;
        layer.style.height = `${((STILL_FRAME.up + STILL_FRAME.down) * size).toFixed(1)}px`;
        // (placed: a phone's picture may show now, hero.css)
        layer.dataset.placed = "";
      }
      // the orbit's ring (hero.css, HeroOrbit)
      frame.style.setProperty("--orbit-x", `${centerX.toFixed(1)}px`);
      frame.style.setProperty("--orbit-y", `${(centerY - ORBIT.lift * size).toFixed(1)}px`);
      frame.style.setProperty("--orbit-stone-y", `${centerY.toFixed(1)}px`);
      frame.style.setProperty("--orbit-size", `${size.toFixed(1)}px`);
      frame.style.setProperty("--orbit-depth", `${Math.round(ORBIT.depth * host.offsetHeight)}px`);
      if (glow.current) glow.current.style.transform = `translate3d(${stoneX.toFixed(1)}px, ${centerY.toFixed(1)}px, 0) translate(-50%, -50%)`;
      // (the page's bridge carries this light on from the numbers, lib/hero-glow)
      heroGlow.centerX = stoneX;
      heroGlow.centerY = centerY;
      heroGlowMoved();
    };
    place();
    const sized = new ResizeObserver(place);
    sized.observe(host);
    let alive = true;
    void document.fonts?.ready.then(() => alive && place());
    return () => {
      alive = false;
      sized.disconnect();
    };
  }, [filmStone, film]);

  // the island (see above): made once, taken over by each shell, its box moved into this hero before it is drawn
  useLayoutEffect(() => {
    const host = hero.current;
    if (!build || !host) return;
    heroBox.current = host;
    glowBox.current = glow.current;
    if (!island) {
      const box = document.createElement("div");
      box.style.display = "contents";
      island = { box, root: createRoot(box), drop: 0 };
    }
    clearTimeout(island.drop);
    // (right after the background light, before the copy)
    host.insertBefore(island.box, host.querySelector(".hero__bg")?.nextSibling ?? null);
    const held = island;
    return () => {
      // a moment for the next shell (the other language) to take it over; else the 3D goes
      held.drop = window.setTimeout(() => {
        if (island !== held) return;
        island = null;
        held.root.unmount();
        held.box.remove();
        sceneRun.set(false);
      }, 1500);
    };
  }, [build]);
  useEffect(() => {
    if (!build) return;
    island?.root.render(
      // (the stone moves with reduced motion too: the owner, 9 Nov 2026; only the intro is skipped there)
      <WebGLGate onSkip={skipScene}>
        <HeroScene heroRef={heroBox} glowRef={glowBox} orbitLabel={orbitLabel} running={running} reducedMotion={false} />
      </WebGLGate>,
    );
  }, [build, running, orbitLabel]);

  return (
    <div className="hero" data-hero ref={hero}>
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__glow" data-glow ref={glow} />
      </div>
      <div className={`hero__shards${started ? " is-in" : ""}`} aria-hidden="true">
        {SHARD_PICTURES.map((shard) => (
          // eslint-disable-next-line @next/next/no-img-element -- small decorative pictures cut to size already, placed by CSS
          <img
            key={shard.seed}
            className="hero__shard"
            src={`/img/hero/shard-${shard.seed}.webp`}
            alt=""
            loading="lazy"
            decoding="async"
            data-phone={shard.phone ? "" : undefined}
            style={
              {
                "--x": shard.x,
                "--y": shard.y,
                "--height": shard.height,
                "--drift-x": shard.driftX,
                "--drift-y": shard.driftY,
                ...(shard.phone ? { "--phone-x": shard.phone.x, "--phone-y": shard.phone.y, "--phone-height": shard.phone.height } : {}),
              } as CSSProperties
            }
          />
        ))}
      </div>
      {/* (the 3D: the island's box goes here) */}
      {/* the film's stone (LITE, a phone), the still and its orbit: the picture in the markup for every visitor, shown
          and fetched only there (hero.css; a lazy picture that is not displayed is never fetched), the orbit made only
          there */}
      <div className={`hero__still${started ? " is-in" : ""}${film ? " is-film" : ""}${film && filmShown ? " has-film" : ""}`} aria-hidden="true">
        {/* (the stone, its light and its orbit float together: hero.css) */}
        <div className="hero__float">
          <picture>
            <source media={WIDE} srcSet={FILM.stillWide} />
            <img ref={still} src={FILM.stillNarrow} alt="" loading="lazy" decoding="async" />
          </picture>
          {film && <canvas ref={filmCanvas} className="hero__film" />}
          {filmStone && <HeroOrbit label={orbitLabel} />}
        </div>
      </div>
      {children}
    </div>
  );
}
