import { getLocale, getTranslations } from "next-intl/server";
import { studioName } from "@/config/site";
import { getSiteNav } from "@/content/site-nav";
import { ButtonLink } from "@/components/ui/button/Button";
import { aiHref } from "@/components/ai/links";
import { MailIcon, PhoneIcon, TelegramIcon, ViberIcon } from "@/components/layout/site-nav/Contacts";
import { CopyButton } from "./CopyButton";
import "./kontakty.css";

/*
 * «Контакти» (the owner, 15 Nov 2026: one page with the request form, the mail, the phones, every way to reach the
 * studio, from the main page's parts): 1 the first screen, its words on the left, the ways to reach us on the right as
 * one glass board (the phones, Telegram, Viber, the mail, each a row with its icon, a copy button for the numbers and
 * the mail); 2 the main page's request block (sections/contact). The numbers, the messengers and the mail come from
 * config/contacts through the site's nav data, as the header, the menu and the footer have them.
 */

type Row = { key: string; icon: React.ReactNode; k: string; v: string; href: string; label?: string; blank?: boolean; copy?: string };

/** 1 · the first screen: the crumbs, the title, a line on how to reach us, the request button; the board beside */
export async function KontaktyHero() {
  const t = await getTranslations("kontakty");
  const c = await getTranslations("aiCommon");
  const locale = await getLocale();
  const nav = await getSiteNav(locale);
  const L = nav.labels;
  const rows: Row[] = [
    ...nav.contacts.phones.map((p) => ({ key: p.href, icon: <PhoneIcon />, k: t("board.phone"), v: p.text, href: p.href, label: `${L.call}: ${p.text}`, copy: p.href.replace(/^tel:/, "") })),
    { key: "telegram", icon: <TelegramIcon />, k: "Telegram", v: L.telegram, href: nav.contacts.telegram, blank: true },
    { key: "viber", icon: <ViberIcon />, k: "Viber", v: L.viber, href: nav.contacts.viber },
    { key: "mail", icon: <MailIcon />, k: t("board.mail"), v: nav.contacts.email.text, href: nav.contacts.email.href, copy: nav.contacts.email.text },
  ];
  return (
    <section className="ai-hero lg-hero kt-hero" id="zviazok" aria-labelledby="kt-title">
      {/* a shade under the title, so the grid's rings stay behind the words */}
      <span className="lg-hero__shade" aria-hidden="true" />
      <div className="ai-hero__in">
        <div className="ai-hero__copy">
          <nav className="ai-crumbs" aria-label={c("crumbs.label")}>
            <a href={aiHref(locale, "/")}>{studioName}</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{t("crumb")}</span>
          </nav>
          <h1 className="s-head__title s-head__title--stone ai-hero__title lg-hero__title kt-hero__title" id="kt-title">
            <span className="tone">{t("hero.title")}</span>
          </h1>
          <p className="ai-hero__lead">{t.rich("hero.lead", { nb: (chunks) => <span className="kt-nb">{chunks}</span> })}</p>
          <div className="kt-hero__act">
            <ButtonLink href="#contact" variant="primary">{t("hero.cta")}</ButtonLink>
          </div>
        </div>
        <div className="ai-hero__visual kt-board lg-glass">
          <p className="kt-board__label" id="kt-board">{L.contacts}</p>
          <ul className="kt-board__list" aria-labelledby="kt-board">
            {rows.map((row) => (
              <li className="kt-row" key={row.key}>
                <a className="kt-row__link" href={row.href} aria-label={row.label} {...(row.blank ? { target: "_blank", rel: "noopener" } : {})}>
                  <span className="kt-row__ico">{row.icon}</span>
                  <span className="kt-row__text">
                    <span className="kt-row__k">{row.k}</span>
                    <span className="kt-row__v">{row.v}</span>
                  </span>
                  <svg className="kt-row__go" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M7 17 17 7M8.5 7H17v8.5" />
                  </svg>
                </a>
                {row.copy && <CopyButton text={row.copy} label={t("board.copy")} done={t("board.copied")} />}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
