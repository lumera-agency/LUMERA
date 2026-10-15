/*
 * Про нас: the page head (room-white.jpg), the four rooms as spines (one open; a click opens another, GSAP grows it once),
 * three principles in ruled columns, four doctors as initials on bone cards with their working days, the review
 * placeholders («Тут буде відгук вашого пацієнта», signed «Ваш пацієнт»), the closing band.
 * Rebuilt from the public demos (behaviour only, no code taken):
 *   Spine Accordion · Crafter UI · MIT · 21st.dev/@crafterui/components/spine-accordion — the rooms.
 *   Team Member Card · Shatlyk1011 · MIT · 21st.dev/@Shatlyk1011/components/team-member-card — the doctors (no faces:
 *     initials; on hover a petrol panel rises with their days).
 *   Single Voice Spotlight Testimonial · Oliver (olewandowski1) · MIT-0 · 21st.dev/@olewandowski1/components/testimonials-2
 *     — the review, without its metrics: two placeholders that cross-fade on «1 / 2».
 * Round 2: the manifesto after the head and «Кабінети зблизька» after the rooms (Blocks.tsx, Editorial.tsx).
 */
import { useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { DOCS, ROOMS } from "./copy";
import { two, useEnv } from "./env";
import { Arrow, Band, Cond, CountUp, Kicker, PageHead, Photo, Rail, ULink } from "./parts";
import { Space } from "./Editorial";
import { Manifesto } from "./Blocks";

type Css = CSSProperties & Record<`--${string}`, string | number>;

function Rooms() {
  const { W, rm } = useEnv();
  const A = W.about;
  const [open, setOpen] = useState(1);
  const list = useRef<HTMLDivElement>(null);
  const pick = (i: number) => {
    if (i === open) return;
    const els = list.current?.querySelectorAll<HTMLElement>(".cl-spine");
    if (els && !rm) {
      gsap.fromTo(els[open], { flexGrow: 1 }, { flexGrow: 0, duration: 0.9, ease: "expo.out", clearProps: "flexGrow" });
      gsap.fromTo(els[i], { flexGrow: 0 }, { flexGrow: 1, duration: 0.9, ease: "expo.out", clearProps: "flexGrow" });
    }
    setOpen(i);
  };
  return (
    <section className="cl-sec cl-rooms" data-sec data-anc="rooms">
      <Rail n={1} k={A.roomsK} h={A.roomsH} />
      <div className="cl-grid cl-rooms__g">
        <div className="cl-rooms__fact" data-rv>
          <b className="cl-num__v">
            <CountUp to={A.roomsFact[0]} />
          </b>
          <span>{A.roomsFact[1]}</span>
          <Cond />
        </div>
        <div className="cl-spines" ref={list} data-rv>
          {ROOMS.map((k, i) => (
            <div key={k} className={`cl-spine${i === open ? " is-open" : ""}`} onClick={() => pick(i)}>
              <Photo k={k} className="cl-spine__ph" />
              <span className="cl-spine__t cl-label">
                <i>{two(i + 1)}</i>
                {A.rooms[i]}
              </span>
              <span className="cl-spine__cap">
                <b>{A.rooms[i]}</b>
                <span className="cl-label">
                  {two(i + 1)} / {two(ROOMS.length)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Principles() {
  const { W } = useEnv();
  const A = W.about;
  return (
    <section className="cl-sec cl-princ" data-sec>
      <div className="cl-grid">
        <div className="cl-rail__k" data-rv>
          <Kicker n={3}>{A.princK}</Kicker>
        </div>
      </div>
      <div className="cl-grid cl-princ__g">
        {A.princ.map(([t, d], i) => (
          <div key={t} className="cl-pr3" data-rv style={{ "--rd": `${i * 90}ms` } as Css}>
            <span className="cl-label">{two(i + 1)}</span>
            <b className="cl-h3">{t}</b>
            <span>{d}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Doctors() {
  const { W, go } = useEnv();
  const A = W.about;
  return (
    <section className="cl-sec cl-docs" data-sec data-anc="docs">
      <Rail n={4} k={A.docsK} h={A.docsH} />
      <div className="cl-grid cl-docs__g">
        {A.docs.map(([role, ini], i) => {
          const d = DOCS[i];
          const book = () => go(3, { to: "book", svc: d.chip });
          return (
            <div key={role} className="cl-doc" data-rv style={{ "--rd": `${i * 80}ms` } as Css} onClick={book}>
              <span className="cl-doc__r cl-label">{role}</span>
              <b className="cl-doc__ini">{ini}</b>
              <div className="cl-doc__wk">
                <small className="cl-label">{A.days}</small>
                <span>
                  {[1, 2, 3, 4, 5, 6].map((w) => (
                    <i key={w} className={d.days.includes(w) ? "is-on" : undefined}>
                      {W.wd[w]}
                    </i>
                  ))}
                </span>
              </div>
              <ULink className="cl-doc__go">{W.cta}</ULink>
              <div className="cl-doc__hov" aria-hidden="true">
                <span className="cl-label">{role}</span>
                <b>
                  {A.days}: {d.days.map((w) => W.wd[w]).join(", ")}
                </b>
                <span className="cl-doc__hb">
                  {W.cta}
                  <Arrow />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Review() {
  const { W } = useEnv();
  const A = W.about;
  const [i, setI] = useState(0);
  const n = A.revCtx.length;
  return (
    <section className="cl-sec cl-rev" data-sec data-anc="rev">
      <div className="cl-grid">
        <div className="cl-rail__k" data-rv>
          <Kicker n={5}>{A.revK}</Kicker>
        </div>
        <div className="cl-rev__b" data-rv>
          <span className="cl-rev__q" aria-hidden="true">
            “
          </span>
          <div className="cl-rev__stack">
            {A.revCtx.map((c, k) => (
              <figure key={c} className={k === i ? "is-on" : undefined}>
                <p className="cl-rev__t">{A.rev}</p>
                <figcaption>
                  <b>{A.revBy}</b>
                  <span className="cl-label">{c}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="cl-rev__nav">
            <span className="cl-rev__btn cl-rev__btn--p" onClick={() => setI((i + n - 1) % n)}>
              <Arrow />
            </span>
            <span className="cl-label">
              {i + 1} / {n}
            </span>
            <span className="cl-rev__btn" onClick={() => setI((i + 1) % n)}>
              <Arrow />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function About() {
  const { W } = useEnv();
  const A = W.about;
  return (
    <>
      <PageHead h={A.h} meta={A.meta} photo="room-white" focus="50% 40%" />
      <Manifesto />
      <Rooms />
      <Space n={2} />
      <Principles />
      <Doctors />
      <Review />
      <Band parts={A.band} btn={W.visit.btn} to={[3, { to: "book", svc: 0 }]} />
    </>
  );
}
