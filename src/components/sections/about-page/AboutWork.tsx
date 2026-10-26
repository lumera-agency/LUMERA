import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { countWords, splitWords } from "./words";

/**
 * 2 · Як ми працюємо: why it is these three (the owner's words): no manager between you and the work, how many projects
 * they take on, and that a task that does not suit them is said at the first talk. No cards: the text on the page, the
 * title's first sentence as the head. The words come up one after another as the text reaches the screen, once
 * (21st.dev's Text Generate Effect, on opacity only; runtime: [data-gen]).
 */
export async function AboutWork({ index }: { index: number }) {
  const t = await getTranslations("about");
  // each paragraph's words, counted on from the one before (one run through the three)
  let from = 0;
  const paragraphs = ([1, 2, 3] as const).map((i) => {
    const raw = t.raw(`work.${i}`) as string;
    const words = splitWords(raw, (w, k) => <span className="about-gen" style={{ "--i": k } as React.CSSProperties}>{w}</span>, from);
    from += countWords(raw);
    return <p key={i}>{words}</p>;
  });
  return (
    <section className="section about-work" id="work" aria-labelledby="work-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("work.meta")}</span>
          </p>
          <h2 className="s-head__title" id="work-title" data-split="">
            <span className="tone">{t.rich("work.title", R)}</span>
          </h2>
        </header>
        <div className="about-cols">
          <div className="about-work__text" data-gen="">
            {paragraphs}
          </div>
        </div>
      </div>
    </section>
  );
}
