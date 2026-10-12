import { getTranslations } from "next-intl/server";
import { rich } from "@/lib/rich";
import { PricingClient } from "./PricingClient";
import "./configurator.css";

/**
 * 6 · Ціни: «Зберіть свій проєкт» — the configurator (presets, options, the live preview of the
 * site being configured, the sum). The configurator is a framework-free island (configurator/*.js,
 * ported 1:1), mounted into [data-cfg] by PricingClient.
 */
export async function Pricing() {
  const t = await getTranslations();
  return (
    <section className="section" id="pricing" aria-labelledby="pricing-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta" data-sr="">
            <span className="s-head__index">6</span>
            <span>{t("nav.pricing")}</span>
          </p>
          <h2 className="s-head__title" id="pricing-title" data-split="">
            <span className="tone">{t.rich("pricing.title", rich)}</span>
          </h2>
          <p className="s-head__intro" data-sr="">{t("pricing.intro")}</p>
        </header>
        <PricingClient />
      </div>
    </section>
  );
}
