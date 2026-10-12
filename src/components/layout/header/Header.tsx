"use client";
import { useLocale, useTranslations } from "next-intl";
import { Logo } from "@/components/ui/logo/Logo";
import { ButtonLink } from "@/components/ui/button/Button";
import { RollText } from "@/components/fx/roll-text/RollText";
import { LangSwitch } from "@/components/layout/lang-switch/LangSwitch";
import { menu, useMenuOpen } from "@/components/layout/menu/menu-store";
import "./header.css";

const LINKS = [
  { href: "#services", key: "nav.services" },
  { href: "#approach", key: "nav.approach" },
] as const;

/** The first screen's header: logo, two links, UA · RU, the ghost CTA; on phones the burger opens the site menu (MenuSheet). */
export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const open = useMenuOpen();

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
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? t("menu.close") : t("menu.open")}
          data-reveal="nav"
          onClick={(e) => menu.toggle(e.currentTarget)}
        >
          <span className="menu-toggle__line" />
          <span className="menu-toggle__line" />
        </button>
      </div>
      <span className="header__rule" aria-hidden="true" data-rule />
    </header>
  );
}
