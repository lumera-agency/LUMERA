/*
 * The quick view (spec §4): the card's photo morphs over a white scrim into a dialog: a 4:5 photo on the left; the name,
 * the price, the glass swatches, the Number Field, «У кошик» and «Детальніше» on the right. The photo flies from its
 * well (translate + one scale, its sides clipped to the card's shape), the white panel grows from the card's rectangle,
 * the words come in last; Esc, the ×, or a click on the scrim plays it backwards. Phones: a sheet from the bottom.
 * GSAP (installed), transform / opacity / clip-path; reduced motion: it is simply there.
 * Rebuilt from the public demo (behaviour only, no code taken): Morphing Dialog · Motion Primitives (Julien Thibeaut,
 * ibelick) · MIT · 21st.dev/@ibelick/components/morphing-dialog.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Close, LoadBtn, NumberField, ULink, Swatch, Wipe } from "./parts";
import { narrow, useEnv } from "./env";
import { useShop } from "./store";
import { PRODUCTS, shotOf, type Col } from "./products";
import { money } from "./copy";

export function QuickView() {
  const { qv } = useShop();
  if (!qv) return null;
  return <QVBody key={`${qv.pid}:${qv.col}`} pid={qv.pid} col0={qv.col} from={qv.from} />;
}

function QVBody({ pid, col0, from }: { pid: string; col0: Col; from: HTMLElement | null }) {
  const { W, D, lang, rm, go } = useEnv();
  const { closeQV, add, showProduct } = useShop();
  const p = PRODUCTS[pid];
  const [col, setCol] = useState<Col>(col0);
  const [qty, setQty] = useState(1);
  const root = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLElement>(null);
  const img = useRef<HTMLDivElement>(null);
  const info = useRef<HTMLDivElement>(null);
  const x = useRef<HTMLSpanElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const el = root.current;
    const site = el?.closest<HTMLElement>(".pv-site");
    if (!el || !site || !box.current || !img.current || !bg.current) return;
    const k = site.getBoundingClientRect().width / (site.offsetWidth || 1) || 1;
    const t = gsap.timeline({ paused: true });
    const fade = [info.current, x.current];
    const C = from?.isConnected ? from.getBoundingClientRect() : null;
    const V = site.getBoundingClientRect();
    const seen = C && C.width > 0 && C.bottom > V.top && C.top < V.bottom;
    t.fromTo(scrim.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" }, 0);
    if (narrow()) {
      t.fromTo(box.current, { yPercent: 100 }, { yPercent: 0, duration: 0.55, ease: "power3.out" }, 0);
    } else if (seen && C) {
      // the photo: from the card's well (one scale, its sides clipped to the card's shape) to its place
      const F = img.current.getBoundingClientRect();
      const B = box.current.getBoundingClientRect();
      const byH = C.width / C.height <= F.width / F.height;
      const s = byH ? C.height / F.height : C.width / F.width;
      const ix = byH ? Math.max(0, (F.width - C.width / s) / 2 / F.width) * 100 : 0;
      const iy = byH ? 0 : Math.max(0, (F.height - C.height / s) / 2 / F.height) * 100;
      t.fromTo(
        img.current,
        { x: (C.left + C.width / 2 - (F.left + F.width / 2)) / k, y: (C.top + C.height / 2 - (F.top + F.height / 2)) / k, scale: s, clipPath: `inset(${iy}% ${ix}% ${iy}% ${ix}%)` },
        { x: 0, y: 0, scale: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "power3.inOut" },
        0,
      );
      // the white panel grows from the card's rectangle
      t.fromTo(
        bg.current,
        { x: (C.left - B.left) / k, y: (C.top - B.top) / k, scaleX: C.width / B.width, scaleY: C.height / B.height, transformOrigin: "0 0" },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.55, ease: "power3.inOut" },
        0,
      );
      from?.setAttribute("data-lifted", "");
    } else {
      t.fromTo(box.current, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }, 0);
    }
    t.fromTo(fade, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.05 }, 0.3);
    tl.current = t;
    if (rm) t.progress(1);
    else t.play();
    return () => {
      t.kill();
      from?.removeAttribute("data-lifted");
    };
  }, [from, rm]);

  const close = () => {
    const t = tl.current;
    if (!t || rm) {
      closeQV();
      return;
    }
    t.eventCallback("onReverseComplete", () => closeQV());
    t.timeScale(1.5).reverse();
  };
  // Esc plays the morph backwards
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  });

  const meta = p.height ? W.heightCap(p.height) : p.meta && p.cols.length < 2 ? p.meta[lang] : "";
  return (
    <div className="sh-qv" ref={root} aria-hidden="true">
      <i className="sh-qv__scrim" ref={scrim} onClick={close} />
      <div className="sh-qv__box" ref={box}>
        <i className="sh-qv__bg" ref={bg} />
        <div className="sh-qv__img sh-well" ref={img}>
          <Wipe shot={shotOf(p, col)} />
        </div>
        <div className="sh-qv__info" ref={info}>
          <div className="sh-qv__top">
            <span className="sh-label">{W.types[p.type]}</span>
            <b className="sh-qv__n">{p.name[lang]}</b>
            <span className="sh-qv__p">
              {money(p.price)}
              {p.old ? <s>{money(p.old)}</s> : null}
            </span>
            {meta ? <span className="sh-meta">{meta}</span> : null}
            {p.cols.length > 1 ? (
              <div className="sh-qv__cols">
                <span className="sh-meta">
                  {W.colour}: <b>{W.cols[col]}</b>
                </span>
                <span className="sh-qv__sw">
                  {p.cols.map((c) => (
                    <Swatch key={c} c={c} on={c === col} title={W.cols[c]} onClick={() => setCol(c)} />
                  ))}
                </span>
              </div>
            ) : null}
          </div>
          <div className="sh-qv__buy">
            <NumberField n={qty} set={setQty} />
            <LoadBtn className="sh-qv__add" done={W.added} action={() => add(pid, col, qty)}>
              {D.btn}
            </LoadBtn>
          </div>
          <ULink
            arrow
            onClick={() => {
              showProduct(pid, col, false);
              closeQV();
              go("product");
            }}
          >
            {W.details}
          </ULink>
        </div>
        <span className="sh-x sh-qv__x" ref={x} onClick={close}>
          <Close />
        </span>
      </div>
    </div>
  );
}
