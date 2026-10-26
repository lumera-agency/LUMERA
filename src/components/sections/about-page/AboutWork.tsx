import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";

/**
 * 2 · Як ми працюємо: why it is these three (the owner's words): no manager between you and the work, how many projects
 * they take on, and that a task that does not suit them is said at the first talk. No cards: the text on the page, the
 * title's first sentence as the head.
 */
export async function AboutWork({ index }: { index: number }) {
  const t = await getTranslations("about");
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
          <div className="about-work__text" data-sr="">
            {([1, 2, 3] as const).map((i) => <p key={i}>{t(`work.${i}`)}</p>)}
          </div>
        </div>
      </div>
    </section>
  );
}
