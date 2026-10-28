import { getLocale, getTranslations } from "next-intl/server";
import { getSiteNav } from "@/content/site-nav";
import { PhoneIcon, TelegramIcon, ViberIcon } from "@/components/layout/site-nav/Contacts";
import { FooterCases } from "./FooterCases";

/**
 * The footer's map of the site, on every page: the services with their «від» prices, the clients' cases, the studio's
 * own links and the contacts, in four columns with a hairline between them, as the header's panel has them. Phones:
 * the services across, the cases folded under a plus (FooterCases), the studio's links in a row, the contacts.
 */
export async function FooterMap() {
  const t = await getTranslations();
  const nav = await getSiteNav(await getLocale());
  const L = nav.labels;
  const studio = [
    { text: L.how, href: nav.approach },
    { text: L.pricing, href: nav.pricing },
    { text: t("nav.faq"), href: `${nav.home}#faq` },
    ...(nav.about ? [{ text: L.about, href: nav.about }] : []),
  ];
  return (
    <nav className="container footer__map" aria-label={t("footer.map.label")}>
      <div className="footer__col footer__col--svc">
        <p className="footer__k">{L.services}</p>
        <ul>
          {nav.services.map((s) => (
            <li key={s.n}>
              <a className="footer__link" href={s.href}>
                <span>{s.name}</span>
                {s.price && <b>{s.price}</b>}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <FooterCases label={L.casesMore} items={[...nav.cases.map((c) => ({ text: c.name, href: c.href })), { text: nav.assistant.name, href: nav.assistant.href }]} />
      <div className="footer__col footer__col--studio">
        <p className="footer__k">{t("footer.map.studio")}</p>
        <ul>
          {studio.map((l) => (
            <li key={l.href}>
              <a className="footer__link" href={l.href}>
                <span>{l.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="footer__col footer__col--contacts">
        <p className="footer__k">{t("footer.map.contacts")}</p>
        <ul className="footer__phones">
          {nav.contacts.phones.map((p) => (
            <li key={p.href}>
              <a className="footer__link footer__link--phone" href={p.href} aria-label={`${L.call}: ${p.text}`}>
                <PhoneIcon />
                <span>{p.text}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="footer__chats">
          <a href={nav.contacts.telegram} target="_blank" rel="noopener" aria-label={L.telegram}>
            <TelegramIcon />
            Telegram
          </a>
          <a href={nav.contacts.viber} aria-label={L.viber}>
            <ViberIcon />
            Viber
          </a>
        </div>
      </div>
    </nav>
  );
}
