"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { dpx, topbarHeight } from "@/lib/css";
import { PAGE_NAV } from "@/content/nav";
import { ButtonLink } from "@/components/ui/button/Button";
import { LogoContent } from "@/components/ui/logo/Logo";
import { RollText } from "@/components/fx/roll-text/RollText";
import { LangSwitch } from "@/components/layout/lang-switch/LangSwitch";
import { menu, useMenuOpen } from "@/components/layout/menu/menu-store";
import { ScrollTopLink } from "@/components/layout/page-nav/ScrollTopLink";
import "./topbar.css";

/**
 * The compact page navigation: appears only once the hero has scrolled away. On phones the menu
 * button opens the site menu (MenuSheet).
 */
export function Topbar() {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);
  const open = useMenuOpen();

  useEffect(() => {
    // the page after the hero decides (on touch screens the hero is sticky and never leaves), checked
    // on every scroll and resize: an observer only speaks at a crossing, and a jump, a glide overridden
    // half-way or a restored page could leave the bar out over the hero's own header
    const page = document.querySelector("[data-page]");
    if (!page) return;
    let queued = 0;
    const check = () => {
      queued = 0;
      const show = page.getBoundingClientRect().top <= topbarHeight() + dpx(8);
      setVisible(show);
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

  return (
    <div className={cn("topbar", visible && "is-visible")} data-topbar inert={!visible}>
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
        <button className="topbar__menu" type="button" aria-expanded={open} aria-controls="site-menu" aria-label={t("topbar.menu")} onClick={(e) => menu.toggle(e.currentTarget)}>
          <i />
          <i />
        </button>
      </div>
    </div>
  );
}
