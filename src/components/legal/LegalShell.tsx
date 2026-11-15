import { preload } from "react-dom";
import { getLocale, getTranslations } from "next-intl/server";
import type { NavCta, NavLink } from "@/content/nav";
import { SmoothScroll } from "@/components/fx/smooth-scroll/SmoothScroll";
import { Topbar } from "@/components/layout/topbar/Topbar";
import { MenuSheet } from "@/components/layout/menu/MenuSheet";
import { Footer } from "@/components/layout/footer/Footer";
import { BackToTop } from "@/components/fx/back-to-top/BackToTop";
import { aiHref } from "@/components/ai/links";
import { Backdrop, type Ground } from "./backdrop/Backdrop";
// the main page's header styles, the inner pages' kit (the first screen, the crumbs, the chips), then this page's own
import "@/components/layout/header/header.css";
import "@/components/ai/ai.css";
import "@/components/ai/ai-own.css";
import "./legal.css";

type Props = {
  /** the topbar's and the phone menu's rows */
  nav: readonly NavLink[];
  /** the footer's index */
  footerLinks: readonly NavLink[];
  /** the request: the main page's form */
  cta: NavCta;
  /** the moving ground: «Сяйво» (the policy) or «Зорі» (the contacts) */
  ground?: Ground;
  /** the page's own class on <main>, beside the shared ones */
  page?: string;
  children: React.ReactNode;
};

/** The faces the first screen is set in: fetched with the page, so the words never re-wrap once the font comes in */
const FIRST_SCREEN_FONTS = ["geologica-cyrillic", "geologica-latin", "ibm-plex-mono-400-cyrillic"];

/**
 * A page of the studio (the privacy policy, the contacts) over one moving ground, in the main page's frame, as the AI, sites and ads pages are: the smooth
 * scroll, the topbar (on from the start: the first screen has no header of its own), the phone menu, the footer with
 * the chrome wordmark, the button back up. A page to read: no scenes, no runtime of its own, no sticky request bar.
 */
export async function LegalShell({ nav, footerLinks, cta, ground, page, children }: Props) {
  for (const font of FIRST_SCREEN_FONTS) preload(`/fonts/${font}.woff2`, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  const t = await getTranslations();
  // the logo leads to the main page in the page's language (/, /ru)
  const home = aiHref(await getLocale(), "/");
  return (
    <>
      <SmoothScroll />
      {/* one moving ground under the whole page, the blocks over it glass (backdrop/Backdrop.tsx) */}
      <Backdrop ground={ground} />
      <Topbar always links={nav} cta={cta} home={home} />
      <main id="main" className={page ? `ai lg ${page}` : "ai lg"} data-ai-page="legal">
        {children}
      </main>
      <Footer links={footerLinks} cta={cta} />
      <MenuSheet links={nav} cta={cta} home={home} />
      <BackToTop label={t("footer.up.span")} />
    </>
  );
}
