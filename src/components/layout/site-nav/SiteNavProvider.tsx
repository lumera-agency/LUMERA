"use client";
import { createContext, useContext } from "react";
import type { SiteNavData } from "@/content/site-nav";

const SiteNav = createContext<SiteNavData | null>(null);

/** The header's, the topbar's and the phone menu's data (content/site-nav), handed down from the layout: the hero
 *  renders the header without props, so it reads them here. */
export function SiteNavProvider({ value, children }: { value: SiteNavData; children: React.ReactNode }) {
  return <SiteNav.Provider value={value}>{children}</SiteNav.Provider>;
}

export function useSiteNav() {
  const value = useContext(SiteNav);
  if (!value) throw new Error("useSiteNav: no SiteNavProvider above (app/[locale]/layout.tsx)");
  return value;
}
