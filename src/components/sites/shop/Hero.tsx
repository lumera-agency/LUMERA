/*
 * Головна · the first screen (spec §4.1, 56cqw): the eyebrow, «Скло, яке / ловить світло» in two forced lines, the sub,
 * «До каталогу →» and «Новинки», the facts rail (three ruled cells); on the right the well with Ваза «Грань» in Кобальт,
 * its Кобальт / Малина swatches (the photo wipes between the two glasses) and its caption with a ghost «У кошик».
 * Entrance: the lines rise (.9 s, 80 ms apart), the sub and the buttons follow, the white curtain lifts off the well, the
 * swatches scale in. The tour's demo: once, 2.2 s after the first screen came in, the vase turns to Малина (the visitor's
 * own hands cancel it). With «3D-обʼєкт» the well's photo becomes the glass vase (Vase3D.tsx, React Three Fiber).
 * Phones: the eyebrow, the heading, the sub, the well (91 × 104), the caption, a ghost «У кошик» beside the ink
 * «До каталогу →», the facts as three rows.
 */
import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Btn, Curtain, Lines, LoadBtn, Lx, Roll, Swatch, ULink, Wipe, type Css } from "./parts";
import { useEnv, useIn } from "./env";
import { useShop } from "./store";
import { PRODUCTS, type Col, type Shot } from "./products";
import { money } from "./copy";

const Vase3D = lazy(() => import("./Vase3D"));

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() {
    return { err: true };
  }
  render() {
    return this.state.err ? this.props.fallback : this.props.children;
  }
}

/** WebGL2, no Save-Data, enough memory (else the photo, whose swatches still work) */
function canGL() {
  if (typeof window === "undefined" || typeof WebGL2RenderingContext === "undefined") return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData === true) return false;
  return !(nav.deviceMemory != null && nav.deviceMemory <= 2);
}

const HERO_COLS: readonly Col[] = ["kobalt", "malyna"];
const heroShot = (c: Col): Shot => ({ k: c === "malyna" ? "vase-malyna" : "vase-kobalt", f: "50% 80%", mul: true });

export function Hero() {
  const { W, D, E, three, vp, rm, go, user, onUser, later, lang } = useEnv();
  const { heroCol, setHeroCol, add } = useShop();
  const sec = useRef<HTMLElement>(null);
  const demo = useRef(true);
  const [gl] = useState(canGL);
  const [live, setLive] = useState(false);
  const [dragged, setDragged] = useState(false);
  // the page before (a crossfade) may still hold its own vase: one WebGL context at a time
  const [free, setFree] = useState(() => !vp.querySelector(".pv-site--old .sh-gl"));
  const p = PRODUCTS.hran;

  useEffect(() => {
    onUser(() => {
      demo.current = false;
    });
  }, [onUser]);
  useEffect(() => {
    if (free) return;
    let t = 0;
    const check = () => {
      if (!vp.querySelector(".pv-site--old .sh-gl")) setFree(true);
      else t = window.setTimeout(check, 120);
    };
    t = window.setTimeout(check, 120);
    return () => clearTimeout(t);
  }, [free, vp]);

  // the tour's demo: once, after 2.2 s, the vase turns to Малина
  useIn(sec, ({ animate }) => {
    if (!animate || rm || user()) return;
    later(() => {
      if (demo.current && !user()) setHeroCol("malyna");
    }, 2200);
  });

  const pick = (c: Col) => {
    demo.current = false;
    setHeroCol(c);
  };
  const enH = E ? E.h1 : null;
  const meta = `${W.cols[heroCol]} · ${W.heightCm(p.height || 24)}`;
  const addBtn = (cls: string) => (
    <LoadBtn ghost className={cls} done={W.added} action={() => add("hran", heroCol)}>
      <Lx a={D.btn} b={E?.btn} />
    </LoadBtn>
  );

  return (
    <section className={`sh-hero${E ? " sh-hero--en" : ""}`} data-sec data-part="top" ref={sec}>
      <span className="sh-eyebrow sh-label" data-rv>
        <Lx a={D.eyebrow} b={E?.eyebrow} />
      </span>
      <Lines as="h1" className="sh-h1" lines={W.h1} en={enH} />
      <p className="sh-hero__sub sh-lead" data-rv style={{ "--rd": "300ms" } as Css}>
        <Lx a={W.sub} b={E?.sub} />
      </p>
      <div className="sh-hero__cta" data-rv style={{ "--rd": "380ms" } as Css}>
        <Btn arrow onClick={() => go("catalog")}>
          <Lx a={W.toCat} b={E?.toCat} />
        </Btn>
        <ULink onClick={() => go("coll")}>
          <Lx a={D.nav[1]} b={E?.nav[1]} />
        </ULink>
      </div>
      <ul className="sh-facts" data-rv style={{ "--rd": "460ms" } as Css}>
        {W.facts.map(([a, b]) => (
          <li key={a}>
            <b className="sh-label">{a}</b>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className={`sh-hero__well sh-well sh-ph${three ? " is-3d" : ""}${live ? " is-live" : ""}`} data-obj>
        <span className="sh-hero__poster">
          <Wipe shot={heroShot(heroCol)} eager />
        </span>
        {three && gl && free ? (
          <Boundary fallback={null}>
            <Suspense fallback={null}>
              <Vase3D col={heroCol} onLive={() => setLive(true)} onDrag={() => setDragged(true)} />
            </Suspense>
          </Boundary>
        ) : null}
        <Curtain />
        <span className="sh-hero__sw">
          {HERO_COLS.map((c) => (
            <Swatch key={c} c={c} on={heroCol === c} title={W.cols[c]} onClick={() => pick(c)} />
          ))}
        </span>
        {three && gl ? <span className={`sh-hint${dragged ? " is-off" : ""}`}>{W.hint3d} ↔</span> : null}
      </div>
      <div className="sh-hero__cap" data-rv style={{ "--rd": "520ms" } as Css}>
        <span className="sh-hero__nm">
          <b>{p.name[lang]}</b>
          <small className="sh-meta">{meta}</small>
        </span>
        <span className="sh-hero__pr">
          <span className="sh-price">
            <Roll v={money(p.price)} />
          </span>
          {addBtn("sh-hero__add")}
        </span>
      </div>
      <div className="sh-hero__pcta" data-rv style={{ "--rd": "560ms" } as Css}>
        {addBtn("sh-hero__add2")}
        <Btn arrow onClick={() => go("catalog")}>
          <Lx a={W.toCat} b={E?.toCat} />
        </Btn>
      </div>
    </section>
  );
}
