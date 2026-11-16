import { getTranslations } from "next-intl/server";
import { DemoRun } from "./DemoRun";
import { DemoSteps } from "./DemoSteps";
import { part, type Flight } from "./demo-beats";
import "./demo-window.css";
import "./search-demo.css";

/*
 * «Пошук замовлень», the first task's picture in block 3 (Niches): how the robot finds orders, from the case's own
 * morning (case.ad.*, the decisions of case.decide, the manager's message of case.tg; no new facts). The owner, 16 Nov
 * 2026: the old picture (the bot's chat alone) did not show how or what. The morning's ads come in from the boards and
 * the groups, the robot checks each and says why one does not fit, the one that fits flies over to the manager's
 * Telegram as an order with its score, place and sum, and a row goes into the table. Narrow (the window under 36 rem):
 * the ads over the chat, the window scrolls down to the chat as the order goes out.
 */

// 0 empty · 1–4 the ads come in · 5–9 the robot checks one each · 10 the one that fits goes over · 11 the order ·
// 12 its row in the table (held) · 13 the fade
const BEATS = [700, 420, 420, 420, 800, 760, 760, 760, 760, 650, 650, 1000, 3600, 700] as const;
const HOLD = BEATS.length - 2;
const SENT = 10;
const FLIGHTS: Flight[] = [{ at: SENT, from: ".sd-ad--ok .sd-ad__t", to: ".sd-card__t", wide: true }];

const ADS = [
  { n: 1, ok: false },
  { n: 2, ok: false },
  { n: 3, ok: false },
  { n: 4, ok: true },
] as const;

const X = <path d="M7 7l10 10M17 7 7 17" />;
const TICK = <path d="m5 12.5 4.2 4.2L19 7" />;

export async function SearchDemo() {
  const t = await getTranslations();
  const steps = [
    { text: t("ai.demo.search.step.1"), span: [0, 5] as const },
    { text: t("ai.demo.search.step.2"), span: [5, SENT] as const },
    { text: t("ai.demo.search.step.3"), span: [SENT, 99] as const },
  ];
  return (
    <DemoRun className="ai-demo sd sd--search" label={t("ai.demo.search.sr")} beats={BEATS} flags={{ "is-busy": [5, SENT], "is-sent": SENT }} flights={FLIGHTS}>
      <DemoSteps steps={steps} hold={HOLD} />
      <div className="sd__body" aria-hidden="true">
        <div className="sd__track">
          <div className="sd__ads">
            <p className="sd__head">
              <span>{t("ai.demo.search.head")}</span>
              <b>{t("case.bento.count")}</b>
            </p>
            <ol className="sd__list">
              {ADS.map((ad) => (
                <li {...part(`sd-ad sd-ad--${ad.ok ? "ok" : "no"}`, { in: ad.n, scan: [ad.n + 4, ad.n + 5], done: ad.n + 5 }, HOLD)} key={ad.n}>
                  <span className="sd-ad__mark">
                    <i className="sd-ad__dot" />
                    <svg className="sd-ad__icon" viewBox="0 0 24 24">{ad.ok ? TICK : X}</svg>
                  </span>
                  <span className="sd-ad__text">
                    <b className="sd-ad__t">{t(`case.ad.${ad.n}.t`)}</b>
                    <span className="sd-ad__m">{t(`ai.demo.search.ad.${ad.n}`)}</span>
                    <span className="sd-ad__v">{t(`ai.demo.search.v.${ad.n}`)}</span>
                  </span>
                  <i className="sd-ad__scan" />
                </li>
              ))}
            </ol>
          </div>
          <div className="sd__tg" data-shift="">
            <p className="sd-tg__bar">
              <span className="sd-tg__ava">{t("case.bot.ava")}</span>
              <span className="sd-tg__who">
                <b>{t("case.bot.text")}</b>
                <span className="sd-tg__st">
                  <span className="sd-tg__idle">{t("aiCommon.tg.bot")}</span>
                  <span className="sd-tg__busy">{t("ai.demo.search.busy")}</span>
                </span>
              </span>
            </p>
            <div className="sd-tg__chat">
              <p className="sd-tg__day">{t("aiCommon.tg.today")}</p>
              <div {...part("sd-card", { in: SENT + 1 }, HOLD)}>
                <p className="sd-card__head">
                  <span>{t("ai.demo.search.card.new")}</span>
                  {/* the score's number is the ring's counter (search-demo.css): it counts up as the order arrives */}
                  <span className="sd-card__score">
                    <span>{t("ai.demo.search.card.score")}</span>
                    <i />
                  </span>
                </p>
                <p className="sd-card__t">{t("case.ad.4.t")}</p>
                <p className="sd-card__row">
                  <svg viewBox="0 0 24 24"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></svg>
                  <span>{t("ai.demo.search.card.place")}</span>
                </p>
                <p className="sd-card__row">
                  <svg viewBox="0 0 24 24"><rect x="3" y="6.5" width="18" height="11" rx="2" /><circle cx="12" cy="12" r="2.3" /></svg>
                  <span>{t("ai.demo.search.card.sum")}</span>
                </p>
                <p className="sd-card__foot">
                  <u>{t("case.tg.6")}</u>
                  <time>08:02</time>
                </p>
              </div>
              <p {...part("sd-sheet", { in: SENT + 2 }, HOLD)}>
                <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 10h16M10 4v16" /></svg>
                <span>{t("case.bento.sheet")}</span>
              </p>
            </div>
          </div>
        </div>
        {/* the order that fits, on its way from the list to the chat (wide windows only) */}
        <span className="sd-ghost" />
      </div>
    </DemoRun>
  );
}
