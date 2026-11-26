import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button/Button";
import { aiRich as R } from "@/components/ai/rich";
import type { SitesFacts } from "@/components/sites/facts";

/** The five stages: the client's part (its icon; none at the launch), the note on what is needed (the first two), how
 *  many deliverables */
const STAGES = [
  { n: 1, need: true, items: 4, icon: <path d="M5 6.5h14v9H10l-5 3.5z" /> },
  { n: 2, need: true, items: 3, icon: <path d="M5 19l1.2-4.2L15.5 5.5l3 3-9.3 9.3z" /> },
  { n: 3, need: false, items: 3, icon: <path d="m6 12.5 4 4L18 8" /> },
  { n: 4, need: false, items: 4, icon: <><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" /><circle cx="12" cy="12" r="2.4" /></> },
  { n: 5, need: false, items: 3, icon: null },
] as const;

/**
 * 4 · Як працюємо (ivory): the board with the «Ваш бренд» landing in five states, the time from the first call to
 * the launch, the five stages with the client's part (runtime/fx-how.js). Up to 860 px (the owner, 26 Nov 2026) the
 * board goes, the time is one line and the stages are an accordion: number, name and result, the rest under a tap.
 */
export async function SitesHow({ facts: F }: { facts: SitesFacts }) {
  const t = await getTranslations("sites");
  return (
    <section className="section section--ivory ai-sec st-how" id="how" aria-labelledby="how-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta"><span className="s-head__index">4</span><span>{t("nav.how")}</span></p>
          <h2 data-split="" className="s-head__title" id="how-title"><span className="tone">{t.rich("how.title", R)}</span></h2>
          <p className="s-head__intro">{t("how.intro")}</p>
        </header>
        <div className="st-hw-grid" data-how="" data-scene="how" data-scene-start="0.06">
          <div className="st-hw-side">
            <div className="st-bd" data-board="">
              <div className="st-bd__bar">
                <span className="st-bd__dots" aria-hidden="true"><i /><i /><i /></span>
                <span className="st-bd__url" aria-hidden="true">
                  <span className="st-bd__u is-on" data-u="1">{t("how.bar.1")}</span>
                  <span className="st-bd__u" data-u="2">{t("how.bar.2")}</span>
                  <span className="st-bd__u" data-u="3">{t("how.bar.3")}</span>
                  <span className="st-bd__u" data-u="4">{t("how.bar.4")}</span>
                  <span className="st-bd__u" data-u="5"><svg viewBox="0 0 24 24" focusable="false"><rect x="6" y="11" width="12" height="9" rx="2" /><path d="M9 11V8.5a3 3 0 0 1 6 0V11" /></svg>vash-sait.ua</span>
                </span>
                <span className="ai-sample">{t("x.sample")}</span>
              </div>
              <div className="st-bd__vp" aria-hidden="true">
                <i className="st-bd__paper is-on" data-l="paper" />
                {/* 1 · the call and the plan */}
                <div className="st-bd__l st-bd__l--1 is-on" data-l="1">
                  <span className="st-bd__bub st-bd__bub--a"><i /><i /></span>
                  <span className="st-bd__bub st-bd__bub--b"><i /><i /></span>
                  <span className="st-bd__bub st-bd__bub--c"><i /></span>
                  <div className="st-bd__plan">
                    <p className="st-bd__plan-t"><span>{t("st.1.b.4")}</span> · <span>{t("ms.brand")}</span></p>
                    <p className="st-bd__plan-r"><i className="st-bd__box"><b /></i><span>{t("st.1.b.1")}</span></p>
                    <p className="st-bd__plan-r"><i className="st-bd__box"><b /></i><span>{t("st.1.b.2")}</span></p>
                    <p className="st-bd__plan-r"><i className="st-bd__box"><b /></i><span>{t("st.1.b.3")}</span></p>
                    <p className="st-bd__plan-r"><i className="st-bd__box"><b /></i><span>{t("st.1.b.4")}</span></p>
                  </div>
                </div>
                {/* 2 · the page's scheme, in the landing's own proportions, and the stamp */}
                <div className="st-bd__l st-bd__l--2" data-l="2">
                  <div className="st-bd__page">
                    <i className="wf wf-nav" /><i className="wf wf-logo" /><i className="wf wf-brand" /><i className="wf wf-menu"><b /><b /><b /><b /></i><i className="wf wf-btn" />
                    <i className="wf wf-strip" /><i className="wf wf-kick" />
                    <i className="wf wf-h wf-h1" /><i className="wf wf-h wf-h2" /><i className="wf wf-h wf-h3" />
                    <i className="wf wf-p wf-p1" /><i className="wf wf-p wf-p2" />
                    <i className="wf wf-roll" /><i className="wf wf-img" />
                    <span className="st-bd__lead st-bd__lead--hero">{t("how.wf.1")}</span>
                    <span className="st-bd__lead st-bd__lead--menu">{t("how.wf.2")}</span>
                    <span className="st-bd__lead st-bd__lead--btn">{t("how.wf.3")}</span>
                  </div>
                  <span className="st-bd__stamp">{t("how.stamp")}</span>
                </div>
                {/* 3–5 · the design (it wipes in over the scheme) */}
                <div className="st-bd__l st-bd__l--d" data-l="d">
                  <div className="st-bd__wipe"><div className="st-bd__wipe-in">
                    {/* AVIF where the browser takes it (a third lighter, 12 Nov 2026), a phone the 600-px copy */}
                    <picture>
                      <source type="image/avif" media="(max-width: 600px)" srcSet={t("img.how.d").replace(/\.webp$/, "-s.avif")} />
                      <source type="image/avif" srcSet={t("img.how.d").replace(/\.webp$/, ".avif")} />
                      <source media="(max-width: 600px)" srcSet={t("img.how.d").replace(/\.webp$/, "-s.webp")} />
                      <img className="st-bd__img" width="1200" height="750" alt="" loading="lazy" decoding="async" src={t("img.how.d")} />
                    </picture>
                  </div></div>
                </div>
                <div className="st-bd__l st-bd__l--p" data-l="p">
                  <span className="st-bd__tag st-bd__tag--d">{t("how.tag.d")}</span>
                  <div className="st-bd__ph">
                    <picture>
                      <source type="image/avif" srcSet={t("img.how.m").replace(/\.webp$/, ".avif")} />
                      <img width="300" height="600" alt="" loading="lazy" decoding="async" src={t("img.how.m")} />
                    </picture>
                  </div>
                  <span className="st-bd__tag st-bd__tag--m">{t("how.tag.m")}</span>
                </div>
                {/* 4 · the test address: a click, your edits */}
                <div className="st-bd__l st-bd__l--4" data-l="4">
                  <div className="st-bd__page">
                    <span className="st-bd__pin">1</span>
                    <span className="st-bd__note">{t("st.4.b.4")}</span>
                    <svg className="st-bd__cur" viewBox="0 0 24 24" focusable="false"><path d="M5 2.5 18.5 13l-6 1.1 3.3 6.6-2.9 1.4-3.2-6.7L5 19.6z" /></svg>
                  </div>
                </div>
                {/* 5 · live: the test request, the accounts are yours */}
                <div className="st-bd__l st-bd__l--5" data-l="5">
                  <span className="st-bd__acc"><svg viewBox="0 0 24 24" focusable="false"><circle cx="8" cy="12" r="3.5" /><path d="M11.5 12H20M17 12v3M20 12v2" /></svg><span>{t("how.access")}</span></span>
                  <span className="st-bd__toast"><i className="st-bd__ok"><svg viewBox="0 0 24 24" focusable="false"><path d="m6 12.5 4 4L18 8" /></svg></i><b>{t("st.5.b.1")}</b></span>
                </div>
              </div>
              <div className="st-bd__rib" role="group" aria-label={t("how.tabs")}>
                <button className="st-bd__seg is-you" type="button" data-go="1" aria-controls="how-st-1"><i className="st-bd__trk" aria-hidden="true"><b /></i><span className="st-bd__sl"><em aria-hidden="true">01</em> <span>{t("st.1.t")}</span></span></button>
                <button className="st-bd__seg is-you" type="button" data-go="2" aria-controls="how-st-2"><i className="st-bd__trk" aria-hidden="true"><b /></i><span className="st-bd__sl"><em aria-hidden="true">02</em> <span>{t("st.2.t")}</span></span></button>
                <button className="st-bd__seg is-you" type="button" data-go="3" aria-controls="how-st-3"><i className="st-bd__trk" aria-hidden="true"><b /></i><span className="st-bd__sl"><em aria-hidden="true">03</em> <span>{t("st.3.t")}</span></span></button>
                <button className="st-bd__seg is-you" type="button" data-go="4" aria-controls="how-st-4"><i className="st-bd__trk" aria-hidden="true"><b /></i><span className="st-bd__sl"><em aria-hidden="true">04</em> <span>{t("st.4.t")}</span></span></button>
                <button className="st-bd__seg" type="button" data-go="5" aria-controls="how-st-5"><i className="st-bd__trk" aria-hidden="true"><b /></i><span className="st-bd__sl"><em aria-hidden="true">05</em> <span>{t("st.5.t")}</span></span></button>
              </div>
            </div>
            <div className="st-hw-time">
              <div className="st-hw-time__br"><span className="st-hw-time__vw"><output className="st-hw-time__v" data-how-weeks="" aria-live="polite">{F.wLanding}</output><span className="st-hw-time__calc" data-how-calc="" hidden>{t("how.time.calc")}</span></span></div>
              <div className="st-hw-time__row">
                <p className="st-hw-time__k" id="how-time-k">{t("how.time._")}</p>
                <div className="st-hseg" role="radiogroup" aria-labelledby="how-time-k" data-how-seg="">
                  <label className="st-hseg__o is-on"><input type="radio" name="how-format" value="landing" defaultChecked /><span>{t("f.landing.t")}</span></label>
                  <label className="st-hseg__o"><input type="radio" name="how-format" value="landingPlus" /><span>{t("f.plus.t")}</span></label>
                  <label className="st-hseg__o"><input type="radio" name="how-format" value="corporate" /><span>{t("f.corp.seg")}</span></label>
                  <label className="st-hseg__o"><input type="radio" name="how-format" value="ecommerce" /><span>{t("f.shop.t")}</span></label>
                </div>
              </div>
              <p className="st-hw-time__note"><span>{t("how.time.note")}</span> <span data-how-add="">{t("how.time.add")}</span></p>
            </div>
          </div>
          <ol className="st-hw-list" data-how-list="">
            {STAGES.map(({ n, icon, need, items }) => (
              <li className={`st-hw${icon ? " is-you" : ""}${n === 1 ? " is-open" : ""}`} id={`how-st-${n}`} data-st={n} key={n}>
                <p className="st-hw__n" aria-hidden="true">{`0${n}`}</p>
                <div className="st-hw__b">
                  <h3 className="st-hw__t" id={`how-t-${n}`}>{t(`st.${n}.t`)}</h3>
                  <p className="st-hw__r">{t(`st.${n}._`)}</p>
                  {/* up to 860 px the stage opens and shuts (the owner, 26 Nov 2026): this button covers its head (its name and
                      result), the rest is its panel; the first one open. Wider, the button is not there (sites.css) */}
                  <button className="st-hw__tg" type="button" aria-expanded={n === 1} aria-controls={`how-p-${n}`} aria-labelledby={`how-t-${n}`}><i aria-hidden="true" /></button>
                  <div className="st-hw__p" id={`how-p-${n}`}>
                    {icon && (
                      <p className="st-hw__you"><i className="st-hw__yi" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">{icon}</svg></i><span className="st-hw__yk">{t("how.you")}</span> <span>{t(`st.${n}.you`)}</span></p>
                    )}
                    {need && <p className="st-hw__need">{t(`st.${n}.need`)}</p>}
                    <div className="st-hw__dl">
                      <p className="st-hw__h">{t(`st.${n}.h`)}</p>
                      <ul className="st-hw__items">
                        {Array.from({ length: items }, (_, i) => (
                          <li key={i}><i className="st-hw__tick" aria-hidden="true" /><b>{t(`st.${n}.b.${i + 1}`)}</b><span>{t(`st.${n}.s.${i + 1}`)}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="st-hw-end">
          <p className="st-hw-end__g">{t.rich("how.guarantee", R)}</p>
          <div className="st-hw-end__acts">
            <ButtonLink href="#contact" variant="primary" data-how-cta="">{t("calc.send")}</ButtonLink>
            <a className="st-hw-end__calc" href="#kalkuliator"><span>{t("how.calc")}</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg></a>
          </div>
          <p className="st-hw-end__note">{t("how.cta.note")}</p>
        </div>
      </div>
    </section>
  );
}
