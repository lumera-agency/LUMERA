import { preload } from "react-dom";
import { getLocale, getTranslations } from "next-intl/server";
import type { NavCta, NavLink } from "@/content/nav";
import { SmoothScroll } from "@/components/fx/smooth-scroll/SmoothScroll";
import { Topbar } from "@/components/layout/topbar/Topbar";
import { MenuSheet } from "@/components/layout/menu/MenuSheet";
import { Footer } from "@/components/layout/footer/Footer";
import { BackToTop } from "@/components/fx/back-to-top/BackToTop";
import { ArrowIcon } from "@/components/ui/icons/ArrowIcon";
import { AiSprite } from "@/components/ai/parts";
import { aiHref } from "@/components/ai/links";
import { AboutRuntime } from "./AboutRuntime";
// the main page's header styles, the AI pages' kit (sections, the sticky bar), then this page's own
import "@/components/layout/header/header.css";
import "@/components/ai/ai.css";
import "./about.css";

type Props = {
  nav: readonly NavLink[];
  footerLinks: readonly NavLink[];
  /** the request button everywhere (menu, footer, the phones' sticky bar): the main page's form */
  cta: NavCta;
  /** the topbar's, a shorter word */
  barCta: NavCta;
  children: React.ReactNode;
};

/** Where the button back up steps aside: the contacts and the footer (as on the ads page) */
const TO_TOP_QUIET = ["#contacts", ".footer"].join(", ");

/** The faces the first screen is set in: fetched with the page, so the words never re-wrap once the font comes in */
const FIRST_SCREEN_FONTS = ["geologica-cyrillic", "geologica-latin", "ibm-plex-mono-400-cyrillic"];

/**
 * «Про нас» in the main page's frame, as the sibling pages are (AdsShell): the smooth scroll, the topbar (on from the
 * start), the phone menu, the footer with the chrome LUMERA, the button back up. The page has no form of its own: every
 * request button leads to the main page's (/#contact). On phones the request button stays at hand once the first screen
 * has passed (.ai-sticky), hidden again at the contacts.
 */
export async function AboutShell({ nav, footerLinks, cta, barCta, children }: Props) {
  for (const font of FIRST_SCREEN_FONTS) preload(`/fonts/${font}.woff2`, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  const t = await getTranslations();
  const home = aiHref(await getLocale(), "/");
  return (
    <>
      <AiSprite />
      <SmoothScroll lerp={0.08} />
      <Topbar always links={nav} cta={barCta} home={home} />
      <main id="main" className="ai about" data-ai-page="about">
        {children}
      </main>
      <div className="ai-sticky" data-sticky="" aria-hidden="true">
        <a className="btn btn--primary btn--sm" href={cta.href} tabIndex={-1}>
          <span className="btn__label">{cta.text}</span>
          <ArrowIcon />
        </a>
      </div>
      <Footer links={footerLinks} cta={cta} />
      <MenuSheet links={nav} cta={cta} home={home} />
      <BackToTop label={t("footer.up.span")} quiet={TO_TOP_QUIET} />
      <AboutRuntime />
    </>
  );
}
