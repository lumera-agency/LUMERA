import { defineRouting } from "next-intl/routing";
import { locales } from "@/config/site";

/** Ukrainian at the clean URL (/), Russian under /ru. */
export const routing = defineRouting({
  locales,
  defaultLocale: "uk",
  localePrefix: "as-needed",
  localeDetection: false, // the visitor chooses; no redirect by browser language
});

export type Locale = (typeof routing.locales)[number];
