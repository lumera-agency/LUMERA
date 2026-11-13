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
import { PerfProbe } from "@/components/fx/lite/PerfProbe";

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

/* Runs before first paint: the intro's start states are hidden only when JS and motion are on
   (styles/base.css), and come back by themselves after 3.5 s should a script fail; while the preloader is still up
   they wait for it (up to 10 s): shown under it, the headline would be seen whole as the sheet fades, then hidden and
   played in by the intro (23 Oct). Reached through the page curtain (fx/page-curtain: a link from another page of the
   site, just now) the page comes up under it, html.is-curtain; should no script lift it, it goes after 6 s */
const EARLY = `(function(r){try{history.scrollRestoration='manual'}catch(e){}r.classList.add('js');try{var q=location.search;if(/[?&]lite=1/.test(q))sessionStorage.setItem('eclo:lite','1');else if(/[?&](lite=0|full=1)/.test(q))sessionStorage.setItem('eclo:lite','0');if(sessionStorage.getItem('eclo:lite')==='1')r.classList.add('is-lite')}catch(e){}if(!matchMedia('(prefers-reduced-motion: reduce)').matches)r.classList.add('motion');try{var c=+sessionStorage.getItem('eclo:curtain');sessionStorage.removeItem('eclo:curtain');var n=performance.getEntriesByType('navigation')[0];if(r.classList.contains('motion')&&Date.now()-c<8000&&(!n||n.type==='navigate')){r.classList.add('is-curtain');setTimeout(function(){r.classList.remove('is-curtain')},6000)}}catch(e){}var t=Date.now();setTimeout(function f(){if(document.querySelector('[data-preloader]')&&Date.now()-t<10000)return setTimeout(f,250);r.classList.add('is-ready')},3500)})(document.documentElement)`;

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
        {/* EARLY as the body's first markup, not a React <script>: it runs as the page is parsed, before anything is
            drawn, and a render in the browser (a language switch) neither runs it again nor warns about a script tag */}
        <div style={{ display: "contents" }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `<script>${EARLY}</script><script type="speculationrules">${PREFETCH}</script>${ANALYTICS}` }} />
        <PageCurtain />
        <RootKeep />
        {/* the light mode for computers that cannot keep the site's frames (lib/lite.ts) */}
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
