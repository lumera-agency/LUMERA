import { getLocale, getTranslations } from "next-intl/server";
import { rich } from "@/lib/rich";
import { WhatList } from "./WhatList";
import "./what.css";

/** The four directions; each row leads to its panel in 3 · Послуги. */
export const DIRECTIONS = [
  { n: 1, service: "svc-1" },
  { n: 2, service: "svc-4" },
  { n: 3, service: "svc-5" },
  { n: 4, service: "svc-3" },
] as const;

/** 2 · Що ми робимо: four directions as one big list; over a row its picture follows the cursor. */
export async function What() {
  const t = await getTranslations("what");
  const locale = await getLocale();
  const rows = DIRECTIONS.map((d) => ({
    ...d,
    name: t(`${d.n}.name`),
    desc: t(`${d.n}.desc`),
    image: `/img/what/what-${d.n}-${locale === "ru" ? "ru" : "uk"}.webp`,
  }));
  return (
    <section className="section what" id="what" aria-labelledby="what-title" data-what="">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta" data-sr="">
            <span className="s-head__index">2</span>
            <span>{t("meta")}</span>
          </p>
          <h2 className="s-head__title" id="what-title" data-split="">
            <span className="tone">{t.rich("title", rich)}</span>
          </h2>
          <p className="s-head__intro" data-sr="">{t("intro")}</p>
        </header>
        <WhatList rows={rows} />
      </div>
    </section>
  );
}
