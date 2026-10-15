import { getLocale, getTranslations } from "next-intl/server";
import { aiHref } from "@/components/ai/links";
import { PRICES } from "../copy";

/** 1 · Дизайн: the first screen answers what you offer, why trust you, what to do. Markup ported 1:1 from website-v2; the clip is demos/timelines.js.
 *  «Детальніше» opens the sites page (/dyzain-i-saity) instead of a card. */
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
        <div className="demo demo--attention" data-demo="attention" aria-hidden="true">
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
              <div className="mh">
                <div className="mh__grid">
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
                <div className="mh__nav">
                  <b className="mh__logo">{t("services.mh.brand")}</b>
                  <span>{t("services.mh.nav.1")}</span>
                  <span>{t("services.mh.nav.cases")}</span>
                  <span>{t("prototype.fd.nav.span.3")}</span>
                </div>
                <div className="mh__copy">
                  <p className="mh__title">
                    <span className="rise">
                      <span>{t("services.mh.title")}</span>
                    </span>
                    <i className="mh__wire mh__wire--title"></i>
                  </p>
                  <span className="mh__cta">
                    <span>{t("services.mh.cta")}</span>
                    <i className="mh__wire mh__wire--cta"></i>
                  </span>
                </div>
                <div className="mh__object">
                  <span className="mh__stone">
                    <span className="mh__float">
                      <img src="/img/stone.webp" crossOrigin="anonymous" alt="" width="520" height="626" loading="lazy" decoding="async" />
                      <i className="mh__glint">
                        <b></b>
                      </i>
                    </span>
                  </span>
                  <span className="mh__shadow"></span>
                </div>
                <span className="mh__proof">
                  <svg viewBox="0 0 12 12">
                    <path d="M6 .6l1.41 3.66 3.92.21-3.05 2.47 1.01 3.79L6 8.6l-3.29 2.13 1.01-3.79L.67 4.47l3.92-.21z" />
                  </svg>
                  <span>{t("services.attention.proof")}</span>
                </span>
                <span className="d-note" data-note="1">
                  <i>1</i>
                  <b>{t("services.attention.note.1")}</b>
                </span>
                <span className="d-note" data-note="2">
                  <i>2</i>
                  <b>{t("services.attention.note.2")}</b>
                </span>
                <span className="d-note" data-note="3">
                  <i>3</i>
                  <b>{t("services.attention.note.3")}</b>
                </span>
                <svg className="marks">
                  <path className="marks__brackets" />
                  <path className="marks__lead" data-lead="1" />
                  <path className="marks__lead" data-lead="2" />
                  <path className="marks__lead" data-lead="3" />
                </svg>
              </div>
            </div>
            <p className="d-cap d-cap--phone" aria-hidden="true">
              <i className="d-cap__dot"></i>
              <span className="d-cap__set">
                <b data-cap="1">
                  1 ·{" "}
                  <span>{t("services.attention.note.1")}</span>
                </b>
                <b data-cap="2">
                  2 ·{" "}
                  <span>{t("services.attention.note.2")}</span>
                </b>
                <b data-cap="3">
                  3 ·{" "}
                  <span>{t("services.attention.note.3")}</span>
                </b>
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
              <span>{t("services.attention.step.1")}</span>
            </span>
            <span className="demo-steps__line">
              <b></b>
            </span>
            <span className="demo-steps__step">
              <span className="demo-steps__num">
                <i></i>
                <em>2</em>
              </span>
              <span>{t("services.attention.step.2")}</span>
            </span>
            <span className="demo-steps__line">
              <b></b>
            </span>
            <span className="demo-steps__step">
              <span className="demo-steps__num">
                <i></i>
                <em>3</em>
              </span>
              <span>{t("services.attention.step.3")}</span>
            </span>
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
          {/* the sites page has it all (the formats, sample sites, the price, the steps): «Детальніше» opens it */}
          <a className="service__more-btn service__more-link" href={aiHref(locale, "/dyzain-i-saity")}>
            <span>{t("services.more.label")}</span>
          </a>
        </div>
      </div>
    </article>
  );
}
