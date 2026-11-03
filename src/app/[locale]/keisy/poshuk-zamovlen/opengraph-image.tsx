import { ogImage } from "@/components/og/OgImage";

export { size, contentType, generateStaticParams } from "@/components/og/OgImage";

/** The page's share picture: its h1's title (sections/ai-case/CaseHero.tsx) */
export default ogImage(["case.hero.title"]);
