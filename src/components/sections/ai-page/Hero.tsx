import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button/Button";
import { aiRich } from "@/components/ai/rich";
import { AiStoneSlot } from "@/components/ai/AiStoneSlot";
import { HeroFlux } from "@/components/sites/hero-fx/HeroFlux";
import { AUDIT, LOSS_READY, usd } from "./prices";

/**
 * 1 · the first screen, centred (the owner, 21 Oct 2026: the page sells the result, not the technology): the question
 * the page answers (two lines that rise once, CSS), what the robot takes over, the request button and the way to the
 * losses calculator, the audit's price under them. Far behind the words, the main page's stone: a still that the live
 * 3D stone replaces once it has drawn (three/ai-stone, AiStoneSlot). The ground is the «Дизайн і сайти» page's: its
 * FluxLines on pure black, resting once block 2 covers the screen. It pins, and the page slides over it (data-cover).
 */
export async function Hero() {
  const t = await getTranslations("ai");
  const c = await getTranslations("aiCommon");
  return (
    <section className="ai-hero ai-hero--center" id="top" aria-labelledby="ai-title" data-cover="">
      {/* the sites page's first-screen background: the fluid lines on black (the stone is behind the words, below) */}
      <div className="ai-hero__bg" aria-hidden="true"><HeroFlux under="#case" /></div>
      <div className="ai-hero__in">
        <div className="ai-hero__copy">
          <div className="ai-hero__head">
            <div className="ai-hero__rock" aria-hidden="true">
              <i className="ai-hero__glow" />
              {/* the still and the live stone share one box (and its 0.8 opacity): the still is the live stone's own first
                  frame (img/ai/stone-still*.webp, rendered from three/ai-stone: the phone's from its simpler render), so
                  the live one dissolves in over it with no visible swap (the owner, 21 Oct 2026). The still is the first
                  screen's largest thing (the browser's LCP): fetched early, 60 KB, 19 KB on phones */}
              <span className="ai-hero__stone-box">
                <picture>
                  <source media="(pointer: coarse)" srcSet="/img/ai/stone-still-m.webp" width={771} height={771} />
                  <img className="ai-hero__stone" src="/img/ai/stone-still.webp" width={1268} height={1268} alt="" decoding="async" fetchPriority="high" />
                </picture>
                <AiStoneSlot />
              </span>
            </div>
            <h1 className="s-head__title s-head__title--stone ai-hero__title ai-hero__title--auto" id="ai-title">
              {t.rich("hero.title", aiRich)}
            </h1>
          </div>
          <p className="ai-hero__lead">
            <span>{t("hero.lead")}</span> <span className="ai-hero__lead2">{t("hero.lead2")}</span>
          </p>
          <div className="ai-hero__actions">
            <ButtonLink href="#contact" variant="primary">{c("cta.auto")}</ButtonLink>
            {LOSS_READY && (
              <a className="link ai-hero__loss" href="#loss">
                <span>{t("hero.loss")}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg>
              </a>
            )}
          </div>
          <p className="ai-hero__audit">{t("hero.audit", { audit: usd(AUDIT.price) })}</p>
        </div>
      </div>
    </section>
  );
}
