"use client";
/*
 * FX Lab: every effect of the library on its own, with the one line that wires it up. The page is
 * built with Tailwind only (the tokens from styles/tokens.css: bg-bg, text-ink, text-lime …), as a
 * new site using the library would be.
 */
import { useEffect, useRef } from "react";
import { ButtonLink } from "@/components/ui/button/Button";
import { RollText } from "@/components/fx/roll-text/RollText";
import { TextFill } from "@/components/fx/text-fill/TextFill";
import { ScrollReveals } from "@/components/fx/scroll-reveal/ScrollReveals";
import { SmoothScroll } from "@/components/fx/smooth-scroll/SmoothScroll";
import { useHoverReveal } from "@/components/fx/hover-reveal/useHoverReveal";
import { useSpotlight } from "@/components/fx/spotlight/useSpotlight";
import { startSplashCursor } from "@/components/fx/splash-cursor/startSplashCursor";
import "@/components/fx/roll-text/roll-text.css";
import "./lab.css";

const FX = [
  { id: "preloader", name: "Preloader", file: "fx/preloader", use: "<Preloader brand note words last stages />  ·  window.lumeraLoader.step(p, i) / finish()" },
  { id: "roll-text", name: "RollText", file: "fx/roll-text", use: '<a className="roll-host"><RollText>Послуги</RollText></a>' },
  { id: "invert-cursor", name: "InvertCursor", file: "fx/invert-cursor", use: "<InvertCursor size={22} grow={2.9} quiet=\"[data-wordmark]\" /> once in the layout" },
  { id: "invert-fill", name: "InvertFill", file: "fx/invert-fill", use: "<InvertFill /> once in the layout  ·  .btn --btn-bg / --btn-fill / --btn-fill-ink" },
  { id: "magnetic", name: "Magnetic", file: "fx/magnetic", use: "useMagnetic(ref, { strength: 1 })  ·  <ButtonLink magnetic>" },
  { id: "hover-reveal", name: "HoverReveal", file: "fx/hover-reveal", use: 'useHoverReveal(listRef, { rows: "[data-row]", images })' },
  { id: "text-fill", name: "TextFill", file: "fx/text-fill", use: "<TextFill>A paragraph that lights up as you read</TextFill>" },
  { id: "scroll-reveal", name: "ScrollReveals", file: "fx/scroll-reveal", use: '<ScrollReveals root="[data-page]" />  ·  data-sr / data-split' },
  { id: "spotlight", name: "Spotlight", file: "fx/spotlight", use: 'useSpotlight(scopeRef, ".card")' },
  { id: "horizontal-ride", name: "HorizontalRide", file: "fx/horizontal-ride", use: "initRide({ motion, root, track, panel, name, media, body })" },
  { id: "splash-cursor", name: "SplashCursor", file: "fx/splash-cursor", use: "startSplashCursor(canvas, area, { CURL: 16 })" },
  { id: "chrome-wordmark", name: "ChromeWordmark", file: "fx/chrome-wordmark", use: "initWordmark({ reducedMotion })  ·  [data-wordmark] > canvas" },
  { id: "smooth-scroll", name: "SmoothScroll", file: "fx/smooth-scroll", use: "<SmoothScroll lerp={0.095} />" },
] as const;

function Block({ id, title, children, reveal = true }: { id: string; title: string; children: React.ReactNode; reveal?: boolean }) {
  const fx = FX.find((f) => f.id === id)!;
  return (
    <section id={id} className="border-t border-line py-20" data-sr={reveal ? "" : undefined}>
      <p className="font-mono text-label uppercase tracking-[0.16em] text-ink-mute">{fx.file}</p>
      <h2 className="mt-3 text-display leading-none tracking-tight">{title}</h2>
      <code className="mt-5 block overflow-x-auto rounded-md border border-border bg-white/5 p-4 font-mono text-small text-lime">{fx.use}</code>
      <div className="mt-10">{children}</div>
    </section>
  );
}

export function FxLab({ locale }: { locale: string }) {
  const list = useRef<HTMLOListElement>(null);
  const cards = useRef<HTMLDivElement>(null);
  const smoke = useRef<HTMLDivElement>(null);
  const lang = locale === "ru" ? "ru" : "uk";
  const images = [1, 2, 3, 4].map((n) => `/img/what/what-${n}-${lang}.webp`);
  useHoverReveal(list, { rows: "[data-row]", images });
  useSpotlight(cards, ".lab-card");

  useEffect(() => {
    window.lumeraLoader?.finish(); // the layout's preloader: nothing to wait for here
    document.documentElement.classList.add("is-ready");
    const area = smoke.current;
    const canvas = area?.querySelector("canvas");
    let fluid: { dispose(): void } | null = null;
    if (area && canvas) startSplashCursor(canvas, area, { CURL: 16, COLOR: "#daff02" }).then((f) => (fluid = f));
    let alive = true;
    (async () => {
      const [{ initRide }, { initWordmark }] = await Promise.all([import("@/components/fx/horizontal-ride/ride.js"), import("@/components/fx/chrome-wordmark/wordmark.js")]);
      if (!alive) return;
      initRide({ motion: !matchMedia("(prefers-reduced-motion: reduce)").matches, root: "[data-lab-ride]", track: ".lab-track", panel: ".lab-panel", name: ".lab-panel__name", media: ".lab-panel__media", body: ".lab-panel__copy", tabs: "[data-none]", goEvent: "lab:go" });
      initWordmark({ reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches });
    })();
    return () => {
      alive = false;
      fluid?.dispose();
    };
  }, []);

  return (
    <div className="lab min-h-screen bg-bg px-[var(--gutter)] pb-40 text-ink" data-lab="">
      <SmoothScroll />
      <header className="pb-16 pt-24">
        <p className="font-mono text-label uppercase tracking-[0.16em] text-lime">Lumera · FX library</p>
        <h1 className="mt-4 max-w-[14ch] text-[clamp(3rem,8vw,7.5rem)] font-light leading-[0.95] tracking-[-0.04em]">Effects you can build a site from.</h1>
        <nav className="mt-12 flex flex-wrap gap-2">
          {FX.map((f) => (
            <a key={f.id} href={`#${f.id}`} className="roll-host rounded-full border border-line px-4 py-2 font-mono text-label uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-lime hover:text-lime">
              <RollText>{f.name}</RollText>
            </a>
          ))}
        </nav>
      </header>

      <Block id="preloader" title="Preloader">
        <p className="max-w-[60ch] text-lead text-ink-soft">Five columns, the words of what you do, an honest counter that follows real loading milestones, and an exit that hands over to the hero. It ran when this page opened; reload in a new tab to see it again.</p>
      </Block>

      <Block id="roll-text" title="RollText">
        <div className="flex flex-wrap gap-8 text-[clamp(1.5rem,3vw,2.5rem)]">
          {["Послуги", "Підхід", "Ціни"].map((w) => (
            <a key={w} href="#roll-text" className="roll-host">
              <RollText>{w}</RollText>
            </a>
          ))}
        </div>
      </Block>

      <Block id="invert-cursor" title="InvertCursor">
        <p className="max-w-[60ch] text-lead text-ink-soft">The pointer on this page is the effect: a circle that inverts everything under it, grows over links and buttons, steps aside over the wordmark (its own lens) and keeps the caret in text fields.</p>
      </Block>

      <Block id="invert-fill" title="InvertFill">
        <div className="flex flex-wrap items-center gap-6">
          <ButtonLink href="#invert-fill" variant="primary">Отримати план і оцінку</ButtonLink>
          <ButtonLink href="#invert-fill" variant="ghost">Обговорити проєкт</ButtonLink>
        </div>
      </Block>

      <Block id="magnetic" title="Magnetic">
        <div className="flex flex-wrap items-center gap-6">
          <ButtonLink href="#magnetic" variant="primary" magnetic>Отримати план</ButtonLink>
          <ButtonLink href="#magnetic" variant="ghost" magnetic={0.5}>Обговорити проєкт</ButtonLink>
        </div>
      </Block>

      <Block id="hover-reveal" title="HoverReveal">
        <ol ref={list} className="border-t border-line">
          {["Дизайн і розробка", "Автоматизація", "SaaS-продукти", "Реклама й аналітика"].map((name, i) => (
            <li key={name} className="border-b border-line">
              <a href="#hover-reveal" data-row="" className="group flex items-baseline gap-8 py-6 transition-opacity">
                <span className="font-mono text-label text-ink-mute">0{i + 1}</span>
                <span className="text-[clamp(2rem,5vw,4.5rem)] leading-none tracking-[-0.04em] transition-transform duration-700 ease-out group-hover:translate-x-6">{name}</span>
              </a>
            </li>
          ))}
        </ol>
      </Block>

      <Block id="text-fill" title="TextFill">
        <TextFill className="lab-fill max-w-[22em] text-[clamp(1.6rem,3vw,3rem)] font-light leading-tight tracking-tight">
          Реклама приводить людей на сайт. Заявки з сайту одразу приходять вам, і кожна з них видна в аналітиці.
        </TextFill>
      </Block>

      <Block id="scroll-reveal" title="ScrollReveals">
        <div className="grid gap-4 sm:grid-cols-3">
          {["Пошук", "Сайт", "Заявка"].map((w) => (
            <div key={w} data-sr="" className="rounded-lg border border-border bg-white/[0.03] p-8 text-h4">{w}</div>
          ))}
        </div>
      </Block>

      <Block id="spotlight" title="Spotlight">
        <div ref={cards} className="grid gap-4 sm:grid-cols-2">
          {["Лендінг", "Повна система"].map((w) => (
            <div key={w} className="lab-card relative overflow-hidden rounded-lg border border-border p-10 text-h3">{w}</div>
          ))}
        </div>
      </Block>

      <Block id="horizontal-ride" title="HorizontalRide" reveal={false}>
        <div className="ride lab-ride" data-lab-ride="">
          <div className="lab-track">
            {["Дизайн", "Сайт", "Реклама", "Автоматизація", "SaaS"].map((w, i) => (
              <article key={w} className="lab-panel">
                <div className="lab-panel__media" style={{ "--h": `${70 + i * 18}` } as React.CSSProperties} />
                <div className="lab-panel__copy">
                  <p className="lab-panel__name font-mono text-label uppercase tracking-[0.16em] text-lime">{w}</p>
                  <h3 className="mt-3 text-h3 leading-tight">Панель {i + 1}</h3>
                  <p className="mt-3 text-ink-soft">Вертикальний скрол везе трек убік; центральна панель світиться, сусідні відступають.</p>
                </div>
              </article>
            ))}
          </div>
          <div className="ride__hud">
            <p className="ride__count" aria-hidden="true"><b data-ride-now="">01</b> / <span data-ride-of="">05</span></p>
            <span className="ride__bar" aria-hidden="true"><i data-ride-bar="" /></span>
            <ul className="ride__names" data-ride-names="" />
          </div>
        </div>
      </Block>

      <Block id="splash-cursor" title="SplashCursor">
        <div ref={smoke} className="lab-smoke relative h-[60vh] overflow-hidden rounded-lg border border-border">
          <canvas className="absolute inset-0 h-full w-full" />
          <p className="absolute bottom-6 left-6 font-mono text-label uppercase tracking-[0.16em] text-ink-mute">Move the mouse here</p>
        </div>
      </Block>

      <Block id="chrome-wordmark" title="ChromeWordmark">
        <div className="footer__mark" data-wordmark="" aria-hidden="true">
          <span className="footer__mark-text">LUMERA</span>
          <canvas className="footer__mark-canvas" />
          <span className="footer__drop" data-slot="drop" />
        </div>
      </Block>

      <Block id="smooth-scroll" title="SmoothScroll">
        <p className="max-w-[60ch] text-lead text-ink-soft">Lenis on this page: the wheel glides; ScrollTrigger runs on the same clock; touch keeps the native scroll.</p>
      </Block>
      <ScrollReveals root="[data-lab]" />
    </div>
  );
}
