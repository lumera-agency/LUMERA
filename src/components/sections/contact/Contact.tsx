import { getTranslations } from "next-intl/server";
import { rich } from "@/lib/rich";
import { ContactClient } from "./ContactClient";
import "./contact.css";

/**
 * 8 · Заявка: what happens after the request, what the client gets, and the form (lead-form.js:
 * chips, validation, the plan from the configurator, sending to /api/lead).
 */
export async function Contact() {
  const t = await getTranslations();
  return (
    <>
      <section className="section section--contact" id="contact" aria-labelledby="contact-title">
        <div className="container contact">
          <div className="contact__side">
            <header className="s-head s-head--side">
              <p className="s-head__meta s-head__meta--hatch" data-sr="">
                <span className="s-head__index">8</span>
                <span>{t("nav.contact")}</span>
              </p>
              <h2 className="s-head__title s-head__title--stone" id="contact-title" data-split="">
                <span className="tone tone--key">{t.rich("contact.title", rich)}</span>
              </h2>
            </header>
            <ol className="next" data-sr="" aria-label={t("contact.next.label")}>
              <li>
                <span>1</span>
                <div>
                  <b>{t("contact.next.b.1")}</b>
                  <span>{t("contact.next.span.1")}</span>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <b>{t("contact.next.b.2")}</b>
                  <span>{t("contact.next.span.2")}</span>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <b>{t("contact.next.b.3")}</b>
                  <span>{t("contact.next.span.3")}</span>
                </div>
              </li>
            </ol>
            <section className="get" aria-labelledby="get-t" data-sr="">
              <p className="get__t" id="get-t">{t("contact.get.title")}</p>
              <ul className="checks get__list">
                <li className="is-done">
                  <span className="check" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="m5 12.5 4.2 4.2L19 7" />
                    </svg>
                  </span>
                  <div>
                    <span>{t("contact.get.1")}</span>
                  </div>
                </li>
                <li className="is-done">
                  <span className="check" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="m5 12.5 4.2 4.2L19 7" />
                    </svg>
                  </span>
                  <div>
                    <span>{t("contact.get.2")}</span>
                  </div>
                </li>
                <li className="is-done">
                  <span className="check" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="m5 12.5 4.2 4.2L19 7" />
                    </svg>
                  </span>
                  <div>
                    <span>{t("contact.get.3")}</span>
                  </div>
                </li>
                <li className="is-done">
                  <span className="check" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="m5 12.5 4.2 4.2L19 7" />
                    </svg>
                  </span>
                  <div>
                    <span>{t("contact.get.4")}</span>
                  </div>
                </li>
              </ul>
            </section>
            <p className="contact__alt">{t("contact.materials")}</p>
          </div>
          {/* data-endpoint: where leads go. /api/lead (api/lead.js) forwards them to the channel set in the host's
               environment variables (a webhook or a Telegram bot), never in this code. */}
          <form className="lead-form card" data-lead-form="" method="post" action="#contact" data-endpoint="/api/lead" noValidate aria-labelledby="contact-title" data-sr="">
            <input type="hidden" name="lang" defaultValue="uk" data-form-lang="" />
            {/* a field people never see or reach: a bot that fills it in is ignored by /api/lead */}
            <div className="lead-form__hp" aria-hidden="true">
              <label>
                Fax{" "}
                <input type="text" name="fax" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <div className="lead-form__errors" data-form-errors="" tabIndex={-1} hidden>
              <p>{t("contact.lead-form.errors.p")}</p>
              <ul></ul>
            </div>
            <div className="lead-form__plan" data-form-plan="" hidden>
              <span>{t("contact.lead-form.plan.span")}</span>
              <b data-form-plan-name=""></b>
              <button type="button" className="lead-form__plan-x" data-form-plan-clear="" aria-label={t("contact.lead-form.plan-x.label")}>
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
                </svg>
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
            <fieldset className="field field--chips" aria-describedby="f-task-err">
              <legend>{t("contact.field.legend")}</legend>
              <div className="chips">
                <label className="chip">
                  <input id="f-task" type="radio" name="task" value="Новий сайт" required />
                  <span>{t("contact.chip.span.1")}</span>
                </label>
                <label className="chip">
                  <input type="radio" name="task" value="Оновлення сайту" />
                  <span>{t("contact.chip.span.2")}</span>
                </label>
                <label className="chip">
                  <input type="radio" name="task" value="Реклама" />
                  <span>{t("contact.chip.span.3")}</span>
                </label>
                <label className="chip">
                  <input type="radio" name="task" value="Аналітика" />
                  <span>{t("contact.chip.span.4")}</span>
                </label>
                <label className="chip">
                  <input type="radio" name="task" value="Автоматизація" />
                  <span>{t("contact.chip.span.5")}</span>
                </label>
                <label className="chip">
                  <input type="radio" name="task" value="Ще не знаю" />
                  <span>{t("contact.chip.span.6")}</span>
                </label>
              </div>
              <p className="field__err" id="f-task-err" hidden>{t("contact.field.err.3")}</p>
            </fieldset>
            <div className="field">
              <label htmlFor="f-site">
                <span>{t("contact.field.span.1")}</span>
                {" "}
                <span className="field__opt">{t("contact.field.opt")}</span>
              </label>
              <input id="f-site" name="site" type="text" inputMode="url" autoComplete="url" placeholder="vash-sait.ua" />
            </div>
            <div className="field">
              <label htmlFor="f-note">
                <span>{t("contact.field.span.2")}</span>
                {" "}
                <span className="field__opt">{t("contact.field.opt")}</span>
              </label>
              <textarea id="f-note" name="note" rows={3} placeholder={t("contact.field.textarea.placeholder")}></textarea>
            </div>
            <div className="lead-form__foot">
              <button className="btn btn--primary" type="submit" data-form-submit="">
                <span className="btn__label">{t("contact.btn.label")}</span>
                <span className="btn__icon" aria-hidden="true">
                  <svg className="arrow arrow--a" viewBox="0 0 24 24">
                    <path d="M7 17 17 7M8.5 7H17v8.5" />
                  </svg>
                  <svg className="arrow arrow--b" viewBox="0 0 24 24">
                    <path d="M7 17 17 7M8.5 7H17v8.5" />
                  </svg>
                </span>
              </button>
              <p className="lead-form__note">{t("contact.lead-form.note")}</p>
              <p className="lead-form__fail" data-form-fail="" role="alert" tabIndex={-1} hidden>{t("contact.lead-form.fail")}</p>
              <p className="lead-form__fail" data-form-fail-server="" role="alert" tabIndex={-1} hidden>{t("contact.lead-form.fail-server")}</p>
            </div>
            <div className="lead-form__done" data-form-done="" hidden tabIndex={-1}>
              <span className="check check--lg" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="m5 12.5 4.2 4.2L19 7" />
                </svg>
              </span>
              <p className="lead-form__done-title">{t("contact.lead-form.done-title")}</p>
              <p>{t("contact.lead-form.done.p")}</p>
            </div>
          </form>
        </div>
      </section>
      <ContactClient />
    </>
  );
}
