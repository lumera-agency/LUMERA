import { getTranslations, setRequestLocale } from "next-intl/server";
import { studioName } from "@/config/site";
import { PageShell } from "@/components/layout/page/PageShell";
import { aiHref } from "@/components/ai/links";
import { aiMetadata } from "@/components/ai/meta";
import { AdsShell } from "@/components/ads/AdsShell";
import { adsFacts } from "@/components/ads/facts";
import { AdsHero } from "@/components/sections/ads-page/AdsHero";
import { AdsChannels } from "@/components/sections/ads-page/AdsChannels";
import { AdsHow } from "@/components/sections/ads-page/AdsHow";
import { AdsAnalytics } from "@/components/sections/ads-page/AdsAnalytics";
import { AdsCase } from "@/components/sections/ads-page/AdsCase";
import { AdsPause } from "@/components/sections/ads-page/AdsPause";
import { AdsTerms } from "@/components/sections/ads-page/AdsTerms";
import { AdsPrice } from "@/components/sections/ads-page/AdsPrice";
import { AdsFaq } from "@/components/sections/ads-page/AdsFaq";
import { AdsContact } from "@/components/sections/ads-page/AdsContact";

export async function generateMetadata({ params }: PageProps<"/[locale]/reklama-i-analityka">) {
  const { locale } = await params;
  return aiMetadata({ locale, namespace: "ads.meta", path: "/reklama-i-analityka" });
}

/**
 * «Реклама й аналітика» — the ads section's own page (the main page's block 2, row 04, will lead here). The order of the
 * owner's brief of 21 Oct (the proof before the explaining): 1 the first screen → 2 the clients' cases (the one light
 * block) → a pause, one sentence → 3 where the ads are shown (Google, Facebook / Instagram) → 4 the analytics (GA4) →
 * 5 our terms → 6 the price → 7 how we work → 8 questions → 9 the request. Built from the AI pages' and «Дизайн і
 * сайти»'s kit.
 */
export default async function AdsPage({ params }: PageProps<"/[locale]/reklama-i-analityka">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ads");
  const facts = adsFacts(locale);
  const nav = [
    { href: "#case", text: t("nav.case") },
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
      footerLinks={[...nav.slice(0, 6), { href: aiHref(locale, "/"), text: studioName }]}
      cta={{ href: "#contact", text: t("cta") }}
      barCta={{ href: "#contact", text: t("topbar.cta") }}
      claim={t("foot.claim")}
    >
      <AdsHero facts={facts} />
      <PageShell>
        <AdsCase index={2} />
        <AdsPause />
        <AdsChannels index={3} facts={facts} />
        <AdsAnalytics index={4} facts={facts} />
        <AdsTerms index={5} />
        <AdsPrice index={6} facts={facts} />
        <AdsHow index={7} facts={facts} />
        <AdsFaq index={8} facts={facts} />
        <AdsContact index={9} />
        {/* the main page's PageShell fades in blocks marked data-sr (ScrollReveals); this page has its own reveals and
            none, and GSAP warns «target not found» on an empty list: one empty, unseen mark keeps it quiet (as on the
            sites page) */}
        <i data-sr="" hidden aria-hidden="true" />
      </PageShell>
    </AdsShell>
  );
}
