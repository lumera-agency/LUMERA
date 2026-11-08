import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page/PageShell";
import { aiHref } from "@/components/ai/links";
import { aiMetadata } from "@/components/ai/meta";
import { studioName } from "@/config/site";
import { AboutShell } from "@/components/about/AboutShell";
import { AboutPb, PB_NAV } from "@/components/sections/about-page/pb/AboutPb";
import { AboutPd, PD_NAV } from "@/components/sections/about-page/pd/AboutPd";
import { AboutPe, PE_NAV } from "@/components/sections/about-page/pe/AboutPe";
import { AboutPf, PF_NAV } from "@/components/sections/about-page/pf/AboutPf";

export async function generateMetadata({ params }: PageProps<"/[locale]/pro-nas">) {
  const { locale } = await params;
  return aiMetadata({ locale, namespace: "about.meta", path: "/pro-nas" });
}

/** TEMPORARY (the owner, 8 Nov: «найди еще три варианта составления страницы о нас», from 21st.dev and motionsites.ai):
 *  three more whole-page variants behind ?p=d|e|f, each with its own blocks, styles (about/p?.css), scenes
 *  (about/runtime/p?.js) and keys (about.p?); none: the page as it is (B, «Робочий стіл») */
const PAGES = {
  d: { Blocks: AboutPd, nav: PD_NAV },
  e: { Blocks: AboutPe, nav: PE_NAV },
  f: { Blocks: AboutPf, nav: PF_NAV },
} as const;
type PageKey = keyof typeof PAGES;
const isPage = (p: unknown): p is PageKey => typeof p === "string" && p in PAGES;

/**
 * «Про нас» — the studio's own page (the owner's brief of 26 Oct: it answers one doubt, «won't they vanish in a month?»).
 * The owner, 7 Nov, picked whole-page variant B, «Робочий стіл» (sections/about-page/pb/): 1 the team's role passes on
 * a rail → 2 the desk with the five things the client gets (the one light block) → 3 two notes, the client's words
 * retold or kept → 4 the request form. The FAQ, the prices and the cases are the main page's and the service pages';
 * the footer carries the map of the site. Built from the sibling pages' kit (AdsShell's frame, the main page's
 * sections, card and form).
 */
export default async function AboutPage({ params, searchParams }: PageProps<"/[locale]/pro-nas">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const { p } = await searchParams;
  const page = isPage(p) ? p : null;
  const home = aiHref(locale, "/");
  const blocks = page
    ? PAGES[page].nav.map((id) => ({ href: `#${id}`, text: t(`p${page}.nav.${id}` as Parameters<typeof t>[0]) }))
    : PB_NAV.map((id) => ({ href: `#${id}`, text: t(`pb.nav.${id}`) }));
  const nav = [...blocks, { href: "#contact", text: t("nav.lead"), bar: false }, { href: home, text: t("nav.home"), bar: false }];
  const Blocks = page ? PAGES[page].Blocks : AboutPb;
  return (
    <AboutShell
      nav={nav}
      footerLinks={[...blocks, { href: home, text: studioName }]}
      cta={{ href: "#contact", text: t("cta") }}
      barCta={{ href: "#contact", text: t("topbar.cta") }}
      variant={page ?? undefined}
    >
      <PageShell>
        <Blocks />
      </PageShell>
      {/* TEMPORARY: the switch for the owner's choice (B = the page as it is) */}
      <nav className="about-pick" aria-label={t("pick")}>
        <span>{t("pick")}</span>
        {(["b", "d", "e", "f"] as const).map((k) => (
          <a href={k === "b" ? "?" : `?p=${k}`} aria-current={(page ?? "b") === k ? "page" : undefined} key={k}>{k.toUpperCase()}</a>
        ))}
      </nav>
    </AboutShell>
  );
}
