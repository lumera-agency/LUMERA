import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { PAGE_NAV } from "@/content/nav";
import { getSiteNav } from "@/content/site-nav";
import { aiHref } from "@/components/ai/links";
import { LogoSprite } from "@/components/ui/logo/LogoSprite";
import { InvertCursor } from "@/components/fx/invert-cursor/InvertCursor";
import { PageCurtain } from "@/components/fx/page-curtain/PageCurtain";
import { RootKeep } from "@/components/layout/RootKeep";
import { SiteNavProvider } from "@/components/layout/site-nav/SiteNavProvider";
import { Topbar } from "@/components/layout/topbar/Topbar";
import { MenuSheet } from "@/components/layout/menu/MenuSheet";
import { Footer } from "@/components/layout/footer/Footer";
import { NotFound } from "@/components/sections/not-found/NotFound";
import { EARLY_SCRIPT } from "@/lib/perf/early";
import "./globals.css";
import "@/components/layout/page/page.css";
// the main page's header styles (the topbar's panels, the phone menu), as the service pages take them
import "@/components/layout/header/header.css";

/*
 * The site's 404 (the owner's pick of 13 Nov 2026: «Жила», the number cut from the hero's stone), for any address that
 * is not a page. The site's layout lives under its language ([locale]/layout.tsx), so Next.js could not render a 404
 * inside it on the server (it sent an empty shell and drew the page in the browser); this file is the documented way
 * for that case (next.config: experimental.globalNotFound). It builds the same frame as the layout: the early script,
 * the logo sprite, the cursor, the curtain, the messages and the site's navigation, then the main page's topbar, the
 * phone menu and the footer around the 404 itself. The language is the address's (next-intl's proxy names it;
 * «/ru/…» is Russian, anything else Ukrainian). Next.js sends the 404 status and a noindex.
 * No preloader: a visitor who landed on a wrong address gets the way on at once.
 */

/** The AI pages render their own messages on the server: the browser gets the main page's (as in the layout). */
const AI_NAMESPACES = ["ai", "case", "asst", "aiCommon", "sites", "ads"];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    // (no robots here: Next.js puts the noindex on every 404 itself)
    title: t("notFound.meta"),
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

export default async function GlobalNotFound() {
  const locale = await getLocale();
  const t = await getTranslations();
  const clientMessages = Object.fromEntries(Object.entries(await getMessages()).filter(([ns]) => !AI_NAMESPACES.includes(ns)));
  const siteNav = await getSiteNav(locale);
  const home = aiHref(locale, "/");
  // the main page's blocks, as links to them from here; the request button leads to its form
  const links = PAGE_NAV.map((l) => ({ href: `${home}${l.href}`, text: t(l.label), bar: !("bar" in l) }));
  const cta = { href: `${home}#contact`, text: t("cta.discuss") };
  return (
    <html lang={locale} suppressHydrationWarning>
      <head />
      <body>
        <div style={{ display: "contents" }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `<script>${EARLY_SCRIPT}</script>` }} />
        <PageCurtain />
        <RootKeep />
        <LogoSprite />
        <a className="skip-link" href="#main">{t("skip")}</a>
        <InvertCursor scope=".footer__top, .footer__bottom" quiet="[data-wordmark], .footer__index" size={110} grow={1.15} lensGrow={1.35} />
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          <SiteNavProvider value={siteNav}>
            <Topbar always links={links.filter((l) => !l.href.endsWith("#services"))} cta={cta} home={home} />
            <main id="main">
              <NotFound home={home} />
            </main>
            <Footer links={links} cta={cta} />
            <MenuSheet links={links} cta={cta} home={home} />
          </SiteNavProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
