/** The page's blocks in the navigation: the anchor and the label's message key; `bar: false` stays out of the topbar's row. */
export const PAGE_NAV = [
  { href: "#services", label: "nav.services" },
  { href: "#why", label: "nav.why" },
  { href: "#approach", label: "nav.approach" },
  { href: "#pricing", label: "nav.pricing" },
  { href: "#faq", label: "nav.faq" },
  { href: "#contact", label: "nav.contact", bar: false },
] as const;
