"use client";
import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Logo } from "@/components/ui/logo/Logo";
import { ButtonLink } from "@/components/ui/button/Button";
import { RollText } from "@/components/fx/roll-text/RollText";
import { LangSwitch } from "@/components/layout/lang-switch/LangSwitch";
import { menu, useMenuOpen } from "@/components/layout/menu/menu-store";
import { useSiteNav } from "@/components/layout/site-nav/SiteNavProvider";
import { NavChevron, NavPanel } from "@/components/layout/site-nav/NavPanel";
import { navDisclosure } from "@/components/layout/site-nav/disclosure";
import { Contacts } from "@/components/layout/site-nav/Contacts";
import { boot, pageLetGo } from "@/lib/boot";
import { fadeJumpTo } from "@/lib/scroll";
import "./header.css";

/** The intro reveals the nav from .2 s: the panels wait for it (or 1.6 s after the preloader lets go). */
const NAV_SHOWN = 1600;

/**
 * The first screen's header: logo, «Послуги ⌄» and «Кейси ⌄» (their panels drop under the header: NavPanel), «Як
 * працюємо», «Ціни», «Про нас», UA · RU, the contact pill and the ghost CTA; on phones the burger opens the site menu
 * (MenuSheet).
 */
export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const open = useMenuOpen();
  const nav = useSiteNav();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let ready = false;
    let timer = 0;
    const go = () => void (ready = true);
    boot.introDone.promise.then(go);
    pageLetGo().then(() => (timer = window.setTimeout(go, NAV_SHOWN)));
    const ctl = navDisclosure(el, { ready: () => ready });
    return () => {
      clearTimeout(timer);
      ctl.destroy();
    };
  }, []);

  return (
    <header className="header" ref={root}>
      <div className="header__inner">
        <Logo
          href={locale === "uk" ? "/" : "/ru"}
          label={t("logo.home")}
          data-reveal="nav"
          onClick={(e) => {
            // on its own page it goes back to the top instead of loading the page again
            if (new URL(e.currentTarget.href).pathname !== location.pathname) return;
            e.preventDefault();
            if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
            fadeJumpTo(0);
          }}
        />

        <nav className="nav" aria-label={t("nav.label")}>
          <ul className="nav__list">
            {(["services", "cases"] as const).map((id) => (
              <li key={id}>
                <button
                  className="nav__link nav__trigger"
                  type="button"
                  aria-expanded="false"
                  aria-controls={`navp-${id}`}
                  data-navp-trigger={id}
                  data-reveal="nav"
                >
                  <RollText>{nav.labels[id]}</RollText>
                  <NavChevron />
                </button>
                <NavPanel kind={id} id={`navp-${id}`} />
              </li>
            ))}
            <li className="nav__item--how">
              <a className="nav__link" href="#approach" data-navp-plain="" data-reveal="nav">
                <RollText>{nav.labels.how}</RollText>
              </a>
            </li>
            <li>
              <a className="nav__link" href="#pricing" data-navp-plain="" data-reveal="nav">
                <RollText>{nav.labels.pricing}</RollText>
              </a>
            </li>
            {nav.about && (
              <li>
                <a className="nav__link" href={nav.about} data-navp-plain="" data-reveal="nav">
                  <RollText>{nav.labels.about}</RollText>
                </a>
              </li>
            )}
          </ul>
          <span className="nav__divider" aria-hidden="true" data-reveal="nav" />
          <LangSwitch data-reveal="nav" />
        </nav>

        {/* phones: the languages stay in sight beside the burger (the nav with its own switch is hidden) */}
        <LangSwitch className="lang--bar" data-reveal="nav" />

        <div className="header__cta" data-reveal="nav">
          <Contacts />
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
          <span className="menu-toggle__label" aria-hidden="true">{t("topbar.menu")}</span>
        </button>
      </div>
      <span className="header__rule" aria-hidden="true" data-rule />
      <div className="navp-scrim" aria-hidden="true" data-navp-scrim="" />
    </header>
  );
}
