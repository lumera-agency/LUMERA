import { getTranslations, setRequestLocale } from "next-intl/server";
import { studioName } from "@/config/site";
import { PageShell } from "@/components/layout/page/PageShell";
import { aiHref } from "@/components/ai/links";
import { aiMetadata } from "@/components/ai/meta";
import { LegalShell } from "@/components/legal/LegalShell";
import { PrivacyAsk, PrivacyHero, PrivacyParts } from "@/components/legal/Privacy";
import { PageJsonLd } from "@/components/seo/graph";

const PATH = "/polityka-konfidentsiinosti";

export async function generateMetadata({ params }: PageProps<"/[locale]/polityka-konfidentsiinosti">) {
  const { locale } = await params;
  return aiMetadata({ locale, namespace: "privacy.meta", path: PATH });
}

/**
 * «Політика конфіденційності» (the owner, 13 Nov 2026: in the site's style, from the main page's parts): 1 the first
 * screen with the contents → 2 the short version → 3…11 the policy → 12 the questions. Linked from every page's footer.
 */
export default async function PrivacyPage({ params }: PageProps<"/[locale]/polityka-konfidentsiinosti">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const home = aiHref(locale, "/");
  const nav = [
    { href: "#short", text: t("privacy.nav.short") },
    { href: "#data", text: t("privacy.nav.data") },
    { href: "#cookies", text: t("privacy.nav.cookies") },
    { href: "#rights", text: t("privacy.nav.rights") },
    { href: "#ask", text: t("privacy.nav.ask"), bar: false },
    { href: home, text: t("privacy.nav.home"), bar: false },
  ];
  return (
    <LegalShell nav={nav} footerLinks={[...nav.slice(0, 5), { href: home, text: studioName }]} cta={{ href: `${home}#contact`, text: t("cta.discuss") }}>
      <PrivacyHero />
      <PageShell>
        <PrivacyParts />
        <PrivacyAsk />
      </PageShell>
      <PageJsonLd locale={locale} path={PATH} meta="privacy.meta" crumbs={[{ name: t("privacy.crumb"), path: PATH }]} />
    </LegalShell>
  );
}
