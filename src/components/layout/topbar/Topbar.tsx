"use client";
import { useEffect, useRef, useState } from "react";
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
import { useSiteNav } from "@/components/layout/site-nav/SiteNavProvider";
import { NavChevron, NavPanel } from "@/components/layout/site-nav/NavPanel";
import { navDisclosure, type NavDisclosure } from "@/components/layout/site-nav/disclosure";
import "./topbar.css";

/**
 * The compact page navigation: appears only once the hero has scrolled away. «Послуги ⌄» leads it on every page (its
 * panel hangs under the bar: NavPanel), then the page's own blocks. On phones the menu button opens the site menu
 * (MenuSheet). Another page passes its own links and CTA (ready text) and,
 * with `always`, keeps the bar on from the start (a page whose first screen has no header of its own); with `home`, its
 * logo leads to the main page instead of back to the top.
 */
export function Topbar({ links, cta, always = false, home }: { links?: readonly NavLink[]; cta?: NavCta; always?: boolean; home?: string } = {}) {
  const t = useTranslations();
  const [shown, setVisible] = useState(false);
  const visible = always || shown;
  const open = useMenuOpen();
  // the main page's own «Послуги» block: the panel stands for it
  const items = links ?? PAGE_NAV.filter((l) => l.href !== "#services").map((l) => ({ href: l.href, text: t(l.label), bar: !("bar" in l) }));
  const action = cta ?? { href: "#contact", text: t("cta.discuss") };
  const nav = useSiteNav();
  // a link to a service's page («Сайти» on the ads page): the panel has it already
  const covered = new Set(nav.services.map((s) => s.href));
  const root = useRef<HTMLDivElement>(null);
  const panels = useRef<NavDisclosure | null>(null);

  useEffect(() => {
    if (!root.current) return;
    const ctl = navDisclosure(root.current);
    panels.current = ctl;
    return () => ctl.destroy();
  }, []);
  // the bar slides away: its panel goes with it
  useEffect(() => {
    if (!visible) panels.current?.close();
  }, [visible]);

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
    <div className={cn("topbar", visible && "is-visible")} data-topbar inert={!visible} ref={root}>
      {home ? (
        <a className="logo logo--sm" href={home} aria-label={t("logo.home")}>
          <LogoContent />
        </a>
      ) : (
        <ScrollTopLink className="logo logo--sm" aria-label={t("logo.top")}>
          <LogoContent />
        </ScrollTopLink>
      )}
      {/* phones: the languages beside the logo (the left: who and in which language; the right: the
          button and the menu); wider screens keep theirs at the end */}
      <LangSwitch className="lang--start" />
      <nav className="topbar__nav" aria-label={t("topbar.nav.label")}>
        <button className="nav__link nav__trigger" type="button" aria-expanded="false" aria-controls="tbp-services" data-navp-trigger="services">
          <span>
            <RollText>{nav.labels.services}</RollText>
          </span>
          <NavChevron />
        </button>
        <NavPanel kind="services" id="tbp-services" />
        <NavPanel kind="cases" id="tbp-cases" />
        <span className="topbar__div" aria-hidden="true" />
        {items.filter((l) => l.bar !== false && !covered.has(l.href)).map((l) => (
          <a key={l.href} className="nav__link" href={l.href} data-navp-plain="">
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
          <span className="topbar__menu-label" aria-hidden="true">{t("topbar.menu")}</span>
        </button>
      </div>
      <div className="navp-scrim" aria-hidden="true" data-navp-scrim="" />
    </div>
  );
}
