"use client";
import { useLocale } from "next-intl";
import { cn } from "@/lib/cn";
import { getPathname, usePathname } from "@/i18n/navigation";

const LANGS = [
  { code: "uk", label: "UA", name: "Українська" },
  { code: "ru", label: "RU", name: "Русский" },
] as const;

export const SCROLL_KEY = "lumera:lang-scroll";

/**
 * UA · RU: real links to the same page in the other language (/ ↔ /ru, /ai-avtomatyzatsiia ↔ /ru/ai-avtomatyzatsiia). The switch is a full load (the 3D scene and
 * every effect start fresh in the new language); the page comes back at the same scroll position
 * (lib/boot.ts restoreScroll).
 */
export function LangSwitch({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const locale = useLocale();
  const pathname = usePathname();
  const remember = () => {
    try {
      sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY)));
    } catch {}
  };
  return (
    <div className={cn("lang", className)} {...rest}>
      {LANGS.map((l, i) => (
        <span key={l.code} style={{ display: "contents" }}>
          {i > 0 && <span className="lang__dot" aria-hidden="true">·</span>}
          <a
            className="lang__link"
            href={getPathname({ href: pathname, locale: l.code })}
            lang={l.code}
            hrefLang={l.code}
            aria-label={l.name}
            aria-current={locale === l.code ? "true" : undefined}
            onClick={(e) => {
              if (locale === l.code) return void e.preventDefault();
              remember();
            }}
          >
            {l.label}
          </a>
        </span>
      ))}
    </div>
  );
}
