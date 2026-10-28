"use client";
/*
 * The panels under «Послуги» and «Кейси» (the header and the topbar): four columns, one card each. Services: the
 * picture, the name, the line, the «від» price, the link to the page. Cases: the chip, the figure with its key, who it
 * is for and the honest sentence. The strip under them leads on: the calculator, the other panel, «Про нас».
 * Hidden until opened (disclosure.ts animates them).
 */
import { usePathname } from "@/i18n/navigation";
import { focusBlock, goToBlock } from "@/lib/scroll";
import { useSiteNav } from "./SiteNavProvider";
import type { NavPanelId } from "./disclosure";
import "./nav-panel.css";

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 17 17 7M8.5 7H17v8.5" />
    </svg>
  );
}

export function NavChevron() {
  return (
    <svg className="nav__chev" viewBox="0 0 10 6" aria-hidden="true" focusable="false">
      <path d="M1 1l4 4 4-4" />
    </svg>
  );
}

/** SaaS has no page of its own: on the main page it goes to its panel in the services' ride (as WhatList does). */
function goToService(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  const event = new CustomEvent("services:go", { detail: { id }, cancelable: true });
  if (document.dispatchEvent(event)) return; // nobody took it: the page's link routing does (lib/scroll)
  e.preventDefault();
  const panel = document.getElementById(id);
  if (panel) focusBlock(panel);
}

/** A section of this very page (a format on «Дизайн і сайти»): no reload, a tab is chosen, the page glides there. */
function goToSection(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  const url = new URL(href, location.href);
  if (url.pathname !== location.pathname || !url.hash) return;
  let target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (!target) return;
  e.preventDefault();
  if (target.matches('[role="tab"]')) {
    target.click();
    target = target.closest("section") ?? target;
  }
  goToBlock(target);
  focusBlock(target);
}

export function NavPanel({ kind, id }: { kind: NavPanelId; id: string }) {
  const nav = useSiteNav();
  const path = usePathname();
  const onMain = path === "/";
  const local = (hash: string) => (onMain ? hash : `${nav.home}${hash}`);
  const L = nav.labels;
  const about = nav.about && (
    <a href={nav.about}>
      {L.about}
      <Arrow />
    </a>
  );

  const cards =
    kind === "services"
      ? nav.services.map((s) => {
          const saas = s.path === null;
          const ids = `${id}-${s.n}`;
          const page = saas && onMain ? "#svc-4" : s.href;
          const toPage = saas && onMain ? (e: React.MouseEvent<HTMLAnchorElement>) => goToService(e, "svc-4") : undefined;
          return (
            <li key={s.n}>
              <div className="navp__card" data-current={s.path === path ? "" : undefined}>
                <div className="navp__in">
                  <a className="navp__main" href={page} aria-current={s.path === path ? "page" : undefined} aria-labelledby={`${ids}-name`} onClick={toPage}>
                    <span className="navp__meta">
                      <span data-line="">{s.n}</span>
                    </span>
                    <span className="navp__pic" data-pic="">
                      {/* eslint-disable-next-line @next/next/no-img-element -- the What block's 4:5 picture, cropped */}
                      <img src={s.img} alt="" width={680} height={850} loading="lazy" decoding="async" />
                    </span>
                    <span className="navp__name" id={`${ids}-name`}>
                      <span data-line="">{s.name}</span>
                    </span>
                    {s.subs.length === 0 && (
                      <span className="navp__desc">
                        <span data-line="">{s.desc}</span>
                      </span>
                    )}
                  </a>
                  {/* the page's sections, as the phone menu has them: the formats with their prices, the cases */}
                  {s.subs.length > 0 && (
                    <ul className="navp__subs" aria-label={s.name}>
                      {s.subs.map((sub) => (
                        <li key={sub.text}>
                          <a className="navp__sub" href={sub.href} onClick={(e) => goToSection(e, sub.href)}>
                            <span data-line="">
                              <span>{sub.text}</span>
                              {sub.price ? <b>{sub.price}</b> : sub.tag ? <i className={sub.example ? "navp__tag navp__tag--ex" : "navp__tag"}>{sub.tag}</i> : null}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  <a className="navp__foot" href={page} onClick={toPage} tabIndex={-1} aria-hidden="true">
                    <span data-line="">
                      {s.price ? <span className="navp__price">{s.price}</span> : <span />}
                      <span className="navp__go">
                        {L.more}
                        <span className="navp__disc">
                          <Arrow />
                        </span>
                      </span>
                    </span>
                  </a>
                </div>
              </div>
            </li>
          );
        })
      : nav.cases.map((c) => {
          const ids = `${id}-${c.n}`;
          return (
            <li key={c.n}>
              <a className="navp__card" href={c.href} aria-labelledby={`${ids}-name`} aria-describedby={`${ids}-fig ${ids}-who`}>
                <span className="navp__in">
                  <span className="navp__meta">
                    <span data-line="">
                      <span className="navp__chip">{c.chip}</span>
                      <span>{c.n}</span>
                    </span>
                  </span>
                  <span className="navp__fig" data-pic="" id={`${ids}-fig`}>
                    <b>{c.v}</b>
                    <span>{c.k}</span>
                  </span>
                  <span className="navp__name" id={`${ids}-name`}>
                    <span data-line="">{c.name}</span>
                  </span>
                  <span className="navp__who" id={`${ids}-who`}>
                    <span data-line="">{c.who}</span>
                  </span>
                  {c.honest && (
                    <span className="navp__honest">
                      <span data-line="">{c.honest}</span>
                    </span>
                  )}
                  <span className="navp__foot">
                    <span data-line="">
                      <span className="navp__svc">{c.service}</span>
                      <span className="navp__go">
                        {L.more}
                        <span className="navp__disc">
                          <Arrow />
                        </span>
                      </span>
                    </span>
                  </span>
                </span>
              </a>
            </li>
          );
        });

  return (
    <div className="navp" id={id} data-navp={kind} hidden>
      <div className="navp__frame">
        <div className="navp__cols" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <ul className="navp__grid">{cards}</ul>
        {kind === "services" ? (
          <div className="navp__strip">
            <span className="navp__strip-k">{L.pricing}</span>
            <a href={local("#pricing")}>
              {L.calc}
              <Arrow />
            </a>
            <span className="navp__strip-end">
              <button type="button" data-navp-swap="cases">
                {L.casesMore} <span aria-hidden="true">→</span>
              </button>
              {about}
            </span>
          </div>
        ) : (
          <div className="navp__strip">
            <span className="navp__chip navp__chip--ex">{nav.example.chip}</span>
            <a href={nav.example.href}>
              {nav.example.name} · {nav.example.who}
              <Arrow />
            </a>
            <span className="navp__strip-end">
              <button type="button" data-navp-swap="services">
                <span aria-hidden="true">←</span> {L.what}
              </button>
              {about}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
