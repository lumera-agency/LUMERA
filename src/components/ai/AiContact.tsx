import { getTranslations } from "next-intl/server";
import { ContactClient } from "@/components/sections/contact/ContactClient";
import { ArrowIcon } from "@/components/ui/icons/ArrowIcon";
import { CONTACTS, phoneText, telHref } from "@/config/contacts";
import { aiRich } from "./rich";
import "@/components/sections/contact/contact.css";

type Props = {
  index: number;
  /** the note field's example */
  placeholder: string;
  /** quick picks: a tap adds the phrase to the note field (runtime/ai-runtime.js) */
  picks?: { label: string; items: string[] };
  /** the calculator's result in the form (the main form's plan box): its label and its «take it out» */
  plan?: { label: string; clear: string };
};

/**
 * The request, on the main page's form (sections/contact: lead-form.js validates and sends it to /api/lead): the task
 * is fixed («Автоматизація», a hidden field), the note asks what is still done by hand.
 */
export async function AiContact({ index, placeholder, picks, plan }: Props) {
  const t = await getTranslations();
  const c = await getTranslations("aiCommon");
  return (
    <section className="section section--contact ai-sec" id="contact" aria-labelledby="contact-title">
      <div className="container contact">
        <div className="contact__side">
          <header className="s-head s-head--side">
            <p className="s-head__meta s-head__meta--hatch">
              <span className="s-head__index">{index}</span>
              <span>{c("nav.lead")}</span>
            </p>
            <h2 className="s-head__title s-head__title--stone" id="contact-title" data-split="">
              <span className="tone tone--key">{c.rich("lead.title", aiRich)}</span>
            </h2>
            <p className="s-head__intro">{c("lead.text")}</p>
          </header>
        </div>
        {/* /api/lead forwards leads to the channel set in the host's environment variables, never in this code */}
        <form className="lead-form card" data-lead-form="" method="post" action="#contact" data-endpoint="/api/lead" noValidate aria-labelledby="contact-title">
          <input type="hidden" name="lang" defaultValue="uk" data-form-lang="" />
          <input type="hidden" name="task" defaultValue="Автоматизація" />
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
          <div className="lead-form__plan" data-form-plan="" hidden>
            <span>{plan?.label ?? t("contact.lead-form.plan.span")}</span>
            <b data-form-plan-name=""></b>
            <button type="button" className="lead-form__plan-x" data-form-plan-clear="" aria-label={plan?.clear ?? t("contact.lead-form.plan-x.label")}>
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
            <input id="f-contact" name="contact" type="text" autoComplete="tel" required aria-describedby="f-contact-hint f-contact-err" />
            <p className="field__hint" id="f-contact-hint">{t("contact.field.hint")}</p>
            <p className="field__err" id="f-contact-err" hidden>{t("contact.field.err.2")}</p>
          </div>
          <div className="field">
            <label htmlFor="f-note">
              <span>{c("form.manual.text")}</span> <span className="field__opt">{t("contact.field.opt")}</span>
            </label>
            {picks && (
              <div className="ai-picks" role="group" aria-label={picks.label}>
                {picks.items.map((item) => (
                  <button className="ai-pick" type="button" aria-pressed="false" key={item}>{item}</button>
                ))}
              </div>
            )}
            <textarea id="f-note" name="note" rows={3} placeholder={placeholder}></textarea>
          </div>
          <div className="lead-form__foot">
            <button className="btn btn--primary" type="submit" data-form-submit="">
              <span className="btn__label">{t("contact.btn.label")}</span>
              <ArrowIcon />
            </button>
            <p className="lead-form__note">{t("contact.lead-form.note")}</p>
            {/* the form is sent by its script: without one it would only reload the page, so the phones take over */}
            <noscript>
              <p className="lead-form__fail">
                {c("form.noscript")}{" "}
                {CONTACTS.phones.map((n, i) => (
                  <span key={n}>
                    {i > 0 && ", "}
                    <a className="link" href={telHref(n)}>{phoneText(n)}</a>
                  </span>
                ))}
              </p>
            </noscript>
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
