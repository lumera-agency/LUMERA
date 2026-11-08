import { getLocale, getTranslations } from "next-intl/server";
import { ContactClient } from "@/components/sections/contact/ContactClient";
import { ArrowIcon } from "@/components/ui/icons/ArrowIcon";
import { PhoneIcon, TelegramIcon, ViberIcon } from "@/components/layout/site-nav/Contacts";
import { getSiteNav } from "@/content/site-nav";
import { aiRich as R } from "@/components/ai/rich";
import { Stack, Tick, type CSSVars } from "./PfParts";
import "@/components/sections/contact/contact.css";

/** The task chips of the main page's form, with the values /api/lead receives (as AboutContact has them) */
const TASKS = ["Новий сайт", "Оновлення сайту", "Реклама", "Аналітика", "Автоматизація", "Ще не знаю"] as const;

/**
 * TEMPORARY · variant F, 4 · Заявка: F's own copy of PbContact, the same form (its ids, lead-form.js through
 * ContactClient, /api/lead, the honeypot, the plan from the calculator, the done state), in the reading order head →
 * form → what happens next → the direct contacts, so the focus order is the order on the screen on every width.
 * The chat's last screen: wide screens, the head on the left (sticky), the thread column on the right. The form is the
 * chat's composer card (its bar: the team's badges and name, as the chat's header; the task chips are its quick
 * replies, a chosen one in the ink of the visitor's own bubbles); under it «Що буде далі» (contact.next.*, step two
 * about.pb.next2 as B has it), three system messages with ticks on one line (21st.dev's Order tracking), ticked one
 * after another as they come into view (runtime/pf.js, scene «next»); then the contacts card (config/contacts through
 * getSiteNav, as the header and footer have them). The page's one lime button: «Надіслати заявку».
 */
export async function PfContact({ index }: { index: number }) {
  const t = await getTranslations();
  const a = await getTranslations("about");
  const nav = await getSiteNav(await getLocale());
  const steps = [
    { b: t("contact.next.b.1"), s: t("contact.next.span.1") },
    { b: a("pb.next2"), s: t("contact.next.span.2") },
    { b: t("contact.next.b.3"), s: t("contact.next.span.3") },
  ];
  return (
    <section className="section section--contact about-lead pf-lead" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <div className="pf-chat pf-chat--lead">
          <header className="s-head s-head--side pf-side pf-lead__head">
            <p className="s-head__meta s-head__meta--hatch">
              <span className="s-head__index">{index}</span>
              <span>{a("lead.meta")}</span>
            </p>
            <h2 className="s-head__title s-head__title--stone" id="contact-title" data-split="">
              <span className="tone tone--key">{t.rich("contact.title", R)}</span>
            </h2>
          </header>

          <div className="pf-room pf-lead__room">
            {/* /api/lead forwards leads to the channel set in the host's environment variables, never in this code */}
            <form className="lead-form card pf-compose" data-in="" data-lead-form="" method="post" action="#contact" data-endpoint="/api/lead" noValidate aria-labelledby="contact-title">
              {/* the composer's bar: to whom the message goes (the chat's header; said by the title) */}
              <div className="pf-compose__bar" aria-hidden="true">
                <Stack />
                <span>{a("work.sign")}</span>
              </div>
              <input type="hidden" name="lang" defaultValue="uk" data-form-lang="" />
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
                <span>{t("contact.lead-form.plan.span")}</span>
                <b data-form-plan-name=""></b>
                <button type="button" className="lead-form__plan-x" data-form-plan-clear="" aria-label={t("contact.lead-form.plan-x.label")}>
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
              <fieldset className="field field--chips" aria-describedby="f-task-err">
                <legend>{t("contact.field.legend")}</legend>
                <div className="chips">
                  {TASKS.map((value, i) => (
                    <label className="chip" key={value}>
                      <input id={i === 0 ? "f-task" : undefined} type="radio" name="task" value={value} required={i === 0} />
                      <span>{t(`contact.chip.span.${i + 1}`)}</span>
                    </label>
                  ))}
                </div>
                <p className="field__err" id="f-task-err" hidden>{t("contact.field.err.3")}</p>
              </fieldset>
              <div className="field">
                <label htmlFor="f-note">
                  <span>{t("contact.field.span.2")}</span> <span className="field__opt">{t("contact.field.opt")}</span>
                </label>
                <textarea id="f-note" name="note" rows={3} placeholder={t("contact.field.textarea.placeholder")}></textarea>
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

            {/* what happens after the request: the main page's three steps, as the chat's system messages (no numerals) */}
            <div className="pf-next" data-pf-next="">
              <p className="pf-next__k" id="pf-next-k"><span>{t("contact.next.label")}</span></p>
              <ol className="pf-next__list" aria-labelledby="pf-next-k">
                {steps.map(({ b, s }, k) => (
                  <li key={b} style={{ "--k": k } as CSSVars}>
                    <span className="pf-next__ok"><Tick /></span>
                    <div>
                      <b>{b}</b>
                      <span>{s}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* the direct ways: the phones to call, Telegram, Viber */}
            <div className="pf-card" data-in="">
              <p className="pf-card__k">{t("footer.map.contacts")}</p>
              <ul className="pf-card__tel">
                {nav.contacts.phones.map((p) => (
                  <li key={p.href}>
                    <a href={p.href} aria-label={`${nav.labels.call}: ${p.text}`}>
                      <PhoneIcon />
                      <span>{p.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="pf-card__chats">
                <a href={nav.contacts.telegram} target="_blank" rel="noopener" aria-label={nav.labels.telegram}>
                  <TelegramIcon />
                  <span>Telegram</span>
                </a>
                <a href={nav.contacts.viber} aria-label={nav.labels.viber}>
                  <ViberIcon />
                  <span>Viber</span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <ContactClient />
    </section>
  );
}
