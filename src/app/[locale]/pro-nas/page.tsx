import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page/PageShell";
import { aiHref } from "@/components/ai/links";
import { aiMetadata } from "@/components/ai/meta";
import { studioName } from "@/config/site";
import { AboutShell } from "@/components/about/AboutShell";
import { AboutTeam } from "@/components/sections/about-page/AboutTeam";
import { AboutTerms } from "@/components/sections/about-page/AboutTerms";
import { AboutWhy } from "@/components/sections/about-page/AboutWhy";
import { AboutFaq } from "@/components/sections/about-page/AboutFaq";
import { AboutContact } from "@/components/sections/about-page/AboutContact";

export async function generateMetadata({ params }: PageProps<"/[locale]/pro-nas">) {
  const { locale } = await params;
  return aiMetadata({ locale, namespace: "about.meta", path: "/pro-nas" });
}

/**
 * «Про нас» — the studio's own page (the owner's brief of 26 Oct: it answers one doubt, «won't they vanish in a month?»,
 * and stays short). Each block one doubt: 1 who they are (the team, the first screen) → 2 why them (one team on the
 * whole way of a request, the one light block, its demo; the owner, 3 Nov, in place of the cases) → 3 what stays with
 * the client (the terms) → 4 what happens after the launch (questions) → 5 what happens when I write (the request, the
 * main page's form).
 * Built from the sibling pages' kit (AdsShell's frame, the main page's sections, card, FAQ and form); the art director's
 * layout of 3 Nov.
 */
export default async function AboutPage({ params }: PageProps<"/[locale]/pro-nas">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const home = aiHref(locale, "/");
  const nav = [
    { href: "#team", text: t("nav.team") },
    { href: "#why", text: t("nav.why") },
    { href: "#terms", text: t("nav.terms") },
    { href: "#faq", text: t("nav.faq") },
    { href: "#contact", text: t("nav.lead"), bar: false },
    { href: home, text: t("nav.home"), bar: false },
  ];
  return (
    <AboutShell
      nav={nav}
      footerLinks={[...nav.slice(0, 5), { href: home, text: studioName }]}
      cta={{ href: "#contact", text: t("cta") }}
      barCta={{ href: "#contact", text: t("topbar.cta") }}
    >
      <PageShell>
        <AboutTeam />
        <AboutWhy index={2} />
        <AboutTerms index={3} />
        <AboutFaq index={4} />
        <AboutContact index={5} />
      </PageShell>
    </AboutShell>
  );
}
