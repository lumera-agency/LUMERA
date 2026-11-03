import { preload } from "react-dom";
import { getLocale, getTranslations } from "next-intl/server";
import type { NavCta, NavLink } from "@/content/nav";
import { SmoothScroll } from "@/components/fx/smooth-scroll/SmoothScroll";
import { Topbar } from "@/components/layout/topbar/Topbar";
import { MenuSheet } from "@/components/layout/menu/MenuSheet";
import { Footer } from "@/components/layout/footer/Footer";
import { BackToTop } from "@/components/fx/back-to-top/BackToTop";
import { ArrowIcon } from "@/components/ui/icons/ArrowIcon";
import { AiRuntime } from "./AiRuntime";
import { aiHref } from "./links";
import { AiSprite } from "./parts";
// the topbar's links and UA · RU are styled with the main page's header (its first screen); ai.css goes last
import "@/components/layout/header/header.css";
import "./ai.css";

type Props = {
  /** which page (CSS scope): ai, case, asst */
  page: "ai" | "case" | "asst";
  /** the topbar's and the phone menu's rows */
  nav: readonly NavLink[];
  /** the footer's big links (the main page's footer) */
  footerLinks: readonly NavLink[];
  /** the request button everywhere (menu, footer, the phones' sticky bar) */
  cta: NavCta;
  /** the topbar's, when it needs a shorter word */
  barCta?: NavCta;
  claim: React.ReactNode;
  /** the words the calculator writes (runtime/ai-runtime.js) */
  strings?: Record<string, string>;
  children: React.ReactNode;
};

/**
 * An AI page in the main page's frame: its smooth scroll, topbar (on from the start: the first screen has no header of
 * its own), phone menu, footer with the chrome wordmark and the button back up; the page's own behaviour on top
 * (AiRuntime). On phones the request button stays at hand once the first screen has passed (.ai-sticky).
 */
/** Where the button back up steps aside, as on the main page (the owner, 30 Oct 2026): the footer, plus the two places
 *  that send a request, where a stray tap must never take the page away */
const TO_TOP_QUIET = ".footer, .ai-calc__send, .lead-form";
/** The faces the first screen is set in: fetched with the page, so the words never re-wrap once the font comes in
 *  (the main page hides that moment under its preloader; these pages have none) */
const FIRST_SCREEN_FONTS = ["geologica-cyrillic", "geologica-latin", "ibm-plex-mono-400-cyrillic"];

export async function AiShell({ page, nav, footerLinks, cta, barCta, claim, strings = {}, children }: Props) {
  for (const font of FIRST_SCREEN_FONTS) preload(`/fonts/${font}.woff2`, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  const t = await getTranslations();
  // the logo leads to the main page in the page's language (/, /ru): the way back to the studio
  const home = aiHref(await getLocale(), "/");
  return (
    <>
      <AiSprite />
      <SmoothScroll />
      <Topbar always links={nav} cta={barCta ?? cta} home={home} />
      <main id="main" className="ai" data-ai-page={page}>
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
      {/* the main page's button; on phones the request bar leaves it room (ai.css) */}
      <BackToTop label={t("footer.up.span")} quiet={TO_TOP_QUIET} />
      <AiRuntime strings={strings} />
    </>
  );
}
