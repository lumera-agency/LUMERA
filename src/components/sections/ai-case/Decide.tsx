import { getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";

/** 5 · Як робот вирішує: four ads, a verdict each; the one that passes opens the foreman's notes (scene «decide»). */
export async function Decide() {
  const t = await getTranslations();
  return (
    <section className="section ai-sec" id="decide" aria-labelledby="decide-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta"><span className="s-head__index">5</span><span>{t("case.decide.meta")}</span></p>
          <h2 className="s-head__title" id="decide-title" data-split=""><span className="tone">{t.rich("case.decide.title", aiRich)}</span></h2>
          <p className="s-head__intro">{t("case.decide.intro")}</p>
        </header>
        <div className="ai-decide" data-scene="decide">
          <div className="ai-deck">
            <ul className="ai-cards">
              <li className="ai-ad" data-verdict="no">
                <p className="ai-ad__src"><span>Kleinanzeigen</span><span>{t("case.ad.wanted")}</span></p>
                <p className="ai-ad__t">{t("case.ad.1.t")}</p>
                <p className="ai-ad__meta">{t("case.ad.1.m")}</p>
                <p className="ai-ad__verdict"><span className="ai-stamp" aria-hidden="true">✕</span><span>{t("case.decide.v.1")}</span></p>
              </li>
              <li className="ai-ad" data-verdict="no">
                <p className="ai-ad__src"><span>Facebook</span><span>{t("case.ad.group")}</span></p>
                <p className="ai-ad__t">{t("case.ad.2.t")}</p>
                <p className="ai-ad__meta">{t("case.ad.2.m")}</p>
                <p className="ai-ad__verdict"><span className="ai-stamp" aria-hidden="true">✕</span><span>{t("case.decide.v.2")}</span></p>
              </li>
              <li className="ai-ad" data-verdict="no">
                <p className="ai-ad__src"><span>Kleinanzeigen</span><span>{t("case.ad.wanted")}</span></p>
                <p className="ai-ad__t">{t("case.ad.3.t")}</p>
                <p className="ai-ad__meta">{t("case.ad.3.m")}</p>
                <p className="ai-ad__verdict"><span className="ai-stamp" aria-hidden="true">✕</span><span>{t("case.decide.v.3")}</span></p>
              </li>
              <li className="ai-ad" data-verdict="yes">
                <p className="ai-ad__src"><span>Kleinanzeigen</span><span>{t("case.ad.wanted")}</span></p>
                <p className="ai-ad__t">{t("case.ad.4.t")}</p>
                <p className="ai-ad__meta">{t("case.ad.4.m")}</p>
                <p className="ai-ad__verdict"><span className="ai-stamp" aria-hidden="true">✓</span><span>{t("case.decide.v.4")}</span></p>
                <i className="ai-ad__lit" aria-hidden="true" />
              </li>
            </ul>
          </div>

          {/* the foreman inside the AI: what the job is, where, and what it is worth (no rates, no formulas) */}
          <div className="ai-pad">
            <p className="ai-pad__head"><span>{t("case.decide.pad.head")}</span><span>{t("case.ad.4.t")}</span></p>
            <ol className="ai-pad__lines">
              <li>{t("case.decide.pad.1")}</li>
              <li>{t("case.decide.pad.2")}</li>
              <li>{t.rich("case.decide.pad.3", aiRich)}</li>
              <li className="ai-pad__ok">{t("case.decide.pad.4")}</li>
            </ol>
          </div>
          <button className="ai-replay" type="button" data-replay="decide"><span aria-hidden="true">↻</span> <span>{t("aiCommon.replay")}</span></button>
        </div>
        <p className="ai-foot">{t("case.decide.foot")}</p>
      </div>
    </section>
  );
}
