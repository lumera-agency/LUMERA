import { getLocale, getTranslations } from "next-intl/server";
import { PAGE_NAV, type NavCta, type NavLink } from "@/content/nav";
import { ButtonLink } from "@/components/ui/button/Button";
import { LangSwitch } from "@/components/layout/lang-switch/LangSwitch";
import { ScrollTopLink } from "@/components/layout/page-nav/ScrollTopLink";
import { rich } from "@/lib/rich";
import { getSiteNav } from "@/content/site-nav";
import { Wordmark } from "./Wordmark";
import { FooterMap } from "./FooterMap";
import "./footer.css";

/**
 * The footer: the claim and CTA, the page index, the map of the site (FooterMap), the bottom line, and the brand's name
 * in liquid chrome. Another page passes its own claim, CTA and index (ready text); the main page uses its messages and
 * PAGE_NAV. The top (the owner, 3 Nov, on every page): the claim large with its CTA on one half; on the other, past a
 * hairline, the index as rows with an arrow each, whose own hairline draws itself in lime as the pointer comes (the
 * plain pointer there, the cursor's lens over the claim).
 */
export async function Footer({ claim, links, cta }: { claim?: React.ReactNode; links?: readonly NavLink[]; cta?: NavCta } = {}) {
  const t = await getTranslations();
  const nav = await getSiteNav(await getLocale());
  // a link to a service's page («Дизайн і розробка сайтів» on the ads page): the map below has it already
  const services = new Set(nav.services.map((s) => s.href));
  const items = (links ?? PAGE_NAV.map((l) => ({ href: l.href, text: t(l.label) }))).filter((l) => !services.has(l.href));
  const action = cta ?? { href: "#contact", text: t("cta.discuss") };
  const words = claim ?? t.rich("footer.claim", rich);
  return (
    <footer className="footer">
      <div className="container footer__top">
        <div className="footer__lead">
          <p className="footer__claim" data-cursor-lens="">{words}</p>
          <ButtonLink href={action.href} variant="primary" size="sm">{action.text}</ButtonLink>
        </div>
        <nav className="footer__index" aria-label={t("footer.nav.label")}>
          {items.map((l) => (
            <a key={l.href} href={l.href} className="footer__row">
              <i className="footer__row-line" aria-hidden="true" />
              <span className="footer__row-name">{l.text}</span>
              <span className="footer__row-go" aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>
      <FooterMap />
      <div className="container footer__bottom">
        <p className="footer__legal">{t("footer.legal")}</p>
        <div className="footer__end">
          <LangSwitch />
          <ScrollTopLink className="footer__up">
            <span>{t("footer.up.span")}</span>{" "}
            <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 19.5v-15M6 10.5l6-6 6 6" /></svg>
          </ScrollTopLink>
        </div>
      </div>
      <Wordmark />
    </footer>
  );
}
