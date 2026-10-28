import { getTranslations } from "next-intl/server";
import { PAGE_NAV, type NavCta, type NavLink } from "@/content/nav";
import { ButtonLink } from "@/components/ui/button/Button";
import { LangSwitch } from "@/components/layout/lang-switch/LangSwitch";
import { ScrollTopLink } from "@/components/layout/page-nav/ScrollTopLink";
import { rich } from "@/lib/rich";
import { Wordmark } from "./Wordmark";
import "./footer.css";

/** The footer: the claim and CTA, the page index, the bottom line, and the brand's name in liquid chrome. Another page passes
 *  its own claim, CTA and index (ready text); the main page uses its messages and PAGE_NAV. */
export async function Footer({ claim, links, cta }: { claim?: React.ReactNode; links?: readonly NavLink[]; cta?: NavCta } = {}) {
  const t = await getTranslations();
  const items = links ?? PAGE_NAV.map((l) => ({ href: l.href, text: t(l.label) }));
  const action = cta ?? { href: "#contact", text: t("cta.discuss") };
  return (
    <footer className="footer">
      <div className="container footer__top">
        <div className="footer__lead">
          <p className="footer__claim" data-cursor-lens="">{claim ?? t.rich("footer.claim", rich)}</p>
          <ButtonLink href={action.href} variant="primary" size="sm">{action.text}</ButtonLink>
        </div>
        <nav className="footer__nav" aria-label={t("footer.nav.label")}>
          {items.map((l) => (
            <a key={l.href} href={l.href}>
              <span>{l.text}</span>
            </a>
          ))}
        </nav>
      </div>
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
