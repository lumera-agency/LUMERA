"use client";
import { useLayoutEffect, useRef } from "react";
import { allowFilm, canRunFull, isLite } from "@/lib/perf/mode";

/** The number's metal is drawn at the screen's own pixels, up to 2 (the footer's word at up to 1.75): crisper */
const DPR = 2;
/** The footer's word's cap (fx/chrome-wordmark) */
const WORD_DPR = 1.75;

/** The effect's letters: the face it draws them in (fx/chrome-wordmark) */
const font = (size: number) => `800 ${size}px Archivo, "Arial Black", sans-serif`;

/**
 * The footer's ECLO has a fine frost on its rounded edges: the effect reads the edge's slope one device px apart off an
 * 8-bit blurred copy of the letters, and the steps of that copy show in the metal like ice (the owner, 13 Nov 2026: «на
 * буквах слегка будто лёд»). The blur grows with the letters, so the number, larger than the word, reads it as many px
 * apart as it is times the word's size: the same frost at the same density. Never below the footer's 1.
 */
function frostStep(mark: HTMLElement, text: string) {
  const g = document.createElement("canvas").getContext("2d");
  const word = document.querySelector<HTMLElement>(".footer__mark");
  const wordText = word?.textContent?.trim();
  if (!g || !word || !wordText) return 1;
  g.font = font(200);
  const size = (mark.clientWidth * 200) / g.measureText(text).width;
  const wordSize = (word.clientWidth * 200) / g.measureText(wordText).width;
  // (and as many times more as its pixels are finer than the word's)
  const ratio = window.devicePixelRatio || 1;
  const finer = Math.min(ratio, DPR) / Math.min(ratio, WORD_DPR);
  return wordSize > 0 ? Math.max(1, (size / wordSize) * finer) : 1;
}

/**
 * The number in the footer wordmark's liquid chrome (the owner, 13 Nov 2026: «заполнение 404 как надпись ЕКЛО в
 * подвале»): the same effect (fx/chrome-wordmark, plain WebGL) on the text «404», with its ivory lens under the
 * pointer; calm in LITE, as the footer's. Round it an ember hairline (his ask before), drawn on a canvas of its own
 * over the metal with the effect's own measures, so the line sits exactly on the letters. Where the chrome cannot run
 * (no WebGL; LITE without a graphics card), the text stays with the footer's static chrome gradient and the hairline.
 */
export function ChromeNumber({ text }: { text: string }) {
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    const outline = line.current;
    if (!el || !outline) return;
    let alive = true;
    let live: { destroy(): void } | null = null;

    // the hairline: the effect fits the word's ink to the mark's width and centres its capitals in the mark's height
    // with room for the lens (wordmark.js layout); the same numbers here, drawn as a stroke
    const draw = () => {
      if (!el.classList.contains("is-live")) return;
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const g = outline.getContext("2d");
      if (!g) return;
      g.font = font(200);
      const probe = g.measureText(text);
      const ink = probe.actualBoundingBoxLeft + probe.actualBoundingBoxRight;
      const scale = width / ink;
      const cap = (probe.actualBoundingBoxAscent + probe.actualBoundingBoxDescent) * scale;
      const padY = Math.ceil(Math.max(14, cap * 0.62 - cap / 2 + 14));
      outline.width = Math.round(width * dpr);
      outline.height = Math.round(height * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, width, height);
      g.font = font(200 * scale);
      g.lineJoin = "round";
      g.lineWidth = Math.max(1, cap * 0.004);
      g.strokeStyle = getComputedStyle(el).getPropertyValue("--ember").trim() || "#d2561c";
      g.strokeText(text, probe.actualBoundingBoxLeft * scale, padY + probe.actualBoundingBoxAscent * scale);
    };
    // drawn once the metal is in (the effect marks the mark .is-live), and again whenever it is laid out anew
    const watch = new MutationObserver(draw);
    watch.observe(el, { attributes: true, attributeFilter: ["class", "style"] });
    const sized = new ResizeObserver(draw);
    sized.observe(el);

    // no WebGL at all (allowFilm: the browser has it), or LITE without a graphics card (the shader would run on the
    // processor): the page keeps its layout and stands still (the owner, 13 Nov 2026: «структуру, просто без анимации»):
    // the number in the footer's static chrome with its hairline, the small stones resting (not-found.css, data-still)
    const still = !allowFilm() || (isLite() && !canRunFull());
    if (still) el.closest("[data-nf]")?.setAttribute("data-still", "");
    else {
      void import("@/components/fx/chrome-wordmark/wordmark.js").then(({ initWordmark }) => {
        if (!alive) return;
        live = initWordmark({ reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches, root: el, calm: isLite(), step: frostStep(el, text), look: "lux", maxDpr: DPR });
      });
    }
    return () => {
      alive = false;
      watch.disconnect();
      sized.disconnect();
      live?.destroy();
    };
  }, [text]);

  return (
    <div className="nf__mark" data-wordmark="" aria-hidden="true" ref={root}>
      <span className="nf__mark-text">{text}</span>
      <canvas className="nf__mark-canvas" />
      <canvas className="nf__mark-line" ref={line} />
    </div>
  );
}
