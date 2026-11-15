import { preload } from "react-dom";
import { getLocale, getTranslations } from "next-intl/server";
import { BotStory } from "./BotStory";
import { RobotSlot } from "./RobotSlot";
import "./robot-hero.css";

const LEADS = [1, 2, 3];
/** the requests raining behind, the smaller the farther and the more out of focus: across the screen (%), size, how long
 *  a fall takes, when it starts, how it turns (fixed, so the server and the browser draw the same) */
const RAIN = [
  [6, 0.8, 11, -2, -14],
  [14, 0.6, 14, -9, 10],
  [23, 0.95, 12, -5, -6],
  [31, 0.7, 16, -12, 16],
  [40, 0.55, 13, -1, -20],
  [47, 0.85, 15, -7, 8],
  [55, 0.65, 12, -10, -12],
  [62, 0.9, 17, -3, 18],
  [69, 0.6, 13, -14, -8],
  [76, 0.75, 15, -6, 12],
  [83, 0.55, 11, -11, -16],
  [91, 0.8, 14, -4, 6],
];

/**
 * 1 · the robot at work (the owner, 4 Nov 2026: the words off the first screen for now; the table on the left, the
 * robot on the right; requests rain far behind, small and blurred; the one it catches drops close, sharp). The robot
 * (three/ai-robot: its canvas over the whole screen so its hands can reach) catches each request, reads it, answers it
 * (the answer shows by its mouth: BotStory) and puts it into the CRM, where it becomes a row. The page's question at the
 * top left. The markup is the still (reduced motion, no script): every request booked.
 */
export async function RobotHero() {
  // the question waits unseen for its condensed face (font-display: block, robot-hero.css): it comes with the page, both
  // files of the question's own letters (the giant word's «?» is in the Latin one)
  preload("/fonts/sofia-sans-xc-bot-cyrillic.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload("/fonts/sofia-sans-xc-bot-latin.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  const t = await getTranslations("ai");
  const locale = await getLocale();
  const leads = LEADS.map((n) => ({
    who: t(`bot.leads.${n}.who`),
    via: t(`bot.leads.${n}.via`),
    msg: t(`bot.leads.${n}.msg`),
    reply: t(`bot.leads.${n}.reply`),
    when: t(`bot.leads.${n}.when`),
    state: t(`bot.leads.${n}.state`),
  }));
  // the kicker in two: «AI», set apart, and the rest («автоматизация для бизнеса»)
  const kicker = t("bot.cover.kicker");
  const [kickerLead, kickerRest] = kicker.includes("-") ? [kicker.slice(0, kicker.indexOf("-")), kicker.slice(kicker.indexOf("-") + 1)] : ["", kicker];
  const done = { who: t("bot.done.who"), via: t("bot.done.via"), when: t("bot.done.when"), state: t("bot.done.state") };
  // the request booked before the robot's round: the table's top row; on a phone its last, so the robot puts its first
  // card into the top row, in sight (the owner, 4 Nov 2026); the stylesheet shows one of the two
  const doneRow = (place: "top" | "foot") => (
    <tr className={`bot-crm__done bot-crm__done--${place}`}>
      <td>{done.who}</td>
      <td>{done.via}</td>
      <td>{done.when}</td>
      <td>
        <span className="bot-crm__state">{done.state}</span>
      </td>
    </tr>
  );
  // the requests raining behind: other people writing in, a source, a name, a line each
  const rain = [1, 2, 3, 4, 5, 6].map((n) => ({ via: t(`bot.rain.${n}.via`), who: t(`bot.rain.${n}.who`), msg: t(`bot.rain.${n}.msg`) }));
  return (
    <section className="ai-hero ai-bot" id="top" aria-labelledby="ai-title" data-cover="">
      <div className="ai-hero__bg ai-bot__bg" aria-hidden="true">
        {/* a slow shifting light behind everything, a grid over it as on the robot's face */}
        <span className="bot-aurora" />
        <span className="bot-grid" />
        {RAIN.map(([left, size, fall, delay, turn], index) => {
          const request = rain[index % rain.length];
          return (
            <span
              key={index}
              className="bot-rain"
              data-via={request.via}
              style={{ "--x": `${left}%`, "--s": size, "--fall": `${fall}s`, "--delay": `${delay}s`, "--turn": `${turn}deg` } as React.CSSProperties}
            >
              <span className="bot-rain__via">
                <i />
                {request.via}
              </span>
              <span className="bot-rain__who">{request.who}</span>
              <span className="bot-rain__msg">{`«${request.msg}»`}</span>
            </span>
          );
        })}
      </div>
      <div className="ai-bot__in">
        {/* the page's question, top left, set as a magazine's cover (the owner, 4 Nov 2026): its first words, «до сих
            пор» as a sticker, one giant word */}
        <h1 className="ai-bot__title" id="ai-title">
          {/* what the page is about, as a magazine's kicker (the space between its parts is for reading aloud) */}
          <span className="bot-kicker">
            <b>{kickerLead}</b> <span>{kickerRest}</span>
          </span>{" "}
          <span className="bot-cover__a">{t("bot.cover.a")}</span> <span className="bot-cover__b">{t("bot.cover.b")}</span>{" "}
          {/* (the sticker's words in a span of their own: a browser's translator wraps text in tags that take on the
              sticker's raise, and raised once more inside it they stretched it) */}
          <span className="bot-cover__c">
            <span>{t("bot.cover.c")}</span>
          </span>{" "}
          <span className="bot-cover__d">{t("bot.cover.d")}</span>
        </h1>
        <div className="ai-bot__scene" role="img" aria-label={t("bot.label")}>
          <BotStory>
            <p className="bot-table__status">
              <i />
              {t("bot.status")}
            </p>
            <p className="bot-table__title">{t("bot.crm.title")}</p>
            <table className="bot-crm">
              <thead>
                <tr>
                  {[1, 2, 3, 4].map((n) => (
                    <th key={n}>{t(`bot.crm.col.${n}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {doneRow("top")}
                {leads.map((lead, index) => (
                  <tr key={lead.who} className="bot-crm__new" data-row={index} data-reply={lead.reply}>
                    {[lead.who, lead.via, lead.when].map((text, cell) => (
                      <td key={cell} data-text={text}>
                        {text}
                      </td>
                    ))}
                    <td data-text={lead.state}>
                      <span className="bot-crm__state">{lead.state}</span>
                    </td>
                  </tr>
                ))}
                {doneRow("foot")}
              </tbody>
            </table>
          </BotStory>
          {/* the head's place in the layout: the canvas sizes the head to it */}
          <div className="ai-bot__head" aria-hidden="true">
            <RobotSlot
              words={{ tag: t("bot.tag"), leads }}
              film={`/img/ai/robot-film-${locale}.mp4`}
              deskFilm={`/img/ai/robot-desk-film-${locale}.mp4`}
              deskStill={`/img/ai/robot-desk-${locale}.webp`}
            />
          </div>
        </div>

        {/* the answer the robot gives, by its mouth */}
        <p className="bot-say" data-say="" aria-hidden="true" />
      </div>
    </section>
  );
}
