/*
 * The shop's header (spec §5), after Venini, HAY and Sophie Lou Jacobsen: an ink announcement bar (the delivery line,
 * the phone; UA · EN with «Друга мова») that folds away once the page moves, over a white bar split around the centred
 * wordmark: the menu on the left, «Пошук» and «Кошик (3)» on the right (the count rolls). «Каталог» opens a mega panel
 * (the types with counts, the glasses with counts, a 4:5 preview that crossfades to the hovered type) that drops from
 * under the bar over a white scrim; «Пошук» swaps the menu for a field whose underline draws in, with up to four matching
 * pieces below. Phones: a burger, the wordmark, the search and a black bag with the count; the menu is a white sheet.
 *
 * Rebuilt from the public demos (behaviour only, no code taken):
 *   Underline Animation · Daniel Petho · MIT · 21st.dev/@danielpetho/components/underline-animation — the menu's links.
 *   Stagger List · UI Beats (nikhils4) · MIT · uibeats.com/docs — the panel's rows enter one after another.
 * Ported from React Bits (reactbits.dev, David Haz; MIT + Commons Clause, the notice is in parts.tsx):
 *   Staggered Menu — <MenuSheet>: two pale layers slide in ahead of the white sheet, then its links rise one by one.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { Close, Ico, Lx, Pic, Roll, SearchIco, Swatch, type Css } from "./parts";
import { fine, useEnv, type Part } from "./env";
import { useShop, countOf } from "./store";
import { COL_N, COLS, PRODUCTS, TYPE_N, TYPES, shotOf, type Shot, type Type } from "./products";
import { money } from "./copy";

const NAV_TO: Part[] = ["catalog", "coll", "ship", "ftr"];
export const TYPE_SHOT: Record<Type, Shot> = {
  vases: { k: "vase-malyna", f: "50% 80%", mul: true },
  goblets: { k: "goblets-close", f: "50% 40%", mul: true },
  pitchers: { k: "pitcher", f: "50% 55%" },
  lamps: { k: "lamp-amber-p", f: "50% 55%" },
};

type Drop = "mega" | "search" | null;

export function Header() {
  const { W, D, E, brand, vp, go, rm, lang } = useEnv();
  const shop = useShop();
  const { lines, setDrawer, filterTo, setSheet, sheet } = shop;
  const hdr = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const input2 = useRef<HTMLInputElement>(null);
  const shut = useRef(0);
  const [drop, setDrop] = useState<Drop>(null);
  const [hov, setHov] = useState<Type>("vases");
  const [q, setQ] = useState("");
  const n = countOf(lines);

  // the announcement folds away and the bar's hairline shows once the page has moved
  useEffect(() => {
    const el = hdr.current;
    const top = el?.parentElement?.querySelector(".sh-top");
    if (!el || !top) return;
    // (an attribute React never renders: the header's own re-renders keep it)
    const io = new IntersectionObserver((es) => el.toggleAttribute("data-folded", !es[es.length - 1].isIntersecting), { root: vp, threshold: 0 });
    io.observe(top);
    return () => io.disconnect();
  }, [vp]);

  useEffect(() => () => clearTimeout(shut.current), []);
  // Esc closes the panel
  useEffect(() => {
    if (!drop) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrop(null);
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [drop]);

  const open = (d: Drop) => {
    clearTimeout(shut.current);
    setDrop(d);
  };
  const leave = () => {
    if (drop !== "mega" || !fine()) return;
    clearTimeout(shut.current);
    shut.current = window.setTimeout(() => setDrop(null), 180);
  };
  const to = (p: Part) => {
    setDrop(null);
    go(p);
  };
  const openSearch = () => {
    flushSync(() => setDrop("search"));
    // (the bar's field on a desktop, the panel's own on a phone: whichever is shown)
    const el = [input.current, input2.current].find((x) => x && x.offsetParent);
    el?.focus({ preventScroll: true });
  };

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    return Object.values(PRODUCTS)
      .filter((p) => !s || p.name.uk.toLowerCase().includes(s) || p.name.ru.toLowerCase().includes(s) || W.types[p.type].toLowerCase().includes(s))
      .slice(0, 4);
  }, [q, W]);

  return (
    <header className={`sh-hdr${drop ? ` is-${drop}` : ""}`} ref={hdr} onPointerLeave={leave}>
      <div className="sh-ann">
        <span className="sh-ann__l">
          {E ? (
            <span className="pv-lang" aria-hidden="true">
              <b className="pv-lang__a">UA</b>
              <b className="pv-lang__b">EN</b>
            </span>
          ) : null}
        </span>
        <span className="sh-ann__t">
          <Lx a={W.ann} b={E?.ann} />
        </span>
        <span className="sh-ann__r">{D.footer.phone}</span>
      </div>
      <div className="sh-bar">
        <span className={`sh-burger${sheet === "menu" ? " is-open" : ""}`} onClick={() => setSheet(sheet === "menu" ? null : "menu")}>
          <i />
          <i />
        </span>
        <div className="sh-bar__l">
          <nav className="sh-nav">
            {D.nav.map((x, i) => (
              <span
                key={x}
                className={`sh-nav__i${i === 0 ? " sh-nav__i--cat" : ""}${i === 0 && drop === "mega" ? " is-on" : ""}`}
                onPointerEnter={i === 0 ? () => fine() && open("mega") : () => drop === "mega" && fine() && setDrop(null)}
                onClick={() => {
                  if (i === 0 && !fine() && drop !== "mega") open("mega");
                  else to(NAV_TO[i]);
                }}
              >
                <Lx a={x} b={E?.nav[i]} />
                {i === 0 ? <Ico className="sh-ico sh-chev" d="m7 10 5 5 5-5" /> : null}
              </span>
            ))}
          </nav>
          <label className="sh-find">
            <SearchIco />
            <input
              ref={input}
              className="sh-find__in"
              value={q}
              placeholder={W.searchPh}
              onChange={(e) => setQ(e.target.value)}
              tabIndex={drop === "search" ? 0 : -1}
              aria-label={W.search}
            />
            <i className="sh-find__u" aria-hidden="true" />
          </label>
        </div>
        <span className="sh-wm" onClick={() => to("top")}>
          {brand}
        </span>
        <div className="sh-bar__r">
          <span className="sh-util sh-util--find" onClick={() => (drop === "search" ? setDrop(null) : openSearch())}>
            <span className="sh-util__t">{drop === "search" ? W.close : <Lx a={W.search} b={E?.search} />}</span>
            <SearchIco />
          </span>
          <span className="sh-util sh-util--cart" onClick={() => setDrawer(true)}>
            <span className="sh-util__t">
              <Lx
                a={
                  <>
                    {W.cart} (<Roll v={n} />)
                  </>
                }
                b={
                  E ? (
                    <>
                      {E.cart} (<Roll v={n} />)
                    </>
                  ) : null
                }
              />
            </span>
            <span className="sh-bag" aria-hidden="true">
              <Roll v={n} />
            </span>
          </span>
        </div>
      </div>

      {/* under the bar: the mega panel or the search's results drop in over the scrim */}
      <div className="sh-drop">
        <div className="sh-mega" onPointerEnter={() => clearTimeout(shut.current)}>
          <div className="sh-mega__types">
            {TYPES.map((t, i) => (
              <span
                key={t}
                className={`sh-mega__t${hov === t ? " is-on" : ""}`}
                style={{ "--i": i } as Css}
                onPointerEnter={() => setHov(t)}
                onClick={() => {
                  filterTo({ type: t, col: null });
                  to("catalog");
                }}
              >
                <span>{W.types[t]}</span>
                <sup>{TYPE_N[t]}</sup>
              </span>
            ))}
          </div>
          <div className="sh-mega__cols" style={{ "--i": 4 } as Css}>
            <span className="sh-label">{W.colour}</span>
            <div className="sh-mega__cl">
              {COLS.map((c) => (
                <span
                  key={c}
                  className="sh-mega__c"
                  onClick={() => {
                    filterTo({ col: c, type: "all" });
                    to("catalog");
                  }}
                >
                  <Swatch c={c} />
                  <span>{W.cols[c]}</span>
                  <small>{COL_N[c]}</small>
                </span>
              ))}
            </div>
          </div>
          <div className="sh-mega__pv" style={{ "--i": 5 } as Css}>
            {TYPES.map((t) => (
              <span key={t} className={`sh-mega__ph${hov === t ? " is-on" : ""}`}>
                <Pic shot={TYPE_SHOT[t]} />
              </span>
            ))}
          </div>
        </div>
        <div className="sh-sres">
          <label className="sh-find sh-find--ph">
            <SearchIco />
            <input ref={input2} className="sh-find__in" value={q} placeholder={W.searchPh} onChange={(e) => setQ(e.target.value)} tabIndex={-1} aria-label={W.search} />
            <i className="sh-find__u" aria-hidden="true" />
          </label>
          {matches.length ? (
            <div className="sh-sres__g">
              {matches.map((p, i) => (
                <span
                  key={p.id}
                  className="sh-sres__i"
                  style={{ "--i": i } as Css}
                  onClick={() => {
                    shop.showProduct(p.id, null, false);
                    to("product");
                  }}
                >
                  <span className="sh-sres__ph sh-well">
                    <Pic shot={shotOf(p, null)} />
                  </span>
                  <span className="sh-sres__n">{p.name[lang]}</span>
                  <span className="sh-sres__p">{money(p.price)}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="sh-sres__none">{W.noMatch}</p>
          )}
        </div>
      </div>
      <i className="sh-scrim" aria-hidden="true" onClick={() => setDrop(null)} style={rm ? ({ transition: "none" } as CSSProperties) : undefined} />
    </header>
  );
}

/** Staggered Menu (phones): the white sheet with the links at 9cqw, the glasses and «Кошик (3)» */
export function MenuSheet() {
  const { W, D, brand, go } = useEnv();
  const { sheet, setSheet, lines, filterTo, setDrawer } = useShop();
  const open = sheet === "menu";
  const n = countOf(lines);
  const to = (p: Part) => {
    setSheet(null);
    go(p);
  };
  return (
    <div className={`sh-menu${open ? " is-open" : ""}`} aria-hidden="true">
      <i className="sh-menu__pre sh-menu__pre--1" />
      <i className="sh-menu__pre sh-menu__pre--2" />
      <div className="sh-menu__p">
        <div className="sh-menu__top">
          <span className="sh-wm">{brand}</span>
          <span className="sh-menu__x" onClick={() => setSheet(null)}>
            <Close />
          </span>
        </div>
        <nav className="sh-menu__nav">
          {D.nav.map((x, i) => (
            <span key={x} className="sh-menu__i" style={{ "--i": i } as Css} onClick={() => to(NAV_TO[i])}>
              <small>{String(i + 1).padStart(2, "0")}</small>
              <span>{x}</span>
            </span>
          ))}
        </nav>
        <div className="sh-menu__sw" style={{ "--i": 4 } as Css}>
          <span className="sh-label">{W.colour}</span>
          <div>
            {COLS.map((c) => (
              <Swatch
                key={c}
                c={c}
                title={W.cols[c]}
                onClick={() => {
                  filterTo({ col: c, type: "all" });
                  to("catalog");
                }}
              />
            ))}
          </div>
        </div>
        <span
          className="sh-menu__cart"
          style={{ "--i": 5 } as Css}
          onClick={() => {
            setSheet(null);
            setDrawer(true);
          }}
        >
          {W.cart} ({n})
        </span>
      </div>
    </div>
  );
}
