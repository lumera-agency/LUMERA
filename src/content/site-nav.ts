import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { PRICING, money } from "@/components/sections/pricing/configurator/engine.js";
import { PRODUCTS } from "@/components/sections/ai-page/prices";
import { CONTACTS, phoneText, telHref, telegramHref, viberHref } from "@/config/contacts";
import { SITE_NAV } from "./nav";

/** A section of a service's page in the phone menu: its anchor there (or another page), a price or a tag. */
export type SiteNavSub = { text: string; href: string; price?: string; tag?: string };
/** One service in the header's panel and the phone menu: its page, picture, «від» price (none for SaaS), sections. */
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
  subs: SiteNavSub[];
};
/** A client's case: the chip, who it is for, the figure with its key and the honest sentence beside it. */
export type SiteNavCase = { n: string; chip: string; name: string; who: string; v: string; k: string; honest: string; service: string; href: string };
export type SiteNavData = {
  /** the main page in this language: «/» or «/ru» */
  home: string;
  about: string | null;
  /** the main page's «Як працюємо» and «Ціни», from any page */
  approach: string;
  pricing: string;
  services: SiteNavService[];
  cases: SiteNavCase[];
  /** the AI assistant: a client's case too (the owner, 28 Oct), its own page, no figure yet */
  assistant: { chip: string; name: string; href: string };
  /** the phones (to call) and the messengers (config/contacts) */
  contacts: { phones: { text: string; href: string }[]; telegram: string; viber: string };
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
    how: string;
    contacts: string;
    phones: string;
    telegram: string;
    viber: string;
    call: string;
  };
};

type Group = Record<string, { price: number }>;
/** The cheapest paid option of a configurator group: the «від» price. */
const minPaid = (group: Group) => Math.min(...Object.values(group).map((o) => o.price).filter((p) => p > 0));
const bold = (html: string) => /<b>(.*?)<\/b>/.exec(html)?.[1] ?? "";
const firstSentence = (text: string) => text.split(/(?<=\.)\s/)[0].replace(/\.$/, "");
/** «Сервіс кондиціонерів · Київ і Дніпро» → «Київ і Дніпро»: the title names the business already */
const place = (who: string) => who.split(" · ")[1] ?? who;

/**
 * The header's and the phone menu's data, built on the server: the main page's words (what, nav, start), the cases'
 * from their own pages (ads, case, asst; those messages never reach the browser) and the prices from the configurator's
 * engine and the AI page's list, so no number is written twice.
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
    subs: [],
  });
  const ads = href("/reklama-i-analityka");
  const adsCase = (n: number, id: "ac" | "pest" | "volter"): SiteNavCase => ({
    n: String(n),
    chip: t(`ads.case.${id}.chip`),
    // the owner, 29 Oct: what we did and for whom («Ведення Google Ads: дезінсекція»), not the niche's one word
    name: t(`nav.caseTitle.${id}`),
    who: place(t(`ads.case.${id}.who`)),
    v: t(`ads.case.${id}.tab.v`),
    k: t(`ads.case.${id}.tab.k`),
    honest: bold(t.raw(`ads.case.${id}.honest`) as string),
    service: t("services.service.meta.span.2"),
    // the case's own tab on the ads page (its runtime opens it from the address)
    href: `${ads}#case-${id}`,
  });
  // «Пошук замовлень: <hl>15 хвилин</hl> замість години щоранку»: the name, the figure and its key
  const title = t.raw("case.hero.title") as string;
  const [, caseName = "", caseV = "", caseK = ""] = /^(.*?):\s*<hl>(.*?)<\/hl>\s*(.*)$/.exec(title) ?? [];

  // the services' sections in the phone menu: each page's own blocks, in its own words (its nav), the formats with
  // the engine's prices, the cases where they are
  const at = (path: string, hash: string) => `${href(path)}${hash}`;
  const SITES = "/dyzain-i-saity";
  const AI = "/ai-avtomatyzatsiia";
  const ADS = "/reklama-i-analityka";
  // each format opens as itself: its tab on «Дизайн і сайти» (the page's runtime picks it from the address)
  const formats = (
    [
      ["landing", "landing"],
      ["plus", "landingPlus"],
      ["corp", "corporate"],
      ["shop", "ecommerce"],
    ] as const
  ).map(([k, f]) => ({ text: t(`sites.f.${k}.t`), href: at(SITES, `#fmt-tab-${f}`), price: money(PRICING.formats[f].price) }));
  const subs: SiteNavSub[][] = [
    [
      ...formats,
      { text: t("sites.nav.design"), href: at(SITES, "#design") },
      { text: t("sites.nav.how"), href: at(SITES, "#how") },
      { text: t("sites.x.nav.faq"), href: at(SITES, "#faq") },
    ],
    [
      { text: caseName, href: href("/keisy/poshuk-zamovlen"), tag: t("ai.nav.case") },
      { text: t("ai.nav.services"), href: at(AI, "#niches") },
      { text: t("ai.nav.how"), href: at(AI, "#how") },
      { text: t("ai.nav.offer"), href: at(AI, "#offer") },
      { text: t("ai.nav.calc"), href: at(AI, "#calc") },
      { text: t("asst.crumb"), href: href("/keisy/ai-asystent"), tag: t("ai.nav.case") },
      { text: t("aiCommon.nav.faq"), href: at(AI, "#faq") },
    ],
    [],
    [
      { text: t("nav.casesMore"), href: at(ADS, "#case"), tag: t("ads.nav.case") },
      { text: t("services.service.meta.span.2"), href: at(ADS, "#kanaly") },
      { text: t("ads.nav.analytics"), href: at(ADS, "#analytics") },
      { text: t("ads.nav.price"), href: at(ADS, "#price") },
      { text: t("ads.nav.how"), href: at(ADS, "#how") },
      { text: t("ads.nav.faq"), href: at(ADS, "#faq") },
    ],
  ];
  const services = [
    service(1, SITES, minPaid(PRICING.formats)),
    // the owner, 28 Oct: automation from the AI page's cheapest product (the assistant), ads from the Google Ads setup
    service(2, AI, Math.min(...Object.values(PRODUCTS).flatMap((p) => (p.price ? [p.price] : [])))),
    service(3, null, null),
    service(4, ADS, minPaid(Object.fromEntries(Object.entries(PRICING.growth).filter(([, o]) => "ads" in o && o.ads)))),
  ].map((sv, i) => ({ ...sv, subs: subs[i] }));

  return {
    home,
    approach: `${home}#approach`,
    pricing: `${home}#pricing`,
    about: SITE_NAV.about ? href("/pro-nas") : null,
    services,
    cases: [
      adsCase(1, "ac"),
      adsCase(2, "pest"),
      adsCase(3, "volter"),
      {
        n: "4",
        chip: t("ads.case.ac.chip"),
        name: t("nav.caseTitle.poshuk"),
        who: firstSentence(t("case.hero.lead")),
        v: caseV,
        k: caseK,
        honest: "",
        service: t("services.service.meta.span.3"),
        href: href("/keisy/poshuk-zamovlen"),
      },
    ],
    contacts: {
      phones: CONTACTS.phones.map((n) => ({ text: phoneText(n), href: telHref(n) })),
      telegram: telegramHref(),
      viber: viberHref(),
    },
    assistant: { chip: t("ai.nav.case"), name: t("nav.caseTitle.asst"), href: href("/keisy/ai-asystent") },
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
      how: t("nav.how"),
      contacts: t("nav.contacts.label"),
      phones: t("nav.contacts.phones"),
      telegram: t("nav.contacts.telegram"),
      viber: t("nav.contacts.viber"),
      call: t("nav.contacts.call"),
    },
  };
}
