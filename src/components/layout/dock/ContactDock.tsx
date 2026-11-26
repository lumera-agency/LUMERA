"use client";
/*
 * The contact dock (the owner, 26 Nov 2026: «липка панель внизу на мобільних: Telegram, Viber, Подзвонити», on every
 * page): three buttons pinned to the foot of a phone's screen. It comes in once the first screen has passed (the first
 * screens are drawn to the screen's full height, their own button at the foot), at once on a page whose first screen
 * keeps room for it (main[data-dock="now"], the sites page), and steps away while a field is being
 * typed in (the keyboard would lift it over the field) and while the menu is open (dock.css). While it shows, the
 * root carries .dock-on: the bars that sit at the foot (the request button, the calculators' sum bars, the button
 * back up) stand on it instead (dock.css, BackToTop).
 *
 * It also serves the calculators' «Написати в Telegram» links (tg-quote.ts), as it is on every page.
 */
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useSiteNav } from "@/components/layout/site-nav/SiteNavProvider";
import { PhoneIcon, TelegramIcon, ViberIcon } from "@/components/layout/site-nav/Contacts";
import { listenTgQuotes } from "./tg-quote";
import "./dock.css";

/** the screen width up to which it shows (the header's and the bars' phone layout) */
const PHONES = "(max-width: 860px)";
/** it comes in past this share of the first screen */
const AFTER = 0.6;

export function ContactDock() {
  const nav = useSiteNav();
  const t = useTranslations("dock");
  const root = useRef<HTMLElement>(null);

  useEffect(() => listenTgQuotes(), []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const html = document.documentElement;
    const phones = window.matchMedia(PHONES);
    let typing = false;
    let shown: boolean | null = null;
    let queued = 0;
    // a page whose first screen keeps room for it (main[data-dock="now"]: the sites page, the owner, 26 Nov 2026) has it
    // from the start; elsewhere it comes in past the first screen
    const now = () => !!document.querySelector('main[data-dock="now"]');
    const check = () => {
      queued = 0;
      const on = phones.matches && !typing && (now() || window.scrollY > window.innerHeight * AFTER);
      if (on === shown) return;
      shown = on;
      el.classList.toggle("is-on", on);
      el.inert = !on;
      html.classList.toggle("dock-on", on);
    };
    const queue = () => {
      if (!queued) queued = requestAnimationFrame(check);
    };
    const field = (n: EventTarget | null) => n instanceof HTMLElement && n.matches("input:not([type=checkbox]):not([type=radio]):not([type=hidden]), textarea, select, [contenteditable='true']");
    const onFocusIn = (e: FocusEvent) => {
      if (!field(e.target)) return;
      typing = true;
      queue();
    };
    const onFocusOut = () => {
      // (the next field takes the focus right after: look once it has)
      window.setTimeout(() => {
        typing = field(document.activeElement);
        queue();
      }, 0);
    };
    check();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    phones.addEventListener("change", queue);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      cancelAnimationFrame(queued);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      phones.removeEventListener("change", queue);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      html.classList.remove("dock-on");
    };
  }, []);

  const c = nav.contacts;
  return (
    <nav className="dock" aria-label={t("label")} ref={root} inert>
      <a className="dock__btn" href={c.telegram} target="_blank" rel="noopener">
        <TelegramIcon />
        <span>Telegram</span>
      </a>
      <a className="dock__btn" href={c.viber}>
        <ViberIcon />
        <span>Viber</span>
      </a>
      <a className="dock__btn dock__btn--call" href={c.phones[0]?.href}>
        <PhoneIcon />
        <span>{t("call")}</span>
      </a>
    </nav>
  );
}
