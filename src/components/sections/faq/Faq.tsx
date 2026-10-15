import { getTranslations } from "next-intl/server";
import { rich } from "@/lib/rich";
import { PRICES } from "@/components/sections/services/copy";
import { ButtonLink } from "@/components/ui/button/Button";
import { FaqList } from "./FaqList";
import "./faq.css";

/** 7 · Питання: native <details>; the answers open and close with an animated height. */
export async function Faq() {
  const t = await getTranslations();
  const prices = PRICES;
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
          <details className="faq__item" data-sr="" open>
            <summary>
              <span className="faq__num" aria-hidden="true">1</span>
              <span className="faq__q">{t("faq.q.1")}</span>
              <span className="faq__icon" aria-hidden="true"></span>
            </summary>
            <div className="faq__body">
              <p>{t("faq.a.1.text", prices)}</p>
              <p className="faq__more">
                <a className="link" href="#pricing">{t("faq.a.1.link")}</a>
              </p>
            </div>
          </details>
          <details className="faq__item" data-sr="">
            <summary>
              <span className="faq__num" aria-hidden="true">2</span>
              <span className="faq__q">{t("faq.q.2")}</span>
              <span className="faq__icon" aria-hidden="true"></span>
            </summary>
            <div className="faq__body">
              <p>{t("faq.a.2")}</p>
            </div>
          </details>
          <details className="faq__item" data-sr="">
            <summary>
              <span className="faq__num" aria-hidden="true">3</span>
              <span className="faq__q">{t("faq.q.3")}</span>
              <span className="faq__icon" aria-hidden="true"></span>
            </summary>
            <div className="faq__body">
              <p>{t("faq.a.3")}</p>
            </div>
          </details>
          <details className="faq__item" data-sr="">
            <summary>
              <span className="faq__num" aria-hidden="true">4</span>
              <span className="faq__q">{t("faq.q.4")}</span>
              <span className="faq__icon" aria-hidden="true"></span>
            </summary>
            <div className="faq__body">
              <p>{t("faq.a.4")}</p>
            </div>
          </details>
          <details className="faq__item" data-sr="">
            <summary>
              <span className="faq__num" aria-hidden="true">5</span>
              <span className="faq__q">{t("faq.q.5")}</span>
              <span className="faq__icon" aria-hidden="true"></span>
            </summary>
            <div className="faq__body">
              <p>{t("faq.a.5")}</p>
            </div>
          </details>
          <details className="faq__item" data-sr="">
            <summary>
              <span className="faq__num" aria-hidden="true">6</span>
              <span className="faq__q">{t("faq.q.6")}</span>
              <span className="faq__icon" aria-hidden="true"></span>
            </summary>
            <div className="faq__body">
              <p>{t("faq.a.6")}</p>
            </div>
          </details>
          <details className="faq__item" data-sr="">
            <summary>
              <span className="faq__num" aria-hidden="true">7</span>
              <span className="faq__q">{t("faq.q.7")}</span>
              <span className="faq__icon" aria-hidden="true"></span>
            </summary>
            <div className="faq__body">
              <p>{t("faq.a.7")}</p>
            </div>
          </details>
          <details className="faq__item" data-sr="">
            <summary>
              <span className="faq__num" aria-hidden="true">8</span>
              <span className="faq__q">{t("faq.q.8")}</span>
              <span className="faq__icon" aria-hidden="true"></span>
            </summary>
            <div className="faq__body">
              <p>{t("faq.a.8")}</p>
            </div>
          </details>
          <details className="faq__item" data-sr="">
            <summary>
              <span className="faq__num" aria-hidden="true">9</span>
              <span className="faq__q">{t("faq.q.9")}</span>
              <span className="faq__icon" aria-hidden="true"></span>
            </summary>
            <div className="faq__body">
              <p>{t("faq.a.9", prices)}</p>
            </div>
          </details>
        </FaqList>
      </div>
    </section>
  );
}
