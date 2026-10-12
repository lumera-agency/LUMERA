import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { LogoSprite } from "@/components/ui/logo/LogoSprite";
import { Preloader } from "@/components/fx/preloader/Preloader";
import "../globals.css";
import "@/components/layout/page/page.css";

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
const EARLY = `(function(r){r.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)r.classList.add('motion');setTimeout(function(){r.classList.add('is-ready')},3500)})(document.documentElement)`;

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: EARLY }} />
      </head>
      <body>
        <LogoSprite />
        <Preloader
          brand="Lumera Studio"
          note={t("preloader.note")}
          words={t("preloader.words")}
          last={t("preloader.last")}
          stages={t("preloader.stages")}
        />
        <a className="skip-link" href="#main">{t("skip")}</a>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
