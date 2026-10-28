"use client";
/*
 * The site menu on phones (both burgers open it), «Колони»: a black sheet drops in as the preloader's five columns,
 * left to right, as the desktop panel does. The four services rise out of their masks, each with its «від» price; a
 * tap opens a service's sections (its page's blocks, its formats and cases) as an accordion, one at a time; on a
 * service's own page it is open already, and the block being read is lime. Under them: «Як працюємо», «Ціни», «Про
 * нас», the two phones, Telegram and Viber; the CTA stays at the foot. A link to a block on this page takes the page
 * there under the sheet, so the block is there when the columns lift.
 * A modal dialog in <body> (never inside a transformed header): the page holds still under it, Esc and the cross
 * close it, Tab stays inside, focus goes back to the burger. Reduced motion: a fade.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { gsap } from "@/lib/gsap";
import { focusBlock, scrollToY } from "@/lib/scroll";
import { type NavCta, type NavLink } from "@/content/nav";
import { usePathname } from "@/i18n/navigation";
import { LogoContent } from "@/components/ui/logo/Logo";
import { ButtonLink } from "@/components/ui/button/Button";
import { LangSwitch } from "@/components/layout/lang-switch/LangSwitch";
import { useSiteNav } from "@/components/layout/site-nav/SiteNavProvider";
import { PhoneIcon, TelegramIcon, ViberIcon } from "@/components/layout/site-nav/Contacts";
import { menu, useMenuOpen } from "./menu-store";
import "./menu-sheet.css";

const noSubscribe = () => () => {};
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Arrow() {
  return (
    <svg className="menu-sheet__arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 17 17 7M8.5 7H17v8.5" />
    </svg>
  );
}

/** «/ru/reklama-i-analityka#ads» → its path and hash, against this page */
const split = (href: string) => {
  const url = new URL(href, location.href);
  return { here: url.pathname === location.pathname, hash: url.hash };
};

/** Another page passes its own blocks and CTA as ready text (Topbar does the same); they show here only on a page that
 *  is neither the main page nor a service's (the cases). With `home` the logo leads to the main page. */
export function MenuSheet({ links, cta, home }: { links?: readonly NavLink[]; cta?: NavCta; home?: string } = {}) {
  const t = useTranslations();
  const nav = useSiteNav();
  const path = usePathname();
  const onMain = path === "/";
  const own = nav.services.findIndex((s) => s.path === path);
  const pageLinks = !onMain && own < 0 ? (links ?? []).filter((l) => l.href.startsWith("#")) : [];
  const action = cta ?? { href: "#contact", text: t("cta.discuss") };
  const open = useMenuOpen();
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);
  const sheet = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const [expanded, setExpanded] = useState<number | null>(own >= 0 ? own : null);
  const [current, setCurrent] = useState<string | null>(null);
  // the blocks of this page the menu leads to: its service's sections, or its own links
  const watched = [...(own >= 0 ? nav.services[own].subs.map((s) => s.href) : []), ...pageLinks.map((l) => l.href)]
    .map((h) => (h.includes("#") ? `#${h.split("#")[1]}` : ""))
    .filter(Boolean)
    .join(" ");

  // the block being read: its row turns lime
  useEffect(() => {
    const blocks = [...new Set(watched.split(" "))].filter(Boolean).map((h) => document.querySelector(h)).filter((el): el is Element => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setCurrent(`#${e.target.id}`)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    blocks.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, [watched]);

  // open / close: the page lock, the columns, focus
  useEffect(() => {
    const root = sheet.current;
    if (!root) return;
    if (open === wasOpen.current) return;
    wasOpen.current = open;
    document.documentElement.classList.toggle("menu-open", open);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cols = root.querySelectorAll(".menu-sheet__cols i");
    const rows = root.querySelectorAll(".menu-sheet__name > span");
    const fades = root.querySelectorAll("[data-menu-fade]");
    const frame = root.querySelector(".menu-sheet__frame");
    gsap.killTweensOf([root, cols, rows, fades, frame]);

    if (open) {
      gsap.set(root, { visibility: "visible", autoAlpha: 1 });
      if (reduced) {
        gsap.set([cols, rows, fades, frame], { clearProps: "all" });
        gsap.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
      } else {
        gsap.timeline()
          .fromTo(cols, { yPercent: -101 }, { yPercent: 0, duration: 0.8, ease: "expo.inOut", stagger: 0.055 }, 0)
          // the frame (its lines, the cross) only once the columns cover the page
          .fromTo(frame, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, 0.62)
          .fromTo(rows, { yPercent: 115 }, { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.06 }, 0.62)
          .fromTo(fades, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.04 }, 0.7);
      }
      root.querySelector<HTMLElement>(".menu-sheet__close")?.focus({ preventScroll: true });
    } else {
      const done = () => {
        gsap.set(root, { visibility: "hidden" });
        setExpanded(own >= 0 ? own : null); // the next time it opens as it did the first
      };
      if (reduced) gsap.to(root, { autoAlpha: 0, duration: 0.2, onComplete: done });
      else {
        gsap.timeline({ onComplete: done })
          .to(rows, { yPercent: -115, duration: 0.4, ease: "power3.in", stagger: 0.025 }, 0)
          .to(fades, { autoAlpha: 0, y: -10, duration: 0.3, ease: "power2.in" }, 0)
          .to(frame, { autoAlpha: 0, duration: 0.3, ease: "power1.in" }, 0.1)
          .to(cols, { yPercent: -101, duration: 0.75, ease: "expo.inOut", stagger: { each: 0.05, from: "end" } }, 0.3);
      }
      const back = menu.opener();
      if (back?.isConnected && back.offsetParent) back.focus({ preventScroll: true });
    }
  }, [open, mounted, own]);

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
    // a finger on the sheet never scrolls the page under it (older iOS ignores the overflow lock); the list still
    // scrolls when it doesn't fit
    const sheetEl = sheet.current;
    const onTouch = (e: TouchEvent) => {
      const list = (e.target as Element).closest?.<HTMLElement>(".menu-sheet__scroll");
      if (list && list.scrollHeight > list.clientHeight + 1) return;
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

  /** A link: a block on this page — the page goes there under the sheet, then the sheet lifts; another page opens. */
  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const { here, hash } = split(href);
    if (!here || !hash) return void menu.set(false);
    e.preventDefault();
    menu.set(false);
    let target = document.querySelector<HTMLElement>(hash);
    // a tab (a format on «Дизайн і сайти»): it is chosen, and the page goes to its block
    if (target?.matches('[role="tab"]')) {
      target.click();
      target = target.closest<HTMLElement>("section") ?? target;
    }
    requestAnimationFrame(() => {
      if (!target) return;
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      scrollToY(target.getBoundingClientRect().top + window.scrollY - margin, { immediate: true });
      focusBlock(target); // after the menu gave the focus back to the burger
    });
  };

  /** SaaS has no page: on the main page its panel in the services block (the ride takes it when it runs). */
  const goSaas = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onMain) return void menu.set(false);
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

  if (!mounted) return null;
  const L = nav.labels;
  const local = (hash: string) => (onMain ? hash : `${nav.home}${hash}`);
  const site = [
    { text: L.how, href: local("#approach") },
    { text: L.pricing, href: local("#pricing") },
    ...(nav.about ? [{ text: L.about, href: nav.about }] : []),
  ];
  return createPortal(
    <div ref={sheet} className="menu-sheet" id="site-menu" role="dialog" aria-modal="true" aria-label={t("nav.mobileLabel")} inert={!open}>
      <div className="menu-sheet__cols" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="menu-sheet__frame">
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
          <LangSwitch />
          <button className="menu-sheet__close" type="button" aria-label={t("menu.close")} onClick={() => menu.set(false)}>
            <span aria-hidden="true">{t("nav.closeShort")}</span>
            <i />
            <i />
          </button>
        </div>

        <div className="menu-sheet__scroll">
          <nav aria-label={t("nav.mobileLabel")}>
            <p className="menu-sheet__k" data-menu-fade="">
              {L.what}
            </p>
            <ul className="menu-sheet__list">
              {nav.services.map((s, i) => {
                const isOpen = expanded === i;
                const id = `menu-svc-${i}`;
                const head = (
                  <>
                    <span className="menu-sheet__name">
                      <span>{s.short}</span>
                    </span>
                    {s.price ? (
                      <span className="menu-sheet__price" data-menu-fade="">
                        {s.price}
                      </span>
                    ) : (
                      <span />
                    )}
                  </>
                );
                return (
                  <li key={s.n} className="menu-sheet__item" data-current={own === i ? "" : undefined}>
                    {s.subs.length ? (
                      <button className="menu-sheet__svc" type="button" aria-expanded={isOpen} aria-controls={id} onClick={() => setExpanded(isOpen ? null : i)}>
                        {head}
                        <svg className="menu-sheet__chev" viewBox="0 0 12 12" aria-hidden="true" focusable="false" data-menu-fade="">
                          <path d="M2.5 4.5 6 8l3.5-3.5" />
                        </svg>
                      </button>
                    ) : (
                      <a className="menu-sheet__svc" href={onMain ? "#svc-4" : s.href} onClick={goSaas}>
                        {head}
                        <Arrow />
                      </a>
                    )}
                    {s.subs.length > 0 && (
                      <div className="menu-sheet__subs" id={id} data-open={isOpen ? "" : undefined} inert={!isOpen}>
                        <ul>
                          {s.subs.map((sub, j) => {
                            const hash = sub.href.includes("#") ? `#${sub.href.split("#")[1]}` : null;
                            return (
                              <li key={sub.text} style={{ "--j": j } as React.CSSProperties}>
                                <a
                                  className="menu-sheet__sub"
                                  href={sub.href}
                                  aria-current={own === i && hash && current === hash ? "location" : undefined}
                                  onClick={(e) => go(e, sub.href)}
                                >
                                  <span>{sub.text}</span>
                                  {sub.price ? (
                                    <b>{sub.price}</b>
                                  ) : sub.tag ? (
                                    <span className={sub.example ? "menu-sheet__tag menu-sheet__tag--ex" : "menu-sheet__tag"}>{sub.tag}</span>
                                  ) : (
                                    <Arrow />
                                  )}
                                </a>
                              </li>
                            );
                          })}
                          <li style={{ "--j": s.subs.length } as React.CSSProperties}>
                            <a className="menu-sheet__sub menu-sheet__sub--page" href={s.href} onClick={(e) => go(e, s.href)}>
                              <span>{t("nav.openPage")}</span>
                              <Arrow />
                            </a>
                          </li>
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {pageLinks.length > 0 && (
              <>
                <p className="menu-sheet__k" data-menu-fade="">
                  {L.page}
                </p>
                <ul className="menu-sheet__page" data-menu-fade="">
                  {pageLinks.map((l) => (
                    <li key={l.href}>
                      <a className="menu-sheet__sub" href={l.href} aria-current={current === l.href ? "location" : undefined} onClick={(e) => go(e, l.href)}>
                        <span>{l.text}</span>
                        <Arrow />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </nav>

          <div className="menu-sheet__util">
            <div className="menu-sheet__site" data-menu-fade="">
              {site.map((l) => (
                <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)}>
                  {l.text}
                </a>
              ))}
            </div>
            <div className="menu-sheet__phones" data-menu-fade="">
              {nav.contacts.phones.map((p) => (
                <a key={p.href} href={p.href} aria-label={`${L.call}: ${p.text}`}>
                  <PhoneIcon />
                  {p.text}
                </a>
              ))}
            </div>
            <div className="menu-sheet__chats" data-menu-fade="">
              <a href={nav.contacts.telegram} target="_blank" rel="noopener" aria-label={L.telegram}>
                <TelegramIcon />
                Telegram
              </a>
              <a href={nav.contacts.viber} aria-label={L.viber}>
                <ViberIcon />
                Viber
              </a>
            </div>
          </div>
        </div>

        <div className="menu-sheet__foot" data-menu-fade="">
          <ButtonLink href={action.href} variant="primary" className="menu-sheet__cta" onClick={(e) => go(e, action.href)}>
            {action.text}
          </ButtonLink>
          <p className="menu-sheet__note">{t("preloader.note")}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
