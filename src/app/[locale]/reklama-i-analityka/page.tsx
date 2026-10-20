import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page/PageShell";
import { aiHref } from "@/components/ai/links";
import { aiMetadata } from "@/components/ai/meta";
import { AdsShell } from "@/components/ads/AdsShell";
import { adsFacts } from "@/components/ads/facts";
import { AdsHero } from "@/components/sections/ads-page/AdsHero";
import { AdsChannels } from "@/components/sections/ads-page/AdsChannels";
import { AdsHow } from "@/components/sections/ads-page/AdsHow";
import { AdsAnalytics } from "@/components/sections/ads-page/AdsAnalytics";
import { AdsPrice } from "@/components/sections/ads-page/AdsPrice";
import { AdsFaq } from "@/components/sections/ads-page/AdsFaq";
import { AdsContact } from "@/components/sections/ads-page/AdsContact";

export async function generateMetadata({ params }: PageProps<"/[locale]/reklama-i-analityka">) {
  const { locale } = await params;
  return aiMetadata({ locale, namespace: "ads.meta", path: "/reklama-i-analityka", image: "/img/ads/og-ads.jpg" });
}

/**
 * «Реклама й аналітика» — the ads section's own page (the main page's block 2, row 04, and the ads slide lead here): 1 the
 * first screen → 2 where the ads are shown (Google, Facebook / Instagram) → 3 the analytics (GA4), the page's main
 * difference → 4 the price → 5 how we work → 6 questions (why us is the first one) → 7 the request. Built from the AI
 * pages' and «Дизайн і сайти»'s kit. The cases block (AdsCase, built in the page's working folder) is not live yet: it
 * waits for the clients' consent, dated screenshots and our role confirmed.
 */
export default async function AdsPage({ params }: PageProps<"/[locale]/reklama-i-analityka">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ads");
  const facts = adsFacts(locale);
  const nav = [
    { href: "#ads", text: t("nav.ads") },
    { href: "#analytics", text: t("nav.analytics") },
    { href: "#price", text: t("nav.price") },
    { href: "#how", text: t("nav.how") },
    { href: "#faq", text: t("nav.faq") },
    { href: "#contact", text: t("nav.lead"), bar: false },
    { href: aiHref(locale, "/"), text: t("nav.home"), bar: false },
  ];
  return (
    <AdsShell
      nav={nav}
      footerLinks={[...nav.slice(0, 5), { href: aiHref(locale, "/"), text: "Lumera Studio" }]}
      cta={{ href: "#contact", text: t("cta") }}
      barCta={{ href: "#contact", text: t("topbar.cta") }}
      claim={t("foot.claim")}
    >
      <AdsHero facts={facts} />
      <PageShell>
        <AdsChannels index={2} facts={facts} />
        <AdsAnalytics index={3} facts={facts} />
        <AdsPrice index={4} facts={facts} />
        <AdsHow index={5} facts={facts} />
        <AdsFaq index={6} facts={facts} />
        <AdsContact index={7} />
        {/* the main page's PageShell fades in blocks marked data-sr (ScrollReveals); this page has its own reveals and
            none, and GSAP warns «target not found» on an empty list: one empty, unseen mark keeps it quiet (as on the
            sites page) */}
        <i data-sr="" hidden aria-hidden="true" />
      </PageShell>
    </AdsShell>
  );
}
