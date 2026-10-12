import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/hero/Hero";

/** The page: the blocks in reading order. Each block is one component in components/sections/. */
export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main>
      <Hero />
    </main>
  );
}
