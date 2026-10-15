import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { typesetMessages } from "@/lib/typeset";
import { glueNumbers } from "@/components/ai/typeset";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  // the main page's messages and, under their own namespaces (ai, case, asst, aiCommon), the AI pages' (messages/ai/)
  const main = (await import(`../messages/${locale}.json`)).default;
  const ai = glueNumbers((await import(`../messages/ai/${locale}.json`)).default);
  return {
    locale,
    messages: typesetMessages({ ...main, ...ai }),
  };
});
