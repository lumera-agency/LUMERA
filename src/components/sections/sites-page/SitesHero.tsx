/* eslint-disable @next/next/no-img-element -- the stills and the board's pictures are set, swapped and sliced by the page's script (runtime) */
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button/Button";
import { AiStoneSlot } from "@/components/ai/AiStoneSlot";
import { aiRich as R } from "@/components/ai/rich";
import type { SitesFacts } from "@/components/sites/facts";
import { priceLine } from "@/components/sites/facts";

/**
 * 1 · the first screen, centred (as on the AI page): what the page is about (two lines that rise once), the prices from,
 * one button; the main page's stone behind the words (the still, then the live stone). Below: the sample site «Ваш
 * бренд» on a computer and a phone, assembled block by block once (scene «build»). It pins; block 2 slides over it.
 */
export async function SitesHero({ facts: F }: { facts: SitesFacts }) {
  const t = await getTranslations("sites");
  return (
    <section className="ai-hero ai-hero--center st-hero" id="top" aria-labelledby="st-title" data-cover="">
      <div className="ai-hero__bg" aria-hidden="true" />
      <div className="ai-hero__in">
        <div className="ai-hero__copy">
          <div className="ai-hero__head">
            <div className="ai-hero__rock" aria-hidden="true"><i className="ai-hero__glow" /><img className="ai-hero__stone" src="/img/ai/lock-stone.webp" width={520} height={626} alt="" decoding="async" fetchPriority="high" />
              <AiStoneSlot />
            </div>
            <h1 className="s-head__title s-head__title--stone ai-hero__title ai-hero__title--auto" id="st-title">{t.rich("hero.title", R)}</h1>
          </div>
          <p className="ai-hero__lead">{t("hero.lead")}</p>
          <p className="st-hero__from" data-price-line="">{priceLine(t.raw("hero.from"), F)}</p>
          <div className="ai-hero__actions">
            <ButtonLink href="#contact" variant="primary">{t("cta")}</ButtonLink>
            <a className="ai-down" href="#formats"><span>{t("hero.down")}</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg></a>
          </div>
        </div>

        {/* the sample site on a computer and a phone (decoration: the same words are in the blocks below). Its parts
             come in block by block once, in the order a visitor reads them */}
        <div className="ai-hero__visual">
          <div className="st-show" data-scene="build" data-scene-start="0.2" aria-hidden="true">
            <div className="st-win st-show__desk">
              <div className="st-win__bar"><i /><i /><i /><span className="st-win__url">vash-sait.ua</span><span className="ai-sample">{t("x.sample")}</span></div>
              <div className="st-view">
                <div className="ms ms--auth" data-ms="">
                  <div className="ms-nav" data-b="">
                    <span className="ms-logo"><i /><span>{t("ms.brand")}</span></span>
                    <span className="ms-links"><span>{t("ms.nav.1")}</span><span>{t("ms.nav.2")}</span><span>{t("ms.nav.3")}</span><span>{t("ms.nav.4")}</span></span>
                    <span className="ms-btn ms-btn--sm">{t("ms.cta")}</span>
                  </div>
                  <div className="ms-hero">
                    <p className="ms-tag" data-b=""><i /><span>{t("ms.tag")}</span></p>
                    <p className="ms-h" data-b="">{t("ms.h")}</p>
                    <p className="ms-p" data-b="">{t("ms.p")}</p>
                    <p className="ms-acts" data-b=""><span className="ms-btn">{t("ms.cta")}</span><span className="ms-btn ms-btn--line">{t("ms.nav.3")}</span></p>
                    <div className="ms-obj" data-b=""><i className="ms-obj__glow" /><img src="/img/ai/lock-stone.webp" width="520" height="626" alt="" loading="lazy" decoding="async" /></div>
                    <p className="ms-n" data-b=""><b>01</b><span>{t("ms.n")}</span></p>
                  </div>
                  <div className="ms-row" data-b="">
                    <div className="ms-card"><b>01</b><span>{t("ms.tag")}</span><em>{t("ms.price")}</em></div>
                    <div className="ms-card"><b>02</b><span>{t("ms.tag")}</span><em>{t("ms.price")}</em></div>
                    <div className="ms-card"><b>03</b><span>{t("ms.tag")}</span><em>{t("ms.price")}</em></div>
                  </div>
                </div>
                {/* the page as blocks: six labelled bands, then the first one becomes the first screen (scene «build») */}
                <div className="st-build">
                  <i className="st-build__grow" />
                  <p className="st-build__b"><b>01</b><span>{t("blk.1._")}</span></p>
                  <p className="st-build__b"><b>02</b><span>{t("blk.2._")}</span></p>
                  <p className="st-build__b"><b>03</b><span>{t("blk.3._")}</span></p>
                  <p className="st-build__b"><b>04</b><span>{t("blk.4._")}</span></p>
                  <p className="st-build__b"><b>05</b><span>{t("blk.5._")}</span></p>
                  <p className="st-build__b"><b>06</b><span>{t("blk.6._")}</span></p>
                </div>
              </div>
            </div>
            <div className="st-phone st-show__phone">
              <div className="st-view">
                <div className="ms ms--auth ms--m" data-ms="">
                  <div className="ms-nav" data-b="">
                    <span className="ms-logo"><i /><span>{t("ms.brand")}</span></span>
                    <span className="ms-burger"><i /><i /></span>
                  </div>
                  <div className="ms-hero">
                    <p className="ms-tag" data-b=""><i /><span>{t("ms.tag")}</span></p>
                    <p className="ms-h" data-b="">{t("ms.h")}</p>
                    <div className="ms-obj" data-b=""><i className="ms-obj__glow" /><img src="/img/ai/lock-stone.webp" width="520" height="626" alt="" loading="lazy" decoding="async" /></div>
                    <p className="ms-acts" data-b=""><span className="ms-btn">{t("ms.cta")}</span></p>
                  </div>
                  <div className="ms-row" data-b="">
                    <div className="ms-card"><b>01</b><span>{t("ms.tag")}</span><em>{t("ms.price")}</em></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button className="ai-replay st-show__replay" type="button" data-replay="build" aria-label={t("replay.build")}><span aria-hidden="true">↻</span> <span>{t("x.replay")}</span></button>
        </div>
      </div>
    </section>
  );
}
