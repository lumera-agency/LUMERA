import { getPathname } from "@/i18n/navigation";

/** An AI page's address in the page's language: /keisy/ai-asystent, /ru/keisy/ai-asystent. */
export const aiHref = (locale: string, path: string) => getPathname({ href: path, locale });
