import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { brandName, studioName } from "@/config/site";
import { typesetMessages } from "@/lib/typeset";
import { glueNumbers } from "@/components/ai/typeset";

type Messages = { [key: string]: string | Messages };

/** The name in every message comes from config/site: {brand} → brandName, {studio} → studioName (before the
 *  typesetting, so it sets the final text). */
function withBrand(node: Messages): Messages {
  return Object.fromEntries(
    Object.entries(node).map(([k, v]) => [k, typeof v === "string" ? v.replaceAll("{brand}", brandName).replaceAll("{studio}", studioName) : withBrand(v)]),
  );
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  // the main page's messages and, under their own namespaces (ai, case, asst, aiCommon, sites, ads), the AI pages' (messages/ai/)
  // and «Дизайн і сайти»'s (messages/sites/)
  const main = (await import(`../messages/${locale}.json`)).default;
  const ai = glueNumbers((await import(`../messages/ai/${locale}.json`)).default);
  // «Дизайн і сайти» (/dyzain-i-saity): its own namespace (sites), messages/sites/
  const sites = glueNumbers((await import(`../messages/sites/${locale}.json`)).default);
  // «Реклама й аналітика» (/reklama-i-analityka): its own namespace (ads), messages/ads/
  const ads = glueNumbers((await import(`../messages/ads/${locale}.json`)).default);
  return {
    locale,
    messages: typesetMessages(withBrand({ ...main, ...ai, ...sites, ...ads })),
  };
});
