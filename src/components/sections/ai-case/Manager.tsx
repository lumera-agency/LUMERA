import { getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";

/** 6 · Що отримує менеджер: the Telegram message with its notes, the table in one line (scene «tg»). */
export async function Manager() {
  const t = await getTranslations();
  return (
    <section className="section ai-sec" id="manager" aria-labelledby="manager-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta"><span className="s-head__index">6</span><span>{t("case.manager.meta")}</span></p>
          <h2 className="s-head__title" id="manager-title" data-split=""><span className="tone">{t.rich("case.manager.title", aiRich)}</span></h2>
          <p className="s-head__intro">{t("case.manager.intro")}</p>
        </header>
        <div className="ai-manager">
        <div className="ai-tg" data-scene="tg">
          <div className="ai-phone">
            <div className="ai-phone__bar" aria-hidden="true">
              <span className="ai-phone__back"><svg viewBox="0 0 24 24"><path d="M14.5 5.5 8 12l6.5 6.5" /></svg></span>
              <span className="ai-phone__ava">{t("case.bot.ava")}</span>
              <span className="ai-phone__who"><b>{t("case.bot.text")}</b><span>{t("aiCommon.tg.bot")}</span></span>
            </div>
            <div className="ai-phone__chat">
              <p className="ai-phone__day" aria-hidden="true">{t("aiCommon.tg.today")}</p>
              <div className="ai-push ai-phone__push" aria-hidden="true">
                <span className="ai-push__app"><svg viewBox="0 0 24 24"><path d="M21 3 3 10.5l7 2.5 2.5 7z" /><path d="m10 13 4.5-4.5" /></svg></span>
                <p className="ai-push__head"><b>{t("case.bot.text")}</b><span>{t("ai.lock.now")}</span></p>
                <p className="ai-push__t">{t("case.push.1.t")}</p>
              </div>
              <div className="ai-msg">
                <ul className="ai-msg__rows">
                  <li className="ai-row" data-note=""><span className="ai-row__v"><i className="ai-row__n" aria-hidden="true">1</i><span>{t.rich("case.tg.1", aiRich)}</span></span><span className="ai-row__note">{t("case.manager.tr.1")}</span></li>
                  <li className="ai-row" data-note=""><span className="ai-row__v"><i className="ai-row__n" aria-hidden="true">2</i><span>{t("case.tg.2")}</span></span><span className="ai-row__note">{t("case.manager.tr.2")}</span></li>
                  <li className="ai-row" data-note=""><span className="ai-row__v"><i className="ai-row__n" aria-hidden="true">3</i><span>{t.rich("case.tg.3", aiRich)}</span></span><span className="ai-row__note">{t("case.manager.tr.3")}</span></li>
                  <li className="ai-row ai-row--two" data-note=""><span className="ai-row__v"><i className="ai-row__n" aria-hidden="true">4</i><span>{t("case.tg.4")}</span></span><span className="ai-row__note">{t("case.manager.tr.4")}</span></li>
                  <li className="ai-row" data-note=""><span className="ai-row__v"><i className="ai-row__n" aria-hidden="true">5</i><span>{t.rich("case.tg.5", aiRich)}</span></span><span className="ai-row__note">{t("case.manager.tr.5")}</span></li>
                  <li className="ai-row ai-row--plain"><span className="ai-row__v"><span>{t("case.tg.src")}</span></span></li>
                  <li className="ai-row" data-note=""><span className="ai-row__v"><i className="ai-row__n" aria-hidden="true">6</i><span>🔗 <u>{t("case.tg.6")}</u></span></span><span className="ai-row__note">{t("case.manager.tr.6")}</span></li>
                </ul>
                <p className="ai-msg__time" aria-hidden="true">08:04</p>
              </div>
              <p className="ai-msg__kb" aria-hidden="true">{t("case.tg.kb")}</p>
            </div>
          </div>
          <span className="ai-sample ai-tg__sample">{t("aiCommon.sample")}</span>
          <button className="ai-replay" type="button" data-replay="tg"><span aria-hidden="true">↻</span> <span>{t("aiCommon.replay")}</span></button>
        </div>

        {/* the same requests, kept in one place too */}
        <p className="ai-keep"><span className="ai-keep__ico" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M3.5 9.5h17M3.5 14.5h17M9.5 9.5v10" /></svg></span><span>{t("case.manager.table")}</span></p>
        </div>
      </div>
    </section>
  );
}
