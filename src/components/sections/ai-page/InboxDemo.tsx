import { getTranslations } from "next-intl/server";
import { DemoRun } from "./DemoRun";
import { DemoSteps } from "./DemoSteps";
import { part, type Flight } from "./demo-beats";
import "./demo-window.css";
import "./inbox-demo.css";

/*
 * «Усі заявки разом», the second task's picture in block 3 (Niches; the owner, 16 Nov 2026: every task's picture as
 * clear as the search's). A shop's day: four requests come in on OLX, Instagram, the site and the mail; the robot
 * writes each into one table (where from, who, what); then the table keeps their statuses, and when one has had no
 * answer for 15 minutes the robot reminds the manager (offer.inc: in every service). The names and requests are an
 * example. Narrow (the window under 37.5 rem): the channels two by two, the table's columns folded.
 */

// 0 empty · 1–4 the requests come in · 5–8 the robot writes one each into the table · 9 the statuses · 10 the reminder
// (11 held) · 12 the fade
const BEATS = [700, 380, 380, 380, 760, 720, 720, 720, 900, 1100, 1200, 3400, 700] as const;
const HOLD = BEATS.length - 2;
const ROWS = [1, 2, 3, 4] as const;
const FLIGHTS: Flight[] = ROWS.map((n) => ({ at: n + 4, from: `.sq-tile--${n} .sq-tile__msg`, to: `.sq-row--${n} .sq-row__what` }));

/** each row's status after the robot's day: the one nobody answered gets the reminder */
const LATER: Record<(typeof ROWS)[number], "1" | "3" | "4" | null> = { 1: "1", 2: null, 3: "3", 4: "4" };

const ICONS = {
  1: <><path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3-8.7 8.7z" /><circle cx="8" cy="8" r="1.4" /></>,
  2: <><rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="12" cy="12" r="3.6" /><circle cx="16.8" cy="7.2" r="0.6" /></>,
  3: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18" /><path d="M6 7h.01M8.5 7h.01" /></>,
  4: <><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4.5 7 7.5 6 7.5-6" /></>,
} as const;
const TICK = <path d="m5 12.5 4.2 4.2L19 7" />;
const BELL = <><path d="M6.5 16v-4.5a5.5 5.5 0 0 1 11 0V16l1.5 2h-14z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>;

export async function InboxDemo() {
  const t = await getTranslations("ai.demo.inbox");
  const steps = [
    { text: t("step.1"), span: [0, 5] as const },
    { text: t("step.2"), span: [5, 9] as const },
    { text: t("step.3"), span: [9, 99] as const },
  ];
  return (
    <DemoRun className="ai-demo sd sd--inbox" label={t("sr")} beats={BEATS} flights={FLIGHTS}>
      <DemoSteps steps={steps} hold={HOLD} />
      <div className="sd__body" aria-hidden="true">
        {/* where they write: a tile per channel, its newest message */}
        <ul className="sq-tiles">
          {ROWS.map((n) => (
            <li {...part(`sq-tile sq-tile--${n}`, { done: n + 4 }, HOLD)} key={n}>
              <p className="sq-tile__ch">
                <svg viewBox="0 0 24 24">{ICONS[n]}</svg>
                <span>{t(`ch.${n}`)}</span>
                <i className="sq-tile__badge">
                  <span>1</span>
                  <svg viewBox="0 0 24 24">{TICK}</svg>
                </i>
              </p>
              <p {...part("sq-tile__msg", { in: n }, HOLD)} data-ghost={t(`what.${n}`)}>
                <b>{t(`who.${n}`)}:</b> {t(`msg.${n}`)}
              </p>
            </li>
          ))}
        </ul>
        {/* the one table they all go into */}
        <div className="sq-table">
          <p className="sd__head">
            <span>{t("head")}</span>
            <b>{t("chip")}</b>
          </p>
          <div className="sq-grid">
            <p className="sq-row sq-row--th">
              <span>{t("col.from")}</span>
              <span>{t("col.who")}</span>
              <span>{t("col.what")}</span>
              <span>{t("col.st")}</span>
            </p>
            {ROWS.map((n) => {
              const later = LATER[n];
              return (
                <p {...part(`sq-row sq-row--${n}`, { in: n + 4 }, HOLD)} key={n}>
                  <span className="sq-row__from">
                    <svg viewBox="0 0 24 24">{ICONS[n]}</svg>
                    <span>{t(`ch.${n}`)}</span>
                  </span>
                  <span className="sq-row__who">{t(`who.${n}`)}</span>
                  <span className="sq-row__what">{t(`what.${n}`)}</span>
                  <span className="sq-row__st">
                    <span {...part("sq-st sq-st--new", { in: [n + 4, 9] }, HOLD)}>{t("st.new")}</span>
                    {later ? (
                      <span {...part(`sq-st sq-st--${later}`, { in: 9 }, HOLD)}>{t(`st.${later}`)}</span>
                    ) : (
                      <>
                        <span {...part("sq-st sq-st--wait", { in: [9, 10] }, HOLD)}>{t("st.wait")}</span>
                        <span {...part("sq-st sq-st--ping", { in: 10 }, HOLD)}>
                          <svg viewBox="0 0 24 24">{BELL}</svg>
                          {t("st.ping")}
                        </span>
                      </>
                    )}
                  </span>
                </p>
              );
            })}
          </div>
        </div>
        <span className="sd-ghost" />
      </div>
    </DemoRun>
  );
}
