import { getTranslations, setRequestLocale } from "next-intl/server";
import { studioName } from "@/config/site";
import { PageShell } from "@/components/layout/page/PageShell";
import { aiHref } from "@/components/ai/links";
import { aiMetadata } from "@/components/ai/meta";
import { LegalShell } from "@/components/legal/LegalShell";
import { KontaktyHero } from "@/components/contacts/Kontakty";
import { Contact } from "@/components/sections/contact/Contact";
import { PageJsonLd } from "@/components/seo/graph";

const PATH = "/kontakty";

export async function generateMetadata({ params }: PageProps<"/[locale]/kontakty">) {
  const { locale } = await params;
  return aiMetadata({ locale, namespace: "kontakty.meta", path: PATH });
}

/**
 * «Контакти» (the owner, 15 Nov 2026: the form, the mail, the phones, every way to reach us; the main page's parts, a
 * premium ground after 21st.dev): 1 the first screen with the ways to reach us → 2 the main page's request block, over
 * «Зорі», deep space with meteors (his pick of the space grounds). Linked from every page's footer (its «Студія» column).
 */
export default async function KontaktyPage({ params }: PageProps<"/[locale]/kontakty">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const home = aiHref(locale, "/");
  const nav = [
    { href: "#zviazok", text: t("kontakty.nav.reach") },
    { href: "#contact", text: t("kontakty.nav.form") },
    { href: home, text: t("kontakty.nav.home"), bar: false },
  ];
  return (
    <LegalShell ground="stars" page="kt" nav={nav} footerLinks={[...nav.slice(0, 2), { href: home, text: studioName }]} cta={{ href: "#contact", text: t("cta.discuss") }}>
      <KontaktyHero />
      <PageShell>
        <Contact index={2} />
      </PageShell>
      <PageJsonLd locale={locale} path={PATH} meta="kontakty.meta" crumbs={[{ name: t("kontakty.crumb"), path: PATH }]} />
    </LegalShell>
  );
}
