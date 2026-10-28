import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { PRICING, money } from "@/components/sections/pricing/configurator/engine.js";
import { SITE_NAV } from "./nav";

/** One service in the header's panel and the phone menu: its page, picture and «від» price (none for SaaS). */
export type SiteNavService = {
  n: string;
  name: string;
  short: string;
  desc: string;
  price: string | null;
  /** the page's path without the language (for the current page), null for SaaS (a block on the main page) */
  path: string | null;
  href: string;
  img: string;
};
/** A client's case: the chip, who it is for, the figure with its key and the honest sentence beside it. */
export type SiteNavCase = { n: string; chip: string; name: string; who: string; v: string; k: string; honest: string; service: string; href: string };
export type SiteNavData = {
  /** the main page in this language: «/» or «/ru» */
  home: string;
  about: string | null;
  services: SiteNavService[];
  cases: SiteNavCase[];
  example: { chip: string; name: string; who: string; href: string };
  labels: {
    services: string;
    cases: string;
    pricing: string;
    about: string;
    what: string;
    casesMore: string;
    calc: string;
    more: string;
    page: string;
    pageShort: string;
  };
};

type Group = Record<string, { price: number }>;
/** The cheapest paid option of a configurator group: the «від» price. */
const minPaid = (group: Group) => Math.min(...Object.values(group).map((o) => o.price).filter((p) => p > 0));
const bold = (html: string) => /<b>(.*?)<\/b>/.exec(html)?.[1] ?? "";
const firstSentence = (text: string) => text.split(/(?<=\.)\s/)[0].replace(/\.$/, "");

/**
 * The header's and the phone menu's data, built on the server: the main page's words (what, nav, start), the cases'
 * from their own pages (ads, case, asst; those messages never reach the browser) and the prices from the configurator's
 * engine, so no number is written twice.
 */
export async function getSiteNav(locale: string): Promise<SiteNavData> {
  const t = await getTranslations({ locale });
  const href = (path: string) => getPathname({ href: path, locale });
  const from = (n: number) => `${t("start.from")} ${money(n)}`;
  const home = href("/");
  const service = (n: number, path: string | null, price: number | null): SiteNavService => ({
    n: String(n),
    name: t(`what.${n}.name`),
    short: t(`nav.svc.${n}`),
    desc: t(`what.${n}.desc`),
    price: price === null ? null : from(price),
    path,
    href: path ? href(path) : `${home}#services`,
    img: `/img/what/what-${n}-${locale}.webp`,
  });
  const ads = href("/reklama-i-analityka");
  const adsCase = (n: number, id: "ac" | "pest" | "volter"): SiteNavCase => ({
    n: String(n),
    chip: t(`ads.case.${id}.chip`),
    name: t(`ads.case.${id}.name`),
    who: t(`ads.case.${id}.who`),
    v: t(`ads.case.${id}.tab.v`),
    k: t(`ads.case.${id}.tab.k`),
    honest: bold(t.raw(`ads.case.${id}.honest`) as string),
    service: t("services.service.meta.span.2"),
    href: `${ads}#case`,
  });
  // «Пошук замовлень: <hl>15 хвилин</hl> замість години щоранку»: the name, the figure and its key
  const title = t.raw("case.hero.title") as string;
  const [, caseName = "", caseV = "", caseK = ""] = /^(.*?):\s*<hl>(.*?)<\/hl>\s*(.*)$/.exec(title) ?? [];

  return {
    home,
    about: SITE_NAV.about ? href("/pro-nas") : null,
    services: [
      service(1, "/dyzain-i-saity", minPaid(PRICING.formats)),
      service(2, "/ai-avtomatyzatsiia", minPaid(PRICING.automation)),
      service(3, null, null),
      service(4, "/reklama-i-analityka", minPaid(PRICING.growth)),
    ],
    cases: [
      adsCase(1, "ac"),
      adsCase(2, "pest"),
      adsCase(3, "volter"),
      {
        n: "4",
        chip: t("ads.case.ac.chip"),
        name: caseName,
        who: firstSentence(t("case.hero.lead")),
        v: caseV,
        k: caseK,
        honest: "",
        service: t("services.service.meta.span.3"),
        href: href("/keisy/poshuk-zamovlen"),
      },
    ],
    example: { chip: t("aiCommon.nav.example"), name: t("asst.crumb"), who: firstSentence(t("asst.hero.lead")), href: href("/keisy/ai-asystent") },
    labels: {
      services: t("nav.services"),
      cases: t("nav.cases"),
      pricing: t("nav.pricing"),
      about: t("nav.about"),
      what: t("what.meta"),
      casesMore: t("nav.casesMore"),
      calc: t("nav.calc"),
      more: t("what.more"),
      page: t("nav.page"),
      pageShort: t("nav.pageShort"),
    },
  };
}
