import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page/PageShell";
import { aiHref } from "@/components/ai/links";
import { aiMetadata } from "@/components/ai/meta";
import { studioName } from "@/config/site";
import { AboutShell } from "@/components/about/AboutShell";
import { AboutTeam } from "@/components/sections/about-page/AboutTeam";
import { AboutWork, type WorkVariant } from "@/components/sections/about-page/AboutWork";
import { AboutDirect } from "@/components/sections/about-page/AboutDirect";
import { AboutContact } from "@/components/sections/about-page/AboutContact";
import { AboutPa, PA_NAV } from "@/components/sections/about-page/pa/AboutPa";
import { AboutPb, PB_NAV } from "@/components/sections/about-page/pb/AboutPb";
import { AboutPc, PC_NAV } from "@/components/sections/about-page/pc/AboutPc";

export async function generateMetadata({ params }: PageProps<"/[locale]/pro-nas">) {
  const { locale } = await params;
  return aiMetadata({ locale, namespace: "about.meta", path: "/pro-nas" });
}

/** TEMPORARY: block 2's variants (?v=0|1|2|3) while the owner chooses; goes with the switch below */
const VARIANTS: readonly WorkVariant[] = ["0", "1", "2", "3"];

/** TEMPORARY (the owner, 6 Nov: «ещё 3 варианта оформления целой страницы»): three whole-page variants behind ?p=a|b|c,
 *  each with its own blocks, styles (about/p?.css) and scenes (about/runtime/p?.js); none: the page as it is */
const PAGES = {
  a: { Blocks: AboutPa, nav: PA_NAV },
  b: { Blocks: AboutPb, nav: PB_NAV },
  c: { Blocks: AboutPc, nav: PC_NAV },
} as const;
type PageKey = keyof typeof PAGES;
const isPage = (p: unknown): p is PageKey => typeof p === "string" && p in PAGES;

/**
 * «Про нас» — the studio's own page (the owner's brief of 26 Oct: it answers one doubt, «won't they vanish in a month?»).
 * The owner, 3 Nov: only what the main page does not say, fewer blocks, more creatively; then «add the request form».
 * 1 who they are (the team, the first screen) → 2 how they work (the folder of what the client gets, on the one light
 * block) → 3 straight to the one who does the work (a broken-telephone demo) → 4 the request (the main page's form).
 * The FAQ, the prices and the cases are the main page's and the service pages'; the footer carries the map of the site.
 * Built from the sibling pages' kit (AdsShell's frame, the main page's sections, card and form).
 */
export default async function AboutPage({ params, searchParams }: PageProps<"/[locale]/pro-nas">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const { v, p } = await searchParams;
  const variant = VARIANTS.find((k) => k === v) ?? "0";
  const page = isPage(p) ? p : null;
  const home = aiHref(locale, "/");
  const blocks = page
    ? PAGES[page].nav.map((id) => ({ href: `#${id}`, text: t(`p${page}.nav.${id}` as Parameters<typeof t>[0]) }))
    : [
        { href: "#team", text: t("nav.team") },
        { href: "#work", text: t("nav.work") },
        { href: "#direct", text: t("nav.direct") },
      ];
  const nav = [...blocks, { href: "#contact", text: t("nav.lead"), bar: false }, { href: home, text: t("nav.home"), bar: false }];
  const Blocks = page ? PAGES[page].Blocks : null;
  return (
    <AboutShell
      nav={nav}
      footerLinks={[...blocks, { href: home, text: studioName }]}
      cta={{ href: "#contact", text: t("cta") }}
      barCta={{ href: "#contact", text: t("topbar.cta") }}
      variant={page ?? undefined}
    >
      <PageShell>
        {Blocks ? (
          <Blocks />
        ) : (
          <>
            <AboutTeam />
            <AboutWork index={2} variant={variant} />
            <AboutDirect index={3} />
            <AboutContact index={4} />
          </>
        )}
      </PageShell>
      {/* TEMPORARY: the switches for the owner's choice: the whole page (0 = as it is, A–C) and, on the page as it is,
          block 2's variants */}
      <nav className="about-pick" aria-label={t("pick")}>
        <span>{t("pick")}</span>
        {(["0", "a", "b", "c"] as const).map((k) => (
          <a href={k === "0" ? "?" : `?p=${k}`} aria-current={(page ?? "0") === k ? "page" : undefined} key={k}>{k.toUpperCase()}</a>
        ))}
        {!page && (
          <>
            <span className="about-pick__sep">{t("pickWork")}</span>
            {VARIANTS.map((k) => (
              <a href={`?v=${k}#work`} aria-current={k === variant ? "page" : undefined} key={k}>{k}</a>
            ))}
          </>
        )}
      </nav>
    </AboutShell>
  );
}
