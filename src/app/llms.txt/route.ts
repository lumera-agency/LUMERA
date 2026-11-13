import { getTranslations } from "next-intl/server";
import { locales, studioName } from "@/config/site";
import { CONTACTS, phoneText, realPhones } from "@/config/contacts";
import { money } from "@/components/sections/pricing/configurator/engine.js";
import { pageUrl } from "@/components/seo/graph";
import { plainText } from "@/components/seo/plain-text";
import { services, type Price } from "@/components/seo/services";

/**
 * /llms.txt (llmstxt.org): the studio in short for AI assistants. What it is, the services with their pages and
 * prices, the clients' cases, where the questions are, the contacts; Ukrainian, then Russian. Made once, at build,
 * from the messages and prices the pages show (components/seo/services), so it never says anything else.
 */
export const dynamic = "force-static";

/** The clients' cases, as the header's menu has them (content/site-nav): the ads cases' tabs, the AI cases' pages */
const CASES = [
  { key: "ac", path: "/reklama-i-analityka", hash: "#case-ac" },
  { key: "pest", path: "/reklama-i-analityka", hash: "#case-pest" },
  { key: "volter", path: "/reklama-i-analityka", hash: "#case-volter" },
  { key: "poshuk", path: "/keisy/poshuk-zamovlen" },
  { key: "asst", path: "/keisy/ai-asystent" },
];

async function part(locale: string) {
  const t = await getTranslations({ locale });
  const list = await services(locale);
  const at = (path: string, hash = "") => `${pageUrl(locale, path)}${hash}`;
  /** «Лендінг від $500», «Ведення реклами $150 на місяць (Можна додати …)», «AI-асистент $450 (+ $90/міс супровід, …)» */
  const price = (p: Price) =>
    [p.name, p.from ? t("start.from") : "", String(money(p.sum)), p.perMonth ? t("ads.price.month") : "", p.note ? `(${p.note.replace(/\.$/, "")})` : ""]
      .filter(Boolean)
      .join(" ");
  const item = (name: string, url: string, note = "") => `- [${plainText(name)}](${url})${note ? `: ${plainText(note)}` : ""}`;
  const sections: [string, string[]][] = [
    [t("nav.services"), list.map((s) => item(s.name, at(s.path), [s.desc, s.prices.map(price).join("; ")].join(" ")))],
    [t("nav.casesMore"), CASES.map((c) => item(t(`nav.caseTitle.${c.key}`), at(c.path, c.hash)))],
    [t("nav.faq"), [item(studioName, at("/", "#faq")), ...list.map((s) => item(s.name, at(s.path, "#faq")))]],
    [
      t("footer.map.contacts"),
      [`- [${CONTACTS.email}](mailto:${CONTACTS.email})`, ...realPhones().map((n) => `- [${phoneText(n)}](tel:${n})`), item(t("nav.contact"), at("/", "#contact"))],
    ],
  ];
  return { summary: plainText(t("meta.org")), sections: sections.map(([title, lines]) => `## ${plainText(title)}\n\n${lines.join("\n")}`) };
}

export async function GET() {
  const [first, ...rest] = await Promise.all(locales.map(part));
  const text = [`# ${studioName}`, `> ${first.summary}`, ...rest.map((p) => p.summary), ...[first, ...rest].flatMap((p) => p.sections)].join("\n\n");
  return new Response(`${text}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
