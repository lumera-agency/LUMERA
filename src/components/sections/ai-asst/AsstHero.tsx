import { getLocale, getTranslations } from "next-intl/server";
import { ArrowIcon } from "@/components/ui/icons/ArrowIcon";
import { aiRich } from "@/components/ai/rich";
import { aiHref } from "@/components/ai/links";

/** 1 · the first screen: what the assistant does, and the booking chat itself (scene «chat», it plays on arrival). */
export async function AsstHero() {
  const t = await getTranslations();
  const locale = await getLocale();
  return (
    <section className="ai-hero ai-hero--chat" id="top" aria-labelledby="ai-title">
      <div className="ai-hero__in">
        <div className="ai-hero__copy">
          <nav className="ai-crumbs" aria-label={t("aiCommon.crumbs.label")}><a href={aiHref(locale, "/ai-avtomatyzatsiia")}>{t("aiCommon.nav.ai")}</a><span aria-hidden="true">/</span><span aria-current="page">{t("asst.crumb")}</span></nav>
          <h1 className="s-head__title s-head__title--stone ai-hero__title ai-hero__title--asst" id="ai-title"><span className="tone">{t.rich("asst.hero.title", aiRich)}</span></h1>
          <p className="ai-hero__lead">{t("asst.hero.lead")}</p>
          <ul className="ai-chips">
            <li>{t("asst.hero.chip.1")}</li>
            <li>{t("asst.hero.chip.2")}</li>
            <li>{t("asst.hero.chip.3")}</li>
          </ul>
          <div className="ai-hero__actions">
            <a className="btn btn--primary" href="#contact">
              <span className="btn__label">{t("asst.cta")}</span>
              <ArrowIcon />
            </a>
            <a className="ai-down" href="#schedule"><span>{t("case.hero.how")}</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg></a>
          </div>
        </div>

        {/* the chat as the client sees it: her messages on the right (ember: a person), the assistant's on the left */}
        <div className="ai-hero__visual">
          <div className="ai-chat" data-scene="chat">
            <div className="ai-phone">
              <div className="ai-phone__bar" aria-hidden="true">
                <span className="ai-phone__back"><svg viewBox="0 0 24 24"><use href="#ico-back" /></svg></span>
                <span className="ai-phone__ava">{t("asst.chat.ava")}</span>
                <span className="ai-phone__who"><b>{t("asst.chat.name")}</b><span>{t("aiCommon.tg.bot")}</span></span>
              </div>
              <div className="ai-phone__chat ai-chat__list">
                <p className="ai-phone__day" aria-hidden="true">{t("asst.chat.day")}</p>
                <div className="ai-say ai-say--in"><p className="ai-bub"><span>{t("asst.chat.1")}</span><time>21:47</time></p></div>
                <div className="ai-say"><p className="ai-bub"><span>{t("asst.chat.2")}</span><time>21:47</time></p><span className="ai-typing" aria-hidden="true"><i /><i /><i /></span></div>
                <div className="ai-say ai-say--in"><p className="ai-bub"><span>{t("asst.chat.3")}</span><time>21:48</time></p></div>
                <div className="ai-say"><p className="ai-bub"><span>{t("asst.chat.4")}</span><time>21:48</time></p><span className="ai-typing" aria-hidden="true"><i /><i /><i /></span></div>
                <div className="ai-say ai-say--in"><p className="ai-bub"><span>{t("asst.chat.5")}</span><time>21:49</time></p></div>
                <div className="ai-say"><p className="ai-bub"><span>{t("asst.chat.6")}</span><time>21:49</time></p><span className="ai-typing" aria-hidden="true"><i /><i /><i /></span></div>
              </div>
            </div>
            <span className="ai-sample">{t("aiCommon.sample")}</span>
            <button className="ai-replay" type="button" data-replay="chat"><span aria-hidden="true">↻</span> <span>{t("aiCommon.replay")}</span></button>
          </div>
        </div>
      </div>
    </section>
  );
}
