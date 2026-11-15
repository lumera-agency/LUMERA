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
import { RobotHero } from "@/components/sections/ai-page/RobotHero";
import { WhatIsAutomation } from "@/components/sections/ai-page/WhatIsAutomation";
import { Proof } from "@/components/sections/ai-page/Proof";
import { Pause } from "@/components/sections/ai-page/Pause";
import { Niches } from "@/components/sections/ai-page/Niches";
import { Offer } from "@/components/sections/ai-page/Offer";
import { AUDIT, PRODUCTS, daysText, usd, weeksText } from "@/components/sections/ai-page/prices";
import { PageJsonLd } from "@/components/seo/graph";
import "@/components/sections/ai-page/ai-page.css";

export async function generateMetadata({ params }: PageProps<"/[locale]/ai-avtomatyzatsiia">) {
  const { locale } = await params;
  return aiMetadata({ locale, namespace: "ai.meta", path: "/ai-avtomatyzatsiia" });
}

/**
 * «AI-автоматизація для бізнесу» — the AI section's own page (paid traffic leads here; the owner's rework, 21 Oct 2026:
 * open prices; his order of 5 Nov 2026: what it is first, then for whom, the proof, the offer): 1 the first screen's
 * question → 2 what AI automation is and what the robot does (its console, one letter's way) → 3 the niches, what it
 * takes over (the niches, the lineup's words, set as the main page's services) → 4 the case (with «Як зараз / Як
 * буде») → a pause → 5 the prices: the lineup as a calculator → 6 questions → 7 the request, with what comes with the
 * work and what is not done (the terms, as the main page's request has them; 5 Nov 2026). The section numbers are counted here, so a block can be added
 * (phase 2: the losses calculator after the lineup) without renumbering by hand.
 */
export default async function AiAutomationPage({ params }: PageProps<"/[locale]/ai-avtomatyzatsiia">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ai");
  const c = await getTranslations("aiCommon");
  const root = await getTranslations();
  const lang = (await getLocale()) === "ru" ? "ru" : "uk";
  const facts = aiFacts(locale);
  const nav = [
    { href: "#how", text: t("nav.how") },
    { href: "#case", text: t("nav.case") },
    { href: "#offer", text: t("nav.offer") },
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
      footerLinks={[...nav.slice(0, 4), { href: aiHref(locale, "/"), text: studioName }]}
      cta={{ href: "#contact", text: c("cta.auto") }}
      barCta={{ href: "#contact", text: t("topbar.cta") }}
      claim={t("foot.claim")}
    >
      <RobotHero />
      <PageShell skip="#how, #niches, #case, .ai-pause, #offer, #faq, #contact">
        <WhatIsAutomation index={next()} />
        <Niches index={next()} />
        <Proof index={next()} />
        <Pause />
        <Offer index={next()} />
        <AiFaq index={next()} items={faq} intro={t("faq.intro")} write={c("footer.write")} />
        <AiContact
          index={next()}
          title={t.rich("form.title", aiRich)}
          text={t("form.text")}
          placeholder={t("form.ph")}
          picks={{ label: t("form.chips.label"), items: [1, 2, 3, 4, 5].map((i) => t(`form.chip.${i}`)) }}
          plan={{ label: t("calc.att.text"), clear: t("calc.att.x") }}
          get={{ title: root("contact.get.title"), items: [1, 2, 3, 4].map((i) => t(`terms.get.${i}`)) }}
          out={{ title: t("out.title"), items: [1, 2, 3, 4].map((i) => t(`out.${i}`)) }}
        />
      </PageShell>
      <PageJsonLd locale={locale} path="/ai-avtomatyzatsiia" meta="ai.meta" service="ai" faq={faq} />
    </AiShell>
  );
}
