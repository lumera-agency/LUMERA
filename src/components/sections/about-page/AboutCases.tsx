import { getLocale, getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { aiHref } from "@/components/ai/links";

type Case = {
  id: "ac" | "pest" | "volter" | "orders";
  /** the case's own page on the site, and its block there */
  path: string;
  hash?: string;
  /** the client's site, as the ads page links it (the owner, 21 Oct); none for the Dresden crew */
  site?: string;
};

/** The clients' cases the site already shows (CLAUDE.md «Real proof»), in the site's own words, without their numbers
 *  (the owner, 26 Oct: no numbers on this page for now) */
const CASES: Case[] = [
  { id: "ac", path: "/reklama-i-analityka", hash: "#case", site: "https://airfrost.com.ua" },
  { id: "pest", path: "/reklama-i-analityka", hash: "#case", site: "https://prussakoff.dp.ua" },
  { id: "volter", path: "/reklama-i-analityka", hash: "#case", site: "https://volter.co.ua" },
  { id: "orders", path: "/keisy/poshuk-zamovlen" },
];

/**
 * 3 · Кейси, the page's one light block (in place of the team's photo, the owner, 27 Oct): the owner's sentence «Ми
 * робимо те, що показуємо в кейсах» as the head, and the four clients' cases under it, each with what was done and the
 * way to its case (and to the client's site). The cards rise in one after another as they reach the screen.
 */
export async function AboutCases({ index }: { index: number }) {
  const t = await getTranslations("about");
  const locale = await getLocale();
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
          {CASES.map((c) => (
            <li className="card about-case" data-in="" key={c.id}>
              <p className="about-case__chip">{t(`cases.${c.id}.chip`)}</p>
              <h3 className="about-case__name">{t(`cases.${c.id}.name`)}</h3>
              <p className="about-case__who">{t(`cases.${c.id}.who`)}</p>
              <p className="about-case__d">{t(`cases.${c.id}.d`)}</p>
              <p className="about-case__go">
                <a className="link" href={`${aiHref(locale, c.path)}${c.hash ?? ""}`}>
                  {t("cases.go")}
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </a>
                {c.site && (
                  <a className="link" href={c.site} target="_blank" rel="noopener">
                    {t("cases.site")}
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 16 16 8M9.5 8H16v6.5" /></svg>
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
