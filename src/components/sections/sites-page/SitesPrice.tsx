import { getLocale, getTranslations } from "next-intl/server";
import { ArrowIcon } from "@/components/ui/icons/ArrowIcon";
import { aiRich as R } from "@/components/ai/rich";
import type { SitesFacts } from "@/components/sites/facts";
import { aiHref } from "@/components/ai/links";

/**
 * 3 · Ціна: the format, the live sample site (the main page's configurator samples, the vanilla engine in
 * components/sites/runtime), 3D-обʼєкт and Друга мова, the sum; «Обговорити проєкт» puts the sum into the form.
 */
export async function SitesPrice({ facts: F }: { facts: SitesFacts }) {
  const t = await getTranslations("sites");
  // the main page's calculator, in the page's language (/#pricing, /ru#pricing)
  const home = aiHref(await getLocale(), "/");
  return (
    <section className="section ai-sec st-design" id="design" aria-labelledby="design-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta"><span className="s-head__index">3</span><span>{t("nav.design")}</span></p>
          <h2 data-split="" className="s-head__title" id="design-title"><span className="tone">{t.rich("design.title", R)}</span></h2>
          <p className="s-head__intro">{t("design.intro")}</p>
        </header>

        <form className="st-calc" data-calc="" aria-labelledby="design-title">
          {/* the choices: the format, the sample in two levels, the design, the extras */}
          <div className="st-main">
            <fieldset className="st-g">
              <legend className="ai-calc__l">{t("g.format")}</legend>
              <div className="st-seg" data-seg="">
                <label className="st-seg__o is-on"><input type="radio" name="calc-format" value="landing" defaultChecked /><span>{t("f.landing.t")}</span><em data-fprice="landing">{F.landing}</em></label>
                <label className="st-seg__o"><input type="radio" name="calc-format" value="landingPlus" /><span>{t("f.plus.t")}</span><em data-fprice="landingPlus">{F.landingPlus}</em></label>
                <label className="st-seg__o"><input type="radio" name="calc-format" value="corporate" /><span>{t("f.corp.seg")}</span><em data-fprice="corporate">{F.corporate}</em></label>
                <label className="st-seg__o"><input type="radio" name="calc-format" value="ecommerce" /><span>{t("f.shop.t")}</span><em data-fprice="ecommerce">{F.ecommerce}</em></label>
              </div>
            </fieldset>
            {/* the sample site for the chosen format (the main page's configurator samples, js/sites-pv.js):
                 a photo studio for the landing (and its longer Лендінг+), a law firm for the 5–7 pages, a glass decor store;
                 3D-обʼєкт and Друга мова change it visibly; animation is in every price, so every sample moves. It moves only while it is on screen */}
            <div className="st-pv" data-pv-box="">
              <div className="pvw st-pvw" data-pv="" />
              {/* what the sample has, block by block (or page by page); Лендінг+'s extra blocks marked + */}
              <div className="st-pv__map" data-pv-map="" aria-live="polite"><p className="st-pv__k"><span>{t("pv.k")}</span> <b data-pv-count="" /></p><ul className="st-pv__list" data-pv-list="" /></div>
              <div className="st-stage__end">
                <p className="st-stage__note">{t("pv.note")}</p>
                <span className="ai-sample">{t("x.sample")}</span>
              </div>
            </div>
            <fieldset className="st-g">
              <legend className="ai-calc__l"><span>{t("g.look")}</span></legend>
              <div className="st-adds">
                <label className="st-add"><input type="checkbox" name="calc-3d" value="1" data-opt="three" /><span className="st-add__t">{t("o.3d._")}</span><span className="st-add__d">{t("o.3d.d")}</span><span className="st-add__p" data-oprice="three">+$400</span></label>
                <label className="st-add"><input type="checkbox" name="calc-lang" value="1" data-opt="lang" /><span className="st-add__t">{t("o.lang._")}</span><span className="st-add__d">{t("o.lang.d")}</span><span className="st-add__p" data-oprice="lang">+$100</span></label>
              </div>
            </fieldset>

            <p className="st-here" data-here="" hidden>{t("o.here")}</p>
          </div>

          {/* the sum, beside the choices (sticky); on narrow screens a bar at the bottom leads to it */}
          <div className="st-side" id="design-sum">
            <div className="ai-calc__card st-sum">
              <p className="ai-calc__k"><span>{t("calc.k")}</span><span className="ai-calc__weeks" data-calc-weeks="">≈ 1–2 тижні</span></p>
              <p className="ai-calc__name" data-calc-name="">Лендінг · базовий дизайн</p>
              <p className="ai-calc__x" data-calc-extra="" hidden />
              <p className="ai-calc__price"><b className="st-num" data-calc-price="">$500</b> <span>{t("once")}</span></p>
              <details className="ai-calc__inc">
                <summary><span>{t("inc.h")}</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-plus" /></svg></summary>
                <div data-calc-inc="" />
                <p className="ai-calc__note">{t("calc.extras")}</p>
              </details>
              <button className="btn btn--primary ai-calc__send" type="button" data-calc-send=""><span className="btn__label">{t("calc.send")}</span><ArrowIcon /></button>
              <p className="ai-calc__fine">{t("calc.fine")}</p>
              <p className="ai-calc__tol">{t("calc.tol")}</p>
              <p className="st-sum__more"><span>{t("calc.more._")}</span> <a className="link" href={`${home}#pricing`}>{t("calc.more.a")}</a></p>
              <p className="visually-hidden" aria-live="polite" data-calc-live="" />
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
