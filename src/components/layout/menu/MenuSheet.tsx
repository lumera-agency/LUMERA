"use client";
/*
 * The site menu on phones (both burgers open it). A black sheet drops in as the preloader's five
 * columns, left to right; the page's blocks rise out of their masks as large numbered rows (the one
 * you are in has a lime index), the CTA and the languages come up at the foot. Closing runs it back:
 * the rows slip up and the columns lift right to left. A row takes the page to its block under the
 * sheet, so the block is there when the columns lift.
 * A modal dialog in <body> (never inside a transformed header): the page holds still under it, Esc
 * and the cross close it, Tab stays inside, focus goes back to the burger. Reduced motion: a fade.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { gsap } from "@/lib/gsap";
import { focusBlock, scrollToY } from "@/lib/scroll";
import { PAGE_NAV, type NavCta, type NavLink } from "@/content/nav";
import { LogoContent } from "@/components/ui/logo/Logo";
import { ButtonLink } from "@/components/ui/button/Button";
import { LangSwitch } from "@/components/layout/lang-switch/LangSwitch";
import { menu, useMenuOpen } from "./menu-store";
import "./menu-sheet.css";

const noSubscribe = () => () => {};
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Another page passes its own rows and CTA as ready text (Topbar does the same); the main page uses PAGE_NAV. With
 *  `home` the logo leads to the main page instead of back to the top. */
export function MenuSheet({ links, cta, home }: { links?: readonly NavLink[]; cta?: NavCta; home?: string } = {}) {
  const t = useTranslations();
  const items = links ?? PAGE_NAV.map((l) => ({ href: l.href, text: t(l.label) }));
  const action = cta ?? { href: "#contact", text: t("cta.discuss") };
  const hrefs = items.map((l) => l.href).join(" ");
  const open = useMenuOpen();
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);
  const sheet = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const [current, setCurrent] = useState<string | null>(null);

  // the block being read: its row gets the lime index
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
    const cols = root.querySelectorAll(".menu-sheet__cols i");
    const rows = root.querySelectorAll(".menu-sheet__name > span");
    const fades = root.querySelectorAll("[data-menu-fade]");
    const rule = root.querySelector(".menu-sheet__rule");
    const frame = root.querySelector(".menu-sheet__frame");
    gsap.killTweensOf([root, cols, rows, fades, rule, frame]);

    if (open) {
      gsap.set(root, { visibility: "visible", autoAlpha: 1 });
      if (reduced) {
        gsap.set([cols, rows, fades, rule, frame], { clearProps: "all" });
        gsap.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
      } else {
        gsap.timeline()
          .fromTo(cols, { yPercent: -101 }, { yPercent: 0, duration: 0.8, ease: "expo.inOut", stagger: 0.055 }, 0)
          // the frame (its row lines, the cross) only once the columns cover the page
          .fromTo(frame, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, 0.62)
          .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "expo.inOut" }, 0.35)
          .fromTo(rows, { yPercent: 115 }, { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.06 }, 0.62)
          .fromTo(fades, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.05 }, 0.6);
      }
      root.querySelector<HTMLElement>(".menu-sheet__close")?.focus({ preventScroll: true });
    } else {
      const done = () => void gsap.set(root, { visibility: "hidden" });
      if (reduced) gsap.to(root, { autoAlpha: 0, duration: 0.2, onComplete: done });
      else {
        gsap.timeline({ onComplete: done })
          .to(rows, { yPercent: -115, duration: 0.4, ease: "power3.in", stagger: 0.025 }, 0)
          .to(fades, { autoAlpha: 0, y: -10, duration: 0.3, ease: "power2.in" }, 0)
          // the frame (its row lines, the cross) is gone before the columns bare the page
          .to(frame, { autoAlpha: 0, duration: 0.3, ease: "power1.in" }, 0.1)
          .to(cols, { yPercent: -101, duration: 0.75, ease: "expo.inOut", stagger: { each: 0.05, from: "end" } }, 0.3);
      }
      const back = menu.opener();
      if (back?.isConnected && back.offsetParent) back.focus({ preventScroll: true });
    }
  }, [open, mounted]);

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
    // a finger on the sheet never scrolls the page under it (older iOS ignores the overflow lock);
    // the rows still scroll when they don't fit
    const sheetEl = sheet.current;
    const frame = sheetEl?.querySelector<HTMLElement>(".menu-sheet__frame");
    const onTouch = (e: TouchEvent) => {
      if (frame && frame.scrollHeight > frame.clientHeight + 1) return;
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

  /** A row: the page goes to its block under the sheet, then the sheet lifts off it. */
  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // another page (a case, the main site): the link opens it, the sheet just closes
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

  if (!mounted) return null;
  return createPortal(
    <div
      ref={sheet}
      className="menu-sheet"
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label={t("nav.mobileLabel")}
      inert={!open}
    >
      <div className="menu-sheet__cols" aria-hidden="true">
        <i /><i /><i /><i /><i />
      </div>
      <span className="menu-sheet__glow" aria-hidden="true" data-menu-fade="" />
      <div className="menu-sheet__frame">
        <div className="menu-sheet__top">
          <a
            className="logo menu-sheet__logo"
            href={home ?? "#"}
            aria-label={t(home ? "logo.home" : "logo.top")}
            data-menu-fade=""
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
            <i /><i />
          </button>
        </div>

        <nav className="menu-sheet__nav" aria-label={t("nav.mobileLabel")}>
          <span className="menu-sheet__rule" aria-hidden="true" />
          <ol className="menu-sheet__list">
            {items.map((l, i) => (
              <li key={l.href}>
                <a
                  className="menu-sheet__link"
                  href={l.href}
                  aria-current={current === l.href ? "location" : undefined}
                  onClick={(e) => go(e, l.href)}
                >
                  <span className="menu-sheet__index" data-menu-fade="">{i + 1}</span>
                  <span className="menu-sheet__name">
                    <span>{l.text}</span>
                  </span>
                  <svg className="menu-sheet__arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false" data-menu-fade="">
                    <path d="M7 17 17 7M8.5 7H17v8.5" />
                  </svg>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="menu-sheet__foot">
          <div data-menu-fade="">
            <ButtonLink href={action.href} variant="primary" className="menu-sheet__cta" onClick={(e) => go(e, action.href)}>
              {action.text}
            </ButtonLink>
          </div>
          <div className="menu-sheet__meta" data-menu-fade="">
            <LangSwitch />
            <span>{t("preloader.note")}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
