import { getTranslations } from "next-intl/server";
import { FaqList } from "@/components/sections/faq/FaqList";
import { aiRich as R } from "@/components/ai/rich";
import { priceLine, type SitesFacts } from "@/components/sites/facts";
import "@/components/sections/faq/faq.css";

/**
 * 5 · Питання: the main page's FAQ (native <details>, the answers open with an animated height), the site part. Prices
 * and weeks in the answers from the configurator engine (facts). The fourth answer («Сайт уже є?») is linked from
 * block 2. On phones the runtime opens «Ви гарантуєте заявки?» instead of the first (the phone audit, 15 Oct).
 */
export async function SitesFaq({ facts }: { facts: SitesFacts }) {
  const t = await getTranslations("sites");
  const priced = new Set([1, 2, 8]);
  const items = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
    n,
    q: t(`faq.q.${n}`),
    a: priced.has(n) ? priceLine(t.raw(`faq.a.${n}`), facts) : t(`faq.a.${n}`),
  }));
  return (
    <section className="section ai-sec" id="faq" aria-labelledby="faq-title">
      <div className="container faq-wrap">
        <header className="s-head s-head--side">
          <p className="s-head__meta">
            <span className="s-head__index">5</span>
            <span>{t("x.nav.faq")}</span>
          </p>
          <h2 className="s-head__title" id="faq-title" data-split="">
            <span className="tone">{t.rich("x.faq.title", R)}</span>
          </h2>
          <p className="s-head__intro">{t.rich("faq.intro", R)}</p>
        </header>
        <FaqList>
          {items.map((item) => (
            <details className="faq__item" open={item.n === 1} id={item.n === 4 ? "faq-has" : undefined} key={item.n}>
              <summary>
                <span className="faq__num" aria-hidden="true">{item.n}</span>
                <span className="faq__q">{item.q}</span>
                <span className="faq__icon" aria-hidden="true"></span>
              </summary>
              <div className="faq__body">
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </FaqList>
      </div>
    </section>
  );
}
