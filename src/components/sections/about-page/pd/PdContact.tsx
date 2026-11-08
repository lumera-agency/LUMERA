import { getLocale, getTranslations } from "next-intl/server";
import { ContactClient } from "@/components/sections/contact/ContactClient";
import { ArrowIcon } from "@/components/ui/icons/ArrowIcon";
import { PhoneIcon, TelegramIcon, ViberIcon } from "@/components/layout/site-nav/Contacts";
import { getSiteNav } from "@/content/site-nav";
import { aiRich as R } from "@/components/ai/rich";
import { PdCube } from "./PdCube";
import "@/components/sections/contact/contact.css";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/** The task chips of the main page's form, with the values /api/lead receives (as AboutContact has them) */
const TASKS = ["Новий сайт", "Оновлення сайту", "Реклама", "Аналітика", "Автоматизація", "Ще не знаю"] as const;

/** a step's tick (in place of the numerals: no numbers on the page) */
const TICK = (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6.5 12.5 3.5 3.5 7.5-8" /></svg>
);

/**
 * TEMPORARY · variant D, 4 · Заявка: D's own copy of PbContact (B's copy of AboutContact), the same form (its ids,
 * lead-form.js through ContactClient, /api/lead, the honeypot, the plan from the calculator, the done state), in the
 * reading order head → form → what happens next and the direct contacts, so the focus order is the order on the screen
 * on every width. «Що буде далі» is the next pipeline, queued: the main page's three steps (the second one's words are
 * about.pb.next2, without the minutes) as three hollow cubes on a vertical line, a tick on each; the contacts card (the
 * phones, Telegram, Viber; config/contacts through getSiteNav, as the header and footer have them) in the ads page's
 * card. 1200 and wider: the head, the queue and the card on cols 1–5, the form on 7–12, riding along. The page's one
 * lime button: «Надіслати заявку».
 */
export async function PdContact({ index }: { index: number }) {
  const t = await getTranslations();
  const a = await getTranslations("about");
  const nav = await getSiteNav(await getLocale());
  const steps = [
    { b: t("contact.next.b.1"), s: t("contact.next.span.1") },
    { b: a("pb.next2"), s: t("contact.next.span.2") },
    { b: t("contact.next.b.3"), s: t("contact.next.span.3") },
  ];
  return (
    <section className="section section--contact about-lead pd-lead" id="contact" aria-labelledby="contact-title">
      <span className="pd-grid" aria-hidden="true" />
      <div className="container pd-c">
        <div className="pd-lead__grid">
          <header className="s-head s-head--side pd-lead__head">
            <p className="s-head__meta s-head__meta--hatch">
              <span className="s-head__index">{index}</span>
              <span>{a("lead.meta")}</span>
            </p>
            <h2 className="s-head__title s-head__title--stone" id="contact-title" data-split="">
              <span className="tone tone--key">{t.rich("contact.title", R)}</span>
            </h2>
          </header>

          {/* /api/lead forwards leads to the channel set in the host's environment variables, never in this code */}
          <form className="lead-form card pd-lead__form" data-in="" data-lead-form="" method="post" action="#contact" data-endpoint="/api/lead" noValidate aria-labelledby="contact-title">
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

          <div className="pd-lead__aside">
            {/* what happens after the request: the main page's three steps as the next run, queued (no numerals) */}
            <div className="pd-next pd-frame" data-in="">
              <p className="pd-next__k" id="pd-next-k">{t("contact.next.label")}</p>
              <ol className="pd-next__list" aria-labelledby="pd-next-k">
                {steps.map(({ b, s }, i) => (
                  <li key={b} style={{ "--i": i } as CSSVars}>
                    <span className="pd-next__node">
                      <PdCube hollow />
                    </span>
                    <div>
                      <b>{b}</b>
                      <span>{s}</span>
                    </div>
                    <span className="pd-next__ok">{TICK}</span>
                  </li>
                ))}
              </ol>
            </div>
            {/* the direct ways: the phones to call, Telegram, Viber */}
            <div className="pd-card" data-in="">
              <p className="pd-card__k">{t("footer.map.contacts")}</p>
              <ul className="pd-card__tel">
                {nav.contacts.phones.map((p) => (
                  <li key={p.href}>
                    <a href={p.href} aria-label={`${nav.labels.call}: ${p.text}`}>
                      <PhoneIcon />
                      <span>{p.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="pd-card__chats">
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
