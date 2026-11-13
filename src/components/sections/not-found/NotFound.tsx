import { getLocale, getTranslations } from "next-intl/server";
import { getSiteNav } from "@/content/site-nav";
import { ButtonLink } from "@/components/ui/button/Button";
import { ArrowIcon } from "@/components/ui/icons/ArrowIcon";
import { ChromeNumber } from "./ChromeNumber";
import { NotFoundLight } from "./NotFoundLight";
import "./not-found.css";

/** The services in the owner's order (sites → ads → AI), then the request. */
const ORDER = ["/dyzain-i-saity", "/reklama-i-analityka", "/ai-avtomatyzatsiia"];

/**
 * The number in the footer wordmark's liquid chrome with an ember hairline round it (ChromeNumber), the hero's small
 * stones beside it, the words, the lime button home (the first screen's) and the
 * pages to go to. The layout and the details are in not-found.css; the stones' drift with the pointer in NotFoundLight.
 */
export async function NotFound({ home }: { home: string }) {
  const t = await getTranslations();
  const nav = await getSiteNav(await getLocale());
  const services = [...nav.services].sort((a, b) => ORDER.indexOf(a.path) - ORDER.indexOf(b.path));
  const pages = [...services.map((s) => ({ href: s.href, text: s.short, lead: false })), { href: `${home}#contact`, text: t("nav.contact"), lead: true }];
  return (
    <section className="nf" data-nf="">
      <div className="nf__art" aria-hidden="true">
        <ChromeNumber text="404" />
        {/* eslint-disable-next-line @next/next/no-img-element -- a small decorative picture, no layout to reserve */}
        <img className="nf__chip nf__chip--a" src="/img/hero/stage-stone-1.webp" alt="" width={693} height={952} decoding="async" />
        {/* eslint-disable-next-line @next/next/no-img-element -- as above */}
        <img className="nf__chip nf__chip--b" src="/img/hero/stage-stone-2.webp" alt="" width={693} height={952} decoding="async" />
      </div>
      <div className="nf__info">
        <div className="nf__text">
          <h1 className="nf__title">{t("notFound.title")}</h1>
          <p className="nf__lead">{t("notFound.text")}</p>
          <ButtonLink href={home} variant="primary" className="nf__go">{t("notFound.home")}</ButtonLink>
        </div>
        <nav className="nf__nav" aria-label={t("notFound.nav")}>
          <ul className="nf__links">
            {pages.map((p) => (
              <li key={p.href}>
                <a href={p.href} className={p.lead ? "is-lead" : undefined}>
                  <span>{p.text}</span>
                  <ArrowIcon />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <NotFoundLight />
    </section>
  );
}
