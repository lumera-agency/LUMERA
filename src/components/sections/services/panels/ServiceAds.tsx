import { getLocale, getTranslations } from "next-intl/server";
import { aiHref } from "@/components/ai/links";
import { PRICES } from "../copy";

/** 2 · Реклама в Google: the search plan, the ad on the results page, the report. Markup ported 1:1 from website-v2; the clip is demos/timelines.js.
 *  «Детальніше» opens the ads page (/reklama-i-analityka) instead of a card. */
export async function ServiceAds() {
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
        <div className="demo demo--ads" data-demo="ads" aria-hidden="true">
          <span className="demo__glow"></span>
          <div className="mock-window">
            <div className="mock-window__bar">
              <i></i>
              <i></i>
              <i></i>
              <span className="d-host">
                <b data-host="0">ads.google.com</b>
                <b data-host="1">google.com</b>
              </span>
              <span className="mock-window__sample">{t("services.demo.sample")}</span>
            </div>
            <div className="d-stage">
              <div className="d-scenes gs">
                {/* 1 · the searches to show the ad for, and the ones to leave out */}
                <section className="d-scene gs-plan">
                  <div className="gs-col">
                    <p className="gs__field">
                      <svg viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="6" />
                        <path d="m20 20-4.3-4.3" />
                      </svg>
                      <span className="gs__tok">
                        <span className="gs-l">{t("services.site.token")}</span>
                        <span className="gs-s">{t("services.site.tokenShort")}</span>
                      </span>
                    </p>
                    <div className="gs-grp">
                      <p className="gs-head">
                        <span>{t("services.ads.show")}</span>
                        <span className="gs--wide">{t("services.ads.col.volume")}</span>
                      </p>
                      <p className="gs__kw">
                        <i className="gs-rule"></i>
                        <i className="gs__mark">✓</i>
                        <span className="gs__q">
                          <span className="gs__tok">{t("services.site.tokenShort")}</span>
                          {" "}
                          <span>{t("services.ads.kw.1")}</span>
                        </span>
                        <b className="gs__vol gs--wide">2 400</b>
                      </p>
                      <p className="gs__kw">
                        <i className="gs-rule"></i>
                        <i className="gs__mark">✓</i>
                        <span className="gs__q">
                          <span className="gs__tok">{t("services.site.tokenShort")}</span>
                          {" "}
                          <span>{t("services.ads.kw.2")}</span>
                        </span>
                        <b className="gs__vol gs--wide">1 300</b>
                      </p>
                      <p className="gs__kw gs--wide">
                        <i className="gs-rule"></i>
                        <i className="gs__mark">✓</i>
                        <span className="gs__q">
                          <span>{t("services.ads.kw.3")}</span>
                          {" "}
                          <span className="gs__tok">{t("services.site.tokenShort")}</span>
                        </span>
                        <b className="gs__vol">880</b>
                      </p>
                    </div>
                    <div className="gs-grp gs-grp--neg">
                      <p className="gs-head">
                        <span>{t("services.ads.excluded")}</span>
                      </p>
                      <p className="gs__kw gs__kw--neg">
                        <i className="gs-rule"></i>
                        <i className="gs__mark">−</i>
                        <span className="gs__q">
                          <span>{t("services.ads.neg.1")}</span>
                          <s className="gs__strike"></s>
                        </span>
                      </p>
                      <p className="gs__kw gs__kw--neg">
                        <i className="gs-rule"></i>
                        <i className="gs__mark">−</i>
                        <span className="gs__q">
                          <span>{t("services.ads.neg.2")}</span>
                          <s className="gs__strike"></s>
                        </span>
                      </p>
                    </div>
                  </div>
                </section>
                {/* 2 · the ad, shown to the one who searches */}
                <section className="d-scene gs-serp">
                  <div className="gs-col">
                    <p className="gs__search">
                      <svg viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="6" />
                        <path d="m20 20-4.3-4.3" />
                      </svg>
                      <span className="gs__tok">
                        <span className="gs-l">{t("services.site.token")}</span>
                        <span className="gs-s">{t("services.site.tokenShort")}</span>
                      </span>
                      <span className="gs__typed" data-words="1">{t("services.ads.kw.1")}</span>
                    </p>
                    <div className="gs__promo">
                      <p className="gs__site">
                        <b>{t("services.mg.ad")}</b>
                        {" "}· vash-sait.ua
                      </p>
                      <p className="gs__title">
                        <span>
                          <span>{t("services.mg.headline")}</span>
                          <i className="gs-u"></i>
                        </span>
                      </p>
                      <p className="gs__desc">{t("services.mg.desc")}</p>
                    </div>
                    <p className="gs__result">
                      <i></i>
                    </p>
                  </div>
                </section>
                {/* 3 · the report: which search brought the request and what one request cost */}
                <section className="d-scene gs-report">
                  <div className="gs-col">
                    <p className="gs__event gs--wide">
                      <i></i>
                      <span>{t("services.ads.event")}</span>
                      <code>14:02</code>
                    </p>
                    <div className="gs-table gs--wide">
                      <p className="gs__row gs__row--head">
                        <span>{t("services.ads.col.query")}</span>
                        <span>{t("services.ads.col.leads")}</span>
                        <span>{t("services.ads.col.cpl")}</span>
                      </p>
                      <p className="gs__row gs__row--hit">
                        <i className="gs-bar"></i>
                        <span className="gs__q">
                          <span className="gs__tok">{t("services.site.tokenShort")}</span>
                          {" "}
                          <span>{t("services.ads.kw.1")}</span>
                          <span className="gs-flagw">
                            <em className="gs__flag">{t("services.ma.plus")}</em>
                          </span>
                        </span>
                        <span className="gs-v" data-v="leads">
                          <i className="gs-flash"></i>
                          <b>4</b>
                          <b>5</b>
                        </span>
                        <span className="gs-v" data-v="cpl">
                          <i className="gs-flash"></i>
                          <b>360 ₴</b>
                          <b>288 ₴</b>
                        </span>
                      </p>
                      <p className="gs__row">
                        <span className="gs__q">
                          <span className="gs__tok">{t("services.site.tokenShort")}</span>
                          {" "}
                          <span>{t("services.ads.kw.2")}</span>
                        </span>
                        <span>2</span>
                        <span>351 ₴</span>
                      </p>
                    </div>
                    <div className="gs-card gs--narrow">
                      <p className="gs-card__q">
                        <span className="gs__q">
                          <span className="gs__tok">{t("services.site.tokenShort")}</span>
                          {" "}
                          <span>{t("services.ads.kw.1")}</span>
                        </span>
                        <span className="gs-flagw">
                          <em className="gs__flag">{t("services.ma.plus")}</em>
                        </span>
                      </p>
                      <p className="gs-card__r">
                        <span>{t("services.ads.col.leads")}</span>
                        <span className="gs-v" data-v="leads">
                          <i className="gs-flash"></i>
                          <b>4</b>
                          <b>5</b>
                        </span>
                      </p>
                      <p className="gs-card__r">
                        <span>{t("services.ads.col.cpl")}</span>
                        <span className="gs-v" data-v="cpl">
                          <i className="gs-flash"></i>
                          <b>360 ₴</b>
                          <b>288 ₴</b>
                        </span>
                      </p>
                    </div>
                  </div>
                </section>
                <span className="gs__tok gs__fly">
                  <span className="gs-l">{t("services.site.token")}</span>
                  <span className="gs-s">{t("services.site.tokenShort")}</span>
                </span>
                <i className="gs__pulse"></i>
                <span className="ripple"></span>
                <span className="cursor"></span>
              </div>
            </div>
            <p className="d-cap" aria-hidden="true">
              <i className="d-cap__dot"></i>
              <span className="d-cap__set">
                <b data-cap="1">{t("services.ads.cap.1")}</b>
                <b data-cap="2">{t("services.ads.cap.2")}</b>
                <b data-cap="3">{t("services.ads.cap.3")}</b>
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
              <span>{t("services.ads.step.1")}</span>
            </span>
            <span className="demo-steps__line">
              <b></b>
            </span>
            <span className="demo-steps__step">
              <span className="demo-steps__num">
                <i></i>
                <em>2</em>
              </span>
              <span>{t("services.ads.step.2")}</span>
            </span>
            <span className="demo-steps__line">
              <b></b>
            </span>
            <span className="demo-steps__step">
              <span className="demo-steps__num">
                <i></i>
                <em>3</em>
              </span>
              <span>{t("services.ads.step.3")}</span>
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
          {/* the ads page has it all (where the ads run, the analytics, the price, the steps): «Детальніше» opens it */}
          <a className="service__more-btn service__more-link" href={aiHref(locale, "/reklama-i-analityka")}>
            <span>{t("services.more.label")}</span>
          </a>
        </div>
      </div>
    </article>
  );
}
