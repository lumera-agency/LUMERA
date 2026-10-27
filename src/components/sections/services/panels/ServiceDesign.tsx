import { Fragment } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { aiHref } from "@/components/ai/links";
import { PRICES } from "../copy";

/** The PageSpeed gauge counts up to this (the owner's figure, 27 Oct 2026: our sites score 90+ in Google PageSpeed). */
const SCORE = 96;

/** 1 · Дизайн і розробка: why our design and development, in three scenes and a summary (the clip is
 *  demos/timelines.js «design»). The first screen of the «Ваш бренд» sample fills in and three numbered notes say what
 *  it answers: what you offer, why to trust you, what to do now. Then PageSpeed Insights: the gauge counts up to 90+
 *  and three checks tick in. Then back on the finished first screen, the details a template hasn't got: the cursor
 *  takes the 3D object and it turns with it, the page scrolls on and the next block's cards rise in as they come
 *  into view, a card rises to the cursor. «Детальніше» opens the sites page (/dyzain-i-saity). */
export async function ServiceDesign() {
  const t = await getTranslations();
  const prices = PRICES;
  const locale = await getLocale();
  return (
    <article className="service" id="svc-1" data-sr="">
      <div className="service__demo">
        <button className="demo-replay" type="button" data-replay="" aria-label={t("services.replay.label")}>
          <span className="demo-replay__icon" aria-hidden="true">↻</span>
          <span className="demo-replay__label">{t("services.replay.text")}</span>
        </button>
        <div className="demo demo--design" data-demo="design" aria-hidden="true">
          <span className="demo__glow"></span>
          <div className="mock-window">
            <div className="mock-window__bar">
              <i></i>
              <i></i>
              <i></i>
              <span className="d-host">
                <b data-host="0">vash-sait.ua</b>
                <b data-host="1">
                  <span className="d-host__l">{t("services.dsn.host.text")}</span>
                  <span className="d-host__s">{t("services.dsn.host.short")}</span>
                </b>
              </span>
              <span className="mock-window__sample">{t("services.demo.sample")}</span>
            </div>
            <div className="d-stage">
              <div className="d-scenes dn">
                {/* 1 · the first screen (scene 1); in scene 3 the page scrolls on to the next block under it */}
                <section className="d-scene dn-site">
                  <div className="dn-view">
                    <div className="dn-page">
                      <div className="dn-hero">
                        <div className="dn-nav">
                          <b className="dn-logo">
                            <i></i>
                            <span>{t("services.mh.brand")}</span>
                          </b>
                          <span>{t("services.mh.nav.1")}</span>
                          <span>{t("services.mh.nav.2")}</span>
                          <span>{t("services.mh.nav.3")}</span>
                          <span className="dn-nav__btn">{t("services.mh.cta")}</span>
                        </div>
                        <div className="dn-copy">
                          <p className="dn-title">
                            <span className="rise">
                              <span>{t("services.mh.title")}</span>
                            </span>
                            <i className="dn-wire dn-wire--title"></i>
                          </p>
                          <p className="dn-text">
                            <span>{t("services.dsn.site.text")}</span>
                            <i className="dn-wire dn-wire--text"></i>
                          </p>
                          <p className="dn-acts">
                            <span className="dn-cta">
                              <span>{t("services.mh.cta")}</span>
                              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                              <i className="dn-wire dn-wire--cta"></i>
                            </span>
                          </p>
                          <p className="dn-proof">
                            <span>
                              <svg className="dn-star" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M6 .6l1.41 3.66 3.92.21-3.05 2.47 1.01 3.79L6 8.6l-3.29 2.13 1.01-3.79L.67 4.47l3.92-.21z" /></svg>
                              <span>{t("services.dsn.site.proof.1")}</span>
                            </span>
                            <span>
                              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z" /><path d="m9 12 2 2 4-4" /></svg>
                              <span>{t("services.dsn.site.proof.2")}</span>
                            </span>
                          </p>
                        </div>
                        {/* the client's object: the hero's stone, lit and turned into place; in scene 3 it turns to the cursor */}
                        <div className="dn-object">
                          <i className="dn-wire dn-wire--obj"></i>
                          <span className="dn-stone">
                            <img src="/img/stone.webp" alt="" width={520} height={626} loading="lazy" decoding="async" />
                            <i className="dn-glint">
                              <b></b>
                            </i>
                          </span>
                          <span className="dn-shadow"></span>
                        </div>
                        {/* the notes (scene 1); the script places them beside what they mark */}
                        {[1, 2, 3].map((n) => (
                          <span className="d-note" data-note={n} key={n}>
                            <i>{n}</i>
                            <b>{t(`services.dsn.note.${n}`)}</b>
                          </span>
                        ))}
                        <svg className="marks" aria-hidden="true" focusable="false">
                          <path className="marks__brackets" />
                          {[1, 2, 3].map((n) => (
                            <path className="marks__lead" data-lead={n} key={n} />
                          ))}
                        </svg>
                      </div>
                      {/* the next block under the first screen, «Послуги й ціни»: scene 3 scrolls down to it and its cards
                          rise in as they come into view (the sample's plan names and «ваша ціна», services.site) */}
                      <div className="dn-block">
                        <p className="dn-block__h">{t("services.dsn.site.block")}</p>
                        <div className="dn-cards">
                          {[1, 2, 3].map((n) => (
                            <p className="dn-card" key={n}>
                              <b>0{n}</b>
                              <span>{t(`services.site.plan.${n}`)}</span>
                              <em>{t(`services.site.price.${n}`)}</em>
                              <i></i>
                            </p>
                          ))}
                        </div>
                      </div>
                      {/* the detail tags (scene 3): the 3D object, the arrival on scroll, the card under the cursor */}
                      {[1, 2, 3].map((n) => (
                        <span className="d-note d-note--fx" data-fx={n} key={n}>
                          <i></i>
                          <b>{t(`services.dsn.fx.${n}`)}</b>
                        </span>
                      ))}
                    </div>
                    <span className="ripple"></span>
                    <span className="cursor"></span>
                  </div>
                </section>
                {/* 2 · PageSpeed Insights: the gauge and the checks */}
                <section className="d-scene dn-speed">
                  <div className="ps">
                    <p className="ps__url">
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.3-4.3" /></svg>
                      <b>vash-sait.ua</b>
                      <em>{t("services.dsn.ps.analyze")}</em>
                    </p>
                    <p className="ps__tabs">
                      <b className="is-on">{t("services.dsn.ps.phone")}</b>
                      <b>{t("services.dsn.ps.desk")}</b>
                    </p>
                    <div className="ps__grid">
                      <div className="ps__gauge">
                        <span className="ps__ring">
                          <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
                            <circle className="ps__track" cx="50" cy="50" r="44" />
                            <circle className="ps__arc" cx="50" cy="50" r="44" pathLength={1} />
                          </svg>
                          <b className="ps__num" data-to={SCORE}>{SCORE}</b>
                        </span>
                        <span className="ps__k">{t("services.dsn.ps.perf")}</span>
                      </div>
                      <ul className="ps__checks">
                        {[1, 2, 3].map((n) => (
                          <li key={n}>
                            <i>
                              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 12.5 4.2 4.2L19 7" /></svg>
                            </i>
                            <span>{t(`services.dsn.ps.check.${n}`)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
                {/* the rest frame: the three results, one line each (no JS / reduced motion: this alone) */}
                <section className="d-scene dn-sum">
                  <ol className="dn-sum__list">
                    {[1, 2, 3].map((n) => (
                      <li key={n}>
                        <i>{n}</i>
                        <span>{t(`services.dsn.sum.${n}`)}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>
            </div>
            <p className="d-cap" aria-hidden="true">
              <i className="d-cap__dot"></i>
              <span className="d-cap__set">
                {[1, 2, 3].map((n) => (
                  <b data-cap={n} key={n}>{t(`services.dsn.cap.${n}`)}</b>
                ))}
              </span>
            </p>
          </div>
          <div className="demo-steps">
            <span className="demo-steps__line demo-steps__line--stub">
              <b></b>
            </span>
            {[1, 2, 3].map((n) => (
              <Fragment key={n}>
                {n > 1 && (
                  <span className="demo-steps__line">
                    <b></b>
                  </span>
                )}
                <span className="demo-steps__step">
                  <span className="demo-steps__num">
                    <i></i>
                    <em>{n}</em>
                  </span>
                  <span>{t(`services.dsn.step.${n}`)}</span>
                </span>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="service__body">
        <p className="service__meta">
          <span>1</span>
          <span>{t("services.service.meta.span.1")}</span>
        </p>
        <h3 className="service__title">{t("services.service.title.1")}</h3>
        <p className="service__text">{t("services.service.text.1")}</p>
        <div className="service__foot">
          <p className="service__price">{t("services.price.1.text", prices)}</p>
          {/* the sites page has it all (the formats, sample sites, the calculator, the steps): «Детальніше» opens it */}
          <a className="service__more-btn service__more-link" href={aiHref(locale, "/dyzain-i-saity")}>
            <span>{t("services.more.label")}</span>
          </a>
        </div>
      </div>
    </article>
  );
}
