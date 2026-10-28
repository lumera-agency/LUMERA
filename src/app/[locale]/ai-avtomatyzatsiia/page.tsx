import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { studioName } from "@/config/site";
import { PageShell } from "@/components/layout/page/PageShell";
import { AiShell } from "@/components/ai/AiShell";
import { AiFaq } from "@/components/ai/AiFaq";
import { AiContact } from "@/components/ai/AiContact";
import { aiFacts } from "@/components/ai/facts";
import { aiHref } from "@/components/ai/links";
import { aiMetadata } from "@/components/ai/meta";
import { aiRich } from "@/components/ai/rich";
import { Hero } from "@/components/sections/ai-page/Hero";
import { Proof } from "@/components/sections/ai-page/Proof";
import { Pause } from "@/components/sections/ai-page/Pause";
import { Niches } from "@/components/sections/ai-page/Niches";
import { Path } from "@/components/sections/ai-page/Path";
import { Offer } from "@/components/sections/ai-page/Offer";
import { Terms } from "@/components/sections/ai-page/Terms";
import { Calc } from "@/components/sections/ai-page/Calc";
import { NotIncluded } from "@/components/sections/ai-page/NotIncluded";
import { AUDIT, PRODUCTS, daysText, usd, weeksText } from "@/components/sections/ai-page/prices";
import "@/components/sections/ai-page/ai-page.css";

export async function generateMetadata({ params }: PageProps<"/[locale]/ai-avtomatyzatsiia">) {
  const { locale } = await params;
  return aiMetadata({ locale, namespace: "ai.meta", path: "/ai-avtomatyzatsiia", image: "/img/ai/og-ai.jpg" });
}

/**
 * «AI-автоматизація для бізнесу» — the AI section's own page (paid traffic leads here; the owner's rework, 21 Oct 2026:
 * the result first, the proof before the explanation, open prices): 1 the first screen → 2 the case (with «Як зараз /
 * Як буде») → a pause → 3 the niches → 4 one letter's way → 5 the lineup → 6 the terms → 7 the price calculator → 8 what
 * is not included → 9 questions → 10 the request. The section numbers are counted here, so a block can be added
 * (phase 2: the losses calculator after the lineup) without renumbering by hand.
 */
export default async function AiAutomationPage({ params }: PageProps<"/[locale]/ai-avtomatyzatsiia">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ai");
  const c = await getTranslations("aiCommon");
  const lang = (await getLocale()) === "ru" ? "ru" : "uk";
  const facts = aiFacts(locale);
  const nav = [
    { href: "#case", text: t("nav.case") },
    { href: "#how", text: t("nav.how") },
    { href: "#offer", text: t("nav.offer") },
    { href: "#calc", text: t("nav.calc") },
    { href: "#faq", text: c("nav.faq") },
    { href: "#contact", text: c("nav.lead"), bar: false },
    { href: aiHref(locale, "/"), text: c("nav.home"), bar: false },
  ];
  // the questions' numbers: the lineup's (offer.ts) and the landing's (the engine's, in facts)
  const w = (p: [number, number] | null) => (p ? weeksText(p, lang) : "");
  const faqArgs = {
    ...aiRich,
    ...facts,
    terms: (chunks: React.ReactNode) => <a className="link" href="#terms">{chunks}</a>,
    monthly: usd(PRODUCTS.assistant.monthly ?? 0),
    w12: w(PRODUCTS.sources.weeks),
    w23: w(PRODUCTS.search.weeks),
    auditDays: daysText(AUDIT.days, lang),
  };
  const faq = [1, 2, 3, 4, 5, 6, 7].map((n) => ({ q: t(`faq.q.${n}`), a: t.rich(`faq.a.${n}`, faqArgs) }));
  let n = 1;
  const next = () => ++n;
  return (
    <AiShell
      page="ai"
      nav={nav}
      footerLinks={[...nav.slice(0, 5), { href: aiHref(locale, "/"), text: studioName }]}
      cta={{ href: "#contact", text: c("cta.auto") }}
      barCta={{ href: "#contact", text: t("topbar.cta") }}
      claim={t("foot.claim")}
    >
      <Hero />
      <PageShell>
        <Proof index={next()} />
        <Pause />
        <Niches index={next()} />
        <Path index={next()} />
        <Offer index={next()} />
        <Terms index={next()} />
        <Calc index={next()} />
        <NotIncluded index={next()} />
        <AiFaq index={next()} items={faq} intro={t.rich("faq.intro", aiRich)} />
        <AiContact
          index={next()}
          placeholder={t("form.ph")}
          picks={{ label: t("form.chips.label"), items: [1, 2, 3, 4, 5].map((i) => t(`form.chip.${i}`)) }}
          plan={{ label: t("calc.att.text"), clear: t("calc.att.x") }}
        />
      </PageShell>
    </AiShell>
  );
}
