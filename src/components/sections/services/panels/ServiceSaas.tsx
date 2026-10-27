import { getTranslations } from "next-intl/server";

/** 4 · SaaS (v2): a product's main screen builds itself — wireframe → interface → release. Markup ported 1:1 from website-v2; the clip is demos/timelines.js. */
export async function ServiceSaas() {
  const t = await getTranslations();
  return (
    <article className="service" id="svc-4" data-sr="">
      <div className="service__demo">
        <button className="demo-replay" type="button" data-replay="" aria-label={t("services.replay.label")}>
          <span className="demo-replay__icon" aria-hidden="true">↻</span>
          <span className="demo-replay__label">{t("services.replay.text")}</span>
        </button>
        <div className="demo demo--saas" data-demo="saas" aria-hidden="true">
          <span className="demo__glow"></span>
          <div className="mock-window">
            <div className="mock-window__bar">
              <i></i>
              <i></i>
              <i></i>
              <span>app.vash-servis.ua</span>
              <span className="mock-window__sample">{t("services.demo.sample")}</span>
            </div>
            <div className="d-stage">
              <div className="sa">
                <aside className="sa-side sa-box">
                  <b className="sa-logo">
                    <i></i>
                    <span>{t("services.saas.brand")}</span>
                  </b>
                  <span className="sa-nav is-on">
                    <i></i>
                    <span>{t("services.saas.nav.1")}</span>
                  </span>
                  <span className="sa-nav">
                    <i></i>
                    <span>{t("services.saas.nav.2")}</span>
                  </span>
                  <span className="sa-nav">
                    <i></i>
                    <span>{t("services.saas.nav.3")}</span>
                  </span>
                  <span className="sa-nav">
                    <i></i>
                    <span>{t("services.saas.nav.4")}</span>
                  </span>
                </aside>
                <div className="sa-main">
                  <div className="sa-kpis">
                    <div className="sa-kpi sa-box">
                      <p>{t("services.saas.kpi.1")}</p>
                      <b className="sa-num" data-to="1240">1 240</b>
                      <em>+12%</em>
                    </div>
                    <div className="sa-kpi sa-box">
                      <p>{t("services.saas.kpi.2")}</p>
                      <b className="sa-num" data-to="318">318</b>
                      <em>+5%</em>
                    </div>
                    <div className="sa-kpi sa-box">
                      <p>{t("services.saas.kpi.3")}</p>
                      <b>92%</b>
                      <em>+1%</em>
                    </div>
                  </div>
                  <div className="sa-chart sa-box">
                    <p>{t("services.saas.chart")}</p>
                    <svg viewBox="0 0 300 90" preserveAspectRatio="none" focusable="false">
                      <path className="sa-area" d="M0 76 L27 70 L54 72 L82 58 L109 62 L136 48 L164 50 L191 36 L218 38 L245 24 L273 20 L300 10 L300 90 L0 90Z" />
                      <path className="sa-line" pathLength="1" d="M0 76 L27 70 L54 72 L82 58 L109 62 L136 48 L164 50 L191 36 L218 38 L245 24 L273 20 L300 10" />
                    </svg>
                    <span className="sa-badge">
                      <i></i>
                      <span>{t("services.saas.release")}</span>
                    </span>
                  </div>
                  <div className="sa-rows sa-box">
                    <p>
                      <span>Studio Nord</span>
                      <span>{t("services.saas.plan.1")}</span>
                      <i></i>
                    </p>
                    <p>
                      <span>Kvitka Shop</span>
                      <span>{t("services.saas.plan.2")}</span>
                      <i></i>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <p className="d-cap" aria-hidden="true">
              <i className="d-cap__dot"></i>
              <span className="d-cap__set">
                <b data-cap="1">{t("services.saas.cap.1")}</b>
                <b data-cap="2">{t("services.saas.cap.2")}</b>
                <b data-cap="3">{t("services.saas.cap.3")}</b>
              </span>
            </p>
          </div>
          <div className="demo-steps">
            <span className="demo-steps__line demo-steps__line--stub">
              <b></b>
            </span>
            <span className="demo-steps__step">
              <span className="demo-steps__num">
                <i></i>
                <em>1</em>
              </span>
              <span>{t("services.saas.step.1")}</span>
            </span>
            <span className="demo-steps__line">
              <b></b>
            </span>
            <span className="demo-steps__step">
              <span className="demo-steps__num">
                <i></i>
                <em>2</em>
              </span>
              <span>{t("services.saas.step.2")}</span>
            </span>
            <span className="demo-steps__line">
              <b></b>
            </span>
            <span className="demo-steps__step">
              <span className="demo-steps__num">
                <i></i>
                <em>3</em>
              </span>
              <span>{t("services.saas.step.3")}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="service__body">
        <p className="service__meta">
          <span>4</span>
          <span>{t("services.service.meta.span.4")}</span>
        </p>
        <h3 className="service__title">{t("services.service.title.4")}</h3>
        <p className="service__text">{t("services.service.text.4")}</p>
        <div className="service__foot">
          <p className="service__price">{t("services.price.4.text")}</p>
          <a className="service__more-btn service__more-link" href="#contact">{t("services.more.saas")}</a>
        </div>
      </div>
    </article>
  );
}
