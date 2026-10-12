import { defineRouting } from "next-intl/routing";

/** Ukrainian at the clean URL (/), Russian under /ru. */
export const routing = defineRouting({
  locales: ["uk", "ru"],
  defaultLocale: "uk",
  localePrefix: "as-needed",
  localeDetection: false, // the visitor chooses; no redirect by browser language
});

export type Locale = (typeof routing.locales)[number];
