import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { AdsCases, type CaseView } from "@/components/ads/AdsCases";

/** A cell ringed on a screenshot, in % of the image */
type Ring = { left: number; top: number; width: number; height: number };
type Shot = { id: string; src: string; w: number; h: number; rings?: Ring[] };
type Case = {
  id: "ac" | "pest" | "volter";
  shots: Shot[];
  /** the client's site, linked from the case (the owner, 21 Oct) */
  site: string;
  /** the screenshot shows the account before our changes: the window's foot says so */
  before?: boolean;
};

/**
 * The cases, one per client (the owner, 20–21 Oct). Numbers are the accounts' own (_cases/<id>/case.md); each case links
 * the client's site (the owner, 21 Oct; the screenshots still hide the names). Before a case goes live: its dated
 * screenshots, our role and the client's consent (_merge/MERGE.md).
 * · ac: a heating and air-conditioning service, Kyiv and Dnipro, June – September 2026, setup and ads: keywords with the
 *   Total row's conversions and cost per conversion ringed, campaigns.
 * · pest: pest control, July – September 2026, managing an account that was already running: the accepted calls counted
 *   by call tracking (one call never twice), the spend ringed on the account's total.
 * · volter: backup power systems, Kyiv and Dnipro, 29 August – 20 October 2026, the first cycle of managing an account:
 *   the budget no longer spent on keywords with no requests, the click's price and the share of impressions before and
 *   after (only three days after the changes, and the card says so). One screenshot, the campaigns, marked «before our
 *   changes» (the owner, 21 Oct: the keywords' screenshot, its quality scores of 3–5 out of 10, only hurt the case).
 */
const CASES: Case[] = [
  {
    id: "ac",
    site: "https://airfrost.com.ua",
    shots: [
      { id: "kw", src: "/img/ads/case-ac-keywords.jpg", w: 780, h: 400, rings: [{ left: 78, top: 13, width: 10.6, height: 7.5 }, { left: 88.6, top: 13, width: 11, height: 7.5 }] },
      { id: "cmp", src: "/img/ads/case-ac-campaigns.jpg", w: 780, h: 385 },
    ],
  },
  {
    id: "pest",
    site: "https://prussakoff.dp.ua",
    shots: [
      { id: "cmp", src: "/img/ads/case-pest-campaigns.jpg", w: 1086, h: 465, rings: [{ left: 46.4, top: 79.2, width: 8.3, height: 8.2 }] },
      { id: "mon", src: "/img/ads/case-pest-months.jpg", w: 1086, h: 550 },
    ],
  },
  {
    id: "volter",
    site: "https://volter.co.ua",
    before: true,
    shots: [{ id: "cmp", src: "/img/ads/case-volter-campaigns.jpg", w: 1138, h: 335 }],
  },
];
/** the numbers: the price of a request (on its card), then requests, conversion and spend */
const METRICS = ["cpl", "n", "cr", "spend"] as const;

/**
 * 2 · Кейси (the page's one light block, right after the first screen: the owner's brief of 21 Oct, the proof before the
 * explaining). The words are resolved here, the switching and the numbers' run are AdsCases (a client part): the setting
 * of 6 Nov 2026 is described there.
 */
export async function AdsCase({ index }: { index: number }) {
  const t = await getTranslations("ads");
  const cases: CaseView[] = CASES.map((c) => ({
    id: c.id,
    name: t(`case.${c.id}.name`),
    who: t(`case.${c.id}.who`),
    per: t(`case.${c.id}.per`),
    site: c.site,
    host: new URL(c.site).hostname,
    before: Boolean(c.before),
    cap: c.before ? t(`case.${c.id}.cap`) : t("case.cap"),
    tab: { v: t(`case.${c.id}.tab.v`), k: t(`case.${c.id}.tab.k`) },
    metrics: METRICS.map((key) => ({ key, k: t(`case.${c.id}.m.${key}.k`), v: t(`case.${c.id}.m.${key}.v`) })),
    how: t.rich(`case.${c.id}.how`, R),
    shots: c.shots.map((shot) => ({ ...shot, label: t(`case.${c.id}.shots.${shot.id}`), alt: t(`case.${c.id}.alt.${shot.id}`) })),
  }));
  return (
    <section className="section section--ivory ai-sec rk-case" id="case" aria-labelledby="case-title">
      <div className="container">
        <AdsCases
          cases={cases}
          text={{ index, nav: t("nav.case"), title: t.rich("case.title", R), intro: t("case.intro"), cta: t("cta"), site: t("case.site"), before: t("case.before"), swipe: t("case.swipe") }}
        />
      </div>
    </section>
  );
}
