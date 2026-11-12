/*
 * A film with its own transparency, drawn on a canvas (the owner, 6 Nov 2026: a phone plays the AI page's robot and the
 * sites page's droplet as films instead of building their 3D). Each frame of the file holds the colour, premultiplied
 * by its alpha, on the left half and the alpha as grey on the right: one H.264 file every browser plays, put back
 * together by a small shader. It plays only while `watch` can be seen and the tab is shown. `onFail`: the browser will
 * not start it by itself (an iPhone in Low Power Mode), the file failed, there is no WebGL, or the film is there and on
 * screen yet no frame comes (a browser keeping it still without a word): the caller then brings its live scene.
 * In both modes (lib/perf/mode.ts allowFilm): in LITE the films stand in for the live scenes.
 * `hold`: the caller's own reason to keep it still (the first screen covered by the block that slides over it: the
 * film is on screen all the while, so the observer alone would let it play, and draw, unseen).
 */
import { allowFilm } from "@/lib/perf/mode";

const VERTEX = `attribute vec2 aPos;
varying vec2 vUv;
void main() { vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5); gl_Position = vec4(aPos, 0.0, 1.0); }`;
// (half a texel in from the seam between the halves, so neither samples the other's edge)
const FRAGMENT = `precision mediump float;
uniform sampler2D uFilm;
uniform float uHalfTexel;
varying vec2 vUv;
void main() {
  float x = clamp(vUv.x * 0.5, uHalfTexel, 0.5 - uHalfTexel);
  vec3 colour = texture2D(uFilm, vec2(x, vUv.y)).rgb;
  float alpha = texture2D(uFilm, vec2(x + 0.5, vUv.y)).r;
  gl_FragColor = vec4(min(colour, vec3(alpha)), alpha);
}`;

type Options = {
  /** where the film is drawn (sized by its caller); its parent also holds the film's source, unseen */
  canvas: HTMLCanvasElement;
  src: string;
  /** what must be on screen for it to play */
  watch: Element;
  /** its first frame drawn */
  onShown: () => void;
  onFail: () => void;
  /** tells the film to hold (true) or go on (false); returns its stop */
  hold?: (set: (held: boolean) => void) => () => void;
};

/** Plays the film; returns its stop. */
export function playAlphaFilm({ canvas, src, watch, onShown, onFail, hold }: Options) {
  const gl = allowFilm() ? canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false }) : null;
  if (!gl) {
    onFail();
    return () => {};
  }
  // iOS decodes a film's frames for a texture only while it is in the page: in it, unseen
  const video = document.createElement("video");
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.loop = true;
  video.autoplay = true;
  video.preload = "auto";
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.style.cssText = "position:absolute;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none";
  video.src = src;
  canvas.parentElement?.append(video);

  const program = gl.createProgram()!;
  for (const [type, source] of [[gl.VERTEX_SHADER, VERTEX], [gl.FRAGMENT_SHADER, FRAGMENT]] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.clearColor(0, 0, 0, 0);

  let shown = false;
  let stopped = false;
  const draw = () => {
    if (stopped || video.readyState < 2) return;
    if (canvas.width !== video.videoWidth / 2 || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth / 2;
      canvas.height = video.videoHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(program, "uHalfTexel"), 0.5 / video.videoWidth);
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!shown) {
      shown = true;
      requestAnimationFrame(() => !stopped && onShown());
    }
  };
  // a frame drawn per frame of the film where the browser tells us (Safari 15.4+, Chrome), else per screen frame
  const perFrame = "requestVideoFrameCallback" in video;
  let loop = 0;
  const next = () => {
    if (stopped) return;
    if (perFrame) loop = (video as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => number }).requestVideoFrameCallback(() => (draw(), next()));
    else loop = requestAnimationFrame(() => (draw(), next()));
  };
  next();

  let onScreen = true;
  let held = false;
  const sync = () => {
    if (stopped) return;
    if (onScreen && !held && !document.hidden) {
      video.play().catch(() => {
        if (!shown && !stopped) onFail();
      });
    } else video.pause();
  };
  const seen = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  });
  seen.observe(watch);
  const stopHold = hold?.((now) => {
    held = now;
    sync();
  });
  document.addEventListener("visibilitychange", sync);
  const broken = () => !shown && !stopped && onFail();
  video.addEventListener("error", broken);
  // enough of the film is in to play, it is on screen, and still no frame: it is being kept still
  let stalled = 0;
  const watchStall = () => {
    clearTimeout(stalled);
    stalled = window.setTimeout(() => {
      if (!shown && onScreen && !held && !document.hidden) broken();
    }, 2500);
  };
  video.addEventListener("canplay", watchStall);
  sync();

  return () => {
    stopped = true;
    if (!perFrame) cancelAnimationFrame(loop);
    seen.disconnect();
    stopHold?.();
    document.removeEventListener("visibilitychange", sync);
    video.removeEventListener("error", broken);
    video.removeEventListener("canplay", watchStall);
    clearTimeout(stalled);
    video.pause();
    video.removeAttribute("src");
    video.load();
    video.remove();
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
}
