/*
 * The clinic's header: a petrol info bar (open now / closed, the address, the phone, UA/EN with «Друга мова») that folds
 * away once the page moves, over the porcelain bar (the shade-tab mark and «Ваш бренд», the four pages with mono indexes,
 * the phone and «Записатися»). Phones: one mono info line, the wordmark, a calendar button and a menu that opens a full
 * petrol sheet.
 * Rebuilt from the public demo (behaviour only, no code taken): Tubelight Navbar · Ayushmaan Singh · MIT ·
 * 21st.dev/@ayushmxxn/components/tubelight-navbar — the current page's 1 px underline slides over from the page before.
 */
import { useLayoutEffect, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Btn, Lx } from "./parts";
import { two, useEnv } from "./env";

/** the mark: a porcelain shade tab on its steel stem */
export const TabMark = () => (
  <svg className="cl-mark" viewBox="0 0 16 22" aria-hidden="true">
    <path className="cl-mark__stem" d="M8 21V13" />
    <path className="cl-mark__tab" d="M4.2 13C3.7 10.4 2.6 7 2.8 4.3c.1-1.3.9-1.9 1.9-2 2-.4 4.6-.4 6.6-.1 1.2.2 1.9.9 1.8 2.3-.1 2.8-1.2 5.9-1.7 8.5-1.2.6-5.9.6-7.2 0z" />
  </svg>
);

const CalIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3.5" y="5" width="17" height="15.5" rx="1" />
    <path d="M3.5 10h17M8 3v4M16 3v4M8 14h2.5" />
  </svg>
);

export function Header({ menuOpen, setMenu }: { menuOpen: boolean; setMenu: (v: boolean) => void }) {
  const { W, E, tabs, brand, page, oldPage, rm, vp, clock, go } = useEnv();
  const hdr = useRef<HTMLElement>(null);
  const nav = useRef<HTMLElement>(null);

  // the info bar folds away once the page has moved (the tour's or the visitor's)
  useEffect(() => {
    const el = hdr.current;
    const top = el?.parentElement?.querySelector(".cl-top");
    if (!el || !top) return;
    const io = new IntersectionObserver((es) => el.classList.toggle("is-folded", !es[es.length - 1].isIntersecting), { root: vp, threshold: 0 });
    io.observe(top);
    return () => io.disconnect();
  }, [vp]);

  // Tubelight: the underline slides from the page before to this one (once, on a page change)
  useLayoutEffect(() => {
    if (rm || oldPage == null || oldPage === page || !nav.current) return;
    const on = nav.current.querySelector<HTMLElement>(`[data-i="${page}"]`);
    const was = nav.current.querySelector<HTMLElement>(`[data-i="${oldPage}"]`);
    const line = on?.querySelector(".cl-nav__u");
    if (!on || !was || !line || !on.offsetWidth) return;
    const a = was.getBoundingClientRect();
    const b = on.getBoundingClientRect();
    const tw = gsap.fromTo(line, { x: a.left - b.left, scaleX: a.width / b.width }, { x: 0, scaleX: 1, duration: 0.8, delay: 0.5, ease: "expo.out", transformOrigin: "0 50%" });
    return () => {
      tw.kill();
    };
  }, [page, oldPage, rm]);

  const openLine = clock.open ? `${W.openTill} ${clock.closeAt}` : W.closed;
  return (
    <header className="cl-hdr" ref={hdr}>
      <div className="cl-info">
        <span className={`cl-info__st${clock.open ? " is-open" : ""}`}>
          <i aria-hidden="true" />
          {openLine}
        </span>
        <span className="cl-info__a">{W.addrFull}</span>
        <span className="cl-info__r">
          <span className="cl-info__p">{W.phone}</span>
          {E ? (
            <span className="pv-lang" aria-hidden="true">
              <b className="pv-lang__a">UA</b>
              <b className="pv-lang__b">EN</b>
            </span>
          ) : null}
        </span>
      </div>
      <div className="cl-bar">
        <span className="cl-logo" onClick={() => go(0)}>
          <TabMark />
          <span>{brand}</span>
        </span>
        <nav className="cl-nav" ref={nav}>
          {tabs.map((t, i) => (
            <span key={t} data-i={i} className={`cl-nav__i${i === page ? " is-on" : ""}`} onClick={() => go(i)}>
              <small>{two(i + 1)}</small>
              <span>
                <Lx a={t} b={E?.nav?.[i]} />
              </span>
              <i className="cl-nav__u" aria-hidden="true" />
            </span>
          ))}
        </nav>
        <div className="cl-bar__r">
          <span className="cl-bar__ph" onClick={() => go(3, { to: "con" })}>
            {W.phone}
          </span>
          <Btn className="cl-bar__cta" onClick={() => go(3, { to: "book" })}>
            <Lx a={W.cta} b={E?.cta} />
          </Btn>
          <span className="cl-cal" onClick={() => go(3, { to: "book" })}>
            <CalIcon />
          </span>
          <span className={`cl-burger${menuOpen ? " is-open" : ""}`} onClick={() => setMenu(!menuOpen)}>
            <i />
            <i />
          </span>
        </div>
      </div>
    </header>
  );
}

/** phones: the menu, a full petrol sheet (the links at 9cqw, the call to book, the address and the hours) */
export function MenuSheet({ open, setMenu }: { open: boolean; setMenu: (v: boolean) => void }) {
  const { W, tabs, brand, page, go } = useEnv();
  const to = (i: number, t?: Parameters<typeof go>[1]) => {
    setMenu(false);
    go(i, t);
  };
  return (
    <div className={`cl-sheet${open ? " is-open" : ""}`} aria-hidden="true">
      <i className="cl-grain" />
      <div className="cl-sheet__top">
        <span className="cl-logo cl-logo--d">
          <TabMark />
          <span>{brand}</span>
        </span>
        <span className="cl-burger is-open" onClick={() => setMenu(false)}>
          <i />
          <i />
        </span>
      </div>
      <nav className="cl-sheet__nav">
        {tabs.map((t, i) => (
          <span key={t} className={i === page ? "is-on" : undefined} onClick={() => to(i)}>
            <small>{two(i + 1)}</small>
            {t}
          </span>
        ))}
      </nav>
      <div className="cl-sheet__foot">
        <Btn variant="light" onClick={() => to(3, { to: "book" })}>
          {W.hero.btn}
        </Btn>
        <span className="cl-label">{W.addrFull}</span>
        <span className="cl-label">
          {W.phone} · {W.facts[2][1]}
        </span>
      </div>
    </div>
  );
}
