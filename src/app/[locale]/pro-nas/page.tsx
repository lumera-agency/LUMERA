import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page/PageShell";
import { aiHref } from "@/components/ai/links";
import { aiMetadata } from "@/components/ai/meta";
import { AboutShell } from "@/components/about/AboutShell";
import { AboutTeam } from "@/components/sections/about-page/AboutTeam";
import { AboutWork } from "@/components/sections/about-page/AboutWork";
import { AboutCases } from "@/components/sections/about-page/AboutCases";
import { AboutContacts } from "@/components/sections/about-page/AboutContacts";

export async function generateMetadata({ params }: PageProps<"/[locale]/pro-nas">) {
  const { locale } = await params;
  return aiMetadata({ locale, namespace: "about.meta", path: "/pro-nas", image: "/img/about/og-about.jpg" });
}

/**
 * «Про нас» — the studio's own page: who the visitor will talk to, and how to reach them (the owner's brief of 26 Oct:
 * the page answers one doubt, «won't they vanish in a month?», and stays short). 1 the team (the first screen) → 2 how we
 * work → 3 the clients' cases (the one light block; it took the team photo's place, the owner, 27 Oct) → 4 the contacts.
 * No form of its own: the request buttons lead to the main page's. Built from the sibling pages' kit (AdsShell's frame,
 * the main page's sections and card).
 */
export default async function AboutPage({ params }: PageProps<"/[locale]/pro-nas">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const home = aiHref(locale, "/");
  const form = `${home}#contact`;
  const nav = [
    { href: "#team", text: t("nav.team") },
    { href: "#work", text: t("nav.work") },
    { href: "#cases", text: t("nav.cases") },
    { href: "#contacts", text: t("nav.contacts") },
    { href: home, text: t("nav.home"), bar: false },
  ];
  return (
    <AboutShell
      nav={nav}
      footerLinks={[...nav.slice(0, 4), { href: home, text: "Lumera Studio" }]}
      cta={{ href: form, text: t("cta") }}
      barCta={{ href: form, text: t("topbar.cta") }}
    >
      <PageShell>
        <AboutTeam />
        <AboutWork index={2} />
        <AboutCases index={3} />
        <AboutContacts index={4} />
      </PageShell>
    </AboutShell>
  );
}
