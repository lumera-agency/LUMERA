/* eslint-disable @next/next/no-img-element -- the sample's own photos inside the frame (fixed boxes, no next/image) */
/*
 * The clinic's designed blocks of round 2 (the owner: «make the site feel fully designed and full»). Own components, no
 * third-party code. The sample's page moves by a translate (never a native scroll), so «sticky» is done here: loop.ts runs
 * a rAF loop only while the block is in the frame and the page is moving, and writes transforms.
 *   Process (Головна, the first visit): the image on the left stays pinned while the three steps pass on the right; the
 *     step nearest the frame's middle lights up and the image cross-fades to its photo (opacity + a slight scale).
 *     Phones: no pin, each step carries its own photo.
 *   Stack (Послуги, the treatment's steps): four cards that stick under the header one after another and stack, the ones
 *     underneath easing back (scale 1 → 0.955 per card on top).
 *   Manifesto (Про нас): the first screen's own sentence set large, with small round photos inside the line; the words
 *     rise one after another, the photos open from their centre.
 *   Faq (Контакти): the questions, one open at a time; the image beside them changes with the open question.
 * Reduced motion: no loop (the image stands at its place, the cards in their column), the final frame of every entrance.
 */
import { useRef, useState, type CSSProperties } from "react";
import { FAQ_PICS, MANI_PICS, PROC, STACK } from "./copy";
import { PH, two, useEnv } from "./env";
import { useMoveLoop } from "./loop";
import { Btn, Cond, Rail } from "./parts";

type Css = CSSProperties & Record<`--${string}`, string | number>;

function Pic({ k, f, eager = false }: { k: string; f: string; eager?: boolean }) {
  const { phone } = useEnv();
  return <img src={`${PH}${phone ? "m/" : ""}${k}.jpg`} alt="" decoding="async" loading={phone && !eager ? "lazy" : undefined} style={{ objectPosition: f }} />;
}

/** the bottom of the sample's header as it stands now (the info bar folds away) */
const headerBottom = (from: Element | null, v: DOMRect, cq: number) => {
  const bar = from?.closest(".pv-site")?.querySelector(".cl-bar");
  return bar ? bar.getBoundingClientRect().bottom : v.top + 8 * cq;
};

export function Process() {
  const { W, phone, rm, vp, go } = useEnv();
  const V = W.visit;
  const ref = useRef<HTMLElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const cur = useRef(0);
  useMoveLoop(
    ref,
    vp,
    (v, cq) => {
      const sec = ref.current;
      const a = area.current;
      const p = pin.current;
      if (!sec || !a || !p) return;
      const r = a.getBoundingClientRect();
      const top = headerBottom(sec, v, cq) + 3 * cq;
      const off = Math.max(0, Math.min(r.height - p.offsetHeight, top - r.top));
      p.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
      const line = v.top + v.height * 0.56;
      const steps = sec.querySelectorAll<HTMLElement>(".cl-proc__s");
      let k = 0;
      steps.forEach((s, i) => {
        if (s.getBoundingClientRect().top < line) k = i;
      });
      if (k === cur.current) return;
      cur.current = k;
      steps.forEach((s, i) => s.classList.toggle("is-on", i === k));
      p.querySelectorAll(".cl-proc__layer").forEach((l, i) => l.classList.toggle("is-on", i === k));
      const no = p.querySelector(".cl-proc__no b");
      if (no) no.textContent = two(k + 1);
    },
    !phone && !rm,
  );
  return (
    <section className="cl-sec cl-proc" data-sec data-anc="visit" ref={ref}>
      <div className="cl-proc__in">
        <i className="cl-grain" aria-hidden="true" />
        <Rail
          n={5}
          k={V.k}
          h={V.h}
          lead={V.lead}
          aside={
            <Btn variant="light" onClick={() => go(3, { to: "book", svc: 0 })}>
              {V.btn}
            </Btn>
          }
        />
        <div className="cl-grid cl-proc__g">
          <div className="cl-proc__area" ref={area}>
            <div className="cl-proc__pin" ref={pin}>
              <div className="cl-proc__media" data-dir="l" style={{ "--k": 0 } as Css}>
                {PROC.map((d, i) => (
                  <div key={d.k} className={`cl-proc__layer${i ? "" : " is-on"}`}>
                    <Pic k={d.k} f={d.f} />
                  </div>
                ))}
                <i className="cl-ph__cur" aria-hidden="true" />
                <span className="cl-proc__no cl-label">
                  <b>01</b> / {two(PROC.length)}
                </span>
              </div>
            </div>
          </div>
          <ol className="cl-proc__steps">
            {V.steps.map(([t, d], i) => (
              <li key={t} className={`cl-proc__s${i ? "" : " is-on"}`} data-rv data-mv style={{ "--rd": `${i * 120}ms` } as Css}>
                <span className="cl-proc__n">{two(i + 1)}</span>
                <b className="cl-h3">{t}</b>
                <span className="cl-proc__d">{d}</span>
                <span className="cl-proc__pic">
                  <Pic k={PROC[i].k} f={PROC[i].f} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Stack() {
  const { W, vp, rm } = useEnv();
  const S = W.services;
  const ref = useRef<HTMLElement>(null);
  useMoveLoop(
    ref,
    vp,
    (v, cq) => {
      const sec = ref.current;
      if (!sec) return;
      const slots = [...sec.querySelectorAll<HTMLElement>(".cl-stk__slot")];
      const n = slots.length;
      if (!n) return;
      const step = 2.2 * cq;
      const base = headerBottom(sec, v, cq) + 3 * cq;
      const tops = slots.map((s) => s.getBoundingClientRect().top);
      const h = slots[0].offsetHeight || 1;
      const offs = tops.map((t, i) => Math.max(0, Math.min(tops[n - 1] - t - (n - 1 - i) * step, base + i * step - t)));
      const q = tops.map((t, j) => Math.max(0, Math.min(1, 1 - (t + offs[j] - (base + j * step)) / h)));
      slots.forEach((s, i) => {
        let cover = 0;
        for (let j = i + 1; j < n; j++) cover += q[j];
        const card = s.firstElementChild as HTMLElement | null;
        if (card) card.style.transform = `translate3d(0, ${offs[i].toFixed(1)}px, 0) scale(${(1 - 0.045 * cover).toFixed(4)})`;
      });
    },
    !rm,
  );
  return (
    <section className="cl-sec cl-stk" data-sec data-anc="steps" ref={ref}>
      <Rail n={3} k={S.stepsK} h={S.stepsH} />
      <div className="cl-grid">
        <div className="cl-stk__list">
          {S.steps.map(([t, d], i) => (
            <div key={t} className="cl-stk__slot" data-rv data-mv style={{ "--rd": `${i * 110}ms`, zIndex: i + 1 } as Css}>
              <article className={`cl-stk__card cl-stk__card--${i + 1}`}>
                <div className="cl-stk__txt">
                  <span className="cl-label">
                    {W.step} {two(i + 1)} / {two(S.steps.length)}
                  </span>
                  <b className="cl-stk__n">{two(i + 1)}</b>
                  <b className="cl-h3">{t}</b>
                  <p>{d}</p>
                </div>
                <div className="cl-stk__ph" data-dir="r" style={{ "--k": i } as Css}>
                  <Pic k={STACK[i].k} f={STACK[i].f} />
                  <i className="cl-ph__cur" aria-hidden="true" />
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Manifesto() {
  const { W } = useEnv();
  const M = W.manifesto;
  const toks = M.text.split(" ");
  return (
    <section className="cl-sec cl-mani" data-sec>
      <div className="cl-grid">
        <span className="cl-kick cl-mani__k" data-rv>
          <b>—</b>
          <span>{M.k}</span>
        </span>
        <p className="cl-mani__t">
          {toks.map((t, i) => {
            const pic = /^\[(\d)\]$/.exec(t);
            const key = /^\*(.+)\*$/.exec(t);
            const d = pic ? MANI_PICS[Number(pic[1])] : null;
            return (
              <span key={i}>
                {d ? (
                  <span className="cl-mani__pill" style={{ "--i": i } as Css}>
                    <Pic k={d.k} f={d.f} />
                  </span>
                ) : (
                  <span className="cl-mw" style={{ "--i": i } as Css}>
                    <span className={`cl-mw__i${key ? " cl-key" : ""}`}>{key ? key[1] : t}</span>
                  </span>
                )}{" "}
              </span>
            );
          })}
        </p>
      </div>
    </section>
  );
}

export function Faq() {
  const { W } = useEnv();
  const F = W.faq;
  const [open, setOpen] = useState(0);
  const [pic, setPic] = useState(0);
  const toggle = (i: number) => {
    setOpen(i === open ? -1 : i);
    setPic(i);
  };
  return (
    <section className="cl-sec cl-faq" data-sec data-anc="faq">
      <Rail n={2} k={F.k} h={F.h} aside={<Cond />} />
      <div className="cl-grid cl-faq__g">
        <div className="cl-faq__media" data-dir="l" style={{ "--k": 0 } as Css}>
          {FAQ_PICS.map((d, i) => (
            <div key={d.k} className={`cl-faq__layer${i === pic ? " is-on" : ""}`}>
              <Pic k={d.k} f={d.f} />
            </div>
          ))}
          <i className="cl-ph__cur" aria-hidden="true" />
          <span className="cl-faq__no cl-label">
            {two(pic + 1)} / {two(F.list.length)}
          </span>
        </div>
        <ol className="cl-faq__list" data-rv>
          {F.list.map(([q, a], i) => (
            <li key={q} className={`cl-faq__q${i === open ? " is-open" : ""}`}>
              <div className="cl-faq__row" onClick={() => toggle(i)}>
                <span className="cl-label">{two(i + 1)}</span>
                <b>{q}</b>
                <i className="cl-pr__x" aria-hidden="true" />
              </div>
              <div className="cl-faq__b">
                <div className="cl-faq__in">
                  <p>{a}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
