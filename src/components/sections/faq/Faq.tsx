import { getTranslations } from "next-intl/server";
import { rich } from "@/lib/rich";
import { ButtonLink } from "@/components/ui/button/Button";
import { FaqList } from "./FaqList";
import { mainFaqItems } from "./items";
import "./faq.css";

/** 7 · Питання: native <details>; the answers open and close with an animated height. The questions and answers are
 *  items.ts's, which the page's structured data reads too. */
export async function Faq() {
  const t = await getTranslations();
  const items = await mainFaqItems();
  return (
    <section className="section" id="faq" aria-labelledby="faq-title">
      <div className="container faq-wrap">
        <header className="s-head s-head--side">
          <p className="s-head__meta" data-sr="">
            <span className="s-head__index">7</span>
            <span>{t("nav.faq")}</span>
          </p>
          <h2 className="s-head__title" id="faq-title" data-split="">
            <span className="tone">{t.rich("faq.title", rich)}</span>
          </h2>
          <p className="s-head__intro" data-sr="">{t("faq.intro")}</p>
          {/* the way to ask: a button of its own, not a link inside the sentence */}
          <p className="faq__write" data-sr="">
            <ButtonLink href="#contact" variant="primary" size="sm">{t("faq.write")}</ButtonLink>
          </p>
        </header>
        <FaqList>
          {items.map((item) => (
            <details className="faq__item" data-sr="" open={item.n === 1} key={item.n}>
              <summary>
                <span className="faq__num" aria-hidden="true">{item.n}</span>
                <span className="faq__q">{item.q}</span>
                <span className="faq__icon" aria-hidden="true"></span>
              </summary>
              <div className="faq__body">
                <p>{item.a}</p>
                {item.n === 1 && (
                  <p className="faq__more">
                    <a className="link" href="#pricing">{t("faq.a.1.link")}</a>
                  </p>
                )}
              </div>
            </details>
          ))}
        </FaqList>
      </div>
    </section>
  );
}
