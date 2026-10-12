"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { dpx, topbarHeight } from "@/lib/css";
import { PAGE_NAV } from "@/content/nav";
import { ButtonLink } from "@/components/ui/button/Button";
import { LogoContent } from "@/components/ui/logo/Logo";
import { RollText } from "@/components/fx/roll-text/RollText";
import { LangSwitch } from "@/components/layout/lang-switch/LangSwitch";
import { ScrollTopLink } from "@/components/layout/page-nav/ScrollTopLink";
import "./topbar.css";

/**
 * The compact page navigation: appears only once the hero has scrolled away. On phones the links
 * and the language switch open from the menu button (a sheet that closes on a link, Esc, a tap
 * outside or tabbing past its last link).
 */
export function Topbar() {
  const t = useTranslations();
  const bar = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("[data-hero]");
    if (!hero) return;
    // the hero's own position decides, checked on every scroll and resize: an observer only speaks at
    // a crossing, and a jump, a glide overridden half-way or a restored page could leave the bar out
    // over the hero's own header
    let queued = 0;
    const check = () => {
      queued = 0;
      const show = hero.getBoundingClientRect().bottom <= topbarHeight() + dpx(8);
      setVisible(show);
      if (!show) setOpen(false);
    };
    const queue = () => {
      if (!queued) queued = requestAnimationFrame(check);
    };
    queue();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    window.addEventListener("pageshow", queue);
    return () => {
      cancelAnimationFrame(queued);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      window.removeEventListener("pageshow", queue);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      menuBtn.current?.focus();
    };
    const down = (e: PointerEvent) => !bar.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", down);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", down);
    };
  }, [open]);

  return (
    <div
      ref={bar}
      className={cn("topbar", visible && "is-visible", open && "is-menu")}
      data-topbar
      inert={!visible}
      onBlur={(e) => open && !bar.current?.contains(e.relatedTarget as Node) && setOpen(false)}
    >
      <ScrollTopLink className="logo logo--sm" aria-label={t("logo.top")}>
        <LogoContent />
      </ScrollTopLink>
      <nav className="topbar__nav" aria-label={t("topbar.nav.label")}>
        {PAGE_NAV.filter((l) => !("bar" in l)).map((l) => (
          <a key={l.href} className="nav__link" href={l.href}>
            <span><RollText>{t(l.label)}</RollText></span>
          </a>
        ))}
      </nav>
      <div className="topbar__end">
        <LangSwitch />
        <ButtonLink href="#contact" variant="ghost" size="xs">{t("cta.discuss")}</ButtonLink>
        <button ref={menuBtn} className="topbar__menu" type="button" aria-expanded={open} aria-controls="topbar-sheet" aria-label={t("topbar.menu")} onClick={() => setOpen((o) => !o)}>
          <i />
          <i />
        </button>
      </div>
      <div className="topbar__sheet" id="topbar-sheet" hidden={!open} onClick={(e) => (e.target as HTMLElement).closest('a[href^="#"]:not(.lang__link)') && setOpen(false)}>
        <nav aria-label={t("topbar.nav.label")}>
          {PAGE_NAV.map((l) => (
            <a key={l.href} href={l.href}>
              <span>{t(l.label)}</span>
            </a>
          ))}
        </nav>
        <LangSwitch />
      </div>
    </div>
  );
}
