import { getLocale, getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";
import { aiHref } from "@/components/ai/links";
import { Sample } from "@/components/ai/parts";

/** 4 · Приклади: two doors to the example pages, stills only (the motion lives on those pages) (ivory). */
export async function Examples() {
  const t = await getTranslations("ai");
  const c = await getTranslations("aiCommon");
  const locale = await getLocale();
  const doors = [
    { key: "case", mod: "case", href: aiHref(locale, "/keisy/poshuk-zamovlen") },
    { key: "asst", mod: "ex", href: aiHref(locale, "/keisy/ai-asystent") },
  ] as const;
  return (
    <section className="section section--ivory ai-sec" id="examples" aria-labelledby="examples-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">4</span>
            <span>{t("nav.examples")}</span>
          </p>
          <h2 className="s-head__title" id="examples-title" data-split="">
            <span className="tone">{t.rich("ex.title", aiRich)}</span>
          </h2>
        </header>
        <div className="ai-doors">
          {doors.map((d) => (
            <a className={`ai-door ai-door--${d.mod}`} href={d.href} key={d.key}>
              <span className="ai-door__media">
                {/* eslint-disable-next-line @next/next/no-img-element -- a fixed 4:5 still, sized by CSS */}
                <img className="ai-door__still" src={t(`ex.${d.key}.img`)} width={560} height={700} alt="" loading="lazy" decoding="async" />
                <span className="ai-sample ai-door__sample" aria-hidden="true">{c("sample")}</span>
              </span>
              <span className="ai-door__body">
                <span className="ai-door__k">
                  <span className={`ai-door__tag ai-door__tag--${d.mod}`}>{t(`ex.${d.key}.k`)}</span>
                  <span className="ai-door__m">{t(`ex.${d.key}.m`)}</span>
                </span>
                <h3 className="ai-door__t">{t.rich(`ex.${d.key}.t`, aiRich)}</h3>
                <span className="ai-door__p">{t(`ex.${d.key}.p`)}</span>
                <span className="ai-door__go">
                  <span>{t(`ex.${d.key}.go`)}</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-arrow" /></svg>
                </span>
              </span>
            </a>
          ))}
        </div>
        <p className="ai-doors__sample"><Sample>{c("sample")}</Sample></p>
      </div>
    </section>
  );
}
