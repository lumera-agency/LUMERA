import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page/PageShell";
import { aiHref } from "@/components/ai/links";
import { aiMetadata } from "@/components/ai/meta";
import { SitesShell } from "@/components/sites/SitesShell";
import { sitesFacts } from "@/components/sites/facts";
import { sitesStrings } from "@/components/sites/strings";
import { SitesHero } from "@/components/sections/sites-page/SitesHero";
import { SitesFormats } from "@/components/sections/sites-page/SitesFormats";
import { SitesPrice } from "@/components/sections/sites-page/SitesPrice";
import { SitesHow } from "@/components/sections/sites-page/SitesHow";
import { SitesFaq } from "@/components/sections/sites-page/SitesFaq";
import { SitesContact } from "@/components/sections/sites-page/SitesContact";

export async function generateMetadata({ params }: PageProps<"/[locale]/dyzain-i-saity">) {
  const { locale } = await params;
  return aiMetadata({ locale, namespace: "sites.meta", path: "/dyzain-i-saity", image: "/img/sites/og-sites.jpg" });
}

/**
 * «Дизайн і розробка сайтів» — the sites section's own page (the main page's block 2, row 01, leads here): 1 the first
 * screen → 2 the formats with the sample sites → 3 the price with a live sample → 4 how we work → 5 questions →
 * 6 the request. Ported from the static page (the working folder's dyzain-i-saity/index.html), as the AI pages were.
 */
export default async function SitesPage({ params }: PageProps<"/[locale]/dyzain-i-saity">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("sites");
  const facts = sitesFacts(locale);
  const nav = [
    { href: "#formats", text: t("nav.formats") },
    { href: "#design", text: t("nav.design") },
    { href: "#how", text: t("nav.how") },
    { href: "#faq", text: t("x.nav.faq") },
    { href: "#contact", text: t("x.nav.lead"), bar: false },
    { href: aiHref(locale, "/"), text: t("x.nav.home"), bar: false },
  ];
  return (
    <SitesShell
      nav={nav}
      footerLinks={[...nav.slice(0, 5), { href: aiHref(locale, "/"), text: "Lumera Studio" }]}
      cta={{ href: "#contact", text: t("cta") }}
      barCta={{ href: "#contact", text: t("topbar.cta") }}
      claim={t("foot.claim")}
      strings={await sitesStrings()}
    >
      <SitesHero facts={facts} />
      <PageShell>
        <SitesFormats facts={facts} />
        <SitesPrice facts={facts} />
        <SitesHow />
        <SitesFaq facts={facts} />
        <SitesContact />
        {/* (QA 19 Oct, S-15) the main page's PageShell fades in blocks marked data-sr (ScrollReveals); this page has its own
            scenes and none, and GSAP warned «target not found» on the empty list. One empty, unseen mark keeps it quiet */}
        <i data-sr="" hidden aria-hidden="true" />
      </PageShell>
    </SitesShell>
  );
}
