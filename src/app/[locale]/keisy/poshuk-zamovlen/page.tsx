import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page/PageShell";
import { AiShell } from "@/components/ai/AiShell";
import { AiFaq } from "@/components/ai/AiFaq";
import { AiContact } from "@/components/ai/AiContact";
import { MoreLink } from "@/components/ai/parts";
import { aiHref } from "@/components/ai/links";
import { aiMetadata } from "@/components/ai/meta";
import { aiRich } from "@/components/ai/rich";
import { CaseHero } from "@/components/sections/ai-case/CaseHero";
import { About } from "@/components/sections/ai-case/About";
import { Result } from "@/components/sections/ai-case/Result";
import { Bento } from "@/components/sections/ai-case/Bento";
import { Decide } from "@/components/sections/ai-case/Decide";
import { Manager } from "@/components/sections/ai-case/Manager";
import { Fit } from "@/components/sections/ai-case/Fit";

export async function generateMetadata({ params }: PageProps<"/[locale]/keisy/poshuk-zamovlen">) {
  const { locale } = await params;
  return aiMetadata({ locale, namespace: "case.meta", path: "/keisy/poshuk-zamovlen", image: "/img/ai/og-case.jpg" });
}

/**
 * The client case «Пошук замовлень»: 1 the first screen with the film → 2 about the case → 3 the morning before and
 * after → 4 how the robot picks orders (bento) → 5 how it decides → 6 what the manager gets → 7 who else it suits →
 * 8 questions, the salon example → 9 the request. Only the confirmed facts (CLAUDE.md «Confirmed case facts»).
 */
export default async function CasePage({ params }: PageProps<"/[locale]/keisy/poshuk-zamovlen">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const ai = aiHref(locale, "/ai-avtomatyzatsiia");
  const nav = [
    { href: "#how", text: t("aiCommon.nav.how") },
    { href: "#manager", text: t("aiCommon.nav.example") },
    { href: "#faq", text: t("aiCommon.nav.faq") },
    { href: "#contact", text: t("aiCommon.nav.lead"), bar: false },
    { href: ai, text: t("aiCommon.nav.ai"), bar: false },
    { href: aiHref(locale, "/"), text: t("aiCommon.nav.home"), bar: false },
  ];
  const faq = [1, 2, 3, 4].map((n) => ({ q: t(`case.faq.q.${n}`), a: t(`case.faq.a.${n}`) }));
  return (
    <AiShell
      page="case"
      nav={nav}
      footerLinks={[...nav.slice(0, 5), { href: aiHref(locale, "/"), text: "Lumera Studio" }]}
      cta={{ href: "#contact", text: t("aiCommon.cta.want") }}
      // the topbar's own short word (as on the AI page and the main page): the long one pushed the menu button off
      // phones up to 375 px wide
      barCta={{ href: "#contact", text: t("ai.topbar.cta") }}
      claim={t("ai.foot.claim")}
    >
      <CaseHero />
      <PageShell>
        <About />
        <Result />
        <Bento />
        <Decide />
        <Manager />
        <Fit />
        <AiFaq
          index={8}
          items={faq}
          after={<MoreLink href={aiHref(locale, "/keisy/ai-asystent")} label={t("case.more.k")}>{t.rich("case.more.t", aiRich)}</MoreLink>}
        />
        <AiContact index={9} placeholder={t("aiCommon.form.manual.ph")} />
      </PageShell>
    </AiShell>
  );
}
