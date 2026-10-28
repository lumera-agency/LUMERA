"use client";
/*
 * The site menu on phones (both burgers open it): an island over the page, dimmed behind it. Three segments: the
 * services (their pages, «від» prices), the clients' cases and this page's blocks (the one you are in is lime); under them «Ціни» (and «Про нас» once its page is out), the CTA and the languages. A row on this page takes
 * the page to its block under the island, so the block is there when it closes.
 * A modal dialog in <body> (never inside a transformed header): the page holds still under it, Esc and the cross
 * close it, Tab stays inside, focus goes back to the burger. Reduced motion: fades.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { gsap } from "@/lib/gsap";
import { focusBlock, scrollToY } from "@/lib/scroll";
import { PAGE_NAV, type NavCta, type NavLink } from "@/content/nav";
import { usePathname } from "@/i18n/navigation";
import { LogoContent } from "@/components/ui/logo/Logo";
import { ButtonLink } from "@/components/ui/button/Button";
import { LangSwitch } from "@/components/layout/lang-switch/LangSwitch";
import { useSiteNav } from "@/components/layout/site-nav/SiteNavProvider";
import { menu, useMenuOpen } from "./menu-store";
import "./menu-sheet.css";

const noSubscribe = () => () => {};
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** the main page's blocks the services segment and «Ціни» already lead to */
const COVERED = ["#services", "#pricing"];

function Arrow() {
  return (
    <svg className="menu-sheet__arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 17 17 7M8.5 7H17v8.5" />
    </svg>
  );
}

/** Another page passes its own blocks and CTA as ready text (Topbar does the same); the main page uses PAGE_NAV. With
 *  `home` the logo leads to the main page instead of back to the top. */
export function MenuSheet({ links, cta, home }: { links?: readonly NavLink[]; cta?: NavCta; home?: string } = {}) {
  const t = useTranslations();
  const nav = useSiteNav();
  const path = usePathname();
  const onMain = path === "/";
  // this page's blocks without what the services segment and «Ціни» lead to (a service's page included)
  const items = (links ?? PAGE_NAV.filter((l) => !COVERED.includes(l.href)).map((l) => ({ href: l.href, text: t(l.label) }))).filter(
    (l) => !nav.services.some((s) => s.href === l.href),
  );
  const action = cta ?? { href: "#contact", text: t("cta.discuss") };
  const hrefs = items.map((l) => l.href).join(" ");
  const open = useMenuOpen();
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);
  const sheet = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [pane, setPane] = useState(0);
  const lastPane = useRef(0);
  const tabs = [nav.labels.services, nav.labels.cases, nav.labels.pageShort];

  // the block being read: its row turns lime
  useEffect(() => {
    const blocks = hrefs.split(" ").filter((h) => h.startsWith("#")).map((h) => document.querySelector(h)).filter((el): el is Element => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setCurrent(`#${e.target.id}`)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    blocks.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, [hrefs]);

  // open / close: the page lock, the choreography, focus
  useEffect(() => {
    const root = sheet.current;
    if (!root) return;
    if (open === wasOpen.current) return;
    wasOpen.current = open;
    document.documentElement.classList.toggle("menu-open", open);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shade = root.querySelector(".menu-sheet__shade");
    const box = root.querySelector(".menu-sheet__box");
    const rows = root.querySelectorAll(".menu-sheet__pane:not([hidden]) .menu-sheet__row");
    gsap.killTweensOf([root, shade, box, rows]);

    if (open) {
      gsap.set(root, { visibility: "visible", autoAlpha: 1 });
      if (reduced) {
        gsap.set([box, rows], { clearProps: "all" });
        gsap.fromTo([shade, box], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 });
      } else {
        gsap.timeline()
          .fromTo(shade, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, 0)
          .fromTo(box, { autoAlpha: 0, y: -24, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.42, ease: "expo.out" }, 0)
          .fromTo(rows, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out", stagger: 0.03, clearProps: "transform,opacity,visibility" }, 0.1);
      }
      root.querySelector<HTMLElement>(".menu-sheet__close")?.focus({ preventScroll: true });
    } else {
      const done = () => {
        gsap.set(root, { visibility: "hidden" });
        setPane(0); // the next time it opens on the services
      };
      if (reduced) gsap.to([shade, box], { autoAlpha: 0, duration: 0.15, onComplete: done });
      else {
        gsap.timeline({ onComplete: done })
          .to(box, { autoAlpha: 0, y: -12, scale: 0.98, duration: 0.2, ease: "power2.in" }, 0)
          .to(shade, { autoAlpha: 0, duration: 0.2, ease: "power1.in" }, 0);
      }
      const back = menu.opener();
      if (back?.isConnected && back.offsetParent) back.focus({ preventScroll: true });
    }
  }, [open, mounted]);

  // a segment: its rows come in from the side it was on
  useEffect(() => {
    const dir = Math.sign(pane - lastPane.current);
    lastPane.current = pane;
    if (!dir || !sheet.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rows = sheet.current.querySelectorAll(`#site-menu-pane-${pane} .menu-sheet__row`);
    gsap.fromTo(rows, { x: 24 * dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.34, ease: "expo.out", stagger: 0.03, clearProps: "transform,opacity,visibility" });
  }, [pane]);

  // Esc, Tab kept inside, a wide screen closes it
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return menu.set(false);
      if (e.key !== "Tab" || !sheet.current) return;
      const items = [...sheet.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    const wide = matchMedia("(min-width: 861px)");
    const onWide = (e: MediaQueryListEvent) => e.matches && menu.set(false);
    // a finger on the island never scrolls the page under it (older iOS ignores the overflow lock); the rows still
    // scroll when they don't fit
    const sheetEl = sheet.current;
    const onTouch = (e: TouchEvent) => {
      const panes = (e.target as Element).closest?.<HTMLElement>(".menu-sheet__panes");
      if (panes && panes.scrollHeight > panes.clientHeight + 1) return;
      if (e.cancelable) e.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    sheetEl?.addEventListener("touchmove", onTouch, { passive: false });
    return () => {
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      sheetEl?.removeEventListener("touchmove", onTouch);
    };
  }, [open]);

  /** A row: the page goes to its block under the island, then the island lifts off it. */
  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // another page (a service, a case, the main site): the link opens it, the island just closes
    if (!href.startsWith("#")) return void menu.set(false);
    e.preventDefault();
    menu.set(false);
    const target = document.querySelector<HTMLElement>(href);
    requestAnimationFrame(() => {
      if (!target) return;
      scrollToY(target.getBoundingClientRect().top + window.scrollY, { immediate: true });
      focusBlock(target); // after the menu gave the focus back to the burger
    });
  };

  /** SaaS has no page: on the main page its panel in the services block (the ride takes it when it runs). */
  const goSaas = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    menu.set(false);
    requestAnimationFrame(() => {
      const event = new CustomEvent("services:go", { detail: { id: "svc-4" }, cancelable: true });
      if (!document.dispatchEvent(event)) return;
      const panel = document.getElementById("svc-4");
      const target = panel?.offsetParent ? panel : document.getElementById("services");
      if (!target) return;
      scrollToY(target.getBoundingClientRect().top + window.scrollY, { immediate: true });
      focusBlock(target);
    });
  };

  const onTabKey = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const to = e.key === "ArrowRight" ? (i + 1) % 3 : e.key === "ArrowLeft" ? (i + 2) % 3 : e.key === "Home" ? 0 : e.key === "End" ? 2 : -1;
    if (to < 0) return;
    e.preventDefault();
    setPane(to);
    sheet.current?.querySelector<HTMLElement>(`#site-menu-tab-${to}`)?.focus();
  };

  if (!mounted) return null;
  const pricing = onMain ? "#pricing" : `${nav.home}#pricing`;
  return createPortal(
    <div ref={sheet} className="menu-sheet" id="site-menu" role="dialog" aria-modal="true" aria-label={t("nav.mobileLabel")} inert={!open}>
      <div className="menu-sheet__shade" aria-hidden="true" onClick={() => menu.set(false)} />
      <div className="menu-sheet__box">
        <div className="menu-sheet__top">
          <a
            className="logo menu-sheet__logo"
            href={home ?? "#"}
            aria-label={t(home ? "logo.home" : "logo.top")}
            onClick={(e) => {
              if (home) return void menu.set(false);
              e.preventDefault();
              menu.set(false);
              requestAnimationFrame(() => scrollToY(0, { immediate: true }));
            }}
          >
            <LogoContent />
          </a>
          <button className="menu-sheet__close" type="button" aria-label={t("menu.close")} onClick={() => menu.set(false)}>
            <i />
            <i />
          </button>
        </div>

        <div className="menu-sheet__seg" role="tablist" aria-label={t("nav.mobileLabel")}>
          <span className="menu-sheet__glide" aria-hidden="true" style={{ transform: `translateX(${pane * 100}%)` }} />
          {tabs.map((label, i) => (
            <button
              key={label}
              id={`site-menu-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={pane === i}
              aria-controls={`site-menu-pane-${i}`}
              tabIndex={pane === i ? 0 : -1}
              onClick={() => setPane(i)}
              onKeyDown={(e) => onTabKey(e, i)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="menu-sheet__panes">
          <div className="menu-sheet__pane" id="site-menu-pane-0" role="tabpanel" aria-labelledby="site-menu-tab-0" hidden={pane !== 0}>
            <ul>
              {nav.services.map((s) => {
                const saas = s.path === null;
                return (
                  <li key={s.n}>
                    <a
                      className="menu-sheet__row"
                      href={saas && onMain ? "#svc-4" : s.href}
                      aria-current={s.path === path ? "page" : undefined}
                      onClick={saas && onMain ? goSaas : (e) => go(e, s.href)}
                    >
                      <span className="menu-sheet__text">
                        <span className="menu-sheet__name">{s.short}</span>
                        <span className="menu-sheet__line">{s.desc}</span>
                      </span>
                      {s.price ? <span className="menu-sheet__price">{s.price}</span> : <Arrow />}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="menu-sheet__pane" id="site-menu-pane-1" role="tabpanel" aria-labelledby="site-menu-tab-1" hidden={pane !== 1}>
            <ul>
              {nav.cases.map((c) => (
                <li key={c.n}>
                  <a className="menu-sheet__row" href={c.href} onClick={(e) => go(e, c.href)}>
                    <span className="menu-sheet__text">
                      <span className="menu-sheet__name">{c.name}</span>
                      <span className="menu-sheet__line">{c.k}</span>
                    </span>
                    <span className="menu-sheet__price menu-sheet__price--fig">{c.v}</span>
                  </a>
                </li>
              ))}
              <li>
                <a className="menu-sheet__row menu-sheet__row--ex" href={nav.example.href} onClick={(e) => go(e, nav.example.href)}>
                  <span className="menu-sheet__text">
                    <span className="menu-sheet__name">{nav.example.name}</span>
                    <span className="menu-sheet__line">{nav.example.who}</span>
                  </span>
                  <span className="menu-sheet__chip">{nav.example.chip}</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="menu-sheet__pane" id="site-menu-pane-2" role="tabpanel" aria-labelledby="site-menu-tab-2" hidden={pane !== 2}>
            <ul>
              {items.map((l) => (
                <li key={l.href}>
                  <a
                    className="menu-sheet__row menu-sheet__row--page"
                    href={l.href}
                    aria-current={current === l.href ? "location" : undefined}
                    onClick={(e) => go(e, l.href)}
                  >
                    <span className="menu-sheet__name">{l.text}</span>
                    <Arrow />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="menu-sheet__foot">
          <div className="menu-sheet__site">
            <a href={pricing} onClick={(e) => go(e, pricing)}>
              {nav.labels.pricing}
            </a>
            {nav.about && (
              <a href={nav.about} onClick={() => menu.set(false)}>
                {nav.labels.about}
              </a>
            )}
          </div>
          <ButtonLink href={action.href} variant="primary" className="menu-sheet__cta" onClick={(e) => go(e, action.href)}>
            {action.text}
          </ButtonLink>
          <div className="menu-sheet__meta">
            <LangSwitch />
            <span>{t("preloader.note")}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
