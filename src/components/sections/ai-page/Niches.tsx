import { getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";
import { AUDIT, NICHES, usd } from "./prices";

/**
 * 4 · Ніші (the owner, 21 Oct 2026): «це про мене?» — three businesses the reader can recognise, each with what the
 * robot takes over and the price it starts from (offer.ts). Under them, the way in for everyone else: the audit.
 */
export async function Niches({ index }: { index: number }) {
  const t = await getTranslations("ai");
  return (
    <section className="section ai-sec ai-niches" id="niches" aria-labelledby="niches-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("niche.meta")}</span>
          </p>
          <h2 className="s-head__title" id="niches-title" data-split="">
            <span className="tone">{t.rich("niche.title", aiRich)}</span>
          </h2>
        </header>
        <ul className="ai-niches__list">
          {NICHES.map((n) => (
            <li className="ai-niche" key={n.key} data-rv="">
              <h3 className="ai-niche__t">{t(`niche.${n.key}.t`)}</h3>
              <p className="ai-niche__p">{t("niche.from", { sum: usd(n.price) })}</p>
              <ul className="ai-niche__list">
                {[1, 2, 3].map((i) => <li key={i}>{t(`niche.${n.key}.${i}`)}</li>)}
              </ul>
            </li>
          ))}
        </ul>
        <p className="ai-niches__more" data-rv="">
          <span>{t("niche.more")}</span>{" "}
          <a className="link" href="#audit">{t("niche.audit", { audit: usd(AUDIT.price) })}</a>
        </p>
      </div>
    </section>
  );
}
