"use client";
/*
 * The panels under «Послуги» and «Кейси» (the header and the topbar): four columns, one card each. Services: the
 * picture, the name, the page's sections (the formats with their prices, the cases) as plain text, the «від» price; the
 * whole card is one link to the service's page (the owner, 5 Nov 2026: the sections are not links of their own). Cases:
 * the chip, the figure with its key, who it is for and the honest sentence. The strip under them leads on: the
 * calculator, the other panel, «Про нас».
 * Hidden until opened (disclosure.ts animates them).
 */
import { usePathname } from "@/i18n/navigation";
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
          const ids = `${id}-${s.n}`;
          const current = s.path === path;
          return (
            <li key={s.n}>
              <a className="navp__card" href={s.href} data-current={current ? "" : undefined} aria-current={current ? "page" : undefined} aria-labelledby={`${ids}-name`} aria-describedby={s.subs.length ? undefined : `${ids}-desc`}>
                <span className="navp__in">
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
                  {/* the page's sections: what is there, not links (the card leads to the page) */}
                  {s.subs.length > 0 ? (
                    <span className="navp__subs" aria-hidden="true">
                      {s.subs.map((sub) => (
                        <span className="navp__sub" key={sub.text}>
                          <span data-line="">
                            <span>{sub.text}</span>
                            {sub.price ? <b>{sub.price}</b> : sub.tag ? <i className="navp__tag">{sub.tag}</i> : null}
                          </span>
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="navp__desc" id={`${ids}-desc`}>
                      <span data-line="">{s.desc}</span>
                    </span>
                  )}
                  <span className="navp__foot">
                    <span data-line="">
                      {s.price ? <span className="navp__price">{s.price}</span> : <span />}
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
      {/* a dark column per card (three services for now, four cases) */}
      <div className="navp__frame" style={{ "--navp-n": cards.length } as React.CSSProperties}>
        <div className="navp__cols" aria-hidden="true">
          {cards.map((_card, index) => (
            <i key={index} />
          ))}
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
            <span className="navp__chip">{nav.assistant.chip}</span>
            <a href={nav.assistant.href}>
              {nav.assistant.name}
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
