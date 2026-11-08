/* eslint-disable @next/next/no-img-element -- the example site's renders are shown as they are, cropped in fixed frames (the design canvas, the browser) */
import { getLocale, getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { Stack, TeamMsg, Tick, YouMsg, type CSSVars } from "./PfParts";

/** the four keys of «Усе на вас» (about.pb.tag.1–4: the words of about.work.5.d) */
const TAGS = [1, 2, 3, 4] as const;
/** the plan's four sections (the main page's approach.stage.checks.1: «Що з’ясовуємо») */
const PLAN = [1, 2, 3, 4] as const;

/** the report's rows: a campaign each, its two bars (a picture: no numbers) as shares of their column */
const ROWS = [
  { name: "service", leads: 0.92, cpl: 0.38 },
  { name: "brand", leads: 0.56, cpl: 0.24 },
] as const;

/**
 * The example site's renders (the sites page's own, public/img/sites/how-landing-*), copied to public/img/about/pf-*
 * with every digit painted over in the colour beside it (its header's year, its menu's numbers, its price line) and
 * the desktop one cut above its price line: nothing in them can be read as a number.
 */
const SHOTS = {
  d: { uk: "/img/about/pf-layout-d.webp", ru: "/img/about/pf-layout-d-ru.webp", w: 1200, h: 692 },
  m: { uk: "/img/about/pf-layout-m.webp", ru: "/img/about/pf-layout-m-ru.webp", w: 300, h: 600 },
} as const;

/** the keys' small pictures: a window, a globe, a server, a target */
const KEY_ICON: Record<(typeof TAGS)[number], React.ReactNode> = {
  1: <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5ZM4 9h16" />,
  2: <path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-8 8h16M12 4c2.2 2.2 3.3 4.9 3.3 8s-1.1 5.8-3.3 8c-2.2-2.2-3.3-4.9-3.3-8S9.8 6.2 12 4Z" />,
  3: <path d="M5 5.5h14v5H5ZM5 13.5h14v5H5ZM8 8h.01M8 16h.01" />,
  4: <path d="M12 4a8 8 0 1 0 8 8M12 8a4 4 0 1 0 4 4M12 12l7-7M16 5h3v3" />,
};

/**
 * TEMPORARY · variant F, 2 · Як ми працюємо: the project chat, the page's one light block. Wide screens: the head on the
 * left, sticky, with the chat's «files» panel under it (the five things, each ticked as its message arrives: 21st.dev's
 * Order tracking; aria-hidden, the thread says them); the thread on the right (a column of about 40 rem) under the
 * chat's own header. The thread (motionsites' Interior Features and Social Hangouts: chat bubbles with real UI laid in
 * them) delivers the five things as the real things, each message signed by the role that sends it:
 * · «Ви» taps the quick reply «Новий сайт» (contact.chip.span.1), «Супровід» answers (contact.next.span.1);
 * · «Сайти, реклама, автоматизація»: «План робіт» as a document page: its kind (about.work.1.k), the client line
 *   «Ваш бренд» (about.pf.brand: the main page's services.mh.brand), its title (work.1.h), the main page's «Що
 *   з’ясовуємо» with its four heads and lines (approach.stage.checks.1.head / .b.1–4 / .span.1–4), signed «Команда
 *   ECLO» (work.sign); work.1.d under it;
 * · «Дизайн і розробка»: «Макет і тексти» as a design canvas with the example site's two artboards, «Комп’ютер» and
 *   «Телефон» (about.pb.pc / pb.phone; SHOTS), the phone's selected; work.2.h / .d;
 * · «Дизайн і розробка»: «Тестова адреса», the link «vash-sait.ua» (about.pb.url) and its preview, a browser window
 *   with the same site live (work.3.k / .h); work.3.d. Then the test request comes in as a Telegram notification
 *   (the main page's why.sys.3: the request goes to Telegram or a CRM; about.pf.tg «Telegram»): «Тестова заявка»
 *   (about.pb.toast) from vash-sait.ua, the form's two fields by their labels (contact.field.label.1 / .2) with their
 *   values hidden (no personal data), the task «Новий сайт» (contact.chip.span.1); its tick lime (the system's result);
 * · «Сайти, реклама, автоматизація»: «Реклама в Google» as a Google Ads report (about.pb.ads / pb.report): a curve
 *   of the requests and a campaigns table (about.pf.camp «Кампанії», pf.leads «Заявки», pf.cpl «Ціна заявки»: the
 *   ads page's and the main page's labels), its rows «Пошук · ваша послуга» and «Пошук · Ваш бренд» (why.link.1,
 *   about.pf.service: services.site.token, pf.brand), lime lamps for «running», bars and words only (no digits);
 *   work.4.h / .d;
 * · «Команда ECLO»: «Усе на вас», the four keys as access cards (about.pb.tag.1–4), each «Ваш бренд»'s, the domain
 *   «vash-sait.ua», under the label «Оформлені на вас» (about.pf.on: work.5.d's words); work.5.d.
 * «Приклад» (about.direct.sample) at the thread's end. The messages arrive one at a time as they reach the screen, each
 * once: the role types (three dots), the bubble rises in, then the attachment's parts (runtime/pf.js, scene «thread»).
 * Phones: one column, the same.
 */
export async function PfWork({ index }: { index: number }) {
  const t = await getTranslations("about");
  const m = await getTranslations("contact");
  const all = await getTranslations();
  const lang = (await getLocale()) === "ru" ? "ru" : "uk";
  const role = (n: 1 | 2 | 3) => t(`team.${n}.role`);
  const brand = t("pf.brand");
  const url = t("pb.url");
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

              {/* «План робіт»: the document itself, one page */}
              <TeamMsg who={role(2)} role={2} got={1} className="pf-msg--wide">
                <article className="pf-att pf-plan" aria-labelledby="pf-plan-h">
                  <header className="pf-plan__top">
                    <span className="pf-plan__kind">
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5a1.5 1.5 0 0 1 1-1.5ZM14 3.5V8h4" /></svg>
                      {t("work.1.k")}
                    </span>
                    <span className="pf-plan__to"><span className="pf-brand" aria-hidden="true" />{brand}</span>
                  </header>
                  <h3 className="pf-plan__h" id="pf-plan-h">{t("work.1.h")}</h3>
                  <p className="pf-plan__sec">{all("approach.stage.checks.1.head")}</p>
                  <ul className="pf-plan__list">
                    {PLAN.map((n, k) => (
                      <li key={n} style={{ "--k": k } as CSSVars}>
                        <span className="pf-plan__box" aria-hidden="true"><Tick /></span>
                        <span className="pf-plan__b">{all(`approach.stage.checks.1.b.${n}`)}</span>
                        <span className="pf-plan__s">{all(`approach.stage.checks.1.span.${n}`)}</span>
                      </li>
                    ))}
                  </ul>
                  <footer className="pf-plan__sign">
                    <svg className="pf-plan__scrawl" viewBox="0 0 120 36" aria-hidden="true" focusable="false">
                      <path d="M4 26c6-1 9-14 14-15s-1 17 4 16 8-18 13-17-3 15 2 15 9-11 13-10 0 9 5 8 10-6 16-6 9 3 16 1 14-4 29-5" />
                    </svg>
                    <span>{t("work.sign")}</span>
                  </footer>
                </article>
                <p className="pf-bub__t">{t("work.1.d")}</p>
              </TeamMsg>

              {/* «Макет і тексти»: the design canvas, the site's two artboards (the phone's selected) */}
              <TeamMsg who={role(3)} role={3} got={2} className="pf-msg--wide">
                <div className="pf-att pf-art">
                  <figure className="pf-art__board pf-art__board--pc">
                    <figcaption>{t("pb.pc")}</figcaption>
                    <div className="pf-art__frame">
                      <img src={SHOTS.d[lang]} width={SHOTS.d.w} height={SHOTS.d.h} alt={`${t("work.2.h")} · ${t("pb.pc")}`} loading="lazy" decoding="async" />
                    </div>
                  </figure>
                  <figure className="pf-art__board pf-art__board--ph">
                    <figcaption>{t("pb.phone")}</figcaption>
                    <div className="pf-art__frame">
                      <img src={SHOTS.m[lang]} width={SHOTS.m.w} height={SHOTS.m.h} alt={`${t("work.2.h")} · ${t("pb.phone")}`} loading="lazy" decoding="async" />
                      <span className="pf-art__sel" aria-hidden="true"><i /><i /><i /><i /></span>
                    </div>
                  </figure>
                </div>
                <h3 className="pf-bub__h">{t("work.2.h")}</h3>
                <p className="pf-bub__t">{t("work.2.d")}</p>
              </TeamMsg>

              {/* «Тестова адреса»: the link and its preview, the site live in a browser (an example: plain text, no link) */}
              <TeamMsg who={role(3)} role={3} got={3} className="pf-msg--wide">
                <p className="pf-url">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
                  </svg>
                  <span>{url}</span>
                </p>
                <div className="pf-att pf-web">
                  <div className="pf-web__bar" aria-hidden="true">
                    <span className="pf-web__dots"><i /><i /><i /></span>
                    <span className="pf-web__addr">
                      <svg viewBox="0 0 24 24" focusable="false"><path d="M7.5 11V8.5a4.5 4.5 0 0 1 9 0V11M6.5 11h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z" /></svg>
                      {url}
                    </span>
                  </div>
                  <div className="pf-web__view">
                    <img src={SHOTS.d[lang]} width={SHOTS.d.w} height={SHOTS.d.h} alt={`${t("work.3.h")} · ${url}`} loading="lazy" decoding="async" />
                  </div>
                  <div className="pf-web__txt">
                    <p className="pf-att__k">{t("work.3.k")}</p>
                    <h3 className="pf-att__h">{t("work.3.h")}</h3>
                  </div>
                </div>
                <p className="pf-bub__t">{t("work.3.d")}</p>
              </TeamMsg>
              {/* the test request comes in: a Telegram notification (the system's result: its tick lime) */}
              <li className="pf-push" data-pf-msg="">
                <div className="pf-push__card">
                  <p className="pf-push__app">
                    <span className="pf-push__ico" aria-hidden="true">
                      <svg viewBox="0 0 24 24" focusable="false"><path d="m4.5 11.6 14-5.6c.6-.2 1.2.3 1 1l-2.4 11.2c-.1.7-.9 1-1.5.6l-3.7-2.8-1.9 1.8c-.3.3-.8.1-.8-.3v-2.6l6.2-5.6-7.7 4.6-3.2-1c-.7-.2-.7-1.1 0-1.3Z" /></svg>
                    </span>
                    <span>{t("pf.tg")}</span>
                  </p>
                  <p className="pf-push__h">
                    <span>{t("pb.toast")}</span>
                    <span className="pf-push__ok"><Tick /></span>
                  </p>
                  <p className="pf-push__from">{url}</p>
                  <dl className="pf-push__f">
                    <div>
                      <dt>{m("field.label.1")}</dt>
                      <dd aria-hidden="true">•••••</dd>
                    </div>
                    <div>
                      <dt>{m("field.label.2")}</dt>
                      <dd aria-hidden="true">••• ••• •••</dd>
                    </div>
                  </dl>
                  <span className="pf-push__chip">{m("chip.span.1")}</span>
                </div>
              </li>

              {/* «Реклама в Google»: the report (a picture of one: bars and words, no numbers) */}
              <TeamMsg who={role(2)} role={2} got={4} className="pf-msg--wide">
                <div className="pf-att pf-ads" role="img" aria-label={`${t("pb.ads")} · ${t("pb.report")}`}>
                  <div className="pf-ads__top">
                    <span className="pf-ads__logo">
                      <svg className="pf-ads__mark" viewBox="0 0 24 24" focusable="false">
                        <path d="M7 18.5 12 6l5 12.5" />
                        <circle cx="7" cy="18.5" r="2.5" />
                      </svg>
                      {t("pb.ads")}
                    </span>
                    <span className="pf-ads__tag">{t("pb.report")}</span>
                  </div>
                  <div className="pf-ads__chart">
                    <span className="pf-ads__k">{t("pf.leads")}</span>
                    <svg viewBox="0 0 320 84" preserveAspectRatio="none" focusable="false">
                      <path className="pf-ads__area" d="M0 70C22 68 34 60 54 62s30 6 50-4 30-22 52-20 28 12 48 6 32-24 54-28 34 0 62-10V84H0Z" />
                      <path className="pf-ads__line" d="M0 70C22 68 34 60 54 62s30 6 50-4 30-22 52-20 28 12 48 6 32-24 54-28 34 0 62-10" />
                      <path className="pf-ads__grid" d="M0 21h320M0 42h320M0 63h320" />
                    </svg>
                  </div>
                  <div className="pf-ads__t">
                    <span className="pf-ads__th">{t("pf.camp")}</span>
                    <span className="pf-ads__th">{t("pf.leads")}</span>
                    <span className="pf-ads__th">{t("pf.cpl")}</span>
                    {ROWS.map((r, k) => (
                      <span className="pf-ads__row" key={r.name} style={{ "--k": k } as CSSVars}>
                        <span className="pf-ads__name">
                          <i className="pf-ads__lamp" />
                          <span>{all("why.link.1")} · {r.name === "service" ? t("pf.service") : brand}</span>
                        </span>
                        <span className="pf-ads__cell"><i className="pf-ads__bar" style={{ "--b": r.leads } as CSSVars} /></span>
                        <span className="pf-ads__cell"><i className="pf-ads__bar pf-ads__bar--soft" style={{ "--b": r.cpl } as CSSVars} /></span>
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="pf-bub__h">{t("work.4.h")}</h3>
                <p className="pf-bub__t">{t("work.4.d")}</p>
              </TeamMsg>

              {/* «Усе на вас»: from the whole team, the four keys as access cards, each in the client's name */}
              <TeamMsg who={t("work.sign")} role="team" got={5} className="pf-msg--all pf-msg--wide">
                <h3 className="pf-bub__h">{t("work.5.h")}</h3>
                <p className="pf-keys__k">{t("pf.on")}</p>
                <ul className="pf-keys">
                  {TAGS.map((n, k) => (
                    <li className="pf-key" key={n} data-key={n} style={{ "--k": k } as CSSVars}>
                      <span className="pf-key__top" aria-hidden="true">
                        <svg className="pf-key__ico" viewBox="0 0 24 24" focusable="false">{KEY_ICON[n]}</svg>
                        <span className="pf-key__ok"><Tick /></span>
                      </span>
                      <span className="pf-key__name">{t(`pb.tag.${n}`)}</span>
                      {n === 2 && <span className="pf-key__val">{url}</span>}
                      <span className="pf-key__own"><span className="pf-brand" aria-hidden="true" />{brand}</span>
                    </li>
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
