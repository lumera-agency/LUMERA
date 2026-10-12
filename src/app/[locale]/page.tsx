import { getTranslations, setRequestLocale } from "next-intl/server";
import { SmoothScroll } from "@/components/fx/smooth-scroll/SmoothScroll";
import { Topbar } from "@/components/layout/topbar/Topbar";
import { MenuSheet } from "@/components/layout/menu/MenuSheet";
import { PageShell } from "@/components/layout/page/PageShell";
import { Footer } from "@/components/layout/footer/Footer";
import { BackToTop } from "@/components/fx/back-to-top/BackToTop";
import { Hero } from "@/components/sections/hero/Hero";
import { What } from "@/components/sections/what/What";
import { Services } from "@/components/sections/services/Services";
import { Manifesto } from "@/components/sections/manifesto/Manifesto";
import { Why } from "@/components/sections/why/Why";
import { Approach } from "@/components/sections/approach/Approach";
import { Pricing } from "@/components/sections/pricing/Pricing";
import { Faq } from "@/components/sections/faq/Faq";
import { Contact } from "@/components/sections/contact/Contact";

/**
 * The page: the blocks in reading order (v2): 1 the first screen → 2 what we do → 3 the services →
 * the manifesto → 4 why Lumera → 5 the approach → 6 prices → 7 questions → 8 the request.
 * Each block is one component in components/sections/.
 */
export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <>
      <SmoothScroll />
      <main>
        <Hero />
        <Topbar />
        <PageShell>
          <What />
          <Services />
          <Manifesto />
          <Why />
          <Approach />
          <Pricing />
          <Faq />
          <Contact />
        </PageShell>
      </main>
      <Footer />
      <MenuSheet />
      {/* steps aside over the ride's HUD and arrows, the configurator's preview and bars, and the footer (it has its own link up) */}
      <BackToTop label={t("footer.up.span")} quiet=".ride.is-on .ride__hud, .ride.is-on .ride__arrow, .cfg-bar, .cfg-sheet, .pvw, .w5-hs, .footer" />
    </>
  );
}
