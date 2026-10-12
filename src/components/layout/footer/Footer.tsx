import { getTranslations } from "next-intl/server";
import { PAGE_NAV } from "@/content/nav";
import { ButtonLink } from "@/components/ui/button/Button";
import { LangSwitch } from "@/components/layout/lang-switch/LangSwitch";
import { ScrollTopLink } from "@/components/layout/page-nav/ScrollTopLink";
import { rich } from "@/lib/rich";
import { Wordmark } from "./Wordmark";
import "./footer.css";

/** The footer: the claim and CTA, the page index, the bottom line, and LUMERA in liquid chrome. */
export async function Footer() {
  const t = await getTranslations();
  return (
    <footer className="footer">
      <div className="container footer__top">
        <div className="footer__lead">
          <p className="footer__claim" data-cursor-lens="">{t.rich("footer.claim", rich)}</p>
          <ButtonLink href="#contact" variant="primary" size="sm">{t("cta.discuss")}</ButtonLink>
        </div>
        <nav className="footer__nav" aria-label={t("footer.nav.label")}>
          {PAGE_NAV.map((l) => (
            <a key={l.href} href={l.href}>
              <span>{t(l.label)}</span>
            </a>
          ))}
        </nav>
      </div>
      <div className="container footer__bottom">
        <p className="footer__legal">{t("footer.legal")}</p>
        <p className="footer__contacts"><a href="#contact">{t("footer.write")}</a></p>
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
