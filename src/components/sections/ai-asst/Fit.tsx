import { getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";

/** 4 · Кому ще: any business that books clients for a time (ivory, tags). */
export async function Fit() {
  const t = await getTranslations();
  return (
    <section className="section section--ivory ai-sec ai-also" id="fit" aria-labelledby="fit-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta"><span className="s-head__index">4</span><span>{t("asst.fit.meta")}</span></p>
          <h2 className="s-head__title" id="fit-title" data-split=""><span className="tone">{t.rich("asst.fit.title", aiRich)}</span></h2>
          <p className="s-head__intro">{t("asst.fit.intro")}</p>
        </header>
        <ul className="ai-tags">
          <li>{t("asst.tag.1")}</li>
          <li>{t("asst.tag.2")}</li>
          <li>{t("asst.tag.3")}</li>
          <li>{t("asst.tag.4")}</li>
          <li>{t("asst.tag.5")}</li>
          <li>{t("asst.tag.6")}</li>
          <li>{t("asst.tag.7")}</li>
        </ul>
        <p className="ai-fit__end">{t("case.fit.end")}</p>
      </div>
    </section>
  );
}
