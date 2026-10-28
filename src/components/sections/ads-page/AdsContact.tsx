import { getTranslations } from "next-intl/server";
import { ContactClient } from "@/components/sections/contact/ContactClient";
import { ArrowIcon } from "@/components/ui/icons/ArrowIcon";
import { aiRich as R } from "@/components/ai/rich";
import "@/components/sections/contact/contact.css";

/**
 * 7 · Заявка, on the main page's form (sections/contact: lead-form.js validates it and sends it to /api/lead): the task
 * is fixed («Реклама», a hidden field, as the main form's chip). Quick picks add their words to the note (runtime); a
 * price card's «Обговорити» fills the plan box; the site field is optional. Beside the form, what happens next (the main
 * page's three steps) and what the visitor gets (the main page's «Що ви отримуєте», the ads part).
 */
export async function AdsContact({ index }: { index: number }) {
  const t = await getTranslations();
  const a = await getTranslations("ads");
  return (
    <section className="section section--contact ai-sec" id="contact" aria-labelledby="contact-title">
      <div className="container contact">
        <div className="contact__side">
          <header className="s-head s-head--side">
            <p className="s-head__meta s-head__meta--hatch">
              <span className="s-head__index">{index}</span>
              <span>{a("nav.lead")}</span>
            </p>
            <h2 className="s-head__title s-head__title--stone" id="contact-title" data-split="">
              <span className="tone tone--key">{a.rich("lead.title", R)}</span>
            </h2>
            <p className="s-head__intro">{a("lead.text")}</p>
          </header>
          {/* what happens after the request: the main page's three steps (contact.next) */}
          <ol className="ad-next" aria-label={t("contact.next.label")}>
            {[1, 2, 3].map((n) => (
              <li key={n}>
                <span aria-hidden="true">{n}</span>
                <div>
                  <b>{t(`contact.next.b.${n}`)}</b>
                  <span>{t(`contact.next.span.${n}`)}</span>
                </div>
              </li>
            ))}
          </ol>
          <div className="ad-get">
            <p className="ad-get__h">{a("get.h")}</p>
            <ul className="ad-get__list">
              {[1, 2, 3].map((n) => (
                <li key={n}>{a(`get.${n}`)}</li>
              ))}
            </ul>
          </div>
        </div>
        {/* /api/lead forwards leads to the channel set in the host's environment variables, never in this code */}
        <form className="lead-form card" data-lead-form="" method="post" action="#contact" data-endpoint="/api/lead" noValidate aria-labelledby="contact-title">
          <input type="hidden" name="lang" defaultValue="uk" data-form-lang="" />
          <input type="hidden" name="task" defaultValue="Реклама" />
          {/* a field people never see or reach: a bot that fills it in is ignored by /api/lead */}
          <div className="lead-form__hp" aria-hidden="true">
            <label>
              Fax <input type="text" name="fax" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div className="lead-form__errors" data-form-errors="" tabIndex={-1} hidden>
            <p>{t("contact.lead-form.errors.p")}</p>
            <ul></ul>
          </div>
          {/* what the visitor chose in block 5 (a price card's «Обговорити») */}
          <div className="lead-form__plan" data-form-plan="" hidden>
            <span>{a("form.plan")}</span>
            <b data-form-plan-name=""></b>
            <button type="button" className="lead-form__plan-x" data-form-plan-clear="" aria-label={a("form.planX")}>
              <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" /></svg>
            </button>
            <input type="hidden" name="package" data-form-plan-input="" />
            <p className="lead-form__plan-items" data-form-plan-items=""></p>
            <input type="hidden" name="details" data-form-plan-details="" />
          </div>
          <div className="field">
            <label htmlFor="f-name">{t("contact.field.label.1")}</label>
            <input id="f-name" name="name" type="text" autoComplete="name" required aria-describedby="f-name-err" />
            <p className="field__err" id="f-name-err" hidden>{t("contact.field.err.1")}</p>
          </div>
          <div className="field">
            <label htmlFor="f-contact">{t("contact.field.label.2")}</label>
            {/* a phone, a Telegram name or an email: no single kind, so the browser offers what it has */}
            <input id="f-contact" name="contact" type="text" autoComplete="on" required aria-describedby="f-contact-hint f-contact-err" />
            <p className="field__hint" id="f-contact-hint">{t("contact.field.hint")}</p>
            <p className="field__err" id="f-contact-err" hidden>{a("form.err2")}</p>
          </div>
          <div className="field">
            <label htmlFor="f-note">
              <span>{a("form.note")}</span> <span className="field__opt">{t("contact.field.opt")}</span>
            </label>
            <div className="ai-picks" role="group" aria-label={a("form.chips")}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button className="ai-pick" type="button" aria-pressed="false" key={n}>{a(`form.chip.${n}`)}</button>
              ))}
            </div>
            <textarea id="f-note" name="note" rows={3} placeholder={a("form.ph")}></textarea>
          </div>
          {/* the site the ads will lead to: /api/lead sends it as «Сайт: …». Phones fold it under «+ Додати сайт» (the
              owner, 28 Oct: fewer fields on a phone); wider screens open it (runtime: initFolds), its line hidden there */}
          <details className="ad-site-fold" data-fold="" open>
            <summary>{a("form.addSite")} <span className="field__opt">{t("contact.field.opt")}</span></summary>
            <div className="field">
              <label htmlFor="f-site">
                <span>{a("form.site")}</span> <span className="field__opt">{t("contact.field.opt")}</span>
              </label>
              <input id="f-site" name="site" type="text" inputMode="url" autoComplete="url" placeholder="vash-sait.ua" />
            </div>
          </details>
          {/* phones: the steps and the promises stand under the form, so the two that matter sit above its button */}
          <ul className="ad-sure">
            <li>{a("form.sure.1")}</li>
            <li>{a("form.sure.2")}</li>
          </ul>
          <div className="lead-form__foot">
            <button className="btn btn--primary" type="submit" data-form-submit="">
              <span className="btn__label">{t("contact.btn.label")}</span>
              <ArrowIcon />
            </button>
            <p className="lead-form__note">{t("contact.lead-form.note")}</p>
            <p className="lead-form__fail" data-form-fail="" role="alert" tabIndex={-1} hidden>{t("contact.lead-form.fail")}</p>
            <p className="lead-form__fail" data-form-fail-server="" role="alert" tabIndex={-1} hidden>{t("contact.lead-form.fail-server")}</p>
          </div>
          <div className="lead-form__done" data-form-done="" hidden tabIndex={-1}>
            <span className="check check--lg" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.2 4.2L19 7" /></svg></span>
            <p className="lead-form__done-title">{t("contact.lead-form.done-title")}</p>
            <p>{a("form.done")}</p>
          </div>
        </form>
      </div>
      <ContactClient />
    </section>
  );
}
