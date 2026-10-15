import { getLocale, getTranslations } from "next-intl/server";
import { aiHref } from "@/components/ai/links";
import { PRICES } from "../copy";

/** 2 · Сайт і заявка: the page answers the client's questions; ordering takes two fields. Markup ported 1:1 from website-v2; the clip is demos/timelines.js.
 *  «Детальніше» opens the sites page (/dyzain-i-saity) instead of a card. */
export async function ServiceSite() {
  const t = await getTranslations();
  const prices = PRICES;
  const locale = await getLocale();
  return (
    <article className="service" id="svc-2" data-sr="">
      <div className="service__demo">
        <button className="demo-replay" type="button" data-replay="" aria-label={t("services.replay.label")}>
          <span className="demo-replay__icon" aria-hidden="true">↻</span>
          <span className="demo-replay__label">{t("services.replay.text")}</span>
        </button>
        <div className="demo demo--action" data-demo="action" aria-hidden="true">
          <span className="demo__glow"></span>
          <div className="mock-window">
            <div className="mock-window__bar">
              <i></i>
              <i></i>
              <i></i>
              <span>vash-sait.ua</span>
              <span className="mock-window__sample">{t("services.demo.sample")}</span>
            </div>
            <div className="d-stage">
              <div className="sf">
                <ol className="sf__rail">
                  <li className="sf__ri">
                    <i className="sf__rm">
                      <em>1</em>
                      <svg viewBox="0 0 24 24">
                        <path d="m5 12.5 4.2 4.2L19 7" />
                      </svg>
                    </i>
                    <span>
                      <span>{t("services.action.q.1")}</span>
                    </span>
                  </li>
                  <li className="sf__ri">
                    <i className="sf__rm">
                      <em>2</em>
                      <svg viewBox="0 0 24 24">
                        <path d="m5 12.5 4.2 4.2L19 7" />
                      </svg>
                    </i>
                    <span>
                      <span>{t("services.action.q.2")}</span>
                    </span>
                  </li>
                  <li className="sf__ri">
                    <i className="sf__rm">
                      <em>3</em>
                      <svg viewBox="0 0 24 24">
                        <path d="m5 12.5 4.2 4.2L19 7" />
                      </svg>
                    </i>
                    <span>
                      <span>{t("services.action.q.3")}</span>
                    </span>
                  </li>
                  <li className="sf__ri">
                    <i className="sf__rm">
                      <em>4</em>
                      <svg viewBox="0 0 24 24">
                        <path d="m5 12.5 4.2 4.2L19 7" />
                      </svg>
                    </i>
                    <span>
                      <span>{t("services.action.q.4")}</span>
                      {" "}
                      <b className="sf__fields">
                        ·{" "}
                        <span>{t("services.action.fields")}</span>
                      </b>
                    </span>
                  </li>
                </ol>
                <div className="sf__view">
                  <div className="sf__page">
                    <section className="sf__hero">
                      <p className="sf__nav">
                        <b className="sf__logo">
                          <i></i>
                          <span>{t("services.mh.brand")}</span>
                        </b>
                        <span>{t("services.mh.nav.1")}</span>
                        <span>{t("services.mh.nav.3")}</span>
                      </p>
                      <p className="sf__eyebrow">
                        <span className="sf__tok">{t("services.site.token")}</span>
                        {" "}·{" "}
                        <span>{t("services.site.city")}</span>
                      </p>
                      <p className="sf__title">{t("services.mh.title")}</p>
                      <p className="sf__cta">{t("services.ma.block.em")}</p>
                      <img className="sf__stone" src="/img/stone.webp" crossOrigin="anonymous" alt="" width="520" height="626" loading="lazy" decoding="async" />
                    </section>
                    <section className="sf__prices">
                      <p className="sf__plan">
                        <span>{t("services.site.plan.1")}</span>
                        <b>{t("services.site.price.1")}</b>
                      </p>
                      <p className="sf__plan sf__plan--hi">
                        <span>{t("services.site.plan.2")}</span>
                        <b>{t("services.site.price.2")}</b>
                      </p>
                      <p className="sf__plan">
                        <span>{t("services.site.plan.3")}</span>
                        <b>{t("services.site.price.3")}</b>
                      </p>
                    </section>
                    <section className="sf__proof">
                      <p className="sf__rating">
                        <span className="sf__stars">
                          <svg viewBox="0 0 12 12">
                            <path d="M6 .6l1.41 3.66 3.92.21-3.05 2.47 1.01 3.79L6 8.6l-3.29 2.13 1.01-3.79L.67 4.47l3.92-.21z" />
                          </svg>
                          <svg viewBox="0 0 12 12">
                            <path d="M6 .6l1.41 3.66 3.92.21-3.05 2.47 1.01 3.79L6 8.6l-3.29 2.13 1.01-3.79L.67 4.47l3.92-.21z" />
                          </svg>
                          <svg viewBox="0 0 12 12">
                            <path d="M6 .6l1.41 3.66 3.92.21-3.05 2.47 1.01 3.79L6 8.6l-3.29 2.13 1.01-3.79L.67 4.47l3.92-.21z" />
                          </svg>
                          <svg viewBox="0 0 12 12">
                            <path d="M6 .6l1.41 3.66 3.92.21-3.05 2.47 1.01 3.79L6 8.6l-3.29 2.13 1.01-3.79L.67 4.47l3.92-.21z" />
                          </svg>
                          <svg viewBox="0 0 12 12">
                            <path d="M6 .6l1.41 3.66 3.92.21-3.05 2.47 1.01 3.79L6 8.6l-3.29 2.13 1.01-3.79L.67 4.47l3.92-.21z" />
                          </svg>
                        </span>
                        <span>{t("services.attention.proof")}</span>
                      </p>
                      <p className="sf__quote">
                        <span>{t("services.action.review")}</span>
                      </p>
                    </section>
                    <section className="sf__form">
                      <p className="sf__form-title">{t("services.action.form.title")}</p>
                      <div className="sf__field">
                        <span>{t("services.ma.form.span.1")}</span>
                        <p className="sf__input">
                          <i className="sf__focus"></i>
                          <span className="sf__name" data-words="1">{t("services.typed.1")}</span>
                          <i className="sf__ok">
                            <svg viewBox="0 0 24 24">
                              <path d="m5 12.5 4.2 4.2L19 7" />
                            </svg>
                          </i>
                        </p>
                      </div>
                      <div className="sf__field">
                        <span>{t("services.ma.form.span.2")}</span>
                        <p className="sf__input">
                          <i className="sf__focus"></i>
                          <span className="sf__mask" data-words="2">
                            +380{" "}
                            <i className="sf__slot">
                              <b>_</b>
                              <b>6</b>
                            </i>
                            <i className="sf__slot">
                              <b>_</b>
                              <b>7</b>
                            </i>
                            {" "}
                            <i className="sf__slot">
                              <b>_</b>
                              <b>1</b>
                            </i>
                            <i className="sf__slot">
                              <b>_</b>
                              <b>2</b>
                            </i>
                            <i className="sf__slot">
                              <b>_</b>
                              <b>3</b>
                            </i>
                            {" "}
                            <i className="sf__slot">
                              <b>_</b>
                              <b>4</b>
                            </i>
                            <i className="sf__slot">
                              <b>_</b>
                              <b>5</b>
                            </i>
                            {" "}
                            <i className="sf__slot">
                              <b>_</b>
                              <b>6</b>
                            </i>
                            <i className="sf__slot">
                              <b>_</b>
                              <b>7</b>
                            </i>
                          </span>
                          <i className="sf__ok">
                            <svg viewBox="0 0 24 24">
                              <path d="m5 12.5 4.2 4.2L19 7" />
                            </svg>
                          </i>
                        </p>
                      </div>
                      <p className="sf__send">
                        <i className="sf__send-fill"></i>
                        <span className="sf__send-set">
                          <b>{t("services.ma.submit")}</b>
                          <b>
                            <i className="sf__spin"></i>
                          </b>
                          <b>
                            ✓{" "}
                            <span>{t("services.action.sent")}</span>
                          </b>
                        </span>
                      </p>
                      <p className="sf__note">{t("services.action.note")}</p>
                      <p className="sf__done">
                        <b>{t("services.ma.done.span")}</b>
                        .{" "}
                        <span>{t("services.action.done.next")}</span>
                      </p>
                    </section>
                  </div>
                </div>
                <span className="ripple"></span>
                <span className="cursor">
                  <b className="cursor__tag">{t("services.typed.1")}</b>
                </span>
              </div>
            </div>
            <p className="d-cap d-cap--phone" aria-hidden="true">
              <i className="d-cap__dot"></i>
              <span className="d-cap__set">
                <b data-cap="1">
                  1/4 ·{" "}
                  <span>{t("services.action.q.1")}</span>
                </b>
                <b data-cap="2">
                  2/4 ·{" "}
                  <span>{t("services.action.q.2")}</span>
                </b>
                <b data-cap="3">
                  3/4 ·{" "}
                  <span>{t("services.action.q.3")}</span>
                </b>
                <b data-cap="4">
                  4/4 ·{" "}
                  <span>{t("services.action.q.4")}</span>
                  {" "}·{" "}
                  <span>{t("services.action.fields")}</span>
                </b>
                <b data-cap="5">
                  4/4 ✓ ·{" "}
                  <span>{t("services.ma.done.span")}</span>
                </b>
              </span>
            </p>
            <em className="sf__plus">{t("services.ma.plus")}</em>
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
              <span>{t("services.action.step.1")}</span>
            </span>
            <span className="demo-steps__line">
              <b></b>
            </span>
            <span className="demo-steps__step">
              <span className="demo-steps__num">
                <i></i>
                <em>2</em>
              </span>
              <span>{t("services.action.step.2")}</span>
            </span>
            <span className="demo-steps__line">
              <b></b>
            </span>
            <span className="demo-steps__step">
              <span className="demo-steps__num">
                <i></i>
                <em>3</em>
              </span>
              <span>{t("services.action.step.3")}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="service__body">
        <p className="service__meta">
          <span>2</span>
          <span>{t("services.service.meta.span.2")}</span>
        </p>
        <h3 className="service__title">{t("services.service.title.2")}</h3>
        <p className="service__text">{t("services.service.text.2")}</p>
        <div className="service__foot">
          <p className="service__price">{t("services.price.2.text", prices)}</p>
          {/* the sites page has it all (the formats, sample sites, the price, the steps): «Детальніше» opens it */}
          <a className="service__more-btn service__more-link" href={aiHref(locale, "/dyzain-i-saity")}>
            <span>{t("services.more.label")}</span>
          </a>
        </div>
      </div>
    </article>
  );
}
