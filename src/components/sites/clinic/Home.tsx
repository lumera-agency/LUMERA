/*
 * Головна: the first screen «Шов» (a petrol panel and the orange chair's photo side by side; the headline's italic line
 * crosses the seam into the photo), the facts rail, «Що вас турбує?», the numbers, the site's sections as three doors, the
 * first visit on a petrol band.
 * Rebuilt from the public demos (behaviour only, no code taken):
 *   Editorial service list · Waqar H. Syed · MIT · 21st.dev/@ibrandify/components/editorial-service-list — the worries:
 *     numbered rows that shift on hover; one row is open at a time (so the page never changes height).
 * Round 2 (the owner: «designed, not just a site»): «Клініка зсередини» (Editorial.tsx) after the numbers, the first visit
 * as a pinned process (Blocks.tsx); the doors come in from their sides; each number's hairline draws with its count.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SERVICES, WORRY } from "./copy";
import { two, useEnv, useIn } from "./env";
import { Arrow, Btn, Cond, CountUp, Kicker, Lx, Photo, Rail, ULink } from "./parts";
import { Pocket } from "./Pocket";
import { Inside } from "./Editorial";
import { Process } from "./Blocks";

type Css = CSSProperties & Record<`--${string}`, string | number>;

function Hero() {
  const { W, E, clock, go } = useEnv();
  const H = W.hero;
  const [wd, date] = clock.days[0];
  return (
    <section className="cl-hero" data-sec>
      <div className="cl-hero__panel">
        <i className="cl-grain" aria-hidden="true" />
        <div className="cl-hero__ph">
          <Photo k="hero" focus="45% 55%" className="cl-hero__pic" eager />
          <i className="cl-hero__veil" aria-hidden="true" />
          <span className="cl-hero__cap cl-label">{H.caption}</span>
        </div>
        <span className="cl-hero__eye cl-label">
          <Lx a={W.label} b={E?.label} />
        </span>
        <h1 className="cl-hero__h">
          {H.lines.map((l, i) => (
            <span key={l} className={`cl-ln cl-hero__l cl-hero__l${i + 1}`} style={{ "--i": i } as Css}>
              <span className="cl-ln__i">{i === 2 ? <em className="cl-key"><Lx a={l} b={E?.hero.lines[i]} /></em> : <Lx a={l} b={E?.hero.lines[i]} />}</span>
            </span>
          ))}
        </h1>
        <div className="cl-hero__row">
          <p className="cl-hero__sub">
            <Lx a={H.sub} b={E?.hero.sub} />
          </p>
          <Pocket />
        </div>
        <div className="cl-hero__cta">
          <Btn variant="light" onClick={() => go(3, { to: "book" })}>
            <Lx a={H.btn} b={E?.hero.btn} />
          </Btn>
          <ULink className="cl-ul--d" onClick={() => go(1)}>
            <Lx a={H.link} b={E?.hero.link} />
          </ULink>
        </div>
        <div className="cl-hero__tile" onClick={() => go(3, { to: "book", day: 0, time: 1 })}>
          <span className="cl-hero__slot">
            <small className="cl-label">{H.slot}</small>
            <b>
              {W.wd[wd]} {date} · 11:00
            </b>
          </span>
          <span className="cl-hero__go" aria-hidden="true">
            <Arrow />
          </span>
        </div>
      </div>
    </section>
  );
}

function Facts() {
  const { W } = useEnv();
  return (
    <section className="cl-facts" data-sec>
      <div className="cl-grid">
        {W.facts.map(([k, v], i) => (
          <div key={k} className="cl-fact" data-rv style={{ "--rd": `${i * 70}ms` } as Css}>
            <small className="cl-label">{k}</small>
            <b>
              {v.split(" · ").map((x, j) => (
                <span key={x}>
                  {j ? " · " : null}
                  {x}
                </span>
              ))}
            </b>
          </div>
        ))}
      </div>
    </section>
  );
}

function Worries() {
  const { W, armed, user, onUser, go } = useEnv();
  const T = W.worries;
  // one row is always open (the list keeps its height); the tour's demo opens «Болить зуб» once
  const [open, setOpen] = useState(armed ? 5 : 0);
  const ref = useRef<HTMLElement>(null);
  const touched = useRef(false);
  const timer = useRef(0);
  useEffect(() => {
    onUser(() => {
      touched.current = true;
    });
    return () => clearTimeout(timer.current);
  }, [onUser]);
  useIn(ref, ({ animate, delay }) => {
    if (!animate) return;
    timer.current = window.setTimeout(() => {
      if (!touched.current && !user()) setOpen(0);
    }, 1700 + delay);
  });
  const pick = (i: number) => {
    touched.current = true;
    setOpen(i);
  };
  return (
    <section className="cl-sec cl-wor" data-sec data-anc="worries" ref={ref}>
      <Rail n={1} k={T.k} h={T.h} lead={T.lead} />
      <div className="cl-grid">
        <ol className="cl-wor__list" data-rv>
          {T.list.map((t, i) => {
            const si = WORRY[i].svc;
            const s = W.svc[si];
            return (
              <li key={t} className={`cl-wo${i === open ? " is-open" : ""}`}>
                <div className="cl-wo__row" onClick={() => pick(i)}>
                  <span className="cl-wo__n cl-label">{two(i + 1)}</span>
                  <span className="cl-wo__t">{t}</span>
                  <span className="cl-wo__s cl-label">{s.name}</span>
                  <i className="cl-wo__x" aria-hidden="true" />
                </div>
                <div className="cl-wo__b">
                  <div className="cl-wo__in">
                    <Photo k={WORRY[i].photo} className="cl-wo__ph" />
                    <div className="cl-wo__d">
                      <div className="cl-wo__top">
                        <b className="cl-h3">{s.name}</b>
                        <Cond />
                      </div>
                      <p className="cl-wo__p">{s.desc}</p>
                      <dl className="cl-wo__data">
                        <div>
                          <dt className="cl-label">{T.price}</dt>
                          <dd>{s.price}</dd>
                        </div>
                        <div>
                          <dt className="cl-label">{T.visits}</dt>
                          <dd>{s.visits}</dd>
                        </div>
                        <div>
                          <dt className="cl-label">{T.time}</dt>
                          <dd>{s.time}</dd>
                        </div>
                      </dl>
                      <div className="cl-wo__a">
                        <Btn onClick={() => go(3, { to: "book", svc: SERVICES[si].chip })}>{T.book}</Btn>
                        <ULink onClick={() => go(1, { to: "prices", row: si })}>{T.all}</ULink>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function Numbers() {
  const { W } = useEnv();
  return (
    <section className="cl-sec cl-nums" data-sec>
      <div className="cl-grid cl-nums__top">
        <div className="cl-rail__k" data-rv>
          <Kicker n={2}>{W.numbers.k}</Kicker>
        </div>
        <div className="cl-nums__c" data-rv>
          <Cond />
        </div>
      </div>
      <div className="cl-grid cl-nums__row">
        {W.numbers.list.map(([n, l], i) => (
          <div key={l} className="cl-num" data-rv style={{ "--rd": `${i * 90}ms` } as Css}>
            <b className="cl-num__v">
              <CountUp to={n} from={n === "2014" ? 1990 : 0} delay={0.2 + i * 0.12} />
            </b>
            <i className="cl-num__line" aria-hidden="true" style={{ "--cd": `${200 + i * 120}ms` } as Css} />
            <span>{l}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const DOORS = [
  { k: "mirror", f: "72% 50%", d: "l" },
  { k: "room-white", f: "50% 40%", d: "u" },
  { k: "reception", f: "55% 60%", d: "r" },
] as const;

function Doors() {
  const { W, go } = useEnv();
  return (
    <section className="cl-sec cl-doors" data-sec>
      <Rail n={4} k={W.doors.k} h={W.doors.h} />
      <div className="cl-grid cl-doors__g">
        {W.doors.list.map(([t, d], i) => (
          <div key={t} className="cl-door" data-dir={DOORS[i].d} style={{ "--k": i } as Css} onClick={() => go(i + 1)}>
            <Photo k={DOORS[i].k} focus={DOORS[i].f} className="cl-door__ph" />
            <div className="cl-door__txt">
              <i className="cl-door__panel" aria-hidden="true" />
              <span className="cl-label">{two(i + 2)}</span>
              <b className="cl-h3">{t}</b>
              <span className="cl-door__d">{d}</span>
              <Arrow className="cl-ar cl-door__ar" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Home() {
  return (
    <>
      <Hero />
      <Facts />
      <Worries />
      <Numbers />
      <Inside />
      <Doors />
      <Process />
    </>
  );
}
