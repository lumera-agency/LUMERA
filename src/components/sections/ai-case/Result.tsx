import { getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";

/** 3 · Результат: the manager's morning before and after (scene «time»; ivory). */
export async function Result() {
  const t = await getTranslations();
  return (
    <section className="section section--ivory ai-sec" id="result" aria-labelledby="result-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta"><span className="s-head__index">3</span><span>{t("aiCommon.result.meta")}</span></p>
          <h2 className="s-head__title" id="result-title" data-split=""><span className="tone">{t.rich("aiCommon.result.title", aiRich)}</span></h2>
        </header>
        <div className="ai-time" data-scene="time">
          <div className="ai-time__row">
            <p className="ai-time__label"><b>{t("aiCommon.result.before.label")}</b> <span>{t("aiCommon.result.before.v")}</span></p>
            <div className="ai-time__bar ai-time__bar--before" aria-hidden="true"><i /></div>
            <p className="ai-time__text">{t("aiCommon.result.before.text")}</p>
          </div>
          <div className="ai-time__row">
            <p className="ai-time__label"><b>{t("aiCommon.result.after.label")}</b> <span>{t("aiCommon.result.after.v")}</span></p>
            <div className="ai-time__bar ai-time__bar--after" aria-hidden="true"><i /><span className="ai-time__free"><span>{t("aiCommon.result.free")}</span></span></div>
            <p className="ai-time__text">{t("aiCommon.result.after.text")}</p>
          </div>
          <p className="ai-time__scale" aria-hidden="true"><span>0</span><span>15</span><span>30</span><span>45</span><span>{t("aiCommon.result.scale.end")}</span></p>
          <button className="ai-replay" type="button" data-replay="time"><span aria-hidden="true">↻</span> <span>{t("aiCommon.replay")}</span></button>
        </div>
        <p className="ai-total">{t.rich("aiCommon.result.total", aiRich)}</p>
      </div>
    </section>
  );
}
