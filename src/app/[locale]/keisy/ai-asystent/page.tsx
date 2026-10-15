import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page/PageShell";
import { AiShell } from "@/components/ai/AiShell";
import { AiFaq } from "@/components/ai/AiFaq";
import { AiContact } from "@/components/ai/AiContact";
import { MoreLink } from "@/components/ai/parts";
import { aiFacts } from "@/components/ai/facts";
import { aiHref } from "@/components/ai/links";
import { aiMetadata } from "@/components/ai/meta";
import { aiRich } from "@/components/ai/rich";
import { AsstHero } from "@/components/sections/ai-asst/AsstHero";
import { Schedule } from "@/components/sections/ai-asst/Schedule";
import { Admin } from "@/components/sections/ai-asst/Admin";
import { Fit } from "@/components/sections/ai-asst/Fit";

export async function generateMetadata({ params }: PageProps<"/[locale]/keisy/ai-asystent">) {
  const { locale } = await params;
  return aiMetadata({ locale, namespace: "asst.meta", path: "/keisy/ai-asystent", image: "/img/ai/og-assistant.jpg" });
}

/**
 * The assistant example (a beauty salon, «Приклад» everywhere; fictional data): 1 the booking chat → 2 how the time
 * is found → 3 what goes to the administrator → 4 who else it suits → 5 questions, the client case → 6 the request.
 */
export default async function AssistantPage({ params }: PageProps<"/[locale]/keisy/ai-asystent">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const facts = aiFacts(locale);
  const calc = `${aiHref(locale, "/ai-avtomatyzatsiia")}#calc`;
  const nav = [
    { href: "#schedule", text: t("asst.nav.sched") },
    { href: "#admin", text: t("asst.nav.admin") },
    { href: "#faq", text: t("aiCommon.nav.faq") },
    { href: "#contact", text: t("aiCommon.nav.lead"), bar: false },
    { href: aiHref(locale, "/ai-avtomatyzatsiia"), text: t("aiCommon.nav.ai"), bar: false },
    { href: aiHref(locale, "/"), text: t("aiCommon.nav.home"), bar: false },
  ];
  const faq = [1, 2, 3].map((n) => ({ q: t(`asst.faq.q.${n}`), a: t(`asst.faq.a.${n}`) as React.ReactNode }));
  faq.push({
    q: t("asst.faq.q.4"),
    a: (
      <>
        {t("asst.faq.a.4", facts)}{" "}
        <a className="link" href={calc}>{t("ai.price.calc")}</a>
      </>
    ),
  });
  return (
    <AiShell
      page="asst"
      nav={nav}
      footerLinks={[...nav.slice(0, 5), { href: aiHref(locale, "/"), text: "Lumera Studio" }]}
      cta={{ href: "#contact", text: t("asst.cta") }}
      claim={t("ai.foot.claim")}
    >
      <AsstHero />
      <PageShell>
        <Schedule />
        <Admin />
        <Fit />
        <AiFaq
          index={5}
          items={faq}
          after={<MoreLink href={aiHref(locale, "/keisy/poshuk-zamovlen")} label={t("ai.nav.case")}>{t.rich("asst.more.t", aiRich)}</MoreLink>}
        />
        <AiContact index={6} placeholder={t("asst.form.ph")} />
      </PageShell>
    </AiShell>
  );
}
