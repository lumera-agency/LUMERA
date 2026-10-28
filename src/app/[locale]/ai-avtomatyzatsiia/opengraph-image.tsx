import { ogImage } from "@/components/og/OgImage";

export { size, contentType, generateStaticParams } from "@/components/og/OgImage";

/** The page's share picture: its h1's title (sections/ai-page/Hero.tsx) */
export default ogImage(["ai.hero.title"]);
