"use client";
/* eslint-disable @next/next/no-img-element -- the account's screenshots are shown as they are, never re-encoded (the client's numbers stay pixel for pixel) */
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button/Button";
import { isLite } from "@/lib/lite";

type Ring = { left: number; top: number; width: number; height: number };
export type CaseShot = { id: string; src: string; w: number; h: number; rings?: Ring[]; label: string; alt: string };
export type CaseMetric = { key: "cpl" | "n" | "cr" | "spend"; k: string; v: string };
export type CaseView = {
  id: string;
  name: string;
  who: string;
  per: string;
  site: string;
  host: string;
  before: boolean;
  cap: string;
  tab: { v: string; k: string };
  metrics: CaseMetric[];
  how: React.ReactNode;
  shots: CaseShot[];
};
export type CasesText = { index: number; nav: string; title: React.ReactNode; intro: string; cta: string; site: string; before: string; swipe: string };

/** a number, its «≈» and its unit smaller; «before → after» with the old one struck through. With `count` it runs up
 *  from zero each time it comes into view whole after it has left the screen (the owner, 10 Nov 2026: the numbers count
 *  when the block is seen, not when the page opens) */
function Num({ text, count = false }: { text: string; count?: boolean }) {
  const [was, now] = text.includes(" → ") ? text.split(" → ") : [null, text];
  const match = now.match(/^(≈\s*)?(.+?)(\s*(?:грн|%))?$/);
  const body = match?.[2] ?? now;
  const holder = useRef<HTMLSpanElement>(null);
  const rounds = useRounds(holder, count);
  return (
    <span className="rk-cs-num" ref={holder}>
      {was && <s className="rk-cs-num__was">{was}</s>}
      {/* (a new round starts the count and the highlighter afresh) */}
      <span className="rk-cs-num__now" data-run={rounds > 0 || undefined} key={rounds}>
        {match?.[1] && <span className="rk-cs-num__approx">≈</span>}
        {count ? <CountUp value={body} run={rounds > 0} /> : body}
        {match?.[3] && <small className="rk-cs-num__unit">{match[3].trim()}</small>}
      </span>
    </span>
  );
}

/** how many times the element has come into view whole after being off the screen (0: not yet) */
function useRounds(target: React.RefObject<HTMLElement | null>, on: boolean) {
  const [rounds, setRounds] = useState(0);
  useEffect(() => {
    const element = target.current;
    if (!on || !element) return;
    let armed = true;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) armed = true;
        else if (armed && entry.intersectionRatio > 0.98) {
          armed = false;
          setRounds((done) => done + 1);
        }
      },
      { threshold: [0, 1] },
    );
    watch.observe(element);
    return () => watch.disconnect();
  }, [target, on]);
  return rounds;
}

/** the number as the message writes it: a space between thousands, a comma before the decimals */
const writeNumber = (value: number, decimals: number) => {
  const [whole, fraction] = value.toFixed(decimals).split(".");
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0") + (fraction ? `,${fraction}` : "");
};

/** a number that runs up from zero once `run` (the owner, 6 Nov: the client must see the numbers). The final number
 *  stays in the line, unseen, so the line never changes width while it runs and a screen reader reads only it; with
 *  reduced motion (no html.motion) the final number simply shows (ads.css) */
function CountUp({ value, run }: { value: string; run: boolean }) {
  const target = Number(value.replace(/[\s\u00a0\u202f]/g, "").replace(",", "."));
  const decimals = value.includes(",") ? value.split(",")[1].length : 0;
  // the running digits written straight into their span, not through React state: a state set on every frame had React
  // render the cases block again on each frame of the count (10 Nov 2026)
  const runner = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const out = runner.current;
    if (!run || !out || !Number.isFinite(target)) return;
    // (a slow computer, lib/lite: the number at once, not counted up)
    if (isLite()) {
      out.textContent = writeNumber(target, decimals);
      return;
    }
    const start = performance.now();
    const DURATION = 900;
    let frame = 0;
    let written = "";
    const tick = (time: number) => {
      const progress = Math.min(1, (time - start) / DURATION);
      const next = writeNumber(target * (1 - (1 - progress) ** 3), decimals);
      if (next !== written) out.textContent = written = next;
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run, target, decimals]);
  // the running span is empty in the HTML and its «0» is drawn by CSS (ads.css, data-zero): in the page's text the final
  // number stands alone, so a search engine or an AI reads «196», not «1960» (the 13 Nov audit)
  return (
    <span className="rk-cs-count">
      <span className="rk-cs-count__end">{value}</span>
      <span className="rk-cs-count__run" aria-hidden="true" data-zero={writeNumber(0, decimals)} ref={runner} />
    </span>
  );
}

const metric = (c: CaseView, key: CaseMetric["key"]) => c.metrics.find((m) => m.key === key)!;
const ArrowRight = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5.5 15.5 12 9 18.5" /></svg>;
/** the three numbers' marks: a rising line, a target, coins */
const STAT_ICON: Record<"n" | "cr" | "spend", React.ReactNode> = {
  n: <path d="M4 17l5-5 4 4 7-8M15 8h5v5" />,
  cr: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.8" /></>,
  spend: <><ellipse cx="12" cy="7" rx="7" ry="3" /><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" /></>,
};

/** the account's window, as tall as the column: its screenshots' tabs and the client's site in the bar (a lime link,
 *  plainly one to follow), the screenshot as large as the room allows (top left, as in the account), who and when and
 *  the note on the numbers at its foot. One column (phones) shows the screenshot wider than the window, so its figures
 *  stay readable: it scrolls sideways and opens on the ringed cells (without rings on its middle, where the figures are) */
function Window({ c, text, hidden }: { c: CaseView; text: CasesText; hidden: boolean }) {
  const [shot, setShot] = useState(0);
  const [panned, setPanned] = useState(false);
  const pan = useRef<HTMLDivElement>(null);
  const opened = useRef(0);
  const current = c.shots[shot] ?? c.shots[0];
  /* (again at each new size: the scroller has none until the one-column CSS applies, and a turn changes it) */
  useEffect(() => {
    const scroller = pan.current;
    if (!scroller) return;
    const rings = current.rings ?? [];
    const focus = rings.length ? (Math.min(...rings.map((ring) => ring.left)) + Math.max(...rings.map((ring) => ring.left + ring.width))) / 200 : 0.5;
    const open = () => {
      if (scroller.scrollWidth <= scroller.clientWidth) return;
      scroller.scrollLeft = focus * scroller.scrollWidth - scroller.clientWidth / 2;
      opened.current = scroller.scrollLeft;
    };
    const sized = new ResizeObserver(open);
    sized.observe(scroller);
    return () => sized.disconnect();
  }, [current]);
  return (
    <figure className="rk-cs-win" hidden={hidden}>
      <div className="rk-cs-win__bar">
        <i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" />
        <span className="rk-cs-win__host">ads.google.com</span>
        {c.shots.length > 1 && (
          <span className="rk-cs-win__tabs" role="tablist">
            {c.shots.map((s, index) => (
              <button type="button" role="tab" aria-selected={index === shot} onClick={() => setShot(index)} key={s.id}>{s.label}</button>
            ))}
          </span>
        )}
        <a className="rk-cs-win__site" href={c.site} target="_blank" rel="noopener">
          <span>{text.site}</span>
          <b>{c.host}</b>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
        </a>
      </div>
      <div className="rk-cs-win__body" data-panned={panned || undefined}>
        {/* (the scroller is only a box in one column; on a computer it gives way and the screenshot fits the window) */}
        <div className="rk-cs-win__pan" ref={pan} onScroll={(event) => Math.abs(event.currentTarget.scrollLeft - opened.current) > 8 && setPanned(true)}>
          {/* every screenshot is in the HTML with its alt (the figures in it), the ones not chosen hidden */}
          {c.shots.map((s, index) => (
            <span className="rk-cs-win__in" hidden={index !== shot} style={{ "--ar": s.w / s.h, "--w": s.w } as React.CSSProperties} key={`${c.id}-${s.id}`}>
              <img src={s.src} width={s.w} height={s.h} alt={s.alt} loading="lazy" decoding="async" />
              {s.rings?.map((ring, n) => (
                <span className="rk-cs-ring" aria-hidden="true" key={n} style={{ left: `${ring.left}%`, top: `${ring.top}%`, width: `${ring.width}%`, height: `${ring.height}%` }} />
              ))}
            </span>
          ))}
        </div>
        <span className="rk-cs-win__hint" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M8 7.5 3.5 12 8 16.5M16 7.5l4.5 4.5-4.5 4.5M4 12h16" /></svg>
          {text.swipe}
        </span>
      </div>
      <figcaption className="rk-cs-win__foot"><b>{c.who}</b> · {c.per}. {c.before && <em>{text.before}.</em>} {c.cap}</figcaption>
    </figure>
  );
}

/**
 * The cases (the owner's setting of 6 Nov 2026, after four rounds of layouts): the block is one screen on a computer.
 * Its heading is the first row; under it, on the left, the cases as three small cards (the chosen one dark, its price in
 * ember), the case's three numbers (each with its lime mark, a lime highlighter swept under the number as it runs up
 * from zero), what was done, the button at the column's foot; on the right only the account's window, as tall as the
 * column. A link to one case (…#case-pest, the site's menu) shows it: the cards keep those ids (runtime openCase).
 * One column (phones, the owner's setting of 6 Nov 2026): the heading, the cards, the numbers and what was done, the
 * window, the button last (the left column gives way to its parts, the CSS orders them).
 */
export function AdsCases({ cases, text }: { cases: CaseView[]; text: CasesText }) {
  const [active, setActive] = useState(0);
  /** the arrow keys move between the cases while a card has the focus */
  const keys = (event: React.KeyboardEvent) => {
    const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + cases.length) % cases.length;
    setActive(next);
    document.getElementById(`case-${cases[next].id}`)?.focus();
  };
  return (
    <div className="rk-cs">
      <header className="rk-cs-head">
        <p className="rk-cs-head__meta"><span>{text.index}</span>{text.nav}</p>
        <h2 className="rk-cs-head__title" id="case-title"><span className="tone">{text.title}</span></h2>
        <p className="rk-cs-head__intro">{text.intro}</p>
      </header>
      <div className="rk-cs__left">
        <div className="rk-cs__cards" role="tablist" aria-orientation="vertical" aria-label={text.nav} onKeyDown={keys}>
          {cases.map((item, index) => (
            <button
              type="button"
              role="tab"
              className="rk-cs-card"
              id={`case-${item.id}`}
              data-case-pick={item.id}
              aria-selected={index === active}
              tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)}
              key={item.id}
            >
              {/* (read as before: the case's number first; the grid puts it under the name) */}
              <span className="rk-cs-card__tag">{text.nav} {index + 1}</span>
              <span className="rk-cs-card__n">{item.name}</span>
              <span className="rk-cs-card__v"><Num text={item.tab.v} count /></span>
              <span className="rk-cs-card__k">{item.tab.k}</span>
              <span className="rk-cs-card__go" aria-hidden="true"><ArrowRight /></span>
            </button>
          ))}
        </div>
        {/* all three cases are in the HTML (search engines and AI do not click tabs: the 13 Nov audit), the ones not
            chosen hidden; showing one again replays its entrance as a fresh mount did */}
        {cases.map((item, index) => (
          <div className="rk-cs-facts" role="tabpanel" aria-labelledby={`case-${item.id}`} hidden={index !== active} key={item.id}>
            <dl className="rk-cs-dl">
              {(["n", "cr", "spend"] as const).map((key) => (
                <div key={key}>
                  <dt><span className="rk-cs-dl__ico" aria-hidden="true"><svg viewBox="0 0 24 24">{STAT_ICON[key]}</svg></span>{metric(item, key).k}</dt>
                  <dd><Num text={metric(item, key).v} count /></dd>
                </div>
              ))}
            </dl>
            <p className="rk-cs-how">{item.how}</p>
          </div>
        ))}
        <div className="rk-cs-end"><ButtonLink href="#contact" variant="primary">{text.cta}</ButtonLink></div>
      </div>
      {cases.map((item, index) => (
        <Window c={item} text={text} hidden={index !== active} key={item.id} />
      ))}
    </div>
  );
}
