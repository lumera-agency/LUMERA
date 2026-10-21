import { getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";

/** Що не входить (the owner, 21 Oct 2026): the honest limits, as a plain list on thin lines (no cards). */
export async function NotIncluded({ index }: { index: number }) {
  const t = await getTranslations("ai");
  return (
    <section className="section ai-sec ai-out" id="out" aria-labelledby="out-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("out.meta")}</span>
          </p>
          <h2 className="s-head__title" id="out-title" data-split="">
            <span className="tone">{t.rich("out.title", aiRich)}</span>
          </h2>
        </header>
        <ul className="ai-out__list">
          {[1, 2, 3, 4].map((i) => <li className="ai-out__item" key={i} data-rv="">{t(`out.${i}`)}</li>)}
        </ul>
      </div>
    </section>
  );
}
