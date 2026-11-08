import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { Stack, TeamMsg, Tick, YouMsg, type CSSVars } from "./PfParts";

/** the four key tags of «Усе на вас» (about.pb.tag.1–4: the words of about.work.5.d) */
const TAGS = [1, 2, 3, 4] as const;

/** the report's three bars (a picture: no numbers), each its share of the card's width */
const BARS = [0.9, 0.56, 0.3] as const;

/**
 * TEMPORARY · variant F, 2 · Як ми працюємо: the project chat, the page's one light block. Wide screens: the head on the
 * left, sticky, with the chat's «files» panel under it (the five things, each ticked as its message arrives: 21st.dev's
 * Order tracking; aria-hidden, the thread says them); the thread on the right (a column of about 40 rem) under the
 * chat's own header. The thread (motionsites' Interior Features and Social Hangouts: chat bubbles with small UI laid
 * over them) delivers the five things as attachments, each message signed by the role that sends it:
 * · «Ви» taps the quick reply «Новий сайт» (contact.chip.span.1), «Супровід» answers (contact.next.span.1);
 * · «Сайти, реклама, автоматизація»: «План робіт», a document (about.work.1.h / .k / .d);
 * · «Дизайн і розробка»: «Макет і тексти», two pictures «Комп’ютер» / «Телефон» (about.pb.pc / pb.phone, work.2.*);
 * · «Дизайн і розробка»: «Тестова адреса», a link preview «vash-sait.ua» (about.pb.url, work.3.*), then the system's
 *   notice «Тестова заявка» (about.pb.toast, lime: the system's result);
 * · «Сайти, реклама, автоматизація»: «Реклама в Google», a report card «Google Ads» / «Звіт» (about.pb.ads / pb.report,
 *   work.4.*);
 * · «Команда ECLO»: «Усе на вас» with the four key tags (about.pb.tag.1–4, work.5.*).
 * «Приклад» (about.direct.sample) at the thread's end. The messages arrive one at a time as they reach the screen, each
 * once: the role types (three dots), the bubble rises in (runtime/pf.js, scene «thread»). Phones: one column, the same.
 */
export async function PfWork({ index }: { index: number }) {
  const t = await getTranslations("about");
  const m = await getTranslations("contact");
  const role = (n: 1 | 2 | 3) => t(`team.${n}.role`);
  return (
    <section className="section section--ivory pf-work" id="work" aria-labelledby="work-title">
      <div className="container">
        <div className="pf-chat">
          <div className="pf-side">
            <header className="s-head s-head--side">
              <p className="s-head__meta">
                <span className="s-head__index">{index}</span>
                <span>{t("work.meta")}</span>
              </p>
              <h2 className="s-head__title" id="work-title" data-split="">
                <span className="tone">{t.rich("work.title", R)}</span>
              </h2>
              <p className="s-head__intro">{t("work.intro")}</p>
            </header>
            {/* the chat's files: the five things, each ticked as its message arrives (said once, in the thread) */}
            <div className="pf-files" aria-hidden="true">
              <p className="pf-files__k">{t("work.rcpt")}</p>
              <ol className="pf-files__list">
                {([1, 2, 3, 4, 5] as const).map((n) => (
                  <li data-got={n} key={n}>
                    <span className="pf-files__ok"><Tick /></span>
                    <span>{t(`work.${n}.h`)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="pf-room">
            <div className="pf-room__bar" aria-hidden="true">
              <Stack />
              <span>{t("work.sign")}</span>
            </div>
            <ol className="pf-thread" data-pf-thread="">
              {/* the visitor taps a quick reply, the one who answers the requests replies */}
              <YouMsg who={t("direct.you")}>
                <span className="pf-quick">{m("chip.span.1")}</span>
              </YouMsg>
              <TeamMsg who={role(1)} role={1}>
                <p className="pf-bub__t">{m("next.span.1")}</p>
              </TeamMsg>

              {/* «План робіт»: a document */}
              <TeamMsg who={role(2)} role={2} got={1}>
                <div className="pf-att pf-doc">
                  <span className="pf-doc__ico" aria-hidden="true">
                    <svg viewBox="0 0 32 40" focusable="false">
                      <path d="M4 2.5h16l8 8V36a1.5 1.5 0 0 1-1.5 1.5h-22A1.5 1.5 0 0 1 3 36V4a1.5 1.5 0 0 1 1-1.5Z" />
                      <path d="M20 2.5V10.5h8" />
                      <path d="M9 18h14M9 23h14M9 28h9" />
                    </svg>
                  </span>
                  <div className="pf-doc__txt">
                    <h3 className="pf-att__h">{t("work.1.h")}</h3>
                    <p className="pf-att__k">{t("work.1.k")}</p>
                  </div>
                </div>
                <p className="pf-bub__t">{t("work.1.d")}</p>
              </TeamMsg>

              {/* «Макет і тексти»: two pictures, for a computer and for a phone */}
              <TeamMsg who={role(3)} role={3} got={2}>
                <ul className="pf-att pf-thumbs">
                  <li className="pf-thumb pf-thumb--pc">
                    <svg viewBox="0 0 160 100" aria-hidden="true" focusable="false">
                      <rect x="1" y="1" width="158" height="98" rx="5" className="pf-fill" />
                      <path d="M1 12h158" />
                      <circle cx="8" cy="6.5" r="1.5" />
                      <circle cx="13.5" cy="6.5" r="1.5" />
                      <circle cx="19" cy="6.5" r="1.5" />
                      <rect x="12" y="26" width="64" height="8" rx="2" className="pf-ink" />
                      <path d="M12 44h56M12 51h44" />
                      <rect x="12" y="62" width="32" height="11" rx="5.5" className="pf-ember" />
                      <rect x="92" y="24" width="56" height="54" rx="3" />
                      <path d="m96 72 12-14 8 8 6-6 12 12" />
                    </svg>
                    <span>{t("pb.pc")}</span>
                  </li>
                  <li className="pf-thumb pf-thumb--ph">
                    <svg viewBox="0 0 60 100" aria-hidden="true" focusable="false">
                      <rect x="1" y="1" width="58" height="98" rx="9" className="pf-fill" />
                      <path d="M23 8h14" />
                      <rect x="9" y="22" width="34" height="7" rx="2" className="pf-ink" />
                      <path d="M9 38h42M9 45h32M9 52h38" />
                      <rect x="9" y="66" width="26" height="11" rx="5.5" className="pf-ember" />
                    </svg>
                    <span>{t("pb.phone")}</span>
                  </li>
                </ul>
                <h3 className="pf-bub__h">{t("work.2.h")}</h3>
                <p className="pf-bub__t">{t("work.2.d")}</p>
              </TeamMsg>

              {/* «Тестова адреса»: a link preview (the address is an example: plain text, no link) */}
              <TeamMsg who={role(3)} role={3} got={3}>
                <p className="pf-url">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
                  </svg>
                  <span>{t("pb.url")}</span>
                </p>
                <div className="pf-att pf-prev">
                  <div className="pf-prev__pic" aria-hidden="true">
                    <svg viewBox="0 0 200 84" preserveAspectRatio="xMidYMid slice" focusable="false">
                      <rect x="14" y="16" width="84" height="8" rx="2" className="pf-ink" />
                      <path d="M14 34h70M14 42h54" />
                      <rect x="14" y="54" width="40" height="12" rx="6" className="pf-ember" />
                      <rect x="122" y="12" width="64" height="60" rx="4" />
                      <path d="m126 66 14-16 9 9 7-7 14 14" />
                      <circle cx="160" cy="28" r="5" />
                    </svg>
                  </div>
                  <div className="pf-prev__txt">
                    <p className="pf-att__k">{t("work.3.k")}</p>
                    <h3 className="pf-att__h">{t("work.3.h")}</h3>
                  </div>
                </div>
                <p className="pf-bub__t">{t("work.3.d")}</p>
              </TeamMsg>
              {/* the system's notice: the test request has come in */}
              <li className="pf-sys" data-pf-msg="">
                <span className="pf-sys__in">
                  <span className="pf-sys__ok"><Tick /></span>
                  <span>{t("pb.toast")}</span>
                </span>
              </li>

              {/* «Реклама в Google»: a report card */}
              <TeamMsg who={role(2)} role={2} got={4}>
                <div className="pf-att pf-rep">
                  <p className="pf-rep__top">
                    <span>{t("pb.ads")}</span>
                    <span className="pf-rep__tag">{t("pb.report")}</span>
                  </p>
                  <span className="pf-rep__bars" aria-hidden="true">
                    {BARS.map((b, k) => (
                      <span className="pf-rep__bar" key={b} style={{ "--b": b, "--k": k } as CSSVars} />
                    ))}
                  </span>
                </div>
                <h3 className="pf-bub__h">{t("work.4.h")}</h3>
                <p className="pf-bub__t">{t("work.4.d")}</p>
              </TeamMsg>

              {/* «Усе на вас»: from the whole team, the four key tags */}
              <TeamMsg who={t("work.sign")} role="team" got={5} className="pf-msg--all">
                <h3 className="pf-bub__h">{t("work.5.h")}</h3>
                <ul className="pf-keys">
                  {TAGS.map((n, k) => (
                    <li key={n} style={{ "--k": k } as CSSVars}>{t(`pb.tag.${n}`)}</li>
                  ))}
                </ul>
                <p className="pf-bub__t">{t("work.5.d")}</p>
              </TeamMsg>
            </ol>
            <p className="pf-sample">{t("direct.sample")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
