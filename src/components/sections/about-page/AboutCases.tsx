import { getLocale, getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { getSiteNav } from "@/content/site-nav";

/** The cases in the header's and the footer's order, with this page's own line on each (where, and what was done) */
const IDS = ["ac", "pest", "volter", "orders", "asst"] as const;
/** the clients' own sites, as the ads page links them (the owner, 21 Oct) */
const SITES: Partial<Record<(typeof IDS)[number], string>> = {
  ac: "https://airfrost.com.ua",
  pest: "https://prussakoff.dp.ua",
  volter: "https://volter.co.ua",
};

/**
 * 3 · Кейси, the page's one light block: the owner's sentence «Ми робимо те, що показуємо в кейсах» as the head and the
 * five clients' cases (the product director, 3 Nov: the AI assistant too, a client's case since the owner's word of 28
 * Oct). Their names and links are the site's own (getSiteNav: «Ведення Google Ads: дезінсекція», each ads case opening
 * its own tab), so the header, the footer and this page never disagree; no figures (the owner, 26 Oct). Three in a row
 * for the ads, two for automation (the art director); each card is one link to its case, the client's site beside it.
 * Phones: plain rows on hairlines, without the line of what was done.
 */
export async function AboutCases({ index }: { index: number }) {
  const t = await getTranslations("about");
  const nav = await getSiteNav(await getLocale());
  const cases = [
    ...nav.cases.map((c) => ({ name: c.name, href: c.href })),
    { name: nav.assistant.name, href: nav.assistant.href },
  ];
  return (
    <section className="section section--ivory about-cases" id="cases" aria-labelledby="cases-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("cases.meta")}</span>
          </p>
          <h2 className="s-head__title" id="cases-title" data-split="">
            <span className="tone">{t.rich("cases.title", R)}</span>
          </h2>
          <p className="s-head__intro">{t("cases.intro")}</p>
        </header>
        <ul className="about-cases__list">
          {IDS.map((id, i) => (
            <li className="card about-case" data-in="" key={id}>
              <p className="about-case__who">{t(`cases.${id}.who`)}</p>
              <h3 className="about-case__name" id={`about-case-${id}`}>{cases[i].name}</h3>
              <p className="about-case__d">{t(`cases.${id}.d`)}</p>
              <p className="about-case__go">
                <a className="about-case__open" href={cases[i].href} aria-describedby={`about-case-${id}`}>
                  <span>{t("cases.go")}</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </a>
                {SITES[id] && (
                  <a className="link about-case__site" href={SITES[id]} target="_blank" rel="noopener">
                    {t("cases.site")} <span aria-hidden="true">↗</span>
                  </a>
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
