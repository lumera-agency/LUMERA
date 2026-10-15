import { getLocale, getTranslations } from "next-intl/server";
import { ArrowIcon } from "@/components/ui/icons/ArrowIcon";
import { aiRich } from "@/components/ai/rich";
import { aiHref } from "@/components/ai/links";

/** 1 · the first screen: the crumbs, the title, the request and «Як це працює»; the robot's morning as a 12-second film (runtime: it loads after the page, plays only on screen). It pins and the ivory block 2 slides over it (data-cover). */
export async function CaseHero() {
  const t = await getTranslations();
  const locale = await getLocale();
  return (
    <section className="ai-hero ai-hero--film" id="top" aria-labelledby="ai-title" data-cover="">
      <div className="ai-hero__in">
        <div className="ai-hero__copy">
          <nav className="ai-crumbs" aria-label={t("aiCommon.crumbs.label")}><a href={aiHref(locale, "/ai-avtomatyzatsiia")}>{t("aiCommon.nav.ai")}</a><span aria-hidden="true">/</span><span aria-current="page">{t("case.crumb")}</span></nav>
          <h1 className="s-head__title s-head__title--stone ai-hero__title" id="ai-title"><span className="tone">{t.rich("case.hero.title", aiRich)}</span></h1>
          <div className="ai-hero__actions">
            <a className="btn btn--primary" href="#contact">
              <span className="btn__label">{t("case.hero.cta")}</span>
              <ArrowIcon />
            </a>
            <a className="ai-down" href="#how"><span>{t("case.hero.how")}</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg></a>
          </div>
        </div>

        {/* the robot's morning in 12 seconds (an illustration, rendered from _video/case-film.html): ads come in,
             most drop out, the ones that fit land in the manager's Telegram. Muted, it loops only while on screen;
             with reduced motion its poster (the last frame) stays. Poster and film follow the page's language */}
        <div className="ai-hero__visual" aria-hidden="true">
          <div className="ai-film" data-film="">
            <video className="ai-film__video" muted loop playsInline preload="none" width={864} height={1080} poster={t("case.film.poster")} data-src={t("case.film.src")} data-src-sm={t("case.film.src").replace(/\.mp4$/, "-m.mp4")}></video>
          </div>
          <span className="ai-sample">{t("aiCommon.sample")}</span>
        </div>
      </div>
    </section>
  );
}
