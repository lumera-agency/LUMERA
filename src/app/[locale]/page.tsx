import { setRequestLocale } from "next-intl/server";
import { SmoothScroll } from "@/components/fx/smooth-scroll/SmoothScroll";
import { Hero } from "@/components/sections/hero/Hero";
import { Topbar } from "@/components/layout/topbar/Topbar";
import { PageShell } from "@/components/layout/page/PageShell";
import { What } from "@/components/sections/what/What";
import { Services } from "@/components/sections/services/Services";
import { Footer } from "@/components/layout/footer/Footer";

/** The page: the blocks in reading order. Each block is one component in components/sections/. */
export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <SmoothScroll />
      <main>
        <Hero />
        <Topbar />
        <PageShell>
          <What />
          <Services />
        </PageShell>
      </main>
      <Footer />
    </>
  );
}
