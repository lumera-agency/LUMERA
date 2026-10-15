import { getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";

/** 4 · Як працює: the robot's four steps as a bento of cards, each with a short scene of its own (how-src, how-map, how-check, how-send). */
export async function Bento() {
  const t = await getTranslations();
  return (
    <section className="section ai-sec" id="how" aria-labelledby="how-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta"><span className="s-head__index">4</span><span>{t("case.how.meta")}</span></p>
          <h2 className="s-head__title" id="how-title" data-split=""><span className="tone">{t.rich("case.how.title", aiRich)}</span></h2>
          <p className="s-head__intro">{t("case.how.intro")}</p>
        </header>
        <ol className="ai-bento">
          <li className="ai-bc ai-bc--wide" data-svc="">
            <div className="ai-bc__text"><span className="ai-bc__n" aria-hidden="true">1</span><h3 className="ai-bc__t">{t("case.how.step.1.b")}</h3><p className="ai-bc__p">{t("case.how.step.1.text")}</p></div>
            <div className="ai-bc__art ai-bc__art--src" data-scene="how-src" aria-hidden="true">
              <ul className="ai-src">
                <li className="ai-src__s">Kleinanzeigen</li>
                <li className="ai-src__s">{t("case.bento.fb")}</li>
                <li className="ai-src__s">{t("case.bento.mail")}</li>
              </ul>
              <div className="ai-src__deck">
                <p className="ai-src__ad"><b>{t("case.ad.1.t")}</b><span>{t("case.ad.1.m")}</span></p>
                <p className="ai-src__ad"><b>{t("case.ad.3.t")}</b><span>{t("case.ad.3.m")}</span></p>
                <p className="ai-src__ad"><b>{t("case.ad.4.t")}</b><span>{t("case.ad.4.m")}</span></p>
              </div>
              <span className="ai-src__count">{t("case.bento.count")}</span>
            </div>
          </li>
          <li className="ai-bc" data-svc="">
            <div className="ai-bc__text"><span className="ai-bc__n" aria-hidden="true">2</span><h3 className="ai-bc__t">{t("case.how.step.2.b")}</h3><p className="ai-bc__p">{t("case.how.step.2.text")}</p></div>
            <div className="ai-bc__art ai-bc__art--map" data-scene="how-map" aria-hidden="true">
              <div className="ai-map">
                <i className="ai-map__ring" />
                <span className="ai-map__km">100 км</span>
                <i className="ai-map__city" /><span className="ai-map__name">{t("case.bento.city")}</span>
                <i className="ai-map__pin ai-map__pin--in" style={{ left: "32%", top: "38%" }} />
                <i className="ai-map__pin ai-map__pin--in" style={{ left: "64%", top: "30%" }} />
                <i className="ai-map__pin ai-map__pin--in" style={{ left: "57%", top: "69%" }} />
                <i className="ai-map__pin ai-map__pin--out" style={{ left: "95%", top: "60%" }}><b>✕</b></i>
                <i className="ai-map__pin ai-map__pin--out" style={{ left: "9%", top: "88%" }}><b>✕</b></i>
              </div>
              <p className="ai-dup"><span>{t("case.bento.dup.t")}</span><b>{t("case.bento.dup.text")}</b><i className="ai-dup__line" /></p>
            </div>
          </li>
          <li className="ai-bc" data-svc="">
            <div className="ai-bc__text"><span className="ai-bc__n" aria-hidden="true">3</span><h3 className="ai-bc__t">{t("case.how.step.3.b")}</h3><p className="ai-bc__p">{t("case.how.step.3.text")}</p></div>
            <div className="ai-bc__art ai-bc__art--check" data-scene="how-check" aria-hidden="true">
              <ul className="ai-check">
                <li className="ai-check__q"><i className="ai-check__box"><b>✓</b></i><span>{t("case.bento.q.1")}</span></li>
                <li className="ai-check__q"><i className="ai-check__box"><b>✓</b></i><span>{t("case.bento.q.2")}</span></li>
                <li className="ai-check__q"><i className="ai-check__box"><b>✓</b></i><span>{t("case.bento.q.3")}</span></li>
              </ul>
              <p className="ai-check__out"><span className="ai-check__sum">{t("case.bento.sum")}</span><span className="ai-check__score">{t("case.bento.score")}</span></p>
            </div>
          </li>
          <li className="ai-bc ai-bc--wide" data-svc="">
            <div className="ai-bc__text"><span className="ai-bc__n" aria-hidden="true">4</span><h3 className="ai-bc__t">{t("case.how.step.4.b")}</h3><p className="ai-bc__p">{t("case.how.step.4.text")}</p></div>
            <div className="ai-bc__art ai-bc__art--send" data-scene="how-send" aria-hidden="true">
              <div className="ai-push ai-send__push">
                <span className="ai-push__app"><svg viewBox="0 0 24 24"><path d="M21 3 3 10.5l7 2.5 2.5 7z" /><path d="m10 13 4.5-4.5" /></svg></span>
                <p className="ai-push__head"><b>{t("case.bot.text")}</b><span>{t("ai.lock.now")}</span></p>
                <p className="ai-push__t">{t("case.push.1.t")}</p>
                <p className="ai-push__b">{t("case.push.1.b")}</p>
              </div>
              <div className="ai-send__sheet">
                <p className="ai-send__k"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 10h16M10 4v16" /></svg><span>{t("case.bento.sheet")}</span></p>
                <p className="ai-send__row"><i className="ai-send__bar" /><span>{t("case.ad.4.t")}</span><span>6 км</span><span>72</span></p>
              </div>
            </div>
          </li>
        </ol>
        <div className="ai-bento__end">
          <span className="ai-sample">{t("aiCommon.sample")}</span>
          <button className="ai-replay" type="button" data-replay="how-src how-map how-check how-send" aria-label={t("case.replay.how")}><span aria-hidden="true">↻</span> <span>{t("aiCommon.replay")}</span></button>
        </div>
        <p className="ai-foot">{t("case.how.foot")}</p>
      </div>
    </section>
  );
}
