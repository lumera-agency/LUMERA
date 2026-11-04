"use client";
import { useLayoutEffect } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/cn";
import { getPathname, usePathname, useRouter } from "@/i18n/navigation";
import { SWITCHING, holdPlace, keepRoot, readingPlace, type ReadingPlace } from "@/lib/place";
import { menu } from "@/components/layout/menu/menu-store";

const LANGS = [
  { code: "uk", label: "UA", name: "Українська" },
  { code: "ru", label: "RU", name: "Русский" },
] as const;

/** The place to come back to once the other language is on the page (a switch in progress). */
let pending: { locale: string; place: ReadingPlace } | null = null;
/** The switch's flag comes off 1.5 s after the other language has taken the switch over (at most 5 s after the click),
 *  timed from the click itself: nothing in the components' lives can cancel it. */
let settle = 0;
function settleLater(from: number) {
  clearTimeout(settle);
  const wait = () => {
    if (pending && performance.now() - from < 5000) settle = window.setTimeout(wait, 100);
    else settle = window.setTimeout(() => document.documentElement.classList.remove(SWITCHING), 1500);
  };
  wait();
}

/**
 * UA · RU: links to the same page in the other language (/ ↔ /ru, /ai-avtomatyzatsiia ↔ /ru/ai-avtomatyzatsiia).
 * The switch stays in the page (the owner, 3 Nov: at once, no fade, the stone moving on): the router brings the other
 * language's words (fetched ahead as the pointer comes to the link), the page renders anew in them, every block
 * starting over (they all can: each stops on leaving), the hero's 3D carried across (HeroShell), and the visitor kept
 * at the same words. Without the scripts the links are plain links.
 */
export function LangSwitch({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  // the other language is on the page (every switch on it mounts anew): back at the same words before it is drawn
  useLayoutEffect(() => {
    if (pending?.locale !== locale) return;
    const { place } = pending;
    pending = null;
    holdPlace(place);
  }, [locale]);

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
            onPointerEnter={() => locale !== l.code && router.prefetch(pathname, { locale: l.code })}
            onClick={(e) => {
              if (locale === l.code) return void e.preventDefault();
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; // a new tab
              e.preventDefault();
              pending = { locale: l.code, place: readingPlace() };
              document.documentElement.classList.add(SWITCHING);
              menu.set(false); // (picked in the phone menu: it closes on the page in the other language)
              keepRoot();
              settleLater(performance.now());
              router.replace(pathname, { locale: l.code, scroll: false });
            }}
          >
            {l.label}
          </a>
        </span>
      ))}
    </div>
  );
}
