import { getTranslations } from "next-intl/server";
import { FaqList } from "@/components/sections/faq/FaqList";
import { aiRich } from "./rich";
import "@/components/sections/faq/faq.css";

type Item = { q: string; a: React.ReactNode };

/** An AI page's questions, on the main page's FAQ (native <details>, the answers open with an animated height). */
export async function AiFaq({ index, items, intro, after }: { index: number; items: Item[]; intro?: React.ReactNode; after?: React.ReactNode }) {
  const c = await getTranslations("aiCommon");
  return (
    <section className="section ai-sec" id="faq" aria-labelledby="faq-title">
      <div className="container faq-wrap">
        <header className="s-head s-head--side">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{c("nav.faq")}</span>
          </p>
          <h2 className="s-head__title" id="faq-title" data-split="">
            <span className="tone">{c.rich("faq.title", aiRich)}</span>
          </h2>
          {intro && <p className="s-head__intro">{intro}</p>}
        </header>
        <FaqList>
          {items.map((item, i) => (
            <details className="faq__item" open={i === 0} key={i}>
              <summary>
                <span className="faq__num" aria-hidden="true">{i + 1}</span>
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
      {after}
    </section>
  );
}
