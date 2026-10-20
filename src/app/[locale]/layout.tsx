import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { LogoSprite } from "@/components/ui/logo/LogoSprite";
import { InvertCursor } from "@/components/fx/invert-cursor/InvertCursor";
import "../globals.css";
import "@/components/layout/page/page.css";

// (+ sites: «Дизайн і сайти», messages/sites/)
const AI_NAMESPACES = ["ai", "case", "asst", "aiCommon", "sites", "ads"];
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lumera-seven-eta.vercel.app";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const path = locale === routing.defaultLocale ? "/" : `/${locale}`;
  return {
    metadataBase: new URL(SITE),
    title: t("title"),
    description: t("description"),
    alternates: { canonical: path, languages: { uk: "/", ru: "/ru", "x-default": "/" } },
    openGraph: {
      type: "website",
      siteName: "Lumera Studio",
      title: t("title"),
      description: t("description"),
      url: path,
      locale: locale === "ru" ? "ru_RU" : "uk_UA",
      alternateLocale: locale === "ru" ? ["uk_UA"] : ["ru_RU"],
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
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
   (styles/base.css), and come back by themselves after 3.5 s should a script fail. */
const EARLY = `(function(r){try{history.scrollRestoration='manual'}catch(e){}r.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)r.classList.add('motion');setTimeout(function(){r.classList.add('is-ready')},3500)})(document.documentElement)`;

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  // the browser gets the main page's messages only: the AI pages render theirs on the server (messages/ai/)
  const clientMessages = Object.fromEntries(Object.entries(await getMessages()).filter(([ns]) => !AI_NAMESPACES.includes(ns)));

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: EARLY }} />
      </head>
      <body>
        <LogoSprite />
        <a className="skip-link" href="#main">{t("skip")}</a>
        <InvertCursor scope="#manifesto .manifesto__ink, .footer__top, .footer__bottom" size={110} grow={1.15} lensGrow={1.35} />
        <NextIntlClientProvider messages={clientMessages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
