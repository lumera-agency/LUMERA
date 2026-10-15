/*
 * Контакти: the page head (reception.jpg), the booking (a white card on a hairline grid: the steps across its top, the
 * services, the next five working days and a 3 × 2 time grid with one slot taken, a petrol summary that follows the
 * choice; «Записатися» draws a tick and says the request is sent), the contacts (a details list, the week's hours with
 * today in bone) beside our own drawn map with its pin.
 * Rebuilt from the public demos (behaviour only, no code taken):
 *   Meeting Booking Calendar · Kedhareswer Naidu · MIT · 21st.dev/@kedhareswer/components/open-slot-booking — the days
 *     and the slots, the taken one struck through.
 *   Details List · HyperUI · MIT · hyperui.dev/components/application/details-list — the contacts.
 * Round 2: the questions with their image (Blocks.tsx) between the booking and the contacts; on the map the route draws
 *   once, the pin drops in with a small settle and one soft ring.
 * Ported from React Bits (reactbits.dev, David Haz; licence below): Stepper — the four steps across the card, each one's
 *   connector filling (scaleX) as it is done; on phones they stand in a column.
 *
 * ---------------------------------------------------------------------------------------------------------
 * MIT + Commons Clause License Condition v1.0
 *
 * Copyright (c) 2026 David Haz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * ## Commons Clause Restriction
 *
 * You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**
 *
 * ## No Warranty
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * ---------------------------------------------------------------------------------------------------------
 */
import { useEffect, useState } from "react";
import { BUSY, CHIP_SVC, MAIL, TIMES } from "./copy";
import { useEnv } from "./env";
import { Btn, Cond, Hours, Kicker, PageHead, Rail, Status, Tick, ULink } from "./parts";
import { Faq } from "./Blocks";

function Stepper({ labels, cur }: { labels: readonly string[]; cur: number }) {
  return (
    <ol className="cl-stp">
      {labels.map((t, i) => (
        <li key={t} className={`cl-stp__i${i < cur ? " is-done" : ""}${i === cur ? " is-cur" : ""}`}>
          <b className="cl-stp__n">{i < cur ? <Tick /> : i + 1}</b>
          <span className="cl-label">{t}</span>
          {i < labels.length - 1 ? (
            <i className="cl-stp__bar" aria-hidden="true">
              <i />
            </i>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function Booking() {
  const { W, clock, intent, onIntent } = useEnv();
  const C = W.contacts;
  const [svc, setSvc] = useState(intent?.svc ?? 0);
  const [day, setDay] = useState(intent?.day ?? 0);
  const [time, setTime] = useState(intent?.time ?? 1);
  const [cur, setCur] = useState(3);
  const [sent, setSent] = useState(false);
  useEffect(
    () =>
      onIntent((t) => {
        if (t.svc != null) setSvc(t.svc);
        if (t.day != null) setDay(t.day);
        if (t.time != null) setTime(t.time);
        if (t.svc != null || t.day != null || t.time != null) {
          setCur(3);
          setSent(false);
        }
      }),
    [onIntent],
  );
  const [wd, date] = clock.days[day];
  const choose = (f: () => void, next: number) => {
    f();
    setSent(false);
    setCur(next);
  };
  return (
    <section className="cl-sec cl-book" data-sec data-anc="book">
      <Rail n={1} k={C.bookK} h={C.bookH} lead={C.bookLead} />
      <div className="cl-grid">
        <div className="cl-bk" data-rv>
          <Stepper labels={C.steps} cur={sent ? 4 : cur} />
          <div className="cl-bk__col cl-bk__svc">
            <small className="cl-label">{C.fSvc}</small>
            {C.chips.map((x, i) => (
              <span key={x} className={`cl-opt${i === svc ? " is-on" : ""}`} onClick={() => choose(() => setSvc(i), 1)}>
                <i className="cl-opt__box" aria-hidden="true">
                  <Tick />
                </i>
                <span>{x}</span>
                <small>{W.svc[CHIP_SVC[i]].price}</small>
              </span>
            ))}
          </div>
          <div className="cl-bk__col cl-bk__when">
            <small className="cl-label">{C.fDay}</small>
            <div className="cl-days">
              {clock.days.map(([w, d], i) => (
                <span key={`${w}-${d}`} className={`cl-day${i === day ? " is-on" : ""}`} onClick={() => choose(() => setDay(i), 2)}>
                  <small>{W.wd[w]}</small>
                  <b>{d}</b>
                </span>
              ))}
            </div>
            <small className="cl-label">{C.fTime}</small>
            <div className="cl-times">
              {TIMES.map((t, i) =>
                i === BUSY ? (
                  <span key={t} className="cl-time is-busy">
                    <s>{t}</s>
                    <small>{C.busy}</small>
                  </span>
                ) : (
                  <span key={t} className={`cl-time${i === time ? " is-on" : ""}`} onClick={() => choose(() => setTime(i), 3)}>
                    {t}
                  </span>
                ),
              )}
            </div>
          </div>
          <aside className={`cl-bk__sum${sent ? " is-sent" : ""}`}>
            <i className="cl-grain" aria-hidden="true" />
            <small className="cl-label">{C.you}</small>
            <b className="cl-bk__name">{C.chips[svc]}</b>
            <dl className="cl-bk__dl">
              <div>
                <dt className="cl-label">{C.sumPrice}</dt>
                <dd>{W.svc[CHIP_SVC[svc]].price}</dd>
              </div>
              <div>
                <dt className="cl-label">{C.sumWhen}</dt>
                <dd>
                  {W.wd[wd]} {date} · {TIMES[time]}
                </dd>
              </div>
            </dl>
            <div className="cl-bk__fields">
              {C.fields.map(([k, v]) => (
                <span key={k} className="cl-field" onClick={() => setCur(3)}>
                  <small className="cl-label">{k}</small>
                  <span>{v}</span>
                </span>
              ))}
            </div>
            <div className="cl-bk__send">
              <Btn variant="light" className="cl-bk__btn" onClick={() => setSent(true)}>
                {C.send}
              </Btn>
              <span className="cl-bk__ok" aria-hidden={!sent}>
                <i className="cl-bk__tick">
                  <Tick />
                </i>
                <span>
                  <b>{C.sent}</b>
                  <small>{C.sentNote}</small>
                </span>
              </span>
            </div>
            <span className="cl-bk__cond">
              <Cond />
            </span>
          </aside>
        </div>
      </div>
    </section>
  );
}

/** our own map: the quarter's blocks in bone between white streets, the clinic's street and its cross street in petrol,
 *  a square in glaze, the pin with «Ми тут» (drawn round the pin's crossing, turned −12°) */
const BLOCKS = (() => {
  const out: { x: number; y: number; w: number; h: number; park: boolean }[] = [];
  for (let i = -5; i < 5; i++) {
    for (let j = -4; j < 4; j++) {
      out.push({ x: 300 + i * 92 + 6, y: 190 + j * 70 + 6, w: 80, h: 58, park: i === 1 && j === -2 });
    }
  }
  return out;
})();

function MapSvg({ label, street }: { label: string; street: string }) {
  return (
    <svg className="cl-map__svg" viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="600" height="380" className="cl-map__ground" />
      <g transform="rotate(-12 300 190)">
        {BLOCKS.map((b) => (
          <rect key={`${b.x}-${b.y}`} className={b.park ? "cl-map__park" : "cl-map__bl"} x={b.x} y={b.y} width={b.w} height={b.h} rx="4" />
        ))}
        <path className="cl-map__main" d="M-200 190H800" />
        <path className="cl-map__main cl-map__main--b" d="M300 -200V600" />
        <path className="cl-map__route" pathLength={1} d="M116 330V260H208V190H300" />
        <circle className="cl-map__from" cx="116" cy="330" r="5" />
        <text className="cl-map__st" x="330" y="181">
          {street}
        </text>
      </g>
      <g transform="translate(300 190)">
        <circle className="cl-map__ring" r="12" />
        <g className="cl-map__drop">
          <circle className="cl-map__halo" r="24" />
          <circle className="cl-map__pin" r="9" />
          <circle className="cl-map__dot" r="3" />
        </g>
      </g>
      <g transform="translate(268 150)">
        <rect className="cl-map__tag" x={-(label.length * 9 + 22)} y="-15" width={label.length * 9 + 22} height="26" rx="3" />
        <text className="cl-map__lt" x={-(label.length * 9 + 11)} y="3">
          {label}
        </text>
      </g>
    </svg>
  );
}

function Details() {
  const { W } = useEnv();
  const C = W.contacts;
  return (
    <section className="cl-sec cl-con" data-sec data-anc="con">
      <div className="cl-grid cl-con__g">
        <div className="cl-con__l">
          <div data-rv>
            <Kicker n={3}>{C.detailsK}</Kicker>
          </div>
          <dl className="cl-dl" data-rv>
            {C.items.map(([k, v]) => (
              <div key={k}>
                <dt className="cl-label">{k}</dt>
                <dd>{v === MAIL ? <ULink>{v}</ULink> : v}</dd>
              </div>
            ))}
            <div>
              <dt className="cl-label">{C.hoursK}</dt>
              <dd>
                <Status />
                <Hours />
              </dd>
            </div>
          </dl>
        </div>
        <div className="cl-map" data-rv>
          <MapSvg label={C.map} street={C.street} />
          <div className="cl-map__a">
            <Btn>{C.call}</Btn>
            <Btn variant="light">{C.route}</Btn>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Contacts() {
  const { W } = useEnv();
  const C = W.contacts;
  return (
    <>
      <PageHead h={C.h} meta={C.meta} photo="reception" focus="55% 60%" />
      <Booking />
      <Faq />
      <Details />
    </>
  );
}
