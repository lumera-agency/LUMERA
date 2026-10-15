import { getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";

/** 7 · Кому ще може підійти: ideas only, tags on ivory. */
export async function Fit() {
  const t = await getTranslations();
  return (
    <section className="section section--ivory ai-sec" id="fit" aria-labelledby="fit-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta"><span className="s-head__index">7</span><span>{t("case.fit.meta")}</span></p>
          <h2 className="s-head__title" id="fit-title" data-split=""><span className="tone">{t.rich("case.fit.title", aiRich)}</span></h2>
          <p className="s-head__intro">{t("case.fit.intro")}</p>
        </header>
        <ul className="ai-tags">
          <li>{t("case.fit.1")}</li>
          <li>{t("case.fit.2")}</li>
          <li>{t("case.fit.3")}</li>
          <li>{t("case.fit.4")}</li>
          <li>{t("case.fit.5")}</li>
          <li>{t("case.fit.6")}</li>
        </ul>
        <p className="ai-fit__end">{t("case.fit.end")}</p>
      </div>
    </section>
  );
}
