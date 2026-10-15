import { getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";

/** 3 · Адміністратор: a question handed over; a reminder after 15 minutes (scene «strip»). */
export async function Admin() {
  const t = await getTranslations();
  return (
    <section className="section ai-sec" id="admin" aria-labelledby="admin-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta"><span className="s-head__index">3</span><span>{t("asst.admin.meta")}</span></p>
          <h2 className="s-head__title" id="admin-title" data-split=""><span className="tone">{t.rich("asst.admin.title", aiRich)}</span></h2>
          <p className="s-head__intro">{t("asst.admin.intro")}</p>
        </header>
        <ol className="ai-strip" data-scene="strip">
          <li className="ai-strip__step ai-strip__step--person">
            <p className="ai-strip__when"><time>11:20</time><span>{t("asst.strip.1.who")}</span></p>
            <div className="ai-strip__card"><div className="ai-say ai-say--in"><p className="ai-bub">{t("asst.strip.1.text")}</p></div></div>
          </li>
          <li className="ai-strip__step">
            <p className="ai-strip__when"><time>11:20</time><span>{t("asst.strip.2.who")}</span></p>
            <div className="ai-strip__card"><div className="ai-say"><p className="ai-bub">{t("asst.strip.2.text")}</p></div></div>
          </li>
          <li className="ai-strip__step">
            <p className="ai-strip__when"><time>11:20</time><span>{t("asst.strip.3.who")}</span></p>
            <div className="ai-strip__card">
              <div className="ai-push">
                <span className="ai-push__app" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ico-tg" /></svg></span>
                <p className="ai-push__head"><b>{t("asst.chat.name")}</b><span>11:20</span></p>
                <p className="ai-push__t">{t("asst.strip.3.t")}</p>
                <p className="ai-push__b">{t("asst.strip.3.b")}</p>
              </div>
            </div>
          </li>
          <li className="ai-strip__step ai-strip__step--late">
            <p className="ai-strip__when"><time>11:35</time><span>{t("asst.strip.4.who")}</span></p>
            <div className="ai-strip__card">
              <span className="ai-strip__timer" aria-hidden="true"><i /></span>
              <div className="ai-push">
                <span className="ai-push__app ai-push__app--late" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#ico-clock" /></svg></span>
                <p className="ai-push__head"><b>{t("asst.chat.name")}</b><span>11:35</span></p>
                <p className="ai-push__t">{t("asst.strip.4.t")}</p>
                <p className="ai-push__b">{t("asst.strip.4.b")}</p>
              </div>
            </div>
          </li>
        </ol>
        <div className="ai-strip__end">
          <p className="ai-foot">{t("asst.strip.foot")}</p>
          <button className="ai-replay" type="button" data-replay="strip"><span aria-hidden="true">↻</span> <span>{t("aiCommon.replay")}</span></button>
        </div>
      </div>
    </section>
  );
}
