import { getLocale, getTranslations } from "next-intl/server";
import { FaqList } from "@/components/sections/faq/FaqList";
import { aiRich as R } from "@/components/ai/rich";
import { aiHref } from "@/components/ai/links";
import { priceLine, type AdsFacts } from "@/components/ads/facts";
import "@/components/sections/faq/faq.css";

/**
 * 7 · Питання: the main page's FAQ (native <details>, the answers open with an animated height), the ads part. The
 * answers quote or shorten the main page's (budget, guarantees, the accounts); the sums and the setup time come from
 * the configurator engine (facts). Eleven questions in the reader's order: why us first (the trust block's four promises
 * and the honest line, moved here by the owner on 20 Oct), then money, which channel, the site, time, what is needed
 * from you, guarantees, GA4 and the source of each request, the accounts, management, prices.
 */
/** how many questions phones show before «Ще 6 питань» (the page was 17 screens long there, 20 Oct) */
const SHOWN = 5;
const COUNT = 11;
/** «А якщо сайту немає?»: the question that links to the sites page */
const SITES_Q = 4;

export async function AdsFaq({ index, facts }: { index: number; facts: AdsFacts }) {
  const t = await getTranslations("ads");
  const c = await getTranslations("aiCommon");
  const sites = aiHref(await getLocale(), "/dyzain-i-saity");
  const items = Array.from({ length: COUNT }, (_, i) => i + 1).map((n) => ({ n, q: t(`faq.q.${n}`), a: priceLine(t.raw(`faq.a.${n}`), facts) }));
  return (
    <section className="section ai-sec" id="faq" aria-labelledby="faq-title">
      <div className="container faq-wrap">
        <header className="s-head s-head--side">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("nav.faq")}</span>
          </p>
          <h2 className="s-head__title" id="faq-title" data-split="">
            <span className="tone">{c.rich("faq.title", R)}</span>
          </h2>
          <p className="s-head__intro">{t.rich("faq.intro", R)}</p>
        </header>
        <FaqList>
          {items.map((item) => (
            <details className={`faq__item${item.n > SHOWN ? " faq__item--more" : ""}`} open={item.n === 1} key={item.n}>
              <summary>
                <span className="faq__num" aria-hidden="true">{item.n}</span>
                <span className="faq__q">{item.q}</span>
                <span className="faq__icon" aria-hidden="true"></span>
              </summary>
              <div className="faq__body">
                <p>
                  {item.a}
                  {/* «А якщо сайту немає?»: the way to the sites page */}
                  {item.n === SITES_Q && (
                    <>
                      {" "}
                      <a className="link" href={sites}>{t("faq.sites")}</a>
                    </>
                  )}
                </p>
              </div>
            </details>
          ))}
        </FaqList>
        {/* phones: five questions first, the rest a tap away (runtime: initFaqMore) */}
        <button type="button" className="rk-faq-more" aria-expanded="false" data-faq-more="">
          {t("faq.more", { n: COUNT - SHOWN })}
        </button>
      </div>
    </section>
  );
}
