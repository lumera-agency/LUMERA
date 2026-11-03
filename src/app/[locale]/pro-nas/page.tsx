import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page/PageShell";
import { aiHref } from "@/components/ai/links";
import { aiMetadata } from "@/components/ai/meta";
import { studioName } from "@/config/site";
import { AboutShell } from "@/components/about/AboutShell";
import { AboutTeam } from "@/components/sections/about-page/AboutTeam";
import { AboutWork } from "@/components/sections/about-page/AboutWork";
import { AboutDirect } from "@/components/sections/about-page/AboutDirect";

export async function generateMetadata({ params }: PageProps<"/[locale]/pro-nas">) {
  const { locale } = await params;
  return aiMetadata({ locale, namespace: "about.meta", path: "/pro-nas" });
}

/**
 * «Про нас» — the studio's own page (the owner's brief of 26 Oct: it answers one doubt, «won't they vanish in a month?»).
 * The owner, 3 Nov: only what the main page does not say, fewer blocks, more creatively. Three: 1 who they are (the
 * team, the first screen) → 2 how they work (the owner's two rules, a poster on the one light block) → 3 straight to the
 * one who does the work (a broken-telephone demo, then the request button). The FAQ, the form, the prices and the cases
 * are the main page's and the service pages'; the footer carries the contacts and the map of the site. Built from the
 * sibling pages' kit (AdsShell's frame, the main page's sections and card).
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
    { href: "#direct", text: t("nav.direct") },
    { href: home, text: t("nav.home"), bar: false },
  ];
  return (
    <AboutShell
      nav={nav}
      footerLinks={[...nav.slice(0, 3), { href: home, text: studioName }]}
      cta={{ href: form, text: t("cta") }}
      barCta={{ href: form, text: t("topbar.cta") }}
    >
      <PageShell>
        <AboutTeam />
        <AboutWork index={2} />
        <AboutDirect index={3} />
      </PageShell>
    </AboutShell>
  );
}
