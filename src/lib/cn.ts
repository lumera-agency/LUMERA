import { clsx, type ClassValue } from "clsx";

/**
 * Class names, conditional (clsx). No tailwind-merge: only the site's own classes pass through here (btn, lang, topbar,
 * the blocks' own), never Tailwind utilities that could clash, so it merged nothing and put 27 KB into every page's
 * first script (12 Nov 2026).
 */
export const cn = (...inputs: ClassValue[]) => clsx(inputs);
