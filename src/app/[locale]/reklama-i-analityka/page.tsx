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
import { AdsCase } from "@/components/sections/ads-page/AdsCase";
import { AdsPrice } from "@/components/sections/ads-page/AdsPrice";
import { AdsFaq } from "@/components/sections/ads-page/AdsFaq";
import { AdsContact } from "@/components/sections/ads-page/AdsContact";

export async function generateMetadata({ params }: PageProps<"/[locale]/reklama-i-analityka">) {
  const { locale } = await params;
  return aiMetadata({ locale, namespace: "ads.meta", path: "/reklama-i-analityka", image: "/img/ads/og-ads.jpg" });
}

/**
 * «Реклама й аналітика» — the ads section's own page (the main page's block 2, row 04, and the ads slide lead here): 1 the first
 * screen → 2 where the ads are shown (Google, Facebook / Instagram) → 3 the analytics (GA4), the page's main difference →
 * 4 the first real case (the owner, 20 Oct) → 5 the price → 6 how we work → 7 questions (why us is the first one: the
 * trust block moved there, the owner, 20 Oct) → 8 the request (the order the business analyst proposed on 20 Oct: the difference and the price first, the process
 * near the form; the case right after the analytics it proves). Built from the AI pages' and «Дизайн і сайти»'s kit.
 */
export default async function AdsPage({ params }: PageProps<"/[locale]/reklama-i-analityka">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ads");
  const facts = adsFacts(locale);
  const nav = [
    { href: "#ads", text: t("nav.ads") },
    { href: "#analytics", text: t("nav.analytics") },
    { href: "#case", text: t("nav.case") },
    { href: "#price", text: t("nav.price") },
    { href: "#how", text: t("nav.how") },
    { href: "#faq", text: t("nav.faq") },
    { href: "#contact", text: t("nav.lead"), bar: false },
    { href: aiHref(locale, "/"), text: t("nav.home"), bar: false },
  ];
  return (
    <AdsShell
      nav={nav}
      footerLinks={[...nav.slice(0, 6), { href: aiHref(locale, "/"), text: "Lumera Studio" }]}
      cta={{ href: "#contact", text: t("cta") }}
      barCta={{ href: "#contact", text: t("topbar.cta") }}
      claim={t("foot.claim")}
    >
      <AdsHero facts={facts} />
      <PageShell>
        <AdsChannels index={2} facts={facts} />
        <AdsAnalytics index={3} facts={facts} />
        <AdsCase index={4} />
        <AdsPrice index={5} facts={facts} />
        <AdsHow index={6} facts={facts} />
        <AdsFaq index={7} facts={facts} />
        <AdsContact index={8} />
        {/* the main page's PageShell fades in blocks marked data-sr (ScrollReveals); this page has its own reveals and
            none, and GSAP warns «target not found» on an empty list: one empty, unseen mark keeps it quiet (as on the
            sites page) */}
        <i data-sr="" hidden aria-hidden="true" />
      </PageShell>
    </AdsShell>
  );
}
