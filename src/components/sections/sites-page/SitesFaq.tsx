import { getTranslations } from "next-intl/server";
import { FaqList } from "@/components/sections/faq/FaqList";
import { aiRich as R } from "@/components/ai/rich";
import { priceLine, type SitesFacts } from "@/components/sites/facts";
import "@/components/sections/faq/faq.css";

/**
 * 5 · Питання: the main page's FAQ (native <details>, the answers open with an animated height), the site part. Prices
 * and weeks in the answers from the configurator engine (facts). The fourth answer («Сайт уже є?») is linked from
 * block 2. Four questions show; the rest wait in a closed <details>, its summary the row «Показати інші питання» (the
 * owner, 27 Nov 2026: «сократить до 4 вопросов»): it opens without any script, the browser's find and Google's links to
 * an answer's words open it too (FaqList: the entrance, the focus, the tab's memory); the structured data keeps all
 * eleven. On phones the four start closed (the prices are on screen four times before them).
 */
/** how many questions show before «Показати інші питання» */
const SHOWN = 4;
/** The questions and answers, in order: the list below and the page's structured data (components/seo) read them
 *  here, so the two always say the same. */
export async function sitesFaqItems(facts: SitesFacts) {
  const t = await getTranslations("sites");
  // (9–11, the owner's keyword round of 23 Nov 2026: сайт-візитка, what the design includes, a studio or a freelancer)
  const priced = new Set([1, 2, 8, 9]);
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => ({
    n,
    q: t(`faq.q.${n}`),
    a: priced.has(n) ? priceLine(t.raw(`faq.a.${n}`), facts) : t(`faq.a.${n}`),
  }));
}

export async function SitesFaq({ facts }: { facts: SitesFacts }) {
  const t = await getTranslations("sites");
  const items = await sitesFaqItems(facts);
  const shown = items.slice(0, SHOWN);
  const rest = items.slice(SHOWN);
  const question = (item: (typeof items)[number]) => (
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
  );
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
        <FaqList closedOnPhone>
          {shown.map(question)}
          {rest.length > 0 && (
            <details className="faq__rest" data-fold="sites">
              {/* the row: the count where the numbers stand, the label in mono caps, the questions' disc */}
              <summary className="faq__fold" aria-label={t("faq.moreA", { n: rest.length })}>
                <span className="faq__fold-n" aria-hidden="true">+{rest.length}</span>
                <span className="faq__fold-t">{t("faq.more")}</span>
                <span className="faq__icon" aria-hidden="true"></span>
              </summary>
              {rest.map(question)}
            </details>
          )}
        </FaqList>
      </div>
    </section>
  );
}
