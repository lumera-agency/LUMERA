import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { studioName } from "@/config/site";
import { PRICES } from "@/components/sections/services/copy";

/** An AI page's title, description, canonical and hreflang (/path ↔ /ru/path) and link preview. The site's address
 *  (metadataBase) comes from the layout; the preview's picture, from the page's opengraph-image (components/og). A sum
 *  in the title or the description ({landing}, {ads} …) is the configurator engine's, as on the pages (services/copy). */
export async function aiMetadata({ locale, namespace, path }: { locale: string; namespace: string; path: string }): Promise<Metadata> {
  // (the layout's dynamicParams already 404s any other locale; this keeps a stray one out of the tags all the same)
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace });
  const url = locale === routing.defaultLocale ? path : `/${locale}${path}`;
  const title = t("title", PRICES);
  const description = t("description", PRICES);
  return {
    title,
    description,
    alternates: { canonical: url, languages: { uk: path, ru: `/ru${path}`, "x-default": path } },
    openGraph: {
      type: "website",
      siteName: studioName,
      title,
      description,
      url,
      locale: locale === "ru" ? "ru_RU" : "uk_UA",
      alternateLocale: locale === "ru" ? ["uk_UA"] : ["ru_RU"],
    },
    twitter: { card: "summary_large_image" },
  };
}
