import { getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";
import { AUDIT, NICHES, usd } from "./prices";
import { offerScenes } from "./scenes";
import { NicheTabs } from "./NicheTabs";

/**
 * 4 · Ніші (the owner, 21 Oct 2026): «це про мене?» — three businesses the reader can recognise, each with what the
 * robot takes over and the price it starts from (offer.ts). Under them, the way in for everyone else: the audit.
 * The owner's picks, 30 Oct 2026: a computer has the sliding switch and one panel with its scene (NicheTabs), a phone
 * three ivory cards on the black. Both are in the page; ai-page.css shows the one that fits (.ai-wide / .ai-narrow).
 */
export async function Niches({ index }: { index: number }) {
  const t = await getTranslations("ai");
  const scenes = await offerScenes();
  const rows = NICHES.map((n) => ({
    key: n.key,
    name: t(`niche.${n.key}.t`),
    price: t("niche.from", { sum: usd(n.price) }),
    tasks: [1, 2, 3].filter((i) => t.has(`niche.${n.key}.${i}`)).map((i) => t(`niche.${n.key}.${i}`)),
  }));
  const sceneOf = { salon: scenes.assistant, service: scenes.search, shop: scenes.sources } as const;
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
        <NicheTabs
          label={t("niche.meta")}
          tabs={rows.map((r) => r.name)}
          panels={rows.map((r) => (
            <div className="ai-nt__in" key={r.key}>
              <div>
                <p className="ai-nt__price">{r.price}</p>
                <ul className="ai-nt__list">{r.tasks.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
              {sceneOf[r.key as keyof typeof sceneOf]}
            </div>
          ))}
        />
        <ul className="ai-nc ai-narrow">
          {rows.map((r) => (
            <li className="ai-nc__card" key={r.key} data-rv="">
              <h3 className="ai-nc__t">{r.name}</h3>
              <p className="ai-nc__p">{r.price}</p>
              <ul className="ai-nc__list">{r.tasks.map((x) => <li key={x}>{x}</li>)}</ul>
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
