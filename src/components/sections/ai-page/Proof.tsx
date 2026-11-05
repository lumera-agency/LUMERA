import { getLocale, getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button/Button";
import { aiRich } from "@/components/ai/rich";
import { aiHref } from "@/components/ai/links";
import { ShrinkTotal } from "./fx/ShrinkTotal";

/**
 * 4 · Кейс, after the tasks (the owner, 5 Nov 2026). The client, then the manager's morning before (muted) and after (the
 * accent) as two rows of a table between hairlines: the confirmed numbers, ~1 година → ~15 хвилин, are its largest type
 * and come once, the «after» counting down as its bar shrinks (fx/ShrinkTotal). Then what the robot does there and the
 * full case. Its feed of orders is the first task's picture in block 3. Ivory. Phones: the rows stack.
 */
export async function Proof({ index }: { index: number }) {
  const t = await getTranslations("ai");
  const locale = await getLocale();
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
        {/* what the robot does there, and the full case: a dark pill with a lime disc, as the main page's on the ivory */}
        <div className="ai-proof__end" data-rv="">
          <p className="ai-proof__audit">{t("proof.text")}</p>
          <ButtonLink href={aiHref(locale, "/keisy/poshuk-zamovlen")} variant="primary">
            {t("ex.case.go")}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
