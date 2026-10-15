import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page/PageShell";
import { AiShell } from "@/components/ai/AiShell";
import { AiFaq } from "@/components/ai/AiFaq";
import { AiContact } from "@/components/ai/AiContact";
import { aiFacts } from "@/components/ai/facts";
import { aiHref } from "@/components/ai/links";
import { aiMetadata } from "@/components/ai/meta";
import { aiRich } from "@/components/ai/rich";
import { Hero } from "@/components/sections/ai-page/Hero";
import { Path } from "@/components/sections/ai-page/Path";
import { Services } from "@/components/sections/ai-page/Services";
import { Examples } from "@/components/sections/ai-page/Examples";
import { Calc, calcStrings } from "@/components/sections/ai-page/Calc";

export async function generateMetadata({ params }: PageProps<"/[locale]/ai-avtomatyzatsiia">) {
  const { locale } = await params;
  return aiMetadata({ locale, namespace: "ai.meta", path: "/ai-avtomatyzatsiia", image: "/img/ai/og-ai.jpg" });
}

/**
 * «AI-автоматизація для бізнесу» — the AI section's own page (ads lead here): 1 the first screen → 2 one letter's way
 * → 3 what can be automated (cards, panels) → 4 the examples → 5 the calculator → 6 questions → 7 the request.
 */
export default async function AiAutomationPage({ params }: PageProps<"/[locale]/ai-avtomatyzatsiia">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ai");
  const c = await getTranslations("aiCommon");
  const facts = aiFacts(locale);
  const nav = [
    { href: "#how", text: t("nav.how") },
    { href: "#services", text: t("nav.services") },
    { href: "#examples", text: t("nav.examples") },
    { href: "#calc", text: t("nav.calc") },
    { href: "#faq", text: c("nav.faq") },
    { href: "#contact", text: c("nav.lead"), bar: false },
    { href: aiHref(locale, "/"), text: c("nav.home"), bar: false },
  ];
  const faq = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ q: t(`faq.q.${n}`), a: t.rich(`faq.a.${n}`, { ...aiRich, ...facts }) }));
  return (
    <AiShell
      page="ai"
      nav={nav}
      footerLinks={[...nav.slice(0, 5), { href: aiHref(locale, "/"), text: "Lumera Studio" }]}
      cta={{ href: "#contact", text: c("cta.auto") }}
      barCta={{ href: "#contact", text: t("topbar.cta") }}
      claim={t("foot.claim")}
      strings={await calcStrings()}
    >
      <Hero />
      <PageShell>
        <Path />
        <Services facts={facts} />
        <Examples />
        <Calc facts={facts} />
        <AiFaq index={6} items={faq} intro={t.rich("faq.intro", aiRich)} />
        <AiContact
          index={7}
          placeholder={t("form.ph")}
          picks={{ label: t("form.chips.label"), items: [1, 2, 3, 4, 5].map((n) => t(`form.chip.${n}`)) }}
          plan={{ label: t("calc.att.text"), clear: t("calc.att.x") }}
        />
      </PageShell>
    </AiShell>
  );
}
