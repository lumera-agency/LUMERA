import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { Badge, Tick, To } from "./PfParts";

/**
 * TEMPORARY · variant F, 3 · Напряму («Відповідь із цитатою»): one chat moment, told twice. «В ECLO» (the bright pane):
 * the client's message (about.direct.msg) and the answer from «Дизайн і розробка» quoting the same sentence unchanged,
 * as a messenger's reply quote, with a lime tick (the system's «готово»). Beside it, muted, «Зазвичай»: the same message
 * goes to «Менеджер» and is forwarded to «Виконавець» as about.direct.lost (the words changed on the way). «Приклад»
 * under them (about.direct.sample): the sentence is an illustration. Played once as it comes into view: the usual pane,
 * then ours (runtime/pf.js, scene «direct»; below 861 px each pane as it comes in, one at a time).
 */
export async function PfDirect({ index }: { index: number }) {
  const t = await getTranslations("about");
  const msg = t("direct.msg");
  return (
    <section className="section pf-direct" id="direct" aria-labelledby="direct-title">
      <div className="container">
        <header className="s-head pf-direct__head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("direct.meta")}</span>
          </p>
          <h2 className="s-head__title" id="direct-title" data-split="">
            <span className="tone">{t.rich("direct.title", R)}</span>
          </h2>
          <p className="s-head__intro">{t("direct.intro")}</p>
        </header>

        <div className="pf-dm" data-pf-dm="">
          {/* usually: through a manager, the words retold */}
          <figure className="pf-pane pf-pane--usual" data-pf-pane="">
            <figcaption className="pf-pane__k">{t("direct.usual")}</figcaption>
            <ol className="pf-pane__thread">
              <li className="pf-msg pf-msg--you pf-dm__a">
                <p className="pf-msg__who">{t("direct.you")}<To />{t("direct.manager")}</p>
                <div className="pf-msg__body">
                  <div className="pf-bub"><p className="pf-bub__t">{msg}</p></div>
                </div>
              </li>
              <li className="pf-msg pf-msg--team pf-msg--fwd pf-dm__b">
                <span className="pf-badge pf-badge--fwd" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false"><path d="M14 6l6 6-6 6M20 12H9a5 5 0 0 0-5 5v1" /></svg>
                </span>
                <p className="pf-msg__who">{t("direct.manager")}<To />{t("direct.doer")}</p>
                <div className="pf-msg__body">
                  <span className="pf-typing" aria-hidden="true"><i /><i /><i /></span>
                  <div className="pf-bub"><p className="pf-bub__t">{t("direct.lost")}</p></div>
                </div>
              </li>
            </ol>
          </figure>

          {/* at ECLO: to the one who does it, the words quoted as they were */}
          <figure className="pf-pane pf-pane--us" data-pf-pane="">
            <figcaption className="pf-pane__k">{t("direct.us")}</figcaption>
            <ol className="pf-pane__thread">
              <li className="pf-msg pf-msg--you pf-dm__a">
                <p className="pf-msg__who">{t("direct.you")}<To />{t("team.3.role")}</p>
                <div className="pf-msg__body">
                  <div className="pf-bub"><p className="pf-bub__t">{msg}</p></div>
                </div>
              </li>
              <li className="pf-msg pf-msg--team pf-dm__b">
                <Badge role={3} />
                <p className="pf-msg__who">{t("team.3.role")}</p>
                <div className="pf-msg__body">
                  <span className="pf-typing" aria-hidden="true"><i /><i /><i /></span>
                  <div className="pf-bub">
                    <blockquote className="pf-quote">
                      <p className="pf-quote__who">{t("direct.you")}</p>
                      <p className="pf-quote__t">{msg}</p>
                    </blockquote>
                    <span className="pf-dm__ok"><Tick /></span>
                  </div>
                </div>
              </li>
            </ol>
          </figure>
        </div>
        <p className="pf-sample pf-sample--dark">{t("direct.sample")}</p>
      </div>
    </section>
  );
}
