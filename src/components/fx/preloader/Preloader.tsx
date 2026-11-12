/*
 * Preloader — a black sheet with the studio's name in the footer's liquid chrome (fx/chrome-wordmark's own shader),
 * played as a short motion roll (the owner, 3 Nov 2026). The roll starts at once, as soon as the name is drawn, while
 * the page still loads under it; if the page isn't ready when the roll is done, the sheet holds its last pose until it
 * is (finish(), called by the page's boot) («лучше вначале сразу появление и ждать, пока догрузится, после»). The page
 * builds its heavy parts (the hero's 3D) only once the roll has played (ecloLoader.rolled), so they can't stall it: the name
 * in the very middle, its letters coming in left to right, each out of a blur and
 * sliding into place, as smoothly as the AI page's «Робот усе розібрав» (React Bits BlurText there); under it the
 * services as one line as wide as the name, each word squashed flat and heavy as it comes in, then settling, a lime
 * dot dropping in between them. It leaves the way the name came in (the owner: «без штор, как текст появляется»):
 * everything on it blurs away, then the black thins out while the page behind it comes into focus out of a blur (the
 * sheet blurs what is behind it, the page itself is never touched). finish() resolves as the page starts to show, so
 * its intro plays under it.

 *
 * Every move is a transform, an opacity or a filter run by the compositor (each letter of the name a canvas of its
 * own, moved as a layer; only the chrome's flow inside them is drawn from script).
 *
 * Once per visit (sessionStorage): opened again in the same tab the page comes up at once, unless the
 * language was switched; reached from another page of the site it comes up at once too (the owner, 12 Nov 2026: the
 * visitor is on the site already, 3.1 to 3.5 s of the roll were in their way). While it runs the page can't be scrolled (html.is-loading).
 * Server component: the markup and an inline script that starts the clock before any bundle runs.
 * Props are plain strings, so the same component works for any site (words · separated).
 */
import "./preloader.css";
import { brandName } from "@/config/site";
import { VERT as CHROME_VERT, FRAG as CHROME_FRAG } from "@/components/fx/chrome-wordmark/wordmark.js";

type Props = {
  brand: string;
  note: string;
  /** «A · B · C»: what the studio does, under the name */
  words: string;
  /** (the loading stages: kept for the page's calls, nothing counts them now) */
  stages?: string;
};

const split = (s: string) => s.split("·").map((w) => w.trim()).filter(Boolean);
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/* Rendered as plain HTML, outside React's hydration: the clock changes the counter, the words and
   the classes before React starts, and removes the whole sheet when it is done. */
export function Preloader({ brand, note, words }: Props) {
  const list = split(words);
  const config = JSON.stringify({ words: list, mark: brandName, chrome: [CHROME_VERT, CHROME_FRAG] }).replace(/</g, "\\u003c");
  const html = `<div class="preloader" data-preloader aria-hidden="true">
  <span class="preloader__bg"></span>
  <div class="preloader__frame">
    <p class="preloader__brand" data-pl-copy><svg class="preloader__mark" viewBox="0 0 329 329" aria-hidden="true" focusable="false"><use href="#logo-mark"/></svg><span>${esc(brand)}</span></p>
    <div class="preloader__stage"><div class="preloader__center" data-pl-stage></div></div>
    <p class="preloader__note" data-pl-copy>${esc(note)}</p>
  </div>
</div>
<script>(${clock.toString()})(${config})</script>`;
  return <div style={{ display: "contents" }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}

/* The clock, serialised into the page as is (no imports, no closures): it builds the roll while the page loads and
   plays it once the page is ready and the browser idle. */
function clock(cfg: { words: string[]; mark: string; chrome: [string, string] }) {
  const root = document.documentElement;
  const el = document.querySelector<HTMLElement>("[data-preloader]");
  if (!el || !root.classList.contains("js")) return;
  // once per visit: the page reached again in this tab (back from another page, the browser's back) comes up at once,
  // and so does the page reached from another page of the site (the site's links load the next page whole, so it says
  // where it came from); a reload plays it again. A language switch stays in the page (LangSwitch): the sheet the new
  // words render with is never shown (preloader.css, html.pl-done)
  let again = false;
  try {
    const nav = performance.getEntriesByType?.("navigation")?.[0] as PerformanceNavigationTiming | undefined;
    const reload = nav?.type === "reload";
    const fromSite = !!document.referrer && new URL(document.referrer).origin === location.origin;
    again = !reload && (sessionStorage.getItem("eclo:seen") === "1" || fromSite);
    sessionStorage.setItem("eclo:seen", "1");
  } catch {}
  if (again) {
    root.classList.add("pl-done");
    el.remove();
    return;
  }
  // LITE (lib/lite: html.is-lite, set before this runs by the layout's early script): no roll (the owner, 11 Nov 2026:
  // «в лайт версии прелоудер убери вообще»), a thin lime line instead while the first screen loads under the sheet (the
  // owner, 12 Nov 2026: «просто линию загрузки лаймовую самую простую, которая не нагружает … под прелоудером должен
  // загрузиться первый экран»). One transform animation the compositor runs (preloader.css); the sheet goes once the
  // page's start-up lets it (finish: hero/useBoot, PreloaderRelease) and the first screen's fonts and pictures are in,
  // at the latest 5 s after that; finish resolves as it starts to fade, so the page's entrance plays as it goes
  if (root.classList.contains("is-lite")) {
    root.classList.add("is-loading");
    root.classList.remove("is-curtain");
    const letGo = () => root.classList.remove("is-loading");
    setTimeout(letGo, 9000);
    el.setAttribute("data-pl-lite", "");
    el.querySelector(".preloader__frame")?.remove();
    const line = document.createElement("span");
    line.className = "preloader__line";
    el.append(line);
    const pause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
    const firstScreen = () =>
      Promise.all([
        document.fonts ? document.fonts.ready : Promise.resolve(),
        ...[...document.images]
          .filter((image) => {
            const box = image.getBoundingClientRect();
            return box.width > 0 && box.bottom > 0 && box.top < window.innerHeight;
          })
          .map((image) => (image.decode ? image.decode().catch(() => {}) : Promise.resolve())),
      ]);
    let leaving: Promise<void> | null = null;
    (window as unknown as { ecloLoader: unknown }).ecloLoader = {
      step() {},
      rolled: Promise.resolve(),
      finish() {
        leaving ??= Promise.race([firstScreen(), pause(5000)]).then(() => {
          letGo();
          el.setAttribute("data-pl-out", "");
          el.style.pointerEvents = "none";
          void pause(350).then(() => {
            el.remove();
            root.classList.add("pl-done");
          });
        });
        return leaving;
      },
    };
    return;
  }
  // the page holds still under it (base.css; SmoothScroll stops Lenis); let go as it opens the page
  root.classList.add("is-loading");
  // come here through the page curtain (fx/page-curtain), the sheet covers the page itself: under the curtain its
  // roll would wait (base.css)
  root.classList.remove("is-curtain");
  const release = () => root.classList.remove("is-loading");
  setTimeout(release, 14000); // with the sheet's own fallback (preloader.css)
  const motion = root.classList.contains("motion") && !!el.animate;
  const q = <T extends Element = HTMLElement>(s: string) => el.querySelector<T>(s)!;
  const stage = q("[data-pl-stage]");
  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  const W = window.innerWidth, PHONE = W < 700;
  const LAND = "cubic-bezier(0.22, 1, 0.36, 1)";
  // Phones (the owner, 3 Nov): the words one after another, each a card rising from below with a spring like a message,
  // three lime dots «typing» before the word; the name and the cards together in the middle of the screen
  if (PHONE) el.setAttribute("data-pl-phone", "");

  // The studio's name in the footer's liquid chrome (fx/chrome-wordmark's shader, passed in as text), a canvas per
  // letter so each can move as a layer of its own: each letter's mask and its blurred copy for the bevel, drawn from
  // the web font once it is in; one frame loop draws them all
  const FONT = (size: number) => '800 ' + size + 'px Archivo, "Arial Black", sans-serif';
  type Name = { node: HTMLElement; letters: HTMLElement[]; cap: number; stop: () => void };
  const fontIn = Promise.race([document.fonts ? document.fonts.load(FONT(100)) : Promise.resolve(), wait(1500)]).catch(() => {});
  const makeName = (word: string, width: number) =>
    fontIn.then((): Promise<Name | null> => {
      const paint = document.createElement("canvas").getContext("2d")!;
      paint.font = FONT(200);
      const m = paint.measureText(word);
      const scale = width / (m.actualBoundingBoxLeft + m.actualBoundingBoxRight);
      const capH = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) * scale;
      const pad = Math.ceil(capH * 0.14) + 4;
      const cssW = Math.ceil(width + pad * 2), cssH = Math.ceil(capH + pad * 2);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const size = 200 * scale, y = pad + m.actualBoundingBoxAscent * scale, x0 = pad + m.actualBoundingBoxLeft * scale;
      // each letter's place in the word (its kerning with the one before kept): where the word up to it ends, less it
      paint.font = FONT(size);
      const chars = [...word];
      const adv = chars.map((ch) => paint.measureText(ch).width);
      const xs = chars.map((_, i) => x0 + paint.measureText(word.slice(0, i + 1)).width - adv[i]);
      const margin = Math.ceil(capH * 0.12) + 4;
      const bevel = capH * dpr * 0.08;
      const node = document.createElement("div");
      node.className = "preloader__name";
      node.style.cssText = "position:relative;width:" + cssW + "px;height:" + cssH + "px";
      type Gl = { gl: WebGLRenderingContext; prog: WebGLProgram; uTime: WebGLUniformLocation | null };
      const made: Gl[] = [];
      const letters: HTMLElement[] = [];
      for (let i = 0; i < chars.length; i++) {
        const lw = Math.ceil(adv[i] + margin * 2);
        const cv = document.createElement("canvas");
        cv.className = "preloader__letter";
        cv.width = Math.round(lw * dpr);
        cv.height = Math.round(cssH * dpr);
        cv.style.cssText = "left:" + (xs[i] - margin).toFixed(1) + "px;width:" + lw + "px;height:" + cssH + "px";
        const gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
        if (!gl) return Promise.resolve(null);
        const prog = gl.createProgram()!;
        for (const [type, src] of [[gl.VERTEX_SHADER, cfg.chrome[0]], [gl.FRAGMENT_SHADER, cfg.chrome[1]]] as const) {
          const sh = gl.createShader(type)!;
          gl.shaderSource(sh, src);
          gl.compileShader(sh);
          gl.attachShader(prog, sh);
        }
        gl.linkProgram(prog);
        made.push({ gl, prog, uTime: null });
        letters.push(cv);
        node.append(cv);
      }
      // the programs link in the background where the driver can (the page stays free meanwhile), then each letter gets
      // its masks and its uniforms
      const linked = () => made.every(({ gl, prog }) => {
        const ext = gl.getExtension("KHR_parallel_shader_compile");
        return !ext || gl.getProgramParameter(prog, ext.COMPLETION_STATUS_KHR);
      });
      return new Promise<void>((r) => {
        const poll = () => (linked() ? r() : requestAnimationFrame(poll));
        poll();
      }).then(() => {
        for (let i = 0; i < made.length; i++) {
          const { gl, prog } = made[i];
          if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
          gl.useProgram(prog);
          gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
          const aPos = gl.getAttribLocation(prog, "aPos");
          gl.enableVertexAttribArray(aPos);
          gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
          const u = (n: string) => gl.getUniformLocation(prog, n);
          const cv = letters[i] as HTMLCanvasElement;
          const w = cv.width, h = cv.height;
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          const upload = (unit: number) => {
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, gl.ALPHA, gl.UNSIGNED_BYTE, paint.canvas);
          };
          paint.canvas.width = w;
          paint.canvas.height = h;
          paint.font = FONT(size * dpr);
          paint.fillStyle = "#fff";
          paint.fillText(chars[i], margin * dpr, y * dpr);
          upload(0);
          // the blurred copy through the shadow trick (as the footer's: it works where ctx.filter does not)
          paint.clearRect(0, 0, w, h);
          paint.font = FONT(size * dpr);
          paint.shadowColor = "#fff";
          paint.shadowBlur = bevel;
          paint.shadowOffsetX = w * 2;
          paint.fillText(chars[i], margin * dpr - w * 2, y * dpr);
          paint.shadowBlur = 0;
          paint.shadowOffsetX = 0;
          upload(1);
          gl.uniform1i(u("uMask"), 0);
          gl.uniform1i(u("uBevel"), 1);
          gl.uniform2f(u("uRes"), w, h);
          gl.uniform1f(u("uSlope"), bevel * 0.9);
          gl.uniform3f(u("uLens"), 0, 0, 0);
          gl.uniform4f(u("uDrop"), 0, 0, 99, 0);
          gl.viewport(0, 0, w, h);
          made[i].uTime = u("uTime");
        }
        let alive = true;
        const draw = (t: number) => {
          if (!alive) return;
          for (const { gl, uTime } of made) {
            gl.uniform1f(uTime, 6 + t / 1000);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          }
          requestAnimationFrame(draw);
        };
        requestAnimationFrame(draw);
        // stopped with the sheet: the frame loop ends and the letters' contexts are let go at once (not left to the GC)
        const stop = () => {
          alive = false;
          for (const { gl } of made) gl.getExtension("WEBGL_lose_context")?.loseContext();
        };
        return { node, letters, cap: capH, stop };
      });
    });

  // the name in the middle, large; the words under it
  let name: Name | null = null;
  /** The sheet is done: the chrome stops drawing, the sheet goes. */
  const gone = () => {
    name?.stop();
    el.remove();
    root.classList.add("pl-done");
  };
  const nameW = Math.min(W * (PHONE ? 0.9 : 0.76), window.innerHeight * 1.3, 1400);
  const row = document.createElement("div");
  row.className = "preloader__row";
  const items = cfg.words.map((w, i) => {
    const s = document.createElement("span");
    s.className = "preloader__w";
    s.textContent = w;
    row.append(s);
    if (i < cfg.words.length - 1) {
      const d = document.createElement("i");
      d.className = "preloader__sep";
      row.append(d);
    }
    return s;
  });
  const seps = [...row.querySelectorAll<HTMLElement>(".preloader__sep")];
  // phones: each word a message card: a lime dot, the word, and three typing dots where the word will be
  const part = (cls: string, tag = "i") => {
    const x = document.createElement(tag);
    x.className = cls;
    return x;
  };
  const cards = PHONE
    ? items.map((s) => {
        const card = part("preloader__card", "div");
        s.before(card);
        const typing = part("preloader__typing");
        typing.append(part(""), part(""), part(""));
        card.append(part("preloader__pip"), s, typing);
        return card;
      })
    : [];
  // (out of sight until their turn: set before the first paint of them)
  if (motion) row.style.visibility = "hidden";
  const named = makeName(cfg.mark, nameW).then((n) => {
    name = n;
    let node: HTMLElement;
    if (n) {
      node = n.node;
      if (motion) n.letters.forEach((l) => (l.style.opacity = "0"));
    } else {
      // without WebGL: the word itself
      node = document.createElement("div");
      node.className = "preloader__plain";
      node.textContent = cfg.mark;
      node.style.fontSize = (nameW * 0.31).toFixed(1) + "px";
    }
    // the name in the very middle; the words under it hang off it (absolute)
    stage.append(node, row);
    // the line exactly as wide as the name: its words fill about seven eighths of it, the dots share the rest
    row.style.fontSize = "100px";
    const natural = items.map((s) => s.offsetWidth);
    row.style.width = nameW + "px";
    if (PHONE) {
      // the cards: one size, the longest word as wide as its card leaves room for
      row.style.fontSize = Math.min((nameW * 0.7 * 100) / Math.max(...natural), 30).toFixed(2) + "px";
    } else {
      const fs = (nameW * 0.86 * 100) / natural.reduce((a, b) => a + b, 0);
      row.style.fontSize = Math.min(fs, 64).toFixed(2) + "px";
    }
    // each letter its settled width, so nothing moves while they squash and stretch
    items.forEach((s) => {
      const text = s.textContent ?? "";
      s.replaceChildren(...[...text].map((ch) => {
        const l = document.createElement("span");
        l.textContent = ch === " " ? " " : ch;
        return l;
      }));
    });
    // (every width read first, then every one set: read and set letter by letter, each read laid the sheet out again,
    // 48 times, about 15 ms at CPU 4x, 12 Nov 2026)
    const letters = items.flatMap((s) => [...(s.children as HTMLCollectionOf<HTMLElement>)]);
    const widths = letters.map((letter) => letter.offsetWidth);
    letters.forEach((letter, index) => (letter.style.width = widths[index] + "px"));
    return node;
  });

  // The name's way in (as the AI page's BlurText, sideways): each letter, left to right, out of a blur and from a
  // little to the left, in one long, soft stroke that only ever slows down; it is all there long before it is still
  const STEP = 130, LETTER = 1300;
  // (the move and the fade apart from the blur: those two the compositor runs on its own, so the letters keep gliding
  // while the page loading under the sheet holds up the main thread; only the blur, which can't leave it, may pause)
  const blurIn = (n: Name) => {
    const DIST = n.cap * 0.26, B = Math.max(8, n.cap * 0.07);
    return Promise.all(n.letters.map((l, i) => {
      l.style.opacity = "";
      const timing = { delay: i * STEP, fill: "backwards" as const };
      l.animate([{ opacity: 0 }, { opacity: 1 }], { ...timing, duration: LETTER * 0.6, easing: "cubic-bezier(0.25, 0.1, 0.25, 1)" });
      l.animate([{ filter: "blur(" + B.toFixed(1) + "px)" }, { filter: "blur(0px)" }], { ...timing, duration: LETTER, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
      return l.animate(
        [{ transform: "translate3d(" + -DIST.toFixed(1) + "px, 0, 0)" }, { transform: "translate3d(0, 0, 0)" }],
        { ...timing, duration: LETTER, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      ).finished;
    }));
  };
  /** The way out, mirrored: each letter, left to right, blurs and slides off to the right. */
  const blurOut = (n: Name) => {
    const DIST = n.cap * 0.3, B = Math.max(6, n.cap * 0.06);
    n.letters.forEach((l, i) => {
      const timing = { duration: 480, delay: i * 60, easing: "cubic-bezier(0.37, 0, 0.63, 1)", fill: "forwards" as const };
      l.animate([{ opacity: 1, transform: "translateX(0px)" }, { opacity: 0, transform: "translateX(" + DIST.toFixed(1) + "px)" }], timing);
      l.animate([{ filter: "blur(0px)" }, { filter: "blur(" + B.toFixed(1) + "px)" }], timing);
    });
  };

  // The words: each comes in letter by letter, squashed flat and heavy, stretching up and settling to its weight (the
  // face's own weight axis, so it thickens rather than scales); a lime dot drops in after it and squashes as it lands
  const sayWord = (s: HTMLElement, at: number) =>
    [...s.children].forEach((l, i) =>
      (l as HTMLElement).animate(
        [
          { transform: "translateY(0.3em) scale(1.45, 0.3)", fontVariationSettings: '"wght" 150', opacity: 0 },
          { transform: "translateY(-0.03em) scale(0.86, 1.16)", fontVariationSettings: '"wght" 900', opacity: 1, offset: 0.5 },
          { transform: "translateY(0) scale(1, 1)", fontVariationSettings: '"wght" 400', opacity: 1 },
        ],
        { duration: 600, delay: at + i * 16, easing: LAND, fill: "backwards" },
      ),
    );
  const dropDot = (d: HTMLElement, delay: number) =>
    d.animate(
      [
        { transform: "translateY(-1.4em) scale(0.7, 1.3)", opacity: 0, easing: "cubic-bezier(0.5, 0, 0.9, 0.5)" },
        { transform: "translateY(0) scale(1.5, 0.55)", opacity: 1, offset: 0.6, easing: "cubic-bezier(0.3, 0.6, 0.5, 1)" },
        { transform: "translateY(-0.18em) scale(0.9, 1.12)", offset: 0.82, easing: "ease-in-out" },
        { transform: "none" },
      ],
      { duration: 600, delay, fill: "backwards" },
    );
  /** Phones: the message cards one after another down the column, the ones before dimming a little: each rises,
   *  types, then its word comes. Resolves as the last one has all but settled. Quicker since 12 Nov 2026 (the owner:
   *  the cards held a phone's page about 4 s): a card every 380 ms instead of 680, typing for 280 ms instead of 480,
   *  the first card 450 ms after the name starts instead of 650; for three words 2.3 s instead of 3.3. */
  const SETTLE = "cubic-bezier(0.34, 1.36, 0.64, 1)";
  const sayPhone = () => {
    row.style.visibility = "";
    const B = 380, TYPING = 280;
    items.forEach((s, i) => {
      const t = i * B, card = cards[i];
      if (i) cards[i - 1].animate([{ opacity: 1 }, { opacity: 0.42 }], { duration: 400, delay: t, fill: "forwards" });
      card.animate([{ opacity: 0, transform: "translate3d(0, 1.1em, 0) scale(0.94)" }, { opacity: 1, transform: "none" }], { duration: 560, delay: t, easing: SETTLE, fill: "backwards" });
      card.querySelectorAll(".preloader__typing > i").forEach((d, k) =>
        d.animate([{ opacity: 0.25, transform: "translateY(0)" }, { opacity: 1, transform: "translateY(-0.18em)", offset: 0.5 }, { opacity: 0.25, transform: "translateY(0)" }], { duration: 240, delay: t + 70 + k * 60 }),
      );
      card.querySelector(".preloader__typing")!.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, delay: t + TYPING - 20, fill: "forwards" });
      card.querySelector(".preloader__pip")!.animate([{ transform: "scale(0)" }, { transform: "scale(1.6)", offset: 0.55 }, { transform: "scale(1)" }], { duration: 400, delay: t + 70, fill: "backwards" });
      sayWord(s, t + TYPING);
    });
    // (the last word comes after its typing: its letters take about 820 ms)
    return wait((items.length - 1) * B + TYPING + 820);
  };
  // a word every 300 ms, the first 500 ms after the name starts (the owner, 12 Nov 2026: the words under the name a
  // little quicker; they were 380 and 650)
  const BEAT = 300;
  const sayAll = () => {
    if (PHONE) return sayPhone();
    row.style.visibility = "";
    // (all at once, each with its delay: a word waits unseen for its turn)
    items.forEach((s, i) => {
      sayWord(s, i * BEAT);
      if (seps[i]) dropDot(seps[i], i * BEAT + 240);
    });
    // (until the last word has all but settled: the way out follows at once, no pause)
    return wait((items.length - 1) * BEAT + 700);
  };

  // the roll, at once (as soon as the chrome has drawn twice): the name comes in; the words start as it settles
  const drawn = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  const rolled = named.then(drawn).then((): Promise<unknown> => {
    if (!motion) {
      row.style.visibility = "";
      return Promise.resolve();
    }
    // the words' weight is drawn on the main thread: they start once the page's first burst of work has passed
    const calm = new Promise<void>((r) => ("requestIdleCallback" in window ? requestIdleCallback(() => r(), { timeout: 900 }) : setTimeout(r, 300)));
    return Promise.all([name ? blurIn(name) : Promise.resolve(), Promise.all([wait(PHONE ? 450 : 500), calm]).then(sayAll)]);
  });

  // The way out, as the name came in: the name blurs out to the right, the words blur away, the brand
  // and the note too; then the black thins out while what is behind it comes into focus (the sheet's own backdrop
  // blur, from strong to none: the page is never touched). Resolves as the page starts to show
  const blurAway = (n: Element, delay: number) =>
    n.animate([{ opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(10px)" }], { duration: 520, delay, easing: "cubic-bezier(0.37, 0, 0.63, 1)", fill: "forwards" });
  const leave = () => {
    el.querySelectorAll<HTMLElement>("[data-pl-copy]").forEach((c) => blurAway(c, 0));
    if (name) blurOut(name);
    else stage.querySelector(".preloader__plain")?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" });
    blurAway(row, 60);
    const AT = 360, FOCUS = 1500;
    const bg = q(".preloader__bg");
    const blur = (px: number) => "blur(" + px + "px)";
    bg.animate(
      [
        { backgroundColor: "rgb(0 0 0 / 1)", backdropFilter: blur(26), webkitBackdropFilter: blur(26) },
        { backgroundColor: "rgb(0 0 0 / 0.35)", backdropFilter: blur(16), webkitBackdropFilter: blur(16), offset: 0.3 },
        { backgroundColor: "rgb(0 0 0 / 0)", backdropFilter: blur(0), webkitBackdropFilter: blur(0) },
      ] as Keyframe[],
      { duration: FOCUS, delay: AT, easing: "cubic-bezier(0.33, 1, 0.68, 1)", fill: "both" },
    ).finished.then(gone);
    return wait(AT + 60);
  };

  let finishing: Promise<void> | null = null;
  (window as unknown as { ecloLoader: unknown }).ecloLoader = {
    // (the page's milestones: nothing counts them now)
    step() {},
    // the roll has played: the page builds its heavy parts (the hero's 3D) only now, so they can't stall it
    rolled: rolled.then(() => {}),
    finish() {
      if (finishing) return finishing;
      // the roll done (or, if it is still playing, as soon as it is), straight on to the way out
      finishing = rolled
        .then(() => {
          release();
          el.setAttribute("data-pl-out", "");
          el.style.pointerEvents = "none";
          if (!motion) {
            el.style.transition = "opacity 0.3s ease";
            el.style.opacity = "0";
            setTimeout(gone, 320);
            return;
          }
          return leave();
        });
      return finishing;
    },
  };
}
