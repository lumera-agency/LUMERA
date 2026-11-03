import { getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";
import TextType from "./fx/TextType";

/**
 * Наші умови (the owner, 21 Oct 2026): who pays for what and what is promised, once, in plain text (no cards), and
 * beside it what we don't do (the block of its own until 30 Oct: two short blocks saying the same kind of thing). The
 * FAQ and the price block no longer repeat it. Ivory: a quiet block before the calculator. The text types itself out
 * once it comes into view (React Bits TextType, fx/TextType: an uneven, human pace, each letter fading in, an ember
 * cursor); its full height is held from the start, so nothing below moves.
 */
export async function Terms({ index }: { index: number }) {
  const t = await getTranslations("ai");
  return (
    <section className="section section--ivory ai-sec ai-terms" id="terms" aria-labelledby="terms-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("terms.meta")}</span>
          </p>
          <h2 className="s-head__title" id="terms-title" data-split="">
            <span className="tone">{t.rich("terms.title", aiRich)}</span>
          </h2>
        </header>
        <div className="ai-terms__grid">
          <TextType
            as="p"
            className="ai-terms__text"
            text={t("terms.text")}
            reserve
            loop={false}
            startOnVisible
            variableSpeed={{ min: 14, max: 38 }}
            typeEffect="fade"
            cursorStyle="bar"
            cursorColor="var(--ember-deep)"
          />
          <div className="ai-out" data-rv="">
            <h3 className="ai-out__t">{t("out.title")}</h3>
            <ul className="ai-out__list">
              {[1, 2, 3, 4].map((i) => <li className="ai-out__item" key={i}>{t(`out.${i}`)}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
