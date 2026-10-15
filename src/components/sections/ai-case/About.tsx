import { getTranslations } from "next-intl/server";

/** 2 · Про кейс: the case in one paragraph, set large, and its facts (ivory). */
export async function About() {
  const t = await getTranslations();
  return (
    <section className="section section--ivory ai-sec" id="about" aria-labelledby="about-title">
      <div className="container">
        <header className="s-head s-head--meta">
          <p className="s-head__meta"><span className="s-head__index">2</span><span>{t("case.about.meta")}</span></p>
          <h2 className="visually-hidden" id="about-title">{t("case.about.meta")}</h2>
        </header>
        <div className="ai-about">
          <p className="ai-about__text">{t("case.hero.lead")}</p>
          <dl className="ai-about__facts">
            <div className="ai-about__f"><dt>{t("case.about.k.client")}</dt><dd>{t("case.about.v.client")}</dd></div>
            <div className="ai-about__f"><dt>{t("case.about.k.src")}</dt><dd>{t("case.about.v.src")}</dd></div>
            <div className="ai-about__f"><dt>{t("case.about.k.vol")}</dt><dd>{t("case.about.v.vol")}</dd></div>
            <div className="ai-about__f"><dt>{t("case.about.k.radius")}</dt><dd>{t("case.about.v.radius")}</dd></div>
            <div className="ai-about__f"><dt>{t("case.about.k.dev")}</dt><dd>{t("case.about.v.dev")}</dd></div>
            <div className="ai-about__f ai-about__f--made"><dt>{t("case.about.k.made")}</dt><dd>Lumera</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}
