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
import { AdsRuntime } from "./AdsRuntime";
// the main page's header styles, the AI pages' kit (sections, mock windows, the sticky bar, the quick picks),
// then this page's own
import "@/components/layout/header/header.css";
import "@/components/ai/ai.css";
import "./ads.css";

type Props = {
  nav: readonly NavLink[];
  footerLinks: readonly NavLink[];
  /** the request button everywhere (menu, footer, the phones' sticky bar) */
  cta: NavCta;
  /** the topbar's, a shorter word */
  barCta: NavCta;
  claim: React.ReactNode;
  children: React.ReactNode;
};

/** Where the button back up steps aside: only the request block and the footer (the owner, 22 Oct: with every row
 *  and button of the page on the list it blinked on and off as they passed its corner; on phones it stands above the
 *  sticky request bar, ads.css, so the bar no longer hides it) */
const TO_TOP_QUIET = ["#contact", ".footer"].join(", ");

/** The faces the first screen is set in: fetched with the page, so the words never re-wrap once the font comes in */
const FIRST_SCREEN_FONTS = ["geologica-cyrillic", "geologica-latin", "ibm-plex-mono-400-cyrillic"];

/**
 * «Реклама й аналітика» in the main page's frame, as the AI pages and «Дизайн і сайти» are: the smooth scroll, the
 * topbar (on from the start), the phone menu, the footer with the chrome wordmark, the button back up. The page's own
 * behaviour (the scenes, the reveals, the quick picks) runs on top (AdsRuntime). On phones the request button stays at
 * hand once the first screen has passed (.ai-sticky), hidden again at the form.
 */
export async function AdsShell({ nav, footerLinks, cta, barCta, claim, children }: Props) {
  for (const font of FIRST_SCREEN_FONTS) preload(`/fonts/${font}.woff2`, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  const t = await getTranslations();
  const home = aiHref(await getLocale(), "/");
  return (
    <>
      <AiSprite />
      {/* a slower glide than the default 0.095: the owner asked for smoother motion (20 Oct) */}
      <SmoothScroll lerp={0.08} />
      <Topbar always links={nav} cta={barCta} home={home} />
      <main id="main" className="ai ad" data-ai-page="ads">
        {children}
      </main>
      {/* phones: the request is one tap away once the first screen has passed (hidden again at the form) */}
      <div className="ai-sticky" data-sticky="" aria-hidden="true">
        <a className="btn btn--primary btn--sm" href={cta.href} tabIndex={-1}>
          <span className="btn__label">{cta.text}</span>
          <ArrowIcon />
        </a>
      </div>
      <Footer claim={claim} links={footerLinks} cta={cta} />
      <MenuSheet links={nav} cta={cta} home={home} />
      <BackToTop label={t("footer.up.span")} quiet={TO_TOP_QUIET} />
      <AdsRuntime />
    </>
  );
}
