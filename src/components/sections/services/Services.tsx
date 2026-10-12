import { getTranslations } from "next-intl/server";
import { rich } from "@/lib/rich";
import { ButtonLink } from "@/components/ui/button/Button";
import { TextFill } from "@/components/fx/text-fill/TextFill";
import { PRICES } from "./copy";
import { ServicesClient } from "./ServicesClient";
import { ServiceDesign } from "./panels/ServiceDesign";
import { ServiceSite } from "./panels/ServiceSite";
import { ServiceAds } from "./panels/ServiceAds";
import { ServiceAutomation } from "./panels/ServiceAutomation";
import { ServiceSaas } from "./panels/ServiceSaas";
import "./services.css";
import "./demos/demos.css";

const TABS = [1, 2, 3, 4, 5] as const;

/**
 * 3 · Послуги: the services, each with a live demo of the work. Wide screens: a horizontal ride
 * (fx/horizontal-ride). 861–1023 px: rows that stack. Phones: a switcher of chips over one window.
 */
export async function Services() {
  const t = await getTranslations();
  return (
    <section className="section" id="services" aria-labelledby="services-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta" data-sr="">
            <span className="s-head__index">3</span>
            <span>{t("nav.services")}</span>
          </p>
          <h2 className="s-head__title s-head__title--stone" id="services-title" data-split="">
            <span className="tone">{t.rich("services.title", rich)}</span>
          </h2>
        </header>
        <TextFill className="statement">{t("services.statement")}</TextFill>

        {/* ≤ 600 px only: chips over one window, the services below are its panels; after each clip the
            next one comes up by itself, once through, until the visitor picks one */}
        <div className="service-tabs" role="tablist" data-auto="" data-sr="" aria-label={t("nav.services")}>
          {TABS.map((n) => (
            <button key={n} className="service-tab svc-pick" type="button" role="tab" id={`svc-${n}-tab`} aria-selected={n === 1} aria-controls={`svc-${n}`} tabIndex={n === 1 ? 0 : -1}>
              <span className="svc-pick__num">{n}</span>
              <span className="svc-pick__name">{t(`services.service.meta.span.${n}`)}</span>
              <span className="svc-pick__price">{t(`services.price.${n}.m`, PRICES)}</span>
              <i className="service-tab__bar" aria-hidden="true" />
            </button>
          ))}
        </div>

        {/* the track; on a wide screen a ride, the HUD shows where it is */}
        <div className="ride" data-ride="">
          <div className="services">
            <ServiceDesign />
            <ServiceSite />
            <ServiceAds />
            <ServiceAutomation />
            <ServiceSaas />
          </div>
          {/* one panel back / on (wide screens, while the ride is on) */}
          <button className="ride__arrow ride__arrow--prev" type="button" data-ride-prev="" aria-label={t("services.ride.prev")}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          </button>
          <button className="ride__arrow ride__arrow--next" type="button" data-ride-next="" aria-label={t("services.ride.next")}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
          <div className="ride__hud">
            <p className="ride__count" aria-hidden="true">
              <b data-ride-now="">01</b> / <span data-ride-of="">05</span>
            </p>
            <span className="ride__bar" aria-hidden="true"><i data-ride-bar="" /></span>
            <ul className="ride__names" data-ride-names="" aria-label={t("nav.services")} />
            {/* out of the ride without scrolling it to the end */}
            <button className="ride__skip" type="button" data-ride-skip="" aria-label={t("services.ride.skipLabel")}>
              <span>{t("services.ride.skip")}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
            </button>
          </div>
        </div>

        {/* the services lead on to their prices: the configurator below (6 · Ціни) */}
        <div className="services__cta" data-sr="">
          <p className="services__cta-q">{t("services.cta.q")}</p>
          <ButtonLink href="#pricing" variant="primary">{t("services.cta.btn")}</ButtonLink>
        </div>
      </div>
      <ServicesClient />
    </section>
  );
}
