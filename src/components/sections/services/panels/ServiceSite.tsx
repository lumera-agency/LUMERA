import { Fragment } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { aiHref } from "@/components/ai/links";
import { PRICING, addonTag } from "@/components/sections/pricing/configurator/engine.js";
import { PRICES } from "../copy";

const FMTS = [["1", "landing"], ["2", "landingPlus"], ["3", "corporate"], ["4", "ecommerce"]] as const;

/** 2 · Сайт і ціна: the design page's calculator in miniature — the visitor picks a format and an option, and the
 *  sample site and the sum change at once. «Детальніше» opens the calculator on the sites page. */
export async function ServiceSite() {
  const t = await getTranslations();
  const prices = PRICES;
  const locale = await getLocale();
  const sfx = locale === "ru" ? "-ru" : "";
  // the sum's three values in one cell: Магазин, then Лендінг, then Лендінг with 3D (the rest frame, on top)
  const vals = (
    <span className="pick__vals">
      <b>{prices.ecommerce}</b>
      <b>{prices.landing}</b>
      <b>{prices.landing3d}</b>
    </span>
  );
  return (
    <article className="service" id="svc-2" data-sr="">
      <div className="service__demo">
        <button className="demo-replay" type="button" data-replay="" aria-label={t("services.replay.label")}>
          <span className="demo-replay__icon" aria-hidden="true">↻</span>
          <span className="demo-replay__label">{t("services.replay.text")}</span>
        </button>
        {/* the design page's calculator in miniature: a format and an option change the sample site and the sum at
            once (/dyzain-i-saity#design). Sums from the engine (copy.ts). The clip is demos/timelines.js «pick». */}
        <div className="demo demo--pick" data-demo="pick" aria-hidden="true">
          <span className="demo__glow"></span>
          <div className="mock-window">
            <div className="mock-window__bar">
              <i></i>
              <i></i>
              <i></i>
              <span>vash-sait.ua</span>
              <span className="pick__mark">{t("services.pick.mark")}</span>
              <span className="mock-window__sample">{t("services.demo.sample")}</span>
            </div>
            <div className="d-stage">
              <div className="pick">
                <div className="pick__calc">
                  <p className="pick__k">{t("services.pick.k.format")}</p>
                  <div className="pick__fmts">
                    <i className="pick__sel"></i>
                    {FMTS.map(([n, key]) => (
                      <p className="pick__fmt" key={n}>
                        <span>{t(`services.pick.f.${n}`)}</span>
                        <b>{prices[key]}</b>
                      </p>
                    ))}
                  </div>
                  <p className="pick__k">{t("services.pick.k.opt")}</p>
                  <p className="pick__opt">
                    <span className="pick__box">
                      <i></i>
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 12.5 4.2 4.2L19 7" /></svg>
                    </span>
                    <span>{t("services.pick.opt3d")}</span>
                    <em>{addonTag(PRICING.threeDHero.price)}</em>
                  </p>
                  <div className="pick__sum">
                    <i className="pick__ring"></i>
                    <span className="pick__sum-k">{t("services.pick.total")}</span>
                    {vals}
                    <span className="pick__once">{t("services.pick.once")}</span>
                  </div>
                  <p className="pick__send">{t("services.pick.send")}</p>
                </div>
                <div className="pick__view">
                  <span className="pick__shot">
                    <img src={`/img/services/looks/shop-d${sfx}.webp`} width={720} height={496} alt="" loading="lazy" decoding="async" />
                  </span>
                  <span className="pick__shot">
                    <img src={`/img/services/looks/studio-pick${sfx}.webp`} width={720} height={496} alt="" loading="lazy" decoding="async" />
                  </span>
                  <span className="pick__shot">
                    <img src={`/img/services/looks/studio-pick3d${sfx}.webp`} width={720} height={496} alt="" loading="lazy" decoding="async" />
                  </span>
                  {/* phones only: the calculator as one bar over the sample */}
                  <p className="pick__bar">
                    <span className="pick__chip pick__swap">
                      <b>{t("services.pick.f.4")}</b>
                      <b>{t("services.pick.f.1")}</b>
                    </span>
                    <span className="pick__chip pick__chip--3d">{t("services.pick.mark")}</span>
                    <span className="pick__barsum">
                      <i className="pick__ring"></i>
                      {vals}
                    </span>
                  </p>
                </div>
                <span className="ripple"></span>
                <span className="cursor"></span>
              </div>
            </div>
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
                  <span>{t(`services.pick.step.${n}`)}</span>
                </span>
              </Fragment>
            ))}
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
          {/* «Детальніше» opens the sites page's calculator, where the demo comes from */}
          <a className="service__more-btn service__more-link" href={`${aiHref(locale, "/dyzain-i-saity")}#design`}>
            <span>{t("services.more.label")}</span>
          </a>
        </div>
      </div>
    </article>
  );
}
