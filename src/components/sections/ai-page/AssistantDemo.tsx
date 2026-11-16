import { getTranslations } from "next-intl/server";
import { DemoRun } from "./DemoRun";
import { DemoSteps } from "./DemoSteps";
import { part, type Flight } from "./demo-beats";
import "./demo-window.css";
import "./assistant-demo.css";

/*
 * «AI-асистент», the third task's picture in block 3 (Niches; the owner, 16 Nov 2026: every task's picture as clear as
 * the search's). The salon example's evening (asst.*, the example page /keisy/ai-asystent): at 22:47 a client asks for
 * Saturday; the assistant looks at the schedule, offers the free times, she takes 14:30 and the booking is in the
 * schedule; a question that is not in the price list goes to the administrator in Telegram, with a reminder after 15
 * minutes. Wide: the chat on the left, the schedule and the administrator on the right. Narrow (the window under
 * 34 rem): the chat alone, the booking and the hand-over as notes in it.
 */

// 0 empty · 1 she asks · 2 typing · 3 the free times · 4 she picks 14:30 · 5 it is in the schedule · 6 the assistant
// confirms · 7 her question about a discount · 8 typing · 9 «I will ask» · 10 the administrator gets it · 11 the
// reminder (12 held) · 13 the fade
const BEATS = [600, 900, 900, 1300, 900, 900, 1100, 1000, 800, 1000, 1000, 1100, 3400, 700] as const;
const HOLD = BEATS.length - 2;
const FLIGHTS: Flight[] = [
  { at: 5, from: ".sa-pick--b", to: ".sa-slot--b .sa-slot__what", wide: true },
  { at: 10, from: ".sa-m--5 .sa-m__text", to: ".sa-admin__q", wide: true },
];

const SLOTS = [
  { key: "a", time: "10:00", free: true },
  { key: "x", time: "12:00", free: false },
  { key: "b", time: "14:30", free: true, booked: true },
] as const;

const TICK = <path d="m5 12.5 4.2 4.2L19 7" />;
const SEND = <><path d="M21 3 3 10.5l7 2.5 2.5 7z" /><path d="m10 13 4.5-4.5" /></>;
const BELL = <><path d="M6.5 16v-4.5a5.5 5.5 0 0 1 11 0V16l1.5 2h-14z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>;

export async function AssistantDemo() {
  const t = await getTranslations();
  const d = (key: string) => t(`ai.demo.asst.${key}`);
  const steps = [
    { text: d("step.1"), span: [0, 4] as const },
    { text: d("step.2"), span: [4, 7] as const },
    { text: d("step.3"), span: [7, 99] as const },
  ];
  /** a message: the client's on the left, the assistant's on the right in lime */
  const msg = (n: number, from: "in" | "bot", at: number, text: React.ReactNode, extra?: React.ReactNode) => (
    <div {...part(`sa-m sa-m--${from} sa-m--${n}`, { in: at }, HOLD)}>
      <div className="sa-m__in">
        <p className="sa-m__text">{text}</p>
        {extra}
      </div>
    </div>
  );
  const typing = (at: number) => (
    <div {...part("sa-m sa-m--bot sa-m--typing", { in: [at, at + 1] }, HOLD)}>
      <div className="sa-m__in">
        <p className="sa-m__text"><i /><i /><i /></p>
      </div>
    </div>
  );
  const note = (n: 1 | 2, at: number) => (
    <div {...part(`sa-m sa-m--sys sa-m--sys${n}`, { in: at }, HOLD)}>
      <div className="sa-m__in">
        <p className="sa-m__text">
          <svg viewBox="0 0 24 24">{n === 1 ? TICK : SEND}</svg>
          {d(`sys.${n}`)}
        </p>
      </div>
    </div>
  );
  return (
    <DemoRun className="ai-demo sd sd--asst" label={d("sr")} beats={BEATS} flags={{ "is-typing": [[2, 3], [8, 9]] }} flights={FLIGHTS}>
      <DemoSteps steps={steps} hold={HOLD} />
      <div className="sd__body" aria-hidden="true">
        <div className="sa-track">
          {/* the client's chat with the salon */}
          <div className="sa-chat">
            <p className="sd-tg__bar">
              <span className="sd-tg__ava">{t("asst.chat.ava")}</span>
              <span className="sd-tg__who">
                <b>{t("asst.chat.name")}</b>
                <span className="sd-tg__st">
                  <span className="sa-st sa-st--idle">{d("online")}</span>
                  <span className="sa-st sa-st--busy">{d("typing")}</span>
                </span>
              </span>
            </p>
            <div className="sa-flow">
              <p className="sd-tg__day">{d("day")}</p>
              {msg(1, "in", 1, d("m.1"))}
              {typing(2)}
              {msg(
                2,
                "bot",
                3,
                d("m.2"),
                <p className="sa-picks">
                  <span {...part("sa-pick sa-pick--a", { done: 4 }, HOLD)}>10:00</span>
                  <span {...part("sa-pick sa-pick--b", { done: 4 }, HOLD)}>14:30</span>
                </p>,
              )}
              {msg(3, "in", 4, t("asst.chat.3"))}
              {note(1, 5)}
              {msg(4, "bot", 6, d("m.4"))}
              {msg(5, "in", 7, t("asst.strip.1.text"))}
              {typing(8)}
              {msg(6, "bot", 9, t("asst.strip.2.text"))}
              {note(2, 10)}
            </div>
          </div>
          {/* what the assistant sees and does on the other side: the schedule, the administrator */}
          <div className="sa-side">
            <div className="sa-sched">
              <p className="sd__head">
                <span>{d("sched")}</span>
              </p>
              <p className="sa-master">
                <span className="sa-master__ava">{t("asst.day.ava")}</span>
                <span>{t("asst.day.master")}</span>
              </p>
              <ul className="sa-slots">
                {SLOTS.map((slot) => (
                  <li
                    {...part(`sa-slot sa-slot--${slot.key}${slot.free ? " sa-slot--free" : ""}`, slot.free ? { scan: [3, 5], ...(slot.key === "b" ? { done: 5 } : {}) } : {}, HOLD)}
                    key={slot.key}
                  >
                    <time>{slot.time}</time>
                    <span className="sa-slot__what">
                      {slot.key === "b" ? (
                        <>
                          <span className="sa-slot__free">{t("asst.s.free")}</span>
                          <span className="sa-slot__booked">
                            <b>{t("asst.c.kateryna")}</b> · {t("asst.s.by")}
                          </span>
                        </>
                      ) : (
                        <span>{slot.free ? t("asst.s.free") : t("asst.s.busy")}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div {...part("sa-admin", { in: 10 }, HOLD)}>
              <p className="sa-admin__k">
                <svg viewBox="0 0 24 24">{SEND}</svg>
                <span>{t("asst.strip.3.who")}</span>
              </p>
              <p className="sa-admin__t">{t("asst.strip.3.t")}</p>
              <p className="sa-admin__q">{t("asst.strip.3.b")}</p>
              <p {...part("sa-admin__ping", { in: 11 }, HOLD)}>
                <svg viewBox="0 0 24 24">{BELL}</svg>
                <span>
                  {t("asst.strip.4.who")} · {t("asst.strip.4.t")}
                </span>
              </p>
            </div>
          </div>
        </div>
        <span className="sd-ghost" />
      </div>
    </DemoRun>
  );
}
