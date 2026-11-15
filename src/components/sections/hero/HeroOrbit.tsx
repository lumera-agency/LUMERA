"use client";
/*
 * LITE's orbit round the stone (the owner, 12 Nov 2026: «видео с камнем на лёгкой версии тормозит, нет смысла, сделай
 * просто картинку и текст, чтоб летал в коде»): the services on a ring in CSS 3D, over a still of the stone alone.
 * The ring is the live scene's (three/hero/orbit.ts, HeroScene): the same radius, tilt, lean, perspective and pace,
 * Geologica with sharp corners, whole cycles of the list round the ring. One transform animation turns it, on the
 * compositor: the page's own thread does nothing while it runs.
 * Drawn twice (hero.css): the near copy over the stone shows a word only while it faces the viewer, the far copy under
 * the stone only while it faces away, mirrored and faint, as the ribbon's inner face is in the scene. So the stone
 * hides the far half and the near half crosses in front of it.
 * Each word is a flat piece on the ring, a long word cut into pieces of at most LONG letters: a long flat piece stands
 * off the curve at its ends, and where the ring turns away its end covered the next piece's first letter (12 Nov 2026:
 * «AI-» lost its hyphen under «ассистент»). Laid out once its font is in: the pieces measured in a hidden row, then
 * set round the ring by angle.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

/** the scene's ring: radius 2.15, the words 0.34 of a ribbon 0.3 high (orbit.ts), so this many words' em round it */
const RING_EM = (2 * Math.PI * 2.15) / (0.34 * 0.3);
/** the font size that fills the ring with whole cycles, in stone heights per em of cycle (the stone is 3.1 high) */
const SIZE_PER_EM = (2 * Math.PI * 2.15) / 3.1;
/** the most letters a piece may have */
const LONG = 6;

type Piece = { text: string; dot: boolean };
type Ring = { pieces: (Piece & { angle: number })[]; radius: number; scale: number };

/** an item's pieces: its words, a hyphen keeping to the part before it, a long part cut into even pieces */
function cut(item: string) {
  const pieces: string[] = [];
  item.split(" ").forEach((word, wordIndex) => {
    const parts = word.split("-").map((part, index, all) => (index < all.length - 1 ? `${part}-` : part)).filter(Boolean);
    const out: string[] = [];
    for (const part of parts) {
      const count = Math.ceil(part.length / LONG);
      for (let index = 0; index < count; index++) out.push(part.slice(Math.round((index * part.length) / count), Math.round(((index + 1) * part.length) / count)));
    }
    if (wordIndex > 0) out[0] = ` ${out[0]}`;
    pieces.push(...out);
  });
  return pieces;
}

export function HeroOrbit({ label }: { label: string }) {
  const row = useRef<HTMLDivElement>(null);
  const [ring, setRing] = useState<Ring | null>(null);
  /** one cycle: every item opens with the dot (the list runs round, so the last item's dot stands before the first) */
  const cycle = useMemo<Piece[]>(
    () =>
      label
        .split("·")
        .map((item) => item.trim())
        .filter(Boolean)
        .flatMap((item) => cut(item).map((text, index) => ({ text, dot: index === 0 }))),
    [label],
  );

  useEffect(() => {
    let alive = true;
    const measure = () => {
      const box = row.current;
      if (!alive || !box) return;
      const em = parseFloat(getComputedStyle(box).fontSize) || 100;
      const start = box.getBoundingClientRect();
      const centres = [...box.querySelectorAll<HTMLElement>("[data-piece]")].map((span) => {
        const rect = span.getBoundingClientRect();
        return (rect.left - start.left + rect.width / 2) / em;
      });
      const length = start.width / em;
      if (!length || centres.length !== cycle.length) return;
      const cycles = Math.max(1, Math.round(RING_EM / length));
      const radius = (cycles * length) / (2 * Math.PI);
      const pieces: Ring["pieces"] = [];
      for (let round = 0; round < cycles; round++) {
        cycle.forEach((piece, index) => pieces.push({ ...piece, angle: (((round * length + centres[index]) / radius) * 180) / Math.PI }));
      }
      setRing({ pieces, radius, scale: SIZE_PER_EM / (cycles * length) });
    };
    // (measured in the face it is drawn in; measured anyway if the font cannot come)
    const font = document.fonts?.load(`500 100px Geologica`, label);
    if (font) void font.then(measure, measure);
    else measure();
    return () => {
      alive = false;
    };
  }, [cycle, label]);

  const style = ring ? ({ "--orbit-scale": ring.scale.toFixed(5), "--orbit-radius": `${ring.radius.toFixed(3)}em` } as CSSProperties) : undefined;
  return (
    <>
      <div ref={row} className="hero__orbit-row" aria-hidden="true">
        {cycle.map((piece, index) => (
          <span key={index}>
            {piece.dot && <i className="hero__orbit-gap" />}
            <span data-piece="">
              {piece.dot && <i className="hero__orbit-dot" />}
              {piece.text}
            </span>
          </span>
        ))}
      </div>
      {ring &&
        (["far", "near"] as const).map((side) => (
          <div key={side} className={`hero__orbit is-${side}`} style={style} aria-hidden="true">
            <div className="hero__orbit-tilt">
              <div className="hero__orbit-turn">
                {ring.pieces.map((piece, index) => (
                  <span key={index} className="hero__orbit-piece" style={{ "--angle": `${piece.angle.toFixed(3)}deg` } as CSSProperties}>
                    {piece.dot && <i className="hero__orbit-dot" />}
                    {piece.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
    </>
  );
}
