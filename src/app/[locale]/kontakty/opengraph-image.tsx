import { ogImage } from "@/components/og/OgImage";

export { size, contentType, generateStaticParams } from "@/components/og/OgImage";

/** The page's share picture: its h1's title (components/contacts/Kontakty.tsx) */
export default ogImage(["kontakty.hero.title"]);
