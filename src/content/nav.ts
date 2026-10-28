/** The page's blocks in the navigation: the anchor and the label's message key; `bar: false` stays out of the topbar's row. */
export const PAGE_NAV = [
  { href: "#services", label: "nav.services" },
  { href: "#why", label: "nav.why" },
  { href: "#approach", label: "nav.approach" },
  { href: "#pricing", label: "nav.pricing" },
  { href: "#faq", label: "nav.faq" },
  { href: "#contact", label: "nav.contact", bar: false },
] as const;

/** Another page's navigation (the AI pages), as ready text: the topbar, the phone menu and the footer take it instead
 *  of PAGE_NAV. `bar: false` stays out of the topbar's row; a link without "#" opens another page. */
export type NavLink = { href: string; text: string; bar?: boolean };
export type NavCta = { href: string; text: string };

/** The site's own pages in the header, the topbar's panel and the phone menu. `about`: «Про нас» (/pro-nas), shown as the
 *  owner's variant A has it (28 Oct); its page comes with the about-page merge. */
export const SITE_NAV = { about: true } as const;
