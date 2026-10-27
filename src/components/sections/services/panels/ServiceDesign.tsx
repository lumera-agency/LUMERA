import { Fragment } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { rich } from "@/lib/rich";
import { aiHref } from "@/components/ai/links";
import { PRICES } from "../copy";

const LOOKS = ["studio", "clinic", "shop"] as const;

/** 1 · Дизайн: one layout becomes three businesses (a photo studio, a dental clinic, a glass shop), each in its own
 *  colours, fonts and photos, on a computer and a phone — the design page's own sample sites (crops of
 *  public/img/sites/pv-*.jpg). «Детальніше» opens the sites page (/dyzain-i-saity). */
export async function ServiceDesign() {
  const t = await getTranslations();
  const prices = PRICES;
  const locale = await getLocale();
  const sfx = locale === "ru" ? "-ru" : "";
  return (
    <article className="service" id="svc-1" data-sr="">
      <div className="service__demo">
        <button className="demo-replay" type="button" data-replay="" aria-label={t("services.replay.label")}>
          <span className="demo-replay__icon" aria-hidden="true">↻</span>
          <span className="demo-replay__label">{t("services.replay.text")}</span>
        </button>
        {/* one layout and three businesses: each gets its own colours, fonts and photos, on a computer and a phone
            (the design page's sample sites, /dyzain-i-saity). The clip is demos/timelines.js «looks». */}
        <div className="demo demo--looks" data-demo="looks" aria-hidden="true">
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
              <div className="looks">
                <div className="looks__set">
                  <div className="looks__desk">
                    <span className="looks__wire"><i></i><i></i><i></i><i></i><i></i></span>
                    {LOOKS.map((k, i) => (
                      <span className="looks__shot" data-look={i + 1} key={k}>
                        <img src={`/img/services/looks/${k}-d${sfx}.webp`} width={720} height={496} alt="" loading="lazy" decoding="async" />
                      </span>
                    ))}
                  </div>
                  <div className="looks__phone">
                    <span className="looks__wire"><i></i><i></i><i></i><i></i></span>
                    {LOOKS.map((k, i) => (
                      <span className="looks__shot" data-look={i + 1} key={k}>
                        <img src={`/img/services/looks/${k}-m${sfx}.webp`} width={300} height={650} alt="" loading="lazy" decoding="async" />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="d-cap" aria-hidden="true">
              <i className="d-cap__dot"></i>
              <span className="d-cap__set">
                {[1, 2, 3, 4].map((n) => (
                  <b data-cap={n} key={n}>
                    <span className="looks-l">{t.rich(`services.looks.cap.${n}`, rich)}</span>
                    <span className="looks-s">{t.rich(`services.looks.capShort.${n}`, rich)}</span>
                  </b>
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
                  <span>{t(`services.looks.step.${n}`)}</span>
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
          {/* the sites page has it all (the formats, sample sites, the price, the steps): «Детальніше» opens it */}
          <a className="service__more-btn service__more-link" href={aiHref(locale, "/dyzain-i-saity")}>
            <span>{t("services.more.label")}</span>
          </a>
        </div>
      </div>
    </article>
  );
}
