/*
 * Каталог (spec §4, «Каталог: the grid»): a full-width hairline, the breadcrumb and «Каталог³⁰»; the filter bar (the type
 * tabs with a sliding underline, «Колір» with six glass toggles, the sort); the active filters (chips with ×, «Скинути
 * фільтри», the count rolling); the grid, whose wide cards zigzag: Набір «Корона» | Ваза «Грань» | Склянка «Світанок»;
 * four 4:5 cards; the note | Лампа «Крапля» | «Показати ще» (four colour twins, then «Це всі товари прикладу»).
 * A card: the photo fills its well, the name on the left, the price on the right, the meta or the glass dots under them.
 * A fine pointer: the photo scales to 1.035 (Набір and Лампа crossfade to their second view), a white quick bar rises
 * inside the well («+ У кошик», a Loading Button; «Швидкий перегляд»), a dot wipes the photo to its glass; a click opens
 * the piece's page. Touch: a white «+» in each well, a tap opens the quick view as a sheet. Filtering reflows the grid
 * (GSAP Flip, ShopSite.tsx); the tour's demo: once, «Бурштин», then all again.
 * Phones: the tabs scroll inside their bar, «Фільтри (n)» opens a sheet with the glasses and the sort; 2-up cards.
 *
 * Rebuilt from the public demos (behaviour only, no code taken):
 *   Product Listing Card · ShadcnStore · MIT · 21st.dev/@shadcnstore/components/product-card-1 — the card, made square.
 *   Ecommerce Category Page · Mohammad Shehadeh · MIT · 21st.dev/@mohammadshehadeh/components/ecommerce-04 — the
 *     filters, the chips, the sort, the empty state, the phone's sheet.
 *   Sliding Tabs · ShadcnStore · MIT · 21st.dev/@shadcnstore/components/motion-sliding-tabs — the type tabs' underline.
 */
import { useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Chev, Close, Curtain, Lines, LoadBtn, Pic, Plus, Roll, Swatch, ULink, Wipe, type Css } from "./parts";
import { fine, useEnv, useIn } from "./env";
import { useShop, type Filter, type Sort } from "./store";
import { COL_N, COLS, ITEMS, NOTE_AT, PRODUCTS, shotOf, TYPE_N, TYPES, type Col, type Item } from "./products";
import { money, plural } from "./copy";

/** the cards a filter shows (the colour twins only without a colour filter: their piece already answers it) */
export function visibleItems(f: Filter, more: boolean): Item[] {
  return ITEMS.filter((it) => {
    const p = PRODUCTS[it.pid];
    if (it.twin && (!more || f.col)) return false;
    if (f.type !== "all" && p.type !== f.type) return false;
    if (f.col && !p.cols.includes(f.col)) return false;
    return true;
  });
}

function ranked(list: Item[], sort: Sort) {
  const idx = (it: Item) => ITEMS.indexOf(it);
  const s = [...list].sort((a, b) => (sort === 0 ? idx(a) - idx(b) : (sort === 1 ? 1 : -1) * (PRODUCTS[a.pid].price - PRODUCTS[b.pid].price) || idx(a) - idx(b)));
  return new Map(s.map((it, i) => [it.key, (i + 1) * 10]));
}

export function countLabel(f: Filter, vis: Item[], W: ReturnType<typeof useEnv>["W"]) {
  if (f.type === "all" && !f.col) return plural(30, W.items);
  const n = f.type === "all" && f.col ? COL_N[f.col] : f.type !== "all" && !f.col ? TYPE_N[f.type] : vis.filter((x) => !x.twin).length;
  return W.of(n);
}

export function Catalogue() {
  const { W, vp, rm, user, onUser, later, go } = useEnv();
  const shop = useShop();
  const { filter, filterTo, more, gridRef } = shop;
  const sec = useRef<HTMLElement>(null);
  const demo = useRef(false);
  const vis = useMemo(() => visibleItems(filter, more), [filter, more]);
  const rank = useMemo(() => ranked(vis, filter.sort), [vis, filter.sort]);
  const n = vis.length;
  const noteAt = Math.min(NOTE_AT, n) * 10 + 5;
  const moreAt = Math.min(NOTE_AT + 1, n) * 10 + 6;

  // the grid never gets shorter than its full catalogue (a filter during the tour must not pull the page up under it)
  useLayoutEffect(() => {
    const g = gridRef.current;
    if (!g || filter.type !== "all" || filter.col) return;
    const cq = vp.clientWidth / 100 || 1;
    g.style.minHeight = `${(g.offsetHeight / cq).toFixed(2)}cqw`;
  }, [filter, more, gridRef, vp]);

  // the tour's demo: once, «Бурштин», then all again (a visitor taking the sample puts the filter back)
  useLayoutEffect(() => {
    onUser(() => {
      if (demo.current) filterTo({ col: null, type: "all" });
      demo.current = false;
    });
  }, [onUser, filterTo]);
  useIn(sec, ({ animate }) => {
    if (!animate || rm || user()) return;
    later(() => {
      if (user()) return;
      demo.current = true;
      filterTo({ col: "burshtyn", type: "all" });
    }, 1900);
    later(() => {
      if (!demo.current || user()) return;
      demo.current = false;
      filterTo({ col: null, type: "all" });
    }, 5200);
  });

  return (
    <section className="sh-part sh-cat" data-sec data-part="catalog" ref={sec}>
      <div className="sh-crumbs sh-meta" data-rv>
        <span className="sh-crumb" onClick={() => go("top")}>
          {W.home}
        </span>
        <i>/</i>
        <span>{W.catalog}</span>
      </div>
      <Lines className="sh-ph1" lines={[W.catalog]}>
        <sup className="sh-ph1__n">30</sup>
      </Lines>
      <Filters />
      <div className="sh-active" data-rv>
        <span className="sh-active__chips">
          {filter.type !== "all" ? (
            <span className="sh-chip" onClick={() => filterTo({ type: "all" })}>
              {W.tabs[filter.type]}
              <Close />
            </span>
          ) : null}
          {filter.col ? (
            <span className="sh-chip" onClick={() => filterTo({ col: null })}>
              <Swatch c={filter.col} />
              {W.cols[filter.col]}
              <Close />
            </span>
          ) : null}
          {filter.type !== "all" || filter.col ? (
            <ULink className="sh-active__reset" onClick={() => filterTo({ type: "all", col: null })}>
              {W.reset}
            </ULink>
          ) : null}
        </span>
        <span className="sh-active__n sh-meta">
          <Roll v={countLabel(filter, vis, W)} />
        </span>
      </div>
      <div className="sh-grid" ref={gridRef}>
        {ITEMS.map((it, i) => (
          <Card key={it.key} it={it} idx={i} order={rank.get(it.key)} />
        ))}
        <div className={`sh-note${n ? "" : " is-out"}`} data-flip="note" data-sec style={{ order: noteAt, "--i": 7 } as Css}>
          <p>{W.coll.p}</p>
          <span className="sh-label">{W.handmade}</span>
        </div>
        <div className={`sh-more${n ? "" : " is-out"}`} data-flip="more" data-sec style={{ order: moreAt, "--i": 9 } as Css}>
          <span className="sh-more__t">{W.seen(more ? 12 : 8)}</span>
          <span className="sh-more__bar">
            <i style={{ transform: `scaleX(${(more ? 12 : 8) / 30})` }} />
          </span>
          {more ? (
            <span className="sh-more__end sh-meta">{W.allSeen}</span>
          ) : (
            <LoadBtn ghost stay done={W.more} action={shop.showMore}>
              {W.more}
            </LoadBtn>
          )}
        </div>
        <div className={`sh-empty${n ? " is-out" : ""}`} data-flip="empty">
          <p>{W.empty}</p>
          <ULink onClick={() => filterTo({ type: "all", col: null })}>{W.reset}</ULink>
        </div>
      </div>
    </section>
  );
}

function Filters() {
  const { W, vp } = useEnv();
  const { filter, filterTo, setSheet } = useShop();
  const tabs = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const [sortOpen, setSortOpen] = useState(false);

  // Sliding Tabs: the underline goes to the chosen tab (its place read from layout, again when the bar resizes)
  useLayoutEffect(() => {
    const box = tabs.current;
    const u = bar.current;
    if (!box || !u) return;
    const place = () => {
      const on = box.querySelector<HTMLElement>(".sh-tab.is-on");
      if (!on || !on.offsetWidth) return;
      u.style.transform = `translateX(${on.offsetLeft}px) scaleX(${on.offsetWidth / 100})`;
    };
    place();
    const t = window.setTimeout(() => u.classList.add("is-ready"), 50);
    const ro = new ResizeObserver(place);
    ro.observe(box);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [filter.type, vp]);

  const nf = (filter.col ? 1 : 0) + (filter.sort ? 1 : 0);
  return (
    <div className="sh-fbar" data-rv>
      <div className="sh-tabs" ref={tabs}>
        {(["all", ...TYPES] as const).map((t) => (
          <span key={t} className={`sh-tab${filter.type === t ? " is-on" : ""}`} onClick={() => filterTo({ type: t })}>
            {t === "all" ? W.all : W.tabs[t]}
          </span>
        ))}
        <i className="sh-tabs__u" ref={bar} aria-hidden="true" />
      </div>
      <div className="sh-fbar__r">
        <span className="sh-fbar__l sh-meta">{W.colour}</span>
        <span className="sh-fbar__sw">
          {COLS.map((c) => (
            <Swatch key={c} c={c} on={filter.col === c} title={W.cols[c]} onClick={() => filterTo({ col: filter.col === c ? null : c })} />
          ))}
        </span>
        <span className={`sh-sort${sortOpen ? " is-open" : ""}`} onPointerLeave={() => fine() && setSortOpen(false)}>
          <span className="sh-sort__b" onClick={() => setSortOpen(!sortOpen)}>
            <Roll v={W.sort[filter.sort]} />
            <Chev />
          </span>
          <span className="sh-sort__m">
            {W.sort.map((s, i) => (
              <span
                key={s}
                className={i === filter.sort ? "is-on" : undefined}
                onClick={() => {
                  setSortOpen(false);
                  filterTo({ sort: i as Sort });
                }}
              >
                {s}
              </span>
            ))}
          </span>
        </span>
        <span className="sh-fbtn" onClick={() => setSheet("filters")}>
          {W.filters}
          {nf ? ` (${nf})` : ""}
        </span>
      </div>
    </div>
  );
}

function Card({ it, idx, order }: { it: Item; idx: number; order?: number }) {
  const { W, D, lang } = useEnv();
  const shop = useShop();
  const p = PRODUCTS[it.pid];
  const [col, setCol] = useState<Col | null>(it.col);
  const well = useRef<HTMLDivElement>(null);
  const fc = shop.filter.col;
  const eff: Col | null = fc && !it.twin && p.cols.length > 1 && p.cols.includes(fc) ? fc : col;
  // a wide card shows its own view until a glass is chosen (a dot, or the colour filter)
  const shot = it.wide && p.wide ? (eff && eff !== it.col ? p.wide.by?.[eff] : null) || p.wide.base : shotOf(p, eff);
  const pick = eff ?? p.cols[0];
  const out = order == null;
  const open = () => (fine() ? shop.showProduct(p.id, pick, true) : shop.openQV(p.id, pick, well.current));
  const stop = (e: MouseEvent) => e.stopPropagation();
  return (
    <div
      className={`sh-card${it.wide ? " sh-card--wide" : ""}${col !== it.col ? " has-col" : ""}${out ? " is-out" : ""}`}
      data-flip={it.key}
      data-sec
      style={{ order: order ?? 999, "--i": Math.min(idx, 8) } as Css}
      onClick={open}
    >
      <div className="sh-card__w sh-well sh-ph" ref={well}>
        <span className="sh-zoom">
          <Wipe shot={shot} />
          {it.wide && p.alt ? (
            <span className="sh-card__alt">
              <Pic shot={p.alt} />
            </span>
          ) : null}
        </span>
        <Curtain />
        {p.isNew ? <span className="sh-badge sh-label">{W.isNew}</span> : null}
        <div className="sh-qbar" onClick={stop}>
          <LoadBtn className="sh-qbar__add" done={W.added} action={() => shop.add(p.id, pick)}>
            + {D.btn}
          </LoadBtn>
          <span className="sh-qbar__qv" onClick={() => shop.openQV(p.id, pick, well.current)}>
            {W.quick}
          </span>
        </div>
        <LoadBtn className="sh-plus" done="" action={() => shop.add(p.id, pick)}>
          <Plus />
        </LoadBtn>
      </div>
      <div className="sh-card__c">
        <span className="sh-card__n">{p.name[lang]}</span>
        <span className="sh-card__p">
          {money(p.price)}
          {p.old ? <s>{money(p.old)}</s> : null}
        </span>
        {p.meta && !it.twin ? (
          <span className="sh-card__m sh-meta">{p.meta[lang]}</span>
        ) : (
          <span className="sh-dots" onClick={stop}>
            {p.cols.map((c) => (
              <Swatch key={c} c={c} on={eff === c} title={W.cols[c]} onEnter={() => fine() && setCol(c)} onClick={() => setCol(c)} />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

/** phones: «Фільтри (n)» opens a sheet with the glasses and the sort */
export function FilterSheet() {
  const { W, later } = useEnv();
  const { filter, filterTo, sheet, setSheet } = useShop();
  const open = sheet === "filters";
  const done = () => later(() => setSheet(null), 260);
  return (
    <div className={`sh-fsheet${open ? " is-open" : ""}`} aria-hidden="true">
      <i className="sh-fsheet__scrim" onClick={() => setSheet(null)} />
      <div className="sh-fsheet__p">
        <div className="sh-fsheet__h">
          <b>{W.filters}</b>
          <span className="sh-x" onClick={() => setSheet(null)}>
            <Close />
          </span>
        </div>
        <span className="sh-label">{W.colour}</span>
        <div className="sh-fsheet__sw">
          {COLS.map((c) => (
            <span
              key={c}
              className={`sh-fsheet__o${filter.col === c ? " is-on" : ""}`}
              onClick={() => {
                filterTo({ col: filter.col === c ? null : c });
                done();
              }}
            >
              <Swatch c={c} on={filter.col === c} />
              {W.cols[c]}
            </span>
          ))}
        </div>
        <span className="sh-label">{W.sortBy}</span>
        <div className="sh-fsheet__sort">
          {W.sort.map((s, i) => (
            <span
              key={s}
              className={i === filter.sort ? "is-on" : undefined}
              onClick={() => {
                filterTo({ sort: i as Sort });
                done();
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
