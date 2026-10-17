/*
 * Товар (spec §4): Келих «Корона» (any card opens its own piece here). The breadcrumb «Каталог / Келихи / Келих «Корона»»;
 * the thumbnails in c1 and the main photo in c2–c7 (a thumbnail wipes to its view; a pointer zooms the photo to 1.8 with
 * the origin at the pointer); the name and the price, the height, «Колір: Кобальт» with the swatches, the Number Field and
 * a full-width «У кошик» that opens the drawer, the perks; the accordion (Опис · Характеристики · Доставка); the upsell
 * «Набір із трьох — 1 590 ₴ · Додати набір». Phones: a swipe gallery with dots; the price and «У кошик» pinned to the
 * screen's foot once the buy row has gone up (ShopSite's pins).
 * Rebuilt from the public demos (behaviour only, no code taken): Product Detail Page · Mohammad Shehadeh · MIT ·
 * 21st.dev/@mohammadshehadeh/components/ecommerce-03 (the gallery, the swatches, the quantity, the accordion).
 */
import { useRef, useState, type PointerEvent } from "react";
import { Curtain, Lines, LoadBtn, NumberField, Pic, Roll, Swatch, ULink, Wipe, type Css } from "./parts";
import { fine, narrow, useEnv } from "./env";
import { useShop } from "./store";
import { PRODUCTS, shotOf, type Product as P, type Shot, type Col } from "./products";
import { money, nb } from "./copy";

export const viewsOf = (p: P, c: Col): Shot[] => [shotOf(p, c), ...(p.gallery || [])].slice(0, 3);

export function Product() {
  const { W, D, lang, go } = useEnv();
  const { pdp, setPdpCol, add, filterTo } = useShop();
  const p = PRODUCTS[pdp.pid];
  const col = pdp.col;
  const views = viewsOf(p, col);
  const [view, setView] = useState(0);
  const [qty, setQty] = useState(1);
  const [acc, setAcc] = useState(0);
  const [ph] = useState(narrow);
  const zoom = useRef<HTMLSpanElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dot, setDot] = useState(0);
  const v = Math.min(view, views.length - 1);

  const zoomMove = (e: PointerEvent<HTMLDivElement>) => {
    const z = zoom.current;
    if (!z || !fine()) return;
    const r = e.currentTarget.getBoundingClientRect();
    z.style.transformOrigin = `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}% ${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`;
  };
  const spec: [string, string][] = [[W.pdp.material, p.pressed ? W.pdp.pressed : W.pdp.glass]];
  if (p.height) spec.push([W.pdp.height, `${p.height} см`]);
  if (p.volume) spec.push([W.pdp.volume, p.volume]);
  spec.push([W.pdp.stock[0], W.pdp.stock[1]]);
  const [shipH, shipT] = D.perks[1] || ["", ""];
  // the size, or the glass when there is no choice of glass (else the colour row below says it)
  const meta = p.height ? W.heightCap(p.height) : p.meta && p.cols.length < 2 ? p.meta[lang] : "";

  return (
    <section className="sh-part sh-pdp" data-sec data-part="product">
      <div className="sh-crumbs sh-meta" data-rv>
        <span className="sh-crumb" onClick={() => go("catalog")}>
          {W.catalog}
        </span>
        <i>/</i>
        <span
          className="sh-crumb"
          onClick={() => {
            filterTo({ type: p.type, col: null });
            go("catalog");
          }}
        >
          {W.tabs[p.type]}
        </span>
        <i>/</i>
        <span>{p.name[lang]}</span>
      </div>
      <div className="sh-pdp__g">
        {ph ? (
          <div className="sh-pdp__swipe sh-ph">
            <div
              className="sh-pdp__track"
              ref={track}
              onScroll={(e) => {
                const t = e.currentTarget;
                setDot(Math.round(t.scrollLeft / (t.clientWidth || 1)));
              }}
            >
              {views.map((s, i) => (
                <span key={`${s.k}${i}`} className="sh-pdp__slide sh-well">
                  {i === 0 ? <Wipe shot={s} /> : <Pic shot={s} />}
                </span>
              ))}
            </div>
            <Curtain />
            <span className="sh-pdp__dots">
              {views.map((s, i) => (
                <i key={`${s.k}${i}`} className={i === dot ? "is-on" : undefined} />
              ))}
            </span>
          </div>
        ) : (
          <>
            <div className="sh-pdp__thumbs" data-rv>
              {views.map((s, i) => (
                <span key={`${s.k}${i}`} className={`sh-thumb sh-well${i === v ? " is-on" : ""}`} onClick={() => setView(i)}>
                  <Pic shot={s} />
                </span>
              ))}
            </div>
            <div className="sh-pdp__main sh-well sh-ph" onPointerMove={zoomMove}>
              <span className="sh-pdp__zoom" ref={zoom}>
                <Wipe shot={views[v]} />
              </span>
              <Curtain />
            </div>
          </>
        )}
        <div className="sh-pdp__info">
          <Lines className="sh-pdp__n" lines={[p.name[lang]]} />
          <div className="sh-pdp__pr" data-rv>
            <span className="sh-pdp__p">
              <Roll v={money(p.price)} />
              {p.old ? <s>{money(p.old)}</s> : null}
            </span>
            <span className="sh-meta">{meta}</span>
          </div>
          {p.cols.length > 1 ? (
            <div className="sh-pdp__col" data-rv>
              <span className="sh-meta">
                {W.colour}: <b>{W.cols[col]}</b>
              </span>
              <span className="sh-pdp__sw">
                {p.cols.map((c) => (
                  <Swatch
                    key={c}
                    c={c}
                    on={c === col}
                    title={W.cols[c]}
                    onClick={() => {
                      setPdpCol(c);
                      setView(0);
                      track.current?.scrollTo({ left: 0, behavior: "smooth" });
                    }}
                  />
                ))}
              </span>
            </div>
          ) : null}
          <div className="sh-pdp__buy" data-rv data-buy>
            <NumberField n={qty} set={setQty} />
            <LoadBtn className="sh-pdp__add" done={W.added} action={() => add(p.id, col, qty, true)}>
              {D.btn}
            </LoadBtn>
          </div>
          <p className="sh-pdp__perks sh-meta" data-rv>
            {D.card.perks.map((x) => (
              <span key={x}>{nb(x)}</span>
            ))}
          </p>
          <div className="sh-acc" data-rv>
            {W.pdp.acc.map((h, i) => (
              <div key={h} className={`sh-acc__r${acc === i ? " is-open" : ""}`}>
                <span className="sh-acc__h" onClick={() => setAcc(acc === i ? -1 : i)}>
                  {h}
                  <i className="sh-acc__x" aria-hidden="true" />
                </span>
                <div className="sh-acc__b">
                  <div>
                    {i === 0 ? <p>{W.coll.p}</p> : null}
                    {i === 1 ? (
                      <dl className="sh-dl">
                        {spec.map(([a, b]) => (
                          <div key={a}>
                            <dt>{a}</dt>
                            <dd>{b}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                    {i === 2 ? (
                      <p>
                        <b>{shipH}.</b> {shipT}.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {p.id === "korona" ? (
            <div className="sh-upsell" data-rv style={{ "--rd": "120ms" } as Css}>
              <span className="sh-upsell__ph sh-well">
                <Pic shot={PRODUCTS.nabir.wide?.base || shotOf(PRODUCTS.nabir, null)} />
              </span>
              <span className="sh-upsell__t">
                {W.pdp.upsell} — {money(PRODUCTS.nabir.price)}
              </span>
              <ULink onClick={() => add("nabir", "kobalt", 1, true)}>{W.pdp.upsellGo}</ULink>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
