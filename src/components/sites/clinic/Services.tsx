/*
 * Послуги: the page head (mirror.jpg as a letterbox), three popular visits side by side (the middle one in petrol), all
 * the prices (categories over a ruled table whose rows open; on a desktop a small photo follows the pointer down the
 * rows), the treatment's four steps on one hairline, the closing band.
 * Rebuilt from the public demos (behaviour only, no code taken):
 *   Comparison Table · Mohammad Shehadeh · MIT · 21st.dev/@mohammadshehadeh/components/comparison-02 — the three visits.
 *   Segmented radio · chase2k25 · MIT · uiverse.io/chase2k25/slimy-chipmunk-97 — the price categories (a glider slides
 *     under the chosen one).
 *   Outline Accordion · Sean Hello · MIT · 21st.dev/@sean0205/components/outline-accordion — the price rows.
 * Round 2: the contact sheet between the visits and the prices (Editorial.tsx), the treatment's steps as stacking cards
 * (Blocks.tsx).
 */
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { PH, two, useEnv } from "./env";
import { SERVICES, VISITS } from "./copy";
import { Band, Btn, Cond, PageHead, Rail, Tick } from "./parts";
import { Strip } from "./Editorial";
import { Stack } from "./Blocks";


function Compare() {
  const { W, go } = useEnv();
  const S = W.services;
  return (
    <section className="cl-sec cl-cmp" data-sec data-anc="visits">
      <Rail n={1} k={S.compareK} h={S.compareH} aside={<Cond />} />
      <div className="cl-grid">
        <div className="cl-cmp__t" data-rv>
          <div className="cl-cmp__lab" aria-hidden="true">
            <span />
            {S.rows.map((r) => (
              <span key={r} className="cl-label">
                {r}
              </span>
            ))}
            <span />
          </div>
          {VISITS.map((si, c) => {
            const s = W.svc[si];
            const col = S.cols[c];
            return (
              <div key={si} className={`cl-cmp__col${c === 1 ? " is-feat" : ""}`}>
                <div className="cl-cmp__hd">
                  <span className="cl-label">{col.tag}</span>
                  <b className="cl-h3">{s.name}</b>
                </div>
                <ul className="cl-cmp__c cl-cmp__incl" data-l={S.rows[0]}>
                  {col.incl.map((x) => (
                    <li key={x}>
                      <Tick />
                      {x}
                    </li>
                  ))}
                </ul>
                <div className="cl-cmp__c" data-l={S.rows[1]}>
                  {s.time}
                </div>
                <div className="cl-cmp__c" data-l={S.rows[2]}>
                  {col.visits}
                </div>
                <div className="cl-cmp__c cl-cmp__p" data-l={S.rows[3]}>
                  {s.price}
                </div>
                <div className="cl-cmp__go">
                  <Btn variant={c === 1 ? "light" : "dark"} onClick={() => go(3, { to: "book", svc: SERVICES[si].chip })}>
                    {W.worries.book}
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** the categories: a segmented control, its glider under the chosen one (transform only) */
function Segmented({ items, value, onChange }: { items: readonly string[]; value: number; onChange: (i: number) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const glider = useRef<HTMLElement>(null);
  const first = useRef(true);
  useLayoutEffect(() => {
    const place = () => {
      const on = box.current?.querySelector<HTMLElement>(`[data-c="${value}"]`);
      const g = glider.current;
      if (!on || !g) return;
      g.style.transform = `translateX(${on.offsetLeft}px) scaleX(${on.offsetWidth / 100})`;
    };
    place();
    if (first.current) {
      first.current = false;
      document.fonts?.ready.then(place);
    }
  }, [value]);
  return (
    <div className="cl-seg" ref={box}>
      <i className="cl-seg__g" ref={glider} aria-hidden="true" />
      {items.map((x, i) => (
        <span key={x} data-c={i} className={`cl-seg__i${i === value ? " is-on" : ""}`} onClick={() => onChange(i)}>
          {x}
        </span>
      ))}
    </div>
  );
}

function Prices() {
  const { W, intent, onIntent, go } = useEnv();
  const S = W.services;
  const [cat, setCat] = useState(0);
  const [open, setOpen] = useState(intent?.row ?? 0);
  const box = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const shown = useRef(-1);
  useEffect(
    () =>
      onIntent((t) => {
        if (t.row == null) return;
        setCat(0);
        setOpen(t.row);
      }),
    [onIntent],
  );
  // a desktop: a small photo of the service follows the pointer down the rows (opacity and translate only)
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !box.current || !thumb.current || !img.current) return;
    const row = (e.target as Element).closest<HTMLElement>("[data-i]");
    if (!row) {
      thumb.current.classList.remove("is-on");
      return;
    }
    const i = Number(row.dataset.i);
    if (i !== shown.current) {
      shown.current = i;
      img.current.src = `${PH}${SERVICES[i].photo}.jpg`;
    }
    const r = box.current.getBoundingClientRect();
    thumb.current.style.transform = `translate(${e.clientX - r.left + 18}px, ${e.clientY - r.top - 40}px)`;
    thumb.current.classList.add("is-on");
  };
  const leave = () => thumb.current?.classList.remove("is-on");
  return (
    <section className="cl-sec cl-prices" data-sec data-anc="prices">
      <Rail n={2} k={S.pricesK} h={S.pricesH} aside={<Cond />} />
      <div className="cl-grid">
        <div className="cl-prices__w" data-rv>
          <Segmented
            items={S.cats}
            value={cat}
            onChange={(c) => {
              setCat(c);
              const firstShown = W.svc.findIndex((_, i) => c === 0 || SERVICES[i].cat === c);
              if (open < 0 || (c !== 0 && SERVICES[open]?.cat !== c)) setOpen(firstShown);
            }}
          />
          <div className="cl-pt" ref={box} onPointerMove={move} onPointerLeave={leave}>
            <div className="cl-pt__head cl-label">
              <span>№</span>
              <span>{S.head[0]}</span>
              <span>{S.head[1]}</span>
              <span>{S.head[2]}</span>
              <span />
            </div>
            {W.svc.map((s, i) =>
              cat === 0 || SERVICES[i].cat === cat ? (
                <div key={s.name} className={`cl-pr${open === i ? " is-open" : ""}`} data-i={i}>
                  <div className="cl-pr__row" onClick={() => setOpen(open === i ? -1 : i)}>
                    <span className="cl-label">{two(i + 1)}</span>
                    <b className="cl-pr__n">{s.name}</b>
                    <span className="cl-pr__p">{s.price}</span>
                    <span className="cl-pr__v">{s.visits}</span>
                    <i className="cl-pr__x" aria-hidden="true" />
                  </div>
                  <div className="cl-pr__b">
                    <div className="cl-pr__in">
                      <p>{s.desc}</p>
                      <span className="cl-label">{s.time}</span>
                      <Btn onClick={() => go(3, { to: "book", svc: SERVICES[i].chip })}>{W.worries.book}</Btn>
                    </div>
                  </div>
                </div>
              ) : null,
            )}
            <div className="cl-pt__thumb" ref={thumb} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element -- a 6cqw thumbnail inside the sample */}
              <img ref={img} alt="" decoding="async" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Services() {
  const { W } = useEnv();
  const S = W.services;
  return (
    <>
      <PageHead h={S.h} meta={S.meta} photo="mirror" focus="72% 50%" />
      <Compare />
      <Strip />
      <Prices />
      <Stack />
      <Band parts={S.band} btn={S.bandBtn} to={[3, { to: "con" }]} />
    </>
  );
}
