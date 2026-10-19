import { getTranslations } from "next-intl/server";
import { ContactClient } from "@/components/sections/contact/ContactClient";
import { ArrowIcon } from "@/components/ui/icons/ArrowIcon";
import { aiRich as R } from "@/components/ai/rich";
import "@/components/sections/contact/contact.css";

/**
 * 6 · Заявка, on the main page's form (sections/contact: lead-form.js validates it and sends it to /api/lead): the task
 * is fixed («Сайт», a hidden field), the formats are quick picks, and the plan box carries what the visitor chose in
 * block 2 or counted in block 3 (runtime: leadForm().setPlan). «Оновити сайт» opens the field for the current site.
 */
export async function SitesContact() {
  const t = await getTranslations();
  const s = await getTranslations("sites");
  const picks = [
    ["landing", s("f.landing.t")],
    ["landingPlus", s("f.plus.t")],
    ["corporate", s("f.corp.t")],
    ["ecommerce", s("f.shop.t")],
    ["update", s("form.chip.update")],
    ["unsure", s("form.chip.unsure")],
  ];
  return (
    <section className="section section--contact ai-sec" id="contact" aria-labelledby="contact-title">
      <div className="container contact">
        <div className="contact__side">
          <header className="s-head s-head--side">
            <p className="s-head__meta s-head__meta--hatch">
              <span className="s-head__index">6</span>
              <span>{s("x.nav.lead")}</span>
            </p>
            <h2 className="s-head__title s-head__title--stone" id="contact-title" data-split="">
              <span className="tone tone--key">{s.rich("lead.title", R)}</span>
            </h2>
            <p className="s-head__intro">{s("lead.text")}</p>
          </header>
          <div className="st-get">
            <p className="st-get__h">{s("get.h")}</p>
            <ul className="st-get__list">
              <li>{s("get.1")}</li>
              <li>{s("get.2")}</li>
              <li>{s("get.3")}</li>
            </ul>
          </div>
        </div>
        {/* /api/lead forwards leads to the channel set in the host's environment variables, never in this code */}
        <form className="lead-form card" data-lead-form="" method="post" action="#contact" data-endpoint="/api/lead" noValidate aria-labelledby="contact-title">
          <input type="hidden" name="lang" defaultValue="uk" data-form-lang="" />
          <input type="hidden" name="task" defaultValue="Сайт" />
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
          {/* the format chosen in block 2 or the sum counted in block 3 */}
          <div className="lead-form__plan" data-form-plan="" hidden>
            <span>{s("att._")}</span>
            <b data-form-plan-name=""></b>
            <button type="button" className="lead-form__plan-x" data-form-plan-clear="" aria-label={s("att.x")}>
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
            {/* (QA 19 Oct, S-24) a phone, a Telegram name or an email: no single kind, so the browser offers what it has
                rather than phone numbers only */}
            <input id="f-contact" name="contact" type="text" autoComplete="on" required aria-describedby="f-contact-hint f-contact-err" />
            <p className="field__hint" id="f-contact-hint">{t("contact.field.hint")}</p>
            <p className="field__err" id="f-contact-err" hidden>{t("contact.field.err.2")}</p>
          </div>
          <div className="field">
            <label htmlFor="f-note">
              <span>{s("form.note")}</span> <span className="field__opt">{t("contact.field.opt")}</span>
            </label>
            {/* quick picks: a tap puts the format into the plan box (and takes it out again); the field stays free text */}
            <div className="ai-picks" role="group" aria-label={s("form.chips.label")}>
              {picks.map(([pick, text]) => (
                <button className="ai-pick" type="button" aria-pressed="false" data-pick={pick} key={pick}>{text}</button>
              ))}
            </div>
            <textarea id="f-note" name="note" rows={3} placeholder={s("form.ph")}></textarea>
          </div>
          <div className="field" data-site-field="" hidden>
            <label htmlFor="f-site">
              <span>{s("form.site")}</span> <span className="field__opt">{t("contact.field.opt")}</span>
            </label>
            <input id="f-site" name="site" type="text" inputMode="url" autoComplete="url" placeholder="vash-sait.ua" />
          </div>
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
            <p>{t("contact.lead-form.done.p")}</p>
          </div>
        </form>
      </div>
      <ContactClient />
    </section>
  );
}
