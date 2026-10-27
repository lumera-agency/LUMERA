import { getLocale, getTranslations } from "next-intl/server";
import { rich } from "@/lib/rich";
import { aiHref } from "@/components/ai/links";
import { PRICES } from "../copy";

/** 3 · Автоматизація: requests to the CRM and Telegram, data from emails, the assistant. Markup ported 1:1 from website-v2; the clip is demos/timelines.js.
 *  «Детальніше» opens the AI page (/ai-avtomatyzatsiia) instead of a card. */
export async function ServiceAutomation() {
  const t = await getTranslations();
  const prices = PRICES;
  const locale = await getLocale();
  return (
    <article className="service" id="svc-3" data-sr="">
      <div className="service__demo">
        <button className="demo-replay" type="button" data-replay="" aria-label={t("services.replay.label")}>
          <span className="demo-replay__icon" aria-hidden="true">↻</span>
          <span className="demo-replay__label">{t("services.replay.text")}</span>
        </button>
        <div className="demo demo--leads" data-demo="leads" aria-hidden="true">
          <span className="demo__glow"></span>
          <div className="mock-window">
            <div className="mock-window__bar">
              <i></i>
              <i></i>
              <i></i>
              <span className="d-host">
                <b data-host="0">{t("services.mh.brand")}</b>
                <b data-host="1">
                  <span className="d-host__l">{t("services.auto.host.1.text")}</span>
                  <span className="d-host__s">{t("services.auto.host.1.short")}</span>
                </b>
                <b data-host="2">
                  <span className="d-host__l">{t("services.auto.host.2.text")}</span>
                  <span className="d-host__s">{t("services.auto.host.2.short")}</span>
                </b>
                <b data-host="3">
                  <span className="d-host__l">{t("services.auto.host.3.text")}</span>
                  <span className="d-host__s">{t("services.auto.host.3.short")}</span>
                </b>
              </span>
              <span className="mock-window__time">
                <span className="clock">
                  <b>14:02</b>
                  <b>14:17</b>
                  <b>16:30</b>
                  <b>22:40</b>
                </span>
              </span>
              <span className="mock-window__sample">{t("services.demo.sample")}</span>
            </div>
            <div className="d-stage">
              <div className="d-scenes au">
                {/* 1 · a request lands in the CRM, the manager is told, and reminded */}
                <section className="d-scene au-req">
                  <div className="au-col">
                    <div className="au-card">
                      <i className="au-av">{t("services.lead-card.initial")}</i>
                      <p className="au-id">
                        <b>{t("services.lead-card.name")}</b>
                        <span className="au-src">
                          <i className="au-g">G</i>
                          <span>{t("services.lead-card.src")}</span>
                        </span>
                      </p>
                      <em className="au-new">
                        <b className="au-new__hot">{t("services.ml.col.new")}</b>
                        <b className="au-new__cold">{t("services.ml.col.new")}</b>
                      </em>
                    </div>
                    <div className="au-ev">
                      <p className="au-line">
                        <span className="au-line__in">
                          <svg viewBox="0 0 24 24">
                            <path d="M21 3 3 10.5l7 2.5 2.5 7z" />
                            <path d="m10 13 4.5-4.5" />
                          </svg>
                          <span>{t("services.leads.tg")}</span>
                        </span>
                      </p>
                      <p className="au-late">{t("services.leads.sla.late")}</p>
                      <p className="au-ok">
                        <svg viewBox="0 0 24 24">
                          <path d="m5 12.5 4.2 4.2L19 7" />
                        </svg>
                        <span>{t("services.leads.remindSent")}</span>
                      </p>
                    </div>
                  </div>
                </section>
                {/* 2 · routine: the data in an email moves into the table by itself */}
                <section className="d-scene au-mails">
                  <div className="au-col">
                    <div className="au-mail">
                      <svg viewBox="0 0 24 24">
                        <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
                        <path d="m4 7 8 6 8-6" />
                      </svg>
                      <p className="au-mail__from">{t.rich("services.auto.mail.from", rich)}</p>
                      <p className="au-mail__body">{t.rich("services.auto.mail.body", rich)}</p>
                    </div>
                    <div className="au-tab">
                      <div className="au-sheet">
                        <p className="au-tr au-tr--head">
                          <span>{t("services.auto.col.1")}</span>
                          <span>{t("services.auto.col.3")}</span>
                          <span>{t("services.auto.col.4")}</span>
                        </p>
                        <p className="au-tr au-tr--fill">
                          <i className="au-bar"></i>
                          <span className="au-td">{t("services.lead-card.name")}</span>
                          <span className="au-td">20 000 ₴</span>
                          <span className="au-td">15.11</span>
                        </p>
                      </div>
                      <p className="au-stamp">
                        <svg viewBox="0 0 24 24">
                          <path d="m5 12.5 4.2 4.2L19 7" />
                        </svg>
                        <span>{t("services.auto.done")}</span>
                      </p>
                    </div>
                  </div>
                </section>
                {/* 3 · the assistant answers on the site and in Telegram, and hands over what it doesn't know */}
                <section className="d-scene au-chat">
                  <div className="au-col">
                    <p className="au-ch">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="8.5" />
                        <path d="M3.5 12h17M12 3.5c2.6 2.4 3.6 5.3 3.6 8.5s-1 6.1-3.6 8.5c-2.6-2.4-3.6-5.3-3.6-8.5S9.4 5.9 12 3.5z" />
                      </svg>
                      <svg viewBox="0 0 24 24">
                        <path d="M21 3 3 10.5l7 2.5 2.5 7z" />
                        <path d="m10 13 4.5-4.5" />
                      </svg>
                    </p>
                    <div className="au-view">
                      <div className="au-thread">
                        <p className="au-q">{t("services.auto.chat.q1")}</p>
                        <div className="au-aw">
                          <p className="au-typing">
                            <i></i>
                            <i></i>
                            <i></i>
                          </p>
                          <p className="au-a">{t("services.auto.chat.a1")}</p>
                        </div>
                        <p className="au-q">{t("services.auto.chat.q2")}</p>
                        <div className="au-aw">
                          <p className="au-typing">
                            <i></i>
                            <i></i>
                            <i></i>
                          </p>
                          <p className="au-a">{t("services.auto.chat.a2")}</p>
                        </div>
                        <p className="au-hand">
                          →{" "}
                          <span>{t("services.auto.chat.handoff")}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
                {/* the rest frame: the three results, one line each (no JS / reduced motion: this alone) */}
                <section className="d-scene au-sum">
                  <ol className="au-sum__list">
                    <li>
                      <i>1</i>
                      <span>{t("services.auto.sum.1")}</span>
                    </li>
                    <li>
                      <i>2</i>
                      <span>{t("services.auto.sum.2")}</span>
                    </li>
                    <li>
                      <i>3</i>
                      <span>{t("services.auto.sum.3")}</span>
                    </li>
                  </ol>
                </section>
              </div>
            </div>
            <p className="d-cap" aria-hidden="true">
              <i className="d-cap__dot"></i>
              <span className="d-cap__set">
                <b data-cap="1">{t("services.auto.cap.1")}</b>
                <b data-cap="2">{t("services.auto.cap.2")}</b>
                <b data-cap="3">{t("services.auto.cap.3")}</b>
              </span>
            </p>
          </div>
          <div className="demo-steps">
            <span className="demo-steps__line demo-steps__line--stub">
              <b></b>
            </span>
            <span className="demo-steps__step">
              <span className="demo-steps__num">
                <i></i>
                <em>1</em>
              </span>
              <span>{t("services.leads.step.1")}</span>
            </span>
            <span className="demo-steps__line">
              <b></b>
            </span>
            <span className="demo-steps__step">
              <span className="demo-steps__num">
                <i></i>
                <em>2</em>
              </span>
              <span>{t("services.leads.step.2")}</span>
            </span>
            <span className="demo-steps__line">
              <b></b>
            </span>
            <span className="demo-steps__step">
              <span className="demo-steps__num">
                <i></i>
                <em>3</em>
              </span>
              <span>{t("services.leads.step.3")}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="service__body">
        <p className="service__meta">
          <span>3</span>
          <span>{t("services.service.meta.span.3")}</span>
        </p>
        <h3 className="service__title">{t("services.service.title.3")}</h3>
        <p className="service__text">{t("services.service.text.3")}</p>
        <div className="service__foot">
          <p className="service__price">{t("services.price.3.text", prices)}</p>
          {/* the AI page has it all (the services, examples, the case, the calculator): «Детальніше» opens it */}
          <a className="service__more-btn service__more-link" href={aiHref(locale, "/ai-avtomatyzatsiia")}>
            <span>{t("services.more.label")}</span>
          </a>
        </div>
      </div>
    </article>
  );
}
