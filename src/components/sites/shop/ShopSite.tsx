/*
 * «Ваш бренд», a shop of coloured glass: the sample site of the «Магазин» format on «Дизайн і розробка сайтів», art
 * direction «Кольорова тінь» (round 15). One long page whose parts are the frame's tabs: Головна (the first screen,
 * Категорії, Колекція «Світло»), Каталог, Товар, Кошик, then Доставка й оплата and the footer. The header and the overlays
 * (the drawer, the quick view, the phone's sheets and pinned bars) sit outside the page's scroll (.pv-scroll), over the
 * frame. Mounted by module.tsx into the frame's site element.
 * The model (store.ts): one useReducer cart; the filters reflow the grid with GSAP Flip (installed): the cards that go
 * shrink to .96 and fade, then the rest move to their new places (.6 s, power3.inOut) and the new ones come in.
 */
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { EnvCtx, narrow, useEnv, type Env } from "./env";
import { cartReducer, countOf, FILTER0, ShopCtx, sumOf, useShop, type Filter, type Shop } from "./store";
import { CART0, lineKey, PRODUCTS, type Col } from "./products";
import { Header, MenuSheet } from "./Header";
import { Hero } from "./Hero";
import { Categories, Collection } from "./Home";
import { Catalogue, FilterSheet, visibleItems } from "./Catalogue";
import { QuickView } from "./QuickView";
import { Product } from "./Product";
import { CartPage, Drawer } from "./Cart";
import { Delivery, Footer } from "./Footer";
import { Btn, LoadBtn, Roll } from "./parts";
import { money } from "./copy";

gsap.registerPlugin(Flip);

export function ShopSite({ env }: { env: Env }) {
  const [lines, cart] = useReducer(cartReducer, CART0, (x) => x.map((l) => ({ ...l })));
  const [filter, setFilter] = useState<Filter>(FILTER0);
  const [more, setMore] = useState(false);
  const [pdp, setPdp] = useState<{ pid: string; col: Col }>({ pid: "korona", col: "kobalt" });
  const [qv, setQv] = useState<Shop["qv"]>(null);
  const [drawer, setDrawer] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [heroCol, setHeroCol] = useState<Col>("kobalt");
  const [sheet, setSheet] = useState<Shop["sheet"]>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  // what the grid shows now (a filter change reads it: two changes in one moment build on each other)
  const cur = useRef({ filter: FILTER0, more: false });
  const fx = useRef<{ tw: gsap.core.Animation | null; faded: HTMLElement[] }>({ tw: null, faded: [] });
  const { vp, rm, go } = env;

  useEffect(() => {
    const f = fx.current;
    return () => {
      f.tw?.kill();
    };
  }, []);

  /** the grid to a new filter: Flip when it is in the frame, at once when it is not */
  const reflow = useCallback(
    (nf: Filter, nm: boolean) => {
      const commit = () => {
        cur.current = { filter: nf, more: nm };
        flushSync(() => {
          setFilter(nf);
          setMore(nm);
        });
      };
      const f = fx.current;
      f.tw?.kill();
      f.tw = null;
      if (f.faded.length) gsap.set(f.faded, { clearProps: "opacity,scale" });
      f.faded = [];
      const grid = gridRef.current;
      const g = grid?.getBoundingClientRect();
      const v = vp.getBoundingClientRect();
      if (!grid || !g || rm || g.bottom < v.top || g.top > v.bottom) {
        commit();
        return;
      }
      const els = [...grid.querySelectorAll<HTMLElement>("[data-flip]")];
      const show = new Set(visibleItems(nf, nm).map((i) => i.key));
      const any = show.size > 0;
      const will = (e: HTMLElement) => {
        const k = e.dataset.flip || "";
        return k === "note" || k === "more" ? any : k === "empty" ? !any : show.has(k);
      };
      const leaving = els.filter((e) => !e.classList.contains("is-out") && !will(e));
      const run = () => {
        const st = Flip.getState(els);
        commit();
        if (leaving.length) gsap.set(leaving, { clearProps: "opacity,scale" });
        f.faded = [];
        const stay = els.filter((e) => !e.classList.contains("is-out"));
        if (!stay.length) return;
        f.tw = Flip.from(st, {
          targets: stay,
          duration: 0.6,
          ease: "power3.inOut",
          onEnter: (en) => gsap.fromTo(en, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.45, delay: 0.18, ease: "power2.out" }),
        });
      };
      if (leaving.length) {
        f.faded = leaving;
        f.tw = gsap.to(leaving, { opacity: 0, scale: 0.96, duration: 0.22, ease: "power2.in", onComplete: run });
      } else run();
    },
    [vp, rm],
  );

  const filterTo = useCallback((x: Partial<Filter>) => reflow({ ...cur.current.filter, ...x }, cur.current.more), [reflow]);
  const showMore = useCallback(() => reflow(cur.current.filter, true), [reflow]);

  const shop: Shop = useMemo(
    () => ({
      lines,
      cart,
      filter,
      filterTo,
      more,
      showMore,
      pdp,
      showProduct: (pid, col, scroll = true) => {
        const p = PRODUCTS[pid];
        setPdp({ pid, col: col && p.cols.includes(col) ? col : p.cols[0] });
        if (scroll) go("product");
      },
      setPdpCol: (col) => setPdp((x) => ({ ...x, col })),
      qv,
      openQV: (pid, col, from) => setQv({ pid, col, from }),
      closeQV: () => setQv(null),
      drawer,
      setDrawer,
      justAdded,
      add: (pid, col, qty = 1, open = false) => {
        cart({ t: "add", pid, col, qty });
        setJustAdded(lineKey({ pid, col }));
        if (open) setDrawer(true);
      },
      heroCol,
      setHeroCol,
      sheet,
      setSheet,
      gridRef,
    }),
    [lines, filter, filterTo, more, showMore, pdp, qv, drawer, justAdded, heroCol, sheet, go],
  );

  return (
    <EnvCtx.Provider value={env}>
      <ShopCtx.Provider value={shop}>
        <Header />
        <div className="pv-scroll sh-scroll">
          <i className="sh-top" aria-hidden="true" />
          <Hero />
          <Categories />
          <Collection />
          <Catalogue />
          <Product />
          <CartPage />
          <Delivery />
          <Footer />
        </div>
        <Pins />
        <Drawer />
        <QuickView />
        <FilterSheet />
        <MenuSheet />
      </ShopCtx.Provider>
    </EnvCtx.Provider>
  );
}

/** phones: the product's price and «У кошик» once its buy row has gone up; the cart's total while its lines show */
function Pins() {
  const { W, D, lang, vp, go } = useEnv();
  const { pdp, add, lines } = useShop();
  const [on, setOn] = useState<"" | "pdp" | "cart">("");
  useEffect(() => {
    if (!narrow()) return;
    const site = vp.querySelector<HTMLElement>(".pv-site:not(.pv-site--old)") || vp;
    const buy = site.querySelector("[data-buy]");
    const prod = site.querySelector('[data-part="product"]');
    const cartL = site.querySelector(".sh-cartp__l");
    const sum = site.querySelector("[data-sum]");
    const hdr = site.querySelector<HTMLElement>(".sh-hdr");
    const seen = { buyUp: false, prod: false, cartL: false, sum: false };
    const io = new IntersectionObserver(
      (es) => {
        for (const x of es) {
          if (x.target === buy) seen.buyUp = !x.isIntersecting && x.boundingClientRect.top < (x.rootBounds?.top ?? 0);
          else if (x.target === prod) seen.prod = x.isIntersecting;
          else if (x.target === cartL) seen.cartL = x.isIntersecting;
          else if (x.target === sum) seen.sum = x.isIntersecting;
        }
        setOn(seen.prod && seen.buyUp ? "pdp" : seen.cartL && !seen.sum ? "cart" : "");
      },
      { root: vp, threshold: 0, rootMargin: `-${hdr?.offsetHeight || 0}px 0px 0px 0px` },
    );
    [buy, prod, cartL, sum].forEach((x) => x && io.observe(x));
    return () => io.disconnect();
  }, [vp]);
  // while a bar is up, the frame's own pill («Автопрокрутка» / «Гортайте…») rides above it (sites-next.css)
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frame = vp.closest<HTMLElement>(".pvw");
    if (!frame || !on) return;
    frame.style.setProperty("--sh-pin", `${box.current?.offsetHeight || 0}px`);
    return () => {
      frame.style.removeProperty("--sh-pin");
    };
  }, [on, vp]);
  const p = PRODUCTS[pdp.pid];
  return (
    <div className={`sh-pins${on ? ` is-${on}` : ""}`} ref={box} aria-hidden="true">
      <div className="sh-pin sh-pin--pdp">
        <span className="sh-pin__t">
          <span>{p.name[lang]}</span>
          <b>{money(p.price)}</b>
        </span>
        <LoadBtn done={W.added} action={() => add(p.id, pdp.col, 1, true)}>
          {D.btn}
        </LoadBtn>
      </div>
      <div className="sh-pin sh-pin--cart">
        <span className="sh-pin__t">
          <span>
            {W.total} · {countOf(lines)}
          </span>
          <b>
            <Roll v={money(sumOf(lines))} />
          </b>
        </span>
        <Btn
          onClick={() => {
            const s = vp.querySelector(".pv-site:not(.pv-site--old) [data-sum]");
            if (s) go(s);
          }}
        >
          {W.order}
        </Btn>
      </div>
    </div>
  );
}

