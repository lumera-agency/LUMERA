import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { brandAltNames, brandName, siteUrl, studioName } from "@/config/site";
import { CONTACTS, realPhones } from "@/config/contacts";
import { PRICING } from "@/components/sections/pricing/configurator/engine.js";
import { PRICES } from "@/components/sections/services/copy";
import { plainText } from "./plain-text";
import { services, type Price, type ServiceInfo, type ServiceKey } from "./services";

/**
 * A page's structured data (JSON-LD, Next's guide 02-guides/json-ld): what search engines and AI read about the
 * studio and the page, one graph whose parts point at each other by @id. On every page the studio (Organization) and
 * the site (WebSite); then the page itself, its trail from the main page, the service it sells with its prices, and
 * its questions. The words are the messages the page shows, every price comes from where its page takes it
 * (./services), so the markup cannot say anything the page does not.
 */

const ORG = `${siteUrl}/#org`;
const WEBSITE = `${siteUrl}/#website`;
/** the owner, 12 Nov 2026: the studio works for Ukraine */
const COUNTRY: Record<string, string> = { uk: "Україна", ru: "Украина" };
/** the engine's currency sign as a code (the prices are in dollars) */
const CURRENCY = ({ $: "USD", "€": "EUR", "₴": "UAH" } as Record<string, string>)[PRICING.currency as string] ?? "USD";
const MONTH = { "@type": "QuantitativeValue", value: 1, unitCode: "MON" };

/** A page's address in a language, as its canonical and the sitemap have it: https://eclo.com.ua/, …/ru/dyzain-i-saity */
export const pageUrl = (locale: string, path: string) => `${siteUrl}${getPathname({ href: path || "/", locale })}`;

const amount = (p: Price) => (p.from ? { minPrice: p.sum } : { price: p.sum });
const offer = (p: Price) => ({
  "@type": "Offer",
  name: plainText(p.name),
  ...(p.note ? { description: plainText(p.note) } : {}),
  priceSpecification: p.perMonth
    ? { "@type": "UnitPriceSpecification", ...amount(p), priceCurrency: CURRENCY, referenceQuantity: MONTH }
    : { "@type": "PriceSpecification", ...amount(p), priceCurrency: CURRENCY },
});

type Props = {
  locale: string;
  /** the page's path without the language: "/" for the main page */
  path: string;
  /** where its title and description are: "meta", "sites.meta" … (as in its generateMetadata) */
  meta: string;
  /** the service the page sells: its prices, the page's main subject */
  service?: ServiceKey;
  /** a case: the service it shows */
  about?: ServiceKey;
  /** the trail after the main page (a service page's is its own name) */
  crumbs?: { name: string; path: string }[];
  /** the page's questions, as its list shows them */
  faq?: { q: ReactNode; a: ReactNode }[];
};

export async function pageGraph({ locale, path, meta, service, about, crumbs = [], faq = [] }: Props) {
  const t = await getTranslations({ locale });
  const m = await getTranslations({ locale, namespace: meta });
  const list = await services(locale);
  const url = pageUrl(locale, path);
  const own = list.find((s) => s.key === service);
  const topic = list.find((s) => s.key === about);
  const serviceId = (s: ServiceInfo) => `${pageUrl(locale, s.path)}#service`;
  const trail = own ? [{ name: own.name, path: own.path }] : crumbs;
  const phones = realPhones();
  const country = { "@type": "Country", name: COUNTRY[locale] ?? COUNTRY.uk };

  const organization = {
    "@type": "Organization",
    "@id": ORG,
    name: studioName,
    // «ECLO» and the other spellings people use (config/site: «Екло»)
    alternateName: [brandName, ...brandAltNames],
    url: `${siteUrl}/`,
    // the site's icon, the favicon's picture: a new logo there is the studio's logo here too
    logo: `${siteUrl}/apple-touch-icon.png`,
    description: plainText(t("meta.org")),
    email: CONTACTS.email,
    ...(phones.length ? { telephone: phones[0] } : {}),
    ...(CONTACTS.profiles.length ? { sameAs: CONTACTS.profiles } : {}),
    areaServed: country,
    knowsLanguage: ["uk", "ru"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: plainText(t("nav.services")),
      itemListElement: list.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", "@id": serviceId(s), name: plainText(s.name), url: pageUrl(locale, s.path) },
      })),
    },
  };

  const website = {
    "@type": "WebSite",
    "@id": WEBSITE,
    url: `${siteUrl}/`,
    name: studioName,
    alternateName: brandName,
    inLanguage: ["uk", "ru"],
    publisher: { "@id": ORG },
  };

  const page = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    // the page's <title> and description, the sums in them the engine's as in its metadata (services/copy)
    name: plainText(m("title", PRICES)),
    description: plainText(m("description", PRICES)),
    inLanguage: locale,
    isPartOf: { "@id": WEBSITE },
    about: { "@id": own ? serviceId(own) : topic ? serviceId(topic) : ORG },
    ...(own ? { mainEntity: { "@id": serviceId(own) } } : {}),
    ...(trail.length ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
  };

  const breadcrumb = trail.length > 0 && {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [{ name: studioName, path: "/" }, ...trail].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: plainText(c.name),
      item: pageUrl(locale, c.path),
    })),
  };

  const sells = own && {
    "@type": "Service",
    "@id": serviceId(own),
    name: plainText(own.name),
    serviceType: plainText(own.name),
    description: plainText(own.desc),
    url,
    provider: { "@id": ORG },
    areaServed: country,
    ...(own.prices.length ? { offers: own.prices.map(offer) } : {}),
  };

  const questions = faq.length > 0 && {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    isPartOf: { "@id": `${url}#webpage` },
    inLanguage: locale,
    mainEntity: faq.map(({ q, a }) => ({
      "@type": "Question",
      name: plainText(q),
      acceptedAnswer: { "@type": "Answer", text: plainText(a) },
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organization, website, page, breadcrumb, sells, questions].filter(Boolean),
  };
}

/**
 * The page's structured data as a plain <script> (data, not code: not next/script), «<» escaped so no text in it can
 * close the tag. Pages put it in <main> after their blocks: inside .page it would take :last-child from the last
 * block (page.css gives that one its bottom padding).
 */
export async function PageJsonLd(props: Props) {
  const data = await pageGraph(props);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
