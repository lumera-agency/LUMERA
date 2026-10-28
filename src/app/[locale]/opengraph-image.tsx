import { ogImage } from "@/components/og/OgImage";

export { size, contentType, generateStaticParams } from "@/components/og/OgImage";

/** The page's share picture: its h1's title (sections/hero/Hero.tsx) */
export default ogImage(["hero.title.1", "hero.title.2", "hero.title.3"]);
