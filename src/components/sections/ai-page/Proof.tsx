import { getLocale, getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button/Button";
import { aiRich } from "@/components/ai/rich";
import { aiHref } from "@/components/ai/links";
import { FeedDemo, SchemeDemo } from "./CaseDemos";
import { ShrinkTotal } from "./fx/ShrinkTotal";
import { offerScenes } from "./scenes";

/**
 * 2 · Кейс, right under the first screen (the owner, 21 Oct 2026; one block since his review the same day: «Як зараз /
 * Як буде» and the case had repeated the same numbers). The client and what the robot does, then the manager's morning
 * before (muted) and after (the accent): the confirmed numbers, ~1 година → ~15 хвилин, are its largest type and come
 * once, the «after» counting down as its bar shrinks (fx/ShrinkTotal). Then what the robot does and the full case (a
 * button), the two looping demos of its work (CaseDemos: its scheme, what arrives every morning); the salon below,
 * as a dark card with its chat, «Приклад» (the owner, 30 Oct 2026: «подчеркнуть»). Ivory: it is the sheet that slides over the pinned first screen. Phones: the columns stack and
 * only the morning's messages stay (the next blocks explain the scheme).
 */
export async function Proof({ index }: { index: number }) {
  const t = await getTranslations("ai");
  const locale = await getLocale();
  const scenes = await offerScenes();
  const col = (side: "now" | "next", rows: number, value: string, share: number, from?: number) => (
    <div className={`ai-split__col ai-split__col--${side}`} data-rv="">
      <p className="ai-split__k">{t(`split.${side}.k`)}</p>
      <ShrinkTotal value={value} when={t("proof.when")} share={share} from={from} />
      <ol className="ai-split__rows">
        {Array.from({ length: rows }, (_, i) => (
          <li className="ai-split__row" key={i}>
            <time className="ai-split__t">{t(`split.${side}.${i + 1}.t`)}</time>
            <span>{t(`split.${side}.${i + 1}.text`)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
  return (
    <section className="section section--ivory ai-sec ai-proof" id="case" aria-labelledby="case-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("proof.meta")}</span>
          </p>
          <h2 className="s-head__title" id="case-title" data-split="">
            <span className="tone">{t.rich("proof.title", aiRich)}</span>
          </h2>
        </header>
        <div className="ai-proof__lead" data-rv="">
          <p className="ai-proof__k">
            <span className="ai-proof__tag">{t("proof.tag")}</span>
            <span>{t("proof.who")}</span>
          </p>
        </div>
        <div className="ai-split__grid">
          {col("now", 4, t("proof.before"), 1)}
          {col("next", 3, t("proof.after"), 0.25, 60)}
        </div>
        <p className="visually-hidden">{t("proof.sr")}</p>
        <div className="ai-proof__grid">
          <div className="ai-proof__body" data-rv="">
            <p className="ai-proof__audit">{t("proof.text")}</p>
            <ButtonLink href={aiHref(locale, "/keisy/poshuk-zamovlen")} variant="primary" className="ai-proof__go">{t("proof.go")}</ButtonLink>
          </div>
          <div className="ai-proof__shots">
            <figure className="ai-shot ai-shot--scheme" data-rv="">
              <SchemeDemo />
              <figcaption className="ai-shot__cap">{t("proof.shot.flow")}</figcaption>
            </figure>
            <figure className="ai-shot" data-rv="">
              <FeedDemo />
              <figcaption className="ai-shot__cap">
                <span>{t("proof.shot.tg")}</span> <span className="ai-shot__note">{t("demo.feed.note")}</span>
              </figcaption>
            </figure>
          </div>
        </div>
        <a className="ai-proof__ex" href={aiHref(locale, "/keisy/ai-asystent")} data-rv="">
          <span className="ai-proof__ex-body">
            <span className="ai-proof__ex-k">
              <span className="ai-proof__ex-tag">{t("proof.ex.tag")}</span>
              <span>{t("proof.ex.who")}</span>
            </span>
            <span className="ai-proof__ex-t">{t("proof.ex.t")}</span>
            <span className="ai-proof__ex-go">
              <span>{t("proof.ex.go")}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-arrow" /></svg>
            </span>
          </span>
          {scenes.assistant}
        </a>
      </div>
    </section>
  );
}
