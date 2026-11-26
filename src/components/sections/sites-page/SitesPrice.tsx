import { getLocale, getTranslations } from "next-intl/server";
import { ArrowIcon } from "@/components/ui/icons/ArrowIcon";
import { aiRich as R } from "@/components/ai/rich";
import type { SitesFacts } from "@/components/sites/facts";
import { aiHref } from "@/components/ai/links";
import { telegramHref } from "@/config/contacts";
import { TelegramIcon } from "@/components/layout/site-nav/Contacts";

/**
 * 3 · Ціна: the format, the live sample site (the main page's configurator samples, the vanilla engine in
 * components/sites/runtime), 3D-обʼєкт and Друга мова, the sum. Under the sum the request itself (the owner, 26 Nov
 * 2026): one field, a phone or a Telegram name, sent with the sum counted through the page's form handler
 * (sites-runtime initCalcLead → /api/lead, form: calculator); then the sum to Telegram; then «Обговорити проєкт», which
 * puts the sum into the form at the foot of the page.
 */
export async function SitesPrice({ facts: F }: { facts: SitesFacts }) {
  const t = await getTranslations("sites");
  const q = await getTranslations("quote");
  const locale = await getLocale();
  // the main page's calculator, in the page's language (/#pricing, /ru#pricing)
  const home = aiHref(locale, "/");
  return (
    <section className="section ai-sec st-design" id="kalkuliator" aria-labelledby="design-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta"><span className="s-head__index">3</span><span>{t("nav.design")}</span></p>
          <h2 data-split="" className="s-head__title" id="design-title"><span className="tone">{t.rich("design.title", R)}</span></h2>
          <p className="s-head__intro">{t("design.intro")}</p>
        </header>

        {/* (a group, not a form: the request inside the sum card is a form of its own, and forms do not nest) */}
        <div className="st-calc" data-calc="" role="group" aria-labelledby="design-title">
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
              {/* what the sample has, block by block (or page by page); Лендінг+ shows its main page only: said under the list */}
              <div className="st-pv__map" data-pv-map="" aria-live="polite">
                <p className="st-pv__k"><span>{t("pv.k")}</span> <b data-pv-count="" /></p>
                <ul className="st-pv__list" data-pv-list="" />
                <p className="st-pv__more" data-pv-more="" hidden>{t("pv.plus")}</p>
              </div>
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

          {/* the sum, beside the choices (sticky); on narrow screens a bar at the bottom leads to its request */}
          <div className="st-side" id="design-sum">
            <div className="ai-calc__card st-sum" data-tg-card="">
              <p className="ai-calc__k"><span>{t("calc.k")}</span><span className="ai-calc__weeks" data-calc-weeks="" data-tg-line="4">{F.wLanding}</span></p>
              <p className="ai-calc__name" data-calc-name="" data-tg-line="1">{`${t("f.landing.t")} · ${t("calc.design")}`}</p>
              <p className="ai-calc__x" data-calc-extra="" data-tg-line="2" hidden />
              <p className="ai-calc__price" data-tg-line="3"><b className="st-num" data-calc-price="">{F.landing}</b> <span>{t("once")}</span></p>
              <details className="ai-calc__inc">
                <summary><span>{t("inc.h")}</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-plus" /></svg></summary>
                <div data-calc-inc="" />
                <p className="ai-calc__note">{t("calc.extras")}</p>
              </details>
              {/* the request right here: the phone or the Telegram name, the sum goes with it (the same chat as the form's) */}
              <form className="st-lead" id="calc-lead" data-calc-lead="" data-endpoint="/api/lead" noValidate aria-label={t("calc.lead.btn")}>
                <input type="hidden" name="lang" defaultValue={locale} />
                <input type="hidden" name="task" defaultValue="Сайт" />
                <input type="hidden" name="form" defaultValue="calculator" />
                <input type="hidden" name="package" defaultValue="" />
                <input type="hidden" name="details" defaultValue="" />
                {/* a field people never see or reach: a bot that fills it in is ignored by /api/lead */}
                <div className="lead-form__hp" aria-hidden="true">
                  <label>
                    Fax <input type="text" name="fax" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
                <label className="st-lead__l" htmlFor="calc-contact">{t("calc.lead.l")}</label>
                <input className="st-lead__in" id="calc-contact" name="contact" type="text" autoComplete="tel" required aria-describedby="calc-contact-err calc-lead-note" />
                <p className="st-lead__err" id="calc-contact-err" hidden>{t("x.form.contact.err")}</p>
                <button className="btn btn--primary ai-calc__send st-lead__go" type="submit"><span className="btn__label">{t("calc.lead.btn")}</span><ArrowIcon /></button>
                <p className="st-lead__note" id="calc-lead-note">{t("calc.lead.note")} {t("x.form.note")}</p>
                <p className="st-lead__fail" data-lead-fail="" role="alert" tabIndex={-1} hidden>{t("x.form.fail._")}</p>
                <p className="st-lead__fail" data-lead-fail-server="" role="alert" tabIndex={-1} hidden>{t("x.form.fail.server")}</p>
                <p className="st-lead__done" data-lead-done="" tabIndex={-1} hidden>
                  <span className="check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.2 4.2L19 7" /></svg></span>
                  <span>{t("calc.lead.done")}</span>
                </p>
              </form>
              {/* the sum to the studio's Telegram, its message filled in (the owner, 26 Nov 2026; layout/dock/tg-quote) */}
              <a className="tg-quote" href={telegramHref()} target="_blank" rel="noopener" data-tg-quote="" data-tg-hello={q("hello")} data-tg-from={q("from")}>
                <TelegramIcon />
                <span>{q("btn")}</span>
              </a>
              {/* to the form at the foot of the page, the sum in its plan box */}
              <a className="st-sum__talk" href="#contact" data-calc-send=""><span>{t("calc.send")}</span><ArrowIcon /></a>
              <p className="ai-calc__fine">{t("calc.fine")}</p>
              <p className="ai-calc__tol">{t("calc.tol")}</p>
              <p className="st-sum__more"><span>{t("calc.more._")}</span> <a className="link" href={`${home}#pricing`}>{t("calc.more.a")}</a></p>
              <p className="visually-hidden" aria-live="polite" data-calc-live="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
