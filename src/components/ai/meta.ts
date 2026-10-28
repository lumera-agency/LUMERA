import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { studioName } from "@/config/site";

/** An AI page's title, description, canonical and hreflang (/path ↔ /ru/path) and link preview. The site's address
 *  (metadataBase) comes from the layout. */
export async function aiMetadata({ locale, namespace, path, image }: { locale: string; namespace: string; path: string; image: string }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });
  const url = locale === routing.defaultLocale ? path : `/${locale}${path}`;
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: url, languages: { uk: path, ru: `/ru${path}`, "x-default": path } },
    openGraph: {
      type: "website",
      siteName: studioName,
      title: t("title"),
      description: t("description"),
      url,
      locale: locale === "ru" ? "ru_RU" : "uk_UA",
      alternateLocale: locale === "ru" ? ["uk_UA"] : ["ru_RU"],
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
  };
}
