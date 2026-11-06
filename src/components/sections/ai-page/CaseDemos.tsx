import { getTranslations } from "next-intl/server";
import { InView } from "./InView";

/*
 * A looping demo of the robot's work (the owner, 21 Oct 2026: «анімовані демки»; since 5 Nov 2026 the first task's
 * picture in block 3, Niches), built from the case page's own example data (case.*): no platform named. CSS keyframes
 * only (ai-page.css, .ai-demo): it runs while it is on the screen (InView) and rests off it; reduced motion shows the
 * final frame. A picture for screen readers (role img + a sentence).
 */

/** «Що приходить щодня»: the brigade's bot in Telegram, three new orders arriving one after another (the case
 *  page's example messages: a score, the job, the rough price, the ad's link). */
export async function FeedDemo() {
  const t = await getTranslations();
  const msgs = [
    { n: 1, time: "08:02" },
    { n: 2, time: "08:03" },
    { n: 3, time: "08:04" },
  ];
  return (
    <InView className="ai-demo ai-demo--feed" label={t("ai.demo.feed.sr")}>
      <div className="ai-feed__bar" aria-hidden="true">
        <span className="ai-feed__ava">{t("case.bot.ava")}</span>
        <span className="ai-feed__who"><b>{t("case.bot.text")}</b><span>{t("aiCommon.tg.bot")}</span></span>
      </div>
      <div className="ai-feed__chat" aria-hidden="true">
        <p className="ai-feed__day">{t("aiCommon.tg.today")}</p>
        {msgs.map((m) => (
          <div className={`ai-feed__msg ai-feed__msg--${m.n}`} key={m.n}>
            <p className="ai-feed__t">{t(`case.push.${m.n}.t`)}</p>
            <p className="ai-feed__b">{t(`case.push.${m.n}.b`)}</p>
            <p className="ai-feed__f"><u>{t("case.tg.6")}</u><time>{m.time}</time></p>
          </div>
        ))}
      </div>
    </InView>
  );
}
