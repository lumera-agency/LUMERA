import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { allowIndexing, siteUrl, studioName } from "@/config/site";
import { LogoSprite } from "@/components/ui/logo/LogoSprite";
import { InvertCursor } from "@/components/fx/invert-cursor/InvertCursor";
import { SiteNavProvider } from "@/components/layout/site-nav/SiteNavProvider";
import { getSiteNav } from "@/content/site-nav";
import { PRICES } from "@/components/sections/services/copy";
import "../globals.css";
import "@/components/layout/page/page.css";
import { RootKeep } from "@/components/layout/RootKeep";
import { PageCurtain } from "@/components/fx/page-curtain/PageCurtain";
import { Preloader } from "@/components/fx/preloader/Preloader";
import { PreloaderRelease } from "@/components/fx/preloader/PreloaderRelease";
import { PerfProbe } from "@/components/fx/lite/PerfProbe";
import { EARLY_SCRIPT } from "@/lib/perf/early";

// (+ sites: «Дизайн і сайти», messages/sites/)
const AI_NAMESPACES = ["ai", "case", "asst", "aiCommon", "sites", "ads"];

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Only uk and ru are pages: any other first segment is a 404 that renders nothing (the 13 Nov audit: a crafted
 *  /<something with a dot> reached generateMetadata and came out with a canonical and og:url on a foreign host). */
export const dynamicParams = false;

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "meta" });
  const path = locale === routing.defaultLocale ? "/" : `/${locale}`;
  // a sum in the title or the description ({landing} …) is the configurator engine's, as on the page (services/copy)
  const title = t("title", PRICES);
  const description = t("description", PRICES);
  return {
    // every page's canonical, hreflang and og:url are paths: they resolve against the site's address (config/site)
    metadataBase: new URL(siteUrl),
    robots: allowIndexing ? undefined : { index: false, follow: false },
    title,
    description,
    alternates: { canonical: path, languages: { uk: "/", ru: "/ru", "x-default": "/" } },
    openGraph: {
      type: "website",
      siteName: studioName,
      title,
      description,
      url: path,
      locale: locale === "ru" ? "ru_RU" : "uk_UA",
      alternateLocale: locale === "ru" ? ["uk_UA"] : ["ru_RU"],
    },
    twitter: { card: "summary_large_image" },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/favicon-32.png", sizes: "32x32", type: "image/png" }],
      apple: "/apple-touch-icon.png",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

/* Chrome fetches a page of the site while the pointer rests on its link, so the next page is in by the time the curtain
   has covered this one (the studio's /lab left out) */
const PREFETCH = JSON.stringify({
  prefetch: [{ where: { and: [{ href_matches: "/*" }, { not: { href_matches: "/lab*" } }, { not: { href_matches: "/ru/lab*" } }] }, eagerness: "moderate" }],
});

/* Vercel Web Analytics (the owner, 12 Nov 2026): no cookies, so no consent banner; it shows the pages and where the
   visitors came from (Google, chatgpt.com, perplexity.ai). Vercel serves its script under /_vercel/insights once
   Analytics is on in the project, so only the production build asks for it (locally and on previews it is a 404).
   Deferred: it waits for the page and costs the first screen nothing. */
const ANALYTICS = process.env.VERCEL_ENV === "production" ? `<script defer src="/_vercel/insights/script.js"></script>` : "";

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  // the browser gets the main page's messages only: the AI pages render theirs on the server (messages/ai/)
  const clientMessages = Object.fromEntries(Object.entries(await getMessages()).filter(([ns]) => !AI_NAMESPACES.includes(ns)));
  // the header's panels and the phone menu: built here, so the cases' words come along without their namespaces
  const siteNav = await getSiteNav(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head />
      <body>
        {/* the early script (lib/perf/early.ts: the page's mode, the intro's guard) as the body's first markup, not a React <script>: it runs as the page is parsed, before anything is
            drawn, and a render in the browser (a language switch) neither runs it again nor warns about a script tag */}
        <div style={{ display: "contents" }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `<script>${EARLY_SCRIPT}</script><script type="speculationrules">${PREFETCH}</script>${ANALYTICS}` }} />
        {/* the preloader on whichever page a visit starts (the owner, 12 Nov 2026: ads lead to every part of the site);
            later pages of the visit come up without it (its own clock decides). The home page's start-up leads it out
            (hero/useBoot), any other page's once it has loaded (PreloaderRelease) */}
        <Preloader brand={studioName} note={t("preloader.note")} words={t("preloader.words")} />
        <PreloaderRelease />
        <PageCurtain />
        <RootKeep />
        {/* the page's own measures; a FULL page that stays slow goes LITE (lib/perf/monitor.ts) */}
        <PerfProbe />
        <LogoSprite />
        <a className="skip-link" href="#main">{t("skip")}</a>
        {/* (over the footer's index the lens steps aside for the plain pointer: footer.css; the owner, 3 Nov) */}
        <InvertCursor scope="#manifesto .manifesto__ink, .footer__top, .footer__bottom" quiet="[data-wordmark], .footer__index" size={110} grow={1.15} lensGrow={1.35} />
        <NextIntlClientProvider messages={clientMessages}>
          <SiteNavProvider value={siteNav}>{children}</SiteNavProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
