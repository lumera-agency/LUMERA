/* eslint-disable @next/next/no-img-element -- the stills and the board's pictures are set, swapped and sliced by the page's script (runtime) */
import { Fragment } from "react";
import { preload } from "react-dom";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button/Button";
import { AiStoneSlot } from "@/components/ai/AiStoneSlot";
import type { SitesFacts } from "@/components/sites/facts";
import { HeroFlux } from "@/components/sites/hero-fx/HeroFlux";

/**
 * 1 · the first screen, «Плакат» (the owner's pick, 18 Oct 2026, after «текст залазил на объект»): one screen set as a
 * poster on a 12-column grid, so no word ever crosses the stone. The H1 top left, «Дизайн і код» (the owner's pick of
 * nine settings, 19 Oct: see Title); «01 Формати» and the lead top right
 * (set like the clinic sample's manifesto: a picture pill after each format, the end in Source Serif 4 italic); the
 * stone large in the middle (the still, then the live stone: AiStoneSlot), in its own grid area; bottom left the lime
 * button over «02 Ціни» and the three prices (from the engine: data-fprice). (No «Формати й ціни ↓»: the topbar has
 * «Формати» and «Ціна»; the owner, 19 Oct.) Below:
 * the sample site «Ваш бренд» on a computer and a phone, assembled block by block once (scene «build»). It pins; block
 * 2 slides over it. Rules: sites-hero.css. (The earlier versions a–e, w1–w4 and g1/g2/g4 are kept outside the project.)
 */
const FORMATS = [
  { key: "landing", n: "01", name: "hg.f1" },
  { key: "corporate", n: "02", name: "hg.f2" },
  { key: "ecommerce", n: "03", name: "hg.f3" },
] as const;

export async function SitesHero({ facts: F }: { facts: SitesFacts }) {
  const t = await getTranslations("sites");
  // the lead's italic face is fetched with the page: the line never re-wraps when it arrives
  preload("/fonts/sites/source-serif-4-italic-cyrillic.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  const label = (text: string, n: string, area: string) => (
    <p className={`st-hg__k st-hg__k--${area}`} aria-hidden="true"><span>{n}</span>{text}</p>
  );
  return (
    <section className="ai-hero ai-hero--center st-hero st-hg" id="top" aria-labelledby="st-title" data-cover="">
      <div className="ai-hero__bg" aria-hidden="true"><HeroFlux /></div>
      <div className="ai-hero__in">
        <div className="ai-hero__copy st-hg__grid">
          <h1 className="s-head__title s-head__title--stone ai-hero__title st-hg__title" id="st-title">
            <Title raw={t.raw("hero.title") as string} />
          </h1>
          {label(t("nav.formats"), "01", "lead")}
          <PillLead raw={t.raw("hg.lead") as string} />
          {/* the stone in its own box (decoration) */}
          <div className="st-hg__stone" aria-hidden="true">
            <div className="ai-hero__rock">
              <i className="ai-hero__glow" />
              <img className="ai-hero__stone" src="/img/ai/lock-stone.webp" width={520} height={626} alt="" decoding="async" fetchPriority="high" />
              <AiStoneSlot />
            </div>
          </div>
          <div className="ai-hero__actions st-hg__acts">
            <ButtonLink href="#contact" variant="primary">{t("cta")}</ButtonLink>
          </div>
          {label(t("hg.px"), "02", "px")}
          {/* the three formats: number, name, «від», the sum (from the engine; the runtime refills data-fprice) */}
          <ul className="st-hg__px">
            {FORMATS.map((f) => (
              <li className="st-hg__pi" key={f.key}>
                <span className="st-hg__pn" aria-hidden="true">{f.n}</span>
                <span className="st-hg__pt">{t(f.name)}</span>{" "}
                <span className="st-hg__pp">
                  <span className="st-hg__from">{t("from")}</span> <b data-fprice={f.key}>{F[f.key]}</b>
                </span>
              </li>
            ))}
          </ul>
          <i className="st-hg__mark st-hg__mark--tl" aria-hidden="true" />
          <i className="st-hg__mark st-hg__mark--tr" aria-hidden="true" />
          <i className="st-hg__mark st-hg__mark--bl" aria-hidden="true" />
          <i className="st-hg__mark st-hg__mark--br" aria-hidden="true" />
        </div>
        <Show t={t} />
      </div>
    </section>
  );
}

/*
 * The H1, «Дизайн і код» (t5 of the nine settings the owner compared, 19 Oct 2026): each word in the face of what it
 * means. «Дизайн» in Source Serif 4 italic (design), «розробка» in IBM Plex Mono lowercase (code: it types in once
 * behind an ember caret), «сайтів» in Geologica 800, ember (the result); the three faces matched on one x-height.
 * hero.title's words («<line>Дизайн і розробка</line> <line><hl>сайтів</hl></line>»): the screen reader gets the plain
 * sentence (.visually-hidden), the set words are aria-hidden. Rules and the entrance: sites-hero.css (.st-h1).
 */
function Title({ raw }: { raw: string }) {
  const lines = [...raw.matchAll(/<line>(.*?)<\/line>/g)].map((m) => m[1]);
  const [design, and, ...rest] = (lines[0] ?? "").split(/\s+/); // «Дизайн» «і» «розробка» (\s also takes a no-break space)
  const key = (lines[1] ?? "").replace(/<\/?hl>/g, "");
  const code = [...rest.join(" ")]; // mono: every letter has the same width, so nothing moves as it types
  return (
    <>
      <span className="visually-hidden">{`${lines[0] ?? ""} ${key}`}</span>
      <span className="st-h1" aria-hidden="true" style={{ "--n": code.length } as React.CSSProperties}>
        <span className="st-h1__m st-h1__a"><span className="tone">{design}</span></span>
        <span className="st-h1__m st-h1__i"><span className="tone">{and}</span></span>
        <span className="st-h1__m st-h1__b">
          <span className="tone st-h1__code">
            {code.map((ch, i) => (
              <span className="st-h1__k" key={i} style={{ "--i": i } as React.CSSProperties}>{ch}</span>
            ))}
            <i className="st-h1__caret" />
          </span>
        </span>
        <span className="st-h1__m st-h1__s"><span className="tone"><em className="hl">{key}</em></span></span>
      </span>
    </>
  );
}

/*
 * The lead (hg.lead: hero.lead's words, «[n]» where a pill goes, «*…*» the italic end): after each format a pill with
 * a crop of its sample (Фуксія's pink hall, Петроль's orange chair, Кольорова тінь's glass), as the clinic sample's
 * manifesto does (clinic.css .cl-mani__pill). Each pill is glued to its word and its comma (no break inside), so it
 * never starts or ends a line alone. The pills are decoration (aria-hidden): the sentence reads as hero.lead.
 */
const PILLS = ["/img/sites/hg-pill-landing.jpg", "/img/sites/hg-pill-corp.jpg", "/img/sites/hg-pill-shop.jpg"];
function PillLead({ raw }: { raw: string }) {
  const parts = raw.split(/(\S+ \[\d\][,:.;]?|\*[^*]+\*)/).filter(Boolean);
  return (
    <p className="ai-hero__lead st-hg__lead st-hg__mani">
      {parts.map((part, i) => {
        const pill = part.match(/^(\S+) \[(\d)\](.*)$/);
        if (pill) {
          const n = Number(pill[2]);
          return (
            <span className="st-hg__nb" key={i}>
              {pill[1]}{"\u00a0"}
              <span className="st-hg__pill" aria-hidden="true" style={{ "--i": n } as React.CSSProperties}>
                <img src={PILLS[n - 1]} width={160} height={66} alt="" decoding="async" />
              </span>
              {pill[3]}
            </span>
          );
        }
        const em = part.match(/^\*(.+)\*$/);
        return em ? <em className="st-hg__ser" key={i}>{em[1]}</em> : <Fragment key={i}>{part}</Fragment>;
      })}
    </p>
  );
}

/* the sample site on a computer and a phone (decoration: the same words are in the blocks below). Its parts come in
   block by block once, in the order a visitor reads them (scene «build») */
function Show({ t }: { t: Awaited<ReturnType<typeof getTranslations<"sites">>> }) {
  return (
    <div className="ai-hero__visual">
      <div className="st-show" data-scene="build" data-scene-start="0.2" aria-hidden="true">
        <div className="st-win st-show__desk">
          <div className="st-win__bar"><i /><i /><i /><span className="st-win__url">vash-sait.ua</span><span className="ai-sample">{t("x.sample")}</span></div>
          <div className="st-view">
            <div className="ms ms--auth" data-ms="">
              <div className="ms-nav" data-b="">
                <span className="ms-logo"><i /><span>{t("ms.brand")}</span></span>
                <span className="ms-links"><span>{t("ms.nav.1")}</span><span>{t("ms.nav.2")}</span><span>{t("ms.nav.3")}</span><span>{t("ms.nav.4")}</span></span>
                <span className="ms-btn ms-btn--sm">{t("ms.cta")}</span>
              </div>
              <div className="ms-hero">
                <p className="ms-tag" data-b=""><i /><span>{t("ms.tag")}</span></p>
                <p className="ms-h" data-b="">{t("ms.h")}</p>
                <p className="ms-p" data-b="">{t("ms.p")}</p>
                <p className="ms-acts" data-b=""><span className="ms-btn">{t("ms.cta")}</span><span className="ms-btn ms-btn--line">{t("ms.nav.3")}</span></p>
                <div className="ms-obj" data-b=""><i className="ms-obj__glow" /><img src="/img/ai/lock-stone.webp" width="520" height="626" alt="" loading="lazy" decoding="async" /></div>
                <p className="ms-n" data-b=""><b>01</b><span>{t("ms.n")}</span></p>
              </div>
              <div className="ms-row" data-b="">
                <div className="ms-card"><b>01</b><span>{t("ms.tag")}</span><em>{t("ms.price")}</em></div>
                <div className="ms-card"><b>02</b><span>{t("ms.tag")}</span><em>{t("ms.price")}</em></div>
                <div className="ms-card"><b>03</b><span>{t("ms.tag")}</span><em>{t("ms.price")}</em></div>
              </div>
            </div>
            {/* the page as blocks: six labelled bands, then the first one becomes the first screen (scene «build») */}
            <div className="st-build">
              <i className="st-build__grow" />
              <p className="st-build__b"><b>01</b><span>{t("blk.1._")}</span></p>
              <p className="st-build__b"><b>02</b><span>{t("blk.2._")}</span></p>
              <p className="st-build__b"><b>03</b><span>{t("blk.3._")}</span></p>
              <p className="st-build__b"><b>04</b><span>{t("blk.4._")}</span></p>
              <p className="st-build__b"><b>05</b><span>{t("blk.5._")}</span></p>
              <p className="st-build__b"><b>06</b><span>{t("blk.6._")}</span></p>
            </div>
          </div>
        </div>
        <div className="st-phone st-show__phone">
          <div className="st-view">
            <div className="ms ms--auth ms--m" data-ms="">
              <div className="ms-nav" data-b="">
                <span className="ms-logo"><i /><span>{t("ms.brand")}</span></span>
                <span className="ms-burger"><i /><i /></span>
              </div>
              <div className="ms-hero">
                <p className="ms-tag" data-b=""><i /><span>{t("ms.tag")}</span></p>
                <p className="ms-h" data-b="">{t("ms.h")}</p>
                <div className="ms-obj" data-b=""><i className="ms-obj__glow" /><img src="/img/ai/lock-stone.webp" width="520" height="626" alt="" loading="lazy" decoding="async" /></div>
                <p className="ms-acts" data-b=""><span className="ms-btn">{t("ms.cta")}</span></p>
              </div>
              <div className="ms-row" data-b="">
                <div className="ms-card"><b>01</b><span>{t("ms.tag")}</span><em>{t("ms.price")}</em></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button className="ai-replay st-show__replay" type="button" data-replay="build" aria-label={t("replay.build")}><span aria-hidden="true">↻</span> <span>{t("x.replay")}</span></button>
    </div>
  );
}
