import { getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";

/** 2 · Розклад: how the assistant finds the time, four steps beside one master's Saturday (scene «sched»). */
export async function Schedule() {
  const t = await getTranslations();
  return (
    <section className="section ai-sec" id="schedule" aria-labelledby="schedule-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta"><span className="s-head__index">2</span><span>{t("asst.sched.meta")}</span></p>
          <h2 className="s-head__title" id="schedule-title" data-split=""><span className="tone">{t.rich("asst.sched.title", aiRich)}</span></h2>
          <p className="s-head__intro">{t("asst.sched.intro")}</p>
        </header>
        <div className="ai-find" data-scene="sched">
          {/* the story, step by step: who acts (the client: ember, the assistant: signal) and what happens;
               each step lights up together with its moment in the schedule beside it */}
          <ol className="ai-howto">
            <li className="ai-howto__step ai-howto__step--person"><span className="ai-howto__n" aria-hidden="true">1</span><p><b>{t("asst.find.client")}</b><span>{t("asst.find.1")}</span></p></li>
            <li className="ai-howto__step"><span className="ai-howto__n" aria-hidden="true">2</span><p><b>{t("asst.find.bot")}</b><span>{t("asst.find.2")}</span></p></li>
            <li className="ai-howto__step ai-howto__step--person"><span className="ai-howto__n" aria-hidden="true">3</span><p><b>{t("asst.find.client")}</b><span>{t("asst.find.3")}</span></p></li>
            <li className="ai-howto__step"><span className="ai-howto__n" aria-hidden="true">4</span><p><b>{t("asst.find.bot")}</b><span>{t("asst.find.4")}</span></p></li>
          </ol>

          {/* one master's Saturday: other clients are only «Зайнято»; two free windows; 14:30 becomes the booking.
               10:00–18:00 in half hours: row 1 = 10:00, row 10 = 14:30; a slot is placed by its grid-row */}
          <div className="mock-window ai-sheet__win ai-day">
            <div className="ai-sheet__bar ai-book__bar" aria-hidden="true"><i /><i /><i /><span>{t("asst.day.host")}</span><span className="ai-sample">{t("aiCommon.sample")}</span></div>
            <div className="ai-day__head" aria-hidden="true">
              <b>{t("asst.day.date")}</b>
              <span className="ai-day__who"><i className="ai-day__ava">{t("asst.day.ava")}</i><span>{t("asst.day.master")}</span></span>
            </div>
            <div className="ai-day__grid" aria-hidden="true">
              <ol className="ai-day__hours"><li>10:00</li><li>11:00</li><li>12:00</li><li>13:00</li><li>14:00</li><li>15:00</li><li>16:00</li><li>17:00</li></ol>
              <div className="ai-day__col">
                <p className="ai-slot ai-slot--free" style={{ gridRow: "1 / span 3" }}><span><b>{t("asst.s.free")}</b> 10:00</span><i className="ai-slot__glow" /></p>
                <p className="ai-slot" style={{ gridRow: "4 / span 3" }}><span>{t("asst.s.busy")}</span></p>
                <p className="ai-slot" style={{ gridRow: "7 / span 3" }}><span>{t("asst.s.busy")}</span></p>
                <p className="ai-slot ai-slot--free ai-slot--was" style={{ gridRow: "10 / span 3" }}><span><b>{t("asst.s.free")}</b> 14:30</span><i className="ai-slot__glow" /><i className="ai-slot__pick" /></p>
                <p className="ai-slot ai-slot--new" style={{ gridRow: "10 / span 3" }}><b>{t("asst.c.kateryna")}</b><span>{t("asst.s.gel")}</span><em className="ai-slot__by">{t("asst.s.by")}</em><i className="ai-slot__ring" /></p>
                <p className="ai-slot" style={{ gridRow: "13 / span 2" }}><span>{t("asst.s.busy")}</span></p>
                <p className="ai-slot" style={{ gridRow: "15 / span 2" }}><span>{t("asst.s.busy")}</span></p>
              </div>
            </div>
            <p className="visually-hidden">{t("asst.sched.sr")}</p>
          </div>
          <button className="ai-replay" type="button" data-replay="sched"><span aria-hidden="true">↻</span> <span>{t("aiCommon.replay")}</span></button>
        </div>
      </div>
    </section>
  );
}
