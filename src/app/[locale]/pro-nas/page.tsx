import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page/PageShell";
import { aiHref } from "@/components/ai/links";
import { aiMetadata } from "@/components/ai/meta";
import { studioName } from "@/config/site";
import { AboutShell } from "@/components/about/AboutShell";
import { AboutPb, PB_NAV } from "@/components/sections/about-page/pb/AboutPb";

export async function generateMetadata({ params }: PageProps<"/[locale]/pro-nas">) {
  const { locale } = await params;
  return aiMetadata({ locale, namespace: "about.meta", path: "/pro-nas" });
}

/**
 * «Про нас» — the studio's own page (the owner's brief of 26 Oct: it answers one doubt, «won't they vanish in a month?»).
 * The owner, 7 Nov, picked whole-page variant B, «Робочий стіл» (sections/about-page/pb/): 1 the team's role passes on
 * a rail → 2 the desk with the five things the client gets (the one light block) → 3 two notes, the client's words
 * retold or kept → 4 the request form. The FAQ, the prices and the cases are the main page's and the service pages';
 * the footer carries the map of the site. Built from the sibling pages' kit (AdsShell's frame, the main page's
 * sections, card and form).
 */
export default async function AboutPage({ params }: PageProps<"/[locale]/pro-nas">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const home = aiHref(locale, "/");
  const blocks = PB_NAV.map((id) => ({ href: `#${id}`, text: t(`pb.nav.${id}`) }));
  const nav = [...blocks, { href: "#contact", text: t("nav.lead"), bar: false }, { href: home, text: t("nav.home"), bar: false }];
  return (
    <AboutShell
      nav={nav}
      footerLinks={[...blocks, { href: home, text: studioName }]}
      cta={{ href: "#contact", text: t("cta") }}
      barCta={{ href: "#contact", text: t("topbar.cta") }}
    >
      <PageShell>
        <AboutPb />
      </PageShell>
    </AboutShell>
  );
}
