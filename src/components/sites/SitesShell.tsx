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
import { SitesRuntime } from "./SitesRuntime";
// the main page's header styles, the AI pages' blocks (this page is built from the same kit), then this page's own
import "@/components/layout/header/header.css";
import "@/components/ai/ai.css";
import "./sites-pv.css";
import "./clinic/clinic.css";
import "./shop/shop.css";
import "./sites.css";
import "./sites-next.css";
import "./sites-hero.css";

type Props = {
  nav: readonly NavLink[];
  footerLinks: readonly NavLink[];
  /** the request button everywhere (menu, footer, the phones' sticky bar) */
  cta: NavCta;
  /** the topbar's, a shorter word */
  barCta: NavCta;
  claim: React.ReactNode;
  /** the words the page's script writes (runtime/sites-runtime.js), the page's language */
  strings: Record<string, string>;
  children: React.ReactNode;
};

/** Where the button back up steps aside (anything matching that overlaps it): see BackToTop below. */
const TO_TOP_QUIET = [
  ".footer",
  ".ai-sticky.is-on",
  ".st-sumbar.is-on",
  "#faq",
  "#contact",
  ".st-rail",
  ".st-stage__acts",
  ".st-fmts__end",
  ".st-sum",
  ".ai-calc__send",
  ".st-bd__rib",
  ".st-hw-end__acts",
  ".st-show__replay",
  "[data-quiet]",
].join(", ");

/** The faces the first screen is set in: fetched with the page, so the words never re-wrap once the font comes in */
const FIRST_SCREEN_FONTS = ["geologica-cyrillic", "geologica-latin", "ibm-plex-mono-400-cyrillic"];

/**
 * «Дизайн і сайти» in the main page's frame, as the AI pages are: the smooth scroll, the topbar (on from the start), the
 * phone menu, the footer with the chrome wordmark, the button back up. The page's own behaviour (the scenes, the formats,
 * the live sample sites, the calculator, block 4's board) runs on top (SitesRuntime). On phones the request button
 * stays at hand once the first screen has passed (.ai-sticky); in block 3 the sum bar takes its place (.st-sumbar).
 */
export async function SitesShell({ nav, footerLinks, cta, barCta, claim, strings, children }: Props) {
  for (const font of FIRST_SCREEN_FONTS) preload(`/fonts/${font}.woff2`, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  const t = await getTranslations();
  const s = await getTranslations("sites");
  const home = aiHref(await getLocale(), "/");
  return (
    <>
      <AiSprite />
      <SmoothScroll />
      <Topbar always links={nav} cta={barCta} home={home} />
      <main id="main" className="ai st" data-ai-page="sites">
        {children}
      </main>
      {/* narrow screens: while block 3 is on screen and its sum card is not, the sum stays at hand */}
      <a className="st-sumbar" href="#design-sum" data-sumbar="" aria-hidden="true" tabIndex={-1}>
        <span className="st-sumbar__l">
          <span className="st-sumbar__k">{s("calc.k")}</span>
          <span className="st-sumbar__v"><b data-sumbar-price="">$500</b> <span data-sumbar-weeks="">≈&nbsp;1–2 тижні</span></span>
        </span>
        <span className="st-sumbar__go">
          <span>{s("sumbar.go")}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg>
        </span>
      </a>
      {/* phones: the request is one tap away once the first screen has passed (hidden again in block 3 and at the form) */}
      <div className="ai-sticky" data-sticky="" aria-hidden="true">
        <a className="btn btn--primary btn--sm" href={cta.href} tabIndex={-1}>
          <span className="btn__label">{cta.text}</span>
          <ArrowIcon />
        </a>
      </div>
      <Footer claim={claim} links={footerLinks} cta={cta} />
      <MenuSheet links={nav} cta={cta} home={home} />
      {/* it steps aside wherever the page has controls in its corner (QA 19 Oct, S-02: it sat on the questions' pluses, the
          fields' right edge, «Надіслати заявку», the cards' «Обговорити»): the footer, the bars, the questions, the form,
          block 2's tabs and card buttons, the price card, block 4's ribbon and end, the sample's «Ще раз»; on narrow screens
          all of block 3 (its controls run edge to edge: data-quiet, the runtime's initToTop) */}
      <BackToTop label={t("footer.up.span")} quiet={TO_TOP_QUIET} />
      <SitesRuntime strings={strings} />
    </>
  );
}
