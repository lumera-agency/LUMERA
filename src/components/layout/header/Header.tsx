"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/logo/Logo";
import { ButtonLink } from "@/components/ui/button/Button";
import { RollText } from "@/components/fx/roll-text/RollText";
import { LangSwitch } from "@/components/layout/lang-switch/LangSwitch";
import "./header.css";

const LINKS = [
  { href: "#services", key: "nav.services" },
  { href: "#approach", key: "nav.approach" },
] as const;

/** The first screen's header: logo, two links, UA · RU, the ghost CTA; on phones a sheet menu. */
export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    if (!open) return;
    // opened a little way down the hero, the page below would show under the sheet: it opens at the top
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: "instant" });
    menu.current?.querySelector("a")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    const wide = matchMedia("(min-width: 861px)");
    const onWide = (e: MediaQueryListEvent) => e.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <header className="header">
      <div className="header__inner">
        <Logo href={locale === "uk" ? "/" : "/ru"} label={t("logo.home")} data-reveal="nav" />

        <nav className="nav" aria-label={t("nav.label")}>
          <ul className="nav__list">
            {LINKS.map((l) => (
              <li key={l.href} data-reveal="nav">
                <a className="nav__link" href={l.href}>
                  <RollText>{t(l.key)}</RollText>
                </a>
              </li>
            ))}
          </ul>
          <span className="nav__divider" aria-hidden="true" data-reveal="nav" />
          <LangSwitch data-reveal="nav" />
        </nav>

        <div className="header__cta" data-reveal="nav">
          <ButtonLink href="#contact" variant="ghost">{t("cta.discuss")}</ButtonLink>
        </div>

        <button
          ref={toggle}
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t("menu.close") : t("menu.open")}
          data-reveal="nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="menu-toggle__line" />
          <span className="menu-toggle__line" />
        </button>
      </div>
      <span className="header__rule" aria-hidden="true" data-rule />

      <div
        ref={menu}
        className={cn("mobile-menu", open && "is-open")}
        id="mobile-menu"
        inert={!open}
        onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
      >
        <nav className="mobile-menu__nav" aria-label={t("nav.mobileLabel")}>
          <a className="mobile-menu__link" href="#services">{t("nav.services")}</a>
          <a className="mobile-menu__link" href="#approach">{t("nav.approach")}</a>
          <a className="mobile-menu__link" href="#contact">{t("cta.discuss")}</a>
        </nav>
        <LangSwitch className="lang--menu" />
      </div>
    </header>
  );
}
