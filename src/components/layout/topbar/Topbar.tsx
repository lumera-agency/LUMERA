"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { dpx, topbarHeight } from "@/lib/css";
import { PAGE_NAV, type NavCta, type NavLink } from "@/content/nav";
import { ButtonLink } from "@/components/ui/button/Button";
import { LogoContent } from "@/components/ui/logo/Logo";
import { RollText } from "@/components/fx/roll-text/RollText";
import { LangSwitch } from "@/components/layout/lang-switch/LangSwitch";
import { menu, useMenuOpen } from "@/components/layout/menu/menu-store";
import { ScrollTopLink } from "@/components/layout/page-nav/ScrollTopLink";
import "./topbar.css";

/**
 * The compact page navigation: appears only once the hero has scrolled away. On phones the menu
 * button opens the site menu (MenuSheet). Another page passes its own links and CTA (ready text) and,
 * with `always`, keeps the bar on from the start (a page whose first screen has no header of its own).
 */
export function Topbar({ links, cta, always = false }: { links?: readonly NavLink[]; cta?: NavCta; always?: boolean } = {}) {
  const t = useTranslations();
  const [shown, setVisible] = useState(false);
  const visible = always || shown;
  const open = useMenuOpen();
  const items = links ?? PAGE_NAV.map((l) => ({ href: l.href, text: t(l.label), bar: !("bar" in l) }));
  const action = cta ?? { href: "#contact", text: t("cta.discuss") };

  useEffect(() => {
    if (always) return;
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
  }, [always]);

  return (
    <div className={cn("topbar", visible && "is-visible")} data-topbar inert={!visible}>
      <ScrollTopLink className="logo logo--sm" aria-label={t("logo.top")}>
        <LogoContent />
      </ScrollTopLink>
      {/* phones: the languages beside the logo (the left: who and in which language; the right: the
          button and the menu); wider screens keep theirs at the end */}
      <LangSwitch className="lang--start" />
      <nav className="topbar__nav" aria-label={t("topbar.nav.label")}>
        {items.filter((l) => l.bar !== false).map((l) => (
          <a key={l.href} className="nav__link" href={l.href}>
            <span><RollText>{l.text}</RollText></span>
          </a>
        ))}
      </nav>
      <div className="topbar__end">
        <LangSwitch />
        <ButtonLink href={action.href} variant="ghost" size="xs">{action.text}</ButtonLink>
        <button className="topbar__menu" type="button" aria-expanded={open} aria-controls="site-menu" aria-label={t("topbar.menu")} onClick={(e) => menu.toggle(e.currentTarget)}>
          <i />
          <i />
        </button>
      </div>
    </div>
  );
}
