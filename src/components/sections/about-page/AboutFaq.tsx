import { getTranslations } from "next-intl/server";
import { FaqList } from "@/components/sections/faq/FaqList";
import { aiRich as R } from "@/components/ai/rich";
import "@/components/sections/faq/faq.css";

/** The main page's questions this page needs (the product director, 3 Nov), in the reader's order: what happens after
 *  the launch, what is guaranteed, how long it takes, what is needed from you */
const QUESTIONS = [8, 6, 2, 3] as const;

/**
 * 4 · Питання: the main page's FAQ (FaqList: native <details>, the answers open with an animated height), four of its
 * questions in its own words. Only answer 8 is shortened: its first sentence («the site and the accounts are in your
 * name») is block 2's title already. The first question stands open; phones show all four. The rows come in one after
 * another as they reach the screen (React Bits' Animated List).
 */
export async function AboutFaq({ index }: { index: number }) {
  const t = await getTranslations();
  const a = await getTranslations("about");
  const answer = (n: (typeof QUESTIONS)[number]) => (n === 8 ? a("faq.a8") : t(`faq.a.${n}`));
  return (
    <section className="section about-faq" id="faq" aria-labelledby="faq-title">
      <div className="container faq-wrap">
        <header className="s-head s-head--side">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{a("faq.meta")}</span>
          </p>
          <h2 className="s-head__title" id="faq-title" data-split="">
            <span className="tone">{t.rich("faq.title", R)}</span>
          </h2>
          <p className="s-head__intro">{t("faq.intro")}</p>
        </header>
        <FaqList>
          {QUESTIONS.map((n, i) => (
            <details className="faq__item" data-in="" open={i === 0} key={n}>
              <summary>
                <span className="faq__num" aria-hidden="true">{i + 1}</span>
                <span className="faq__q">{t(`faq.q.${n}`)}</span>
                <span className="faq__icon" aria-hidden="true"></span>
              </summary>
              <div className="faq__body">
                <p>{answer(n)}</p>
              </div>
            </details>
          ))}
        </FaqList>
      </div>
    </section>
  );
}
