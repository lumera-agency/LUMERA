/*
 * Кошик (spec §4) and the mini-cart drawer. The part: «Кошик» and a Stepper «Кошик · Доставка · Оплата» whose line fills
 * step by step as the form is used; on the left the lines (a 4:5 thumbnail, the glass, a stepper and ×; a line taken to 0
 * folds away), the delivery (outlined choices «У відділення пошти» / «Курʼєром», the fields Імʼя · Телефон · Місто) and
 * the payment («Оплата при отриманні» / «Карткою на сайті»); on the right a hairline box with «Товари (3)», «Доставка: за
 * тарифом перевізника», «Разом» at 2.4cqw (the sums roll) and «Оформити замовлення», which turns into «Замовлення
 * прийнято». The drawer: the whole cart over a white scrim, its lines coming in one after another, the total, «Оформити
 * замовлення» (to the Кошик part) and «Продовжити покупки».
 *
 * Rebuilt from the public demos (behaviour only, no code taken):
 *   Interactive Checkout · Kokonut UI · MIT · 21st.dev/@kokonutd/components/interactive-checkout — the drawer (no fly).
 *   Stagger List · UI Beats (nikhils4) · MIT · uibeats.com/docs — the drawer's lines enter in sequence.
 * Ported from React Bits (reactbits.dev, David Haz; MIT + Commons Clause, the notice is in parts.tsx):
 *   Stepper — <Steps>: the steps' squares fill and the line between them draws as the next one comes.
 */
import { useState } from "react";
import { Btn, Close, Lines, LoadBtn, Minus, Pic, Plus, Roll, Tick, ULink, type Css } from "./parts";
import { useEnv } from "./env";
import { countOf, sumOf, useShop } from "./store";
import { lineKey, PRODUCTS, shotOf, type Line } from "./products";
import { money, plural } from "./copy";

function Steps({ step, done }: { step: number; done: boolean }) {
  const { W } = useEnv();
  return (
    <span className={`sh-steps${done ? " is-done" : ""}`}>
      {W.steps.map((s, i) => (
        <span key={s} className="sh-steps__s">
          {i ? (
            <b className={`sh-steps__l${step >= i || done ? " is-on" : ""}`} aria-hidden="true">
              <i />
            </b>
          ) : null}
          <span className={`sh-steps__i${step >= i || done ? " is-on" : ""}${step === i && !done ? " is-cur" : ""}`}>
            <i>{done ? <Tick /> : i + 1}</i>
            {s}
          </span>
        </span>
      ))}
    </span>
  );
}

function CartLine({ l, i }: { l: Line; i: number }) {
  const { W, lang, later, rm } = useEnv();
  const { cart, showProduct } = useShop();
  const p = PRODUCTS[l.pid];
  const k = lineKey(l);
  const [going, setGoing] = useState(false);
  const drop = () => {
    setGoing(true);
    later(() => cart({ t: "rm", key: k }), rm ? 0 : 420);
  };
  return (
    <div className={`sh-line${going ? " is-going" : ""}`} style={{ "--i": i } as Css}>
      <div className="sh-line__in">
        <span className="sh-line__ph sh-well" onClick={() => showProduct(l.pid, l.col, true)}>
          <Pic shot={shotOf(p, l.col)} />
        </span>
        <span className="sh-line__t">
          <b onClick={() => showProduct(l.pid, l.col, true)}>{p.name[lang]}</b>
          <span className="sh-meta">
            {W.cols[l.col]} · {money(p.price)}
          </span>
        </span>
        <span className="sh-step">
          <span onClick={() => (l.qty <= 1 ? drop() : cart({ t: "qty", key: k, qty: l.qty - 1 }))}>
            <Minus />
          </span>
          <b>
            <Roll v={l.qty} />
          </b>
          <span onClick={() => cart({ t: "qty", key: k, qty: l.qty + 1 })}>
            <Plus />
          </span>
        </span>
        <b className="sh-line__s">
          <Roll v={money(p.price * l.qty)} />
        </b>
        <span className="sh-x sh-line__x" onClick={drop}>
          <Close />
        </span>
      </div>
    </div>
  );
}

export function CartPage() {
  const { W, go } = useEnv();
  const { lines } = useShop();
  const [step, setStep] = useState(0);
  const [ship, setShip] = useState(0);
  const [pay, setPay] = useState(0);
  const [field, setField] = useState(-1);
  const [done, setDone] = useState(false);
  const n = countOf(lines);
  const sum = sumOf(lines);
  const up = (s: number) => setStep((x) => Math.max(x, s));
  return (
    <section className="sh-part sh-cartp" data-sec data-part="cart">
      <div className="sh-crumbs sh-meta" data-rv>
        <span className="sh-crumb" onClick={() => go("catalog")}>
          {W.catalog}
        </span>
        <i>/</i>
        <span>{W.cart}</span>
      </div>
      <div className="sh-cartp__h">
        <Lines className="sh-ph1" lines={[W.cart]} />
        <span data-rv>
          <Steps step={step} done={done} />
        </span>
      </div>
      <div className="sh-cartp__g">
        <div className="sh-cartp__l">
          <div className="sh-lines2" data-rv>
            {lines.map((l, i) => (
              <CartLine key={lineKey(l)} l={l} i={i} />
            ))}
            {n ? null : (
              <p className="sh-cartp__empty">
                {W.emptyCart} · <ULink onClick={() => go("catalog")}>{W.toCat}</ULink>
              </p>
            )}
          </div>
          <div className="sh-blk" data-rv>
            <span className="sh-blk__h">{W.delivery}</span>
            <div className="sh-radios">
              {[W.post, W.courier].map((x, i) => (
                <span
                  key={x}
                  className={`sh-radio${ship === i ? " is-on" : ""}`}
                  onClick={() => {
                    setShip(i);
                    up(1);
                  }}
                >
                  <i />
                  {x}
                </span>
              ))}
            </div>
            <div className="sh-fields">
              {W.fields.map(([a, b], i) => (
                <span
                  key={a}
                  className={`sh-field${field === i ? " is-focus" : ""}`}
                  onClick={() => {
                    setField(i);
                    up(1);
                  }}
                >
                  <small>{a}</small>
                  <span>{b}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="sh-blk" data-rv>
            <span className="sh-blk__h">{W.pay}</span>
            <div className="sh-radios">
              {[W.payCod, W.payCard].map((x, i) => (
                <span
                  key={x}
                  className={`sh-radio${pay === i ? " is-on" : ""}`}
                  onClick={() => {
                    setPay(i);
                    up(2);
                  }}
                >
                  <i />
                  {x}
                </span>
              ))}
            </div>
          </div>
        </div>
        <aside className="sh-sum" data-rv data-sum style={{ "--rd": "120ms" } as Css}>
          <div className="sh-sum__r">
            <span>
              {W.goods} (<Roll v={n} />)
            </span>
            <b>
              <Roll v={money(sum)} />
            </b>
          </div>
          <div className="sh-sum__r">
            <span>{W.delivery}</span>
            <span className="sh-meta">{W.tariff}</span>
          </div>
          <div className="sh-sum__t">
            <span>{W.total}</span>
            <b>
              <Roll v={money(sum)} />
            </b>
          </div>
          <LoadBtn
            className="sh-sum__go"
            stay
            done={W.ordered}
            action={() => {
              setDone(true);
              setStep(2);
            }}
          >
            {W.order}
          </LoadBtn>
        </aside>
      </div>
    </section>
  );
}

/** the mini-cart (Interactive Checkout): the whole cart over the scrim */
export function Drawer() {
  const { W, lang, go } = useEnv();
  const { lines, drawer, setDrawer, justAdded } = useShop();
  const n = countOf(lines);
  return (
    <div className={`sh-drawer${drawer ? " is-open" : ""}`} aria-hidden="true">
      <i className="sh-drawer__scrim" onClick={() => setDrawer(false)} />
      <aside className="sh-drawer__p">
        <div className="sh-drawer__h">
          <b>{W.cart}</b>
          <span className="sh-meta">{plural(n, W.items)}</span>
          <span className="sh-x" onClick={() => setDrawer(false)}>
            <Close />
          </span>
        </div>
        <div className="sh-drawer__ls">
          {lines.map((l, i) => {
            const p = PRODUCTS[l.pid];
            return (
              <div key={lineKey(l)} className={`sh-dl${justAdded === lineKey(l) ? " is-new" : ""}`} style={{ "--i": i } as Css}>
                <span className="sh-dl__ph sh-well">
                  <Pic shot={shotOf(p, l.col)} />
                </span>
                <span className="sh-dl__t">
                  {justAdded === lineKey(l) ? (
                    <span className="sh-ok sh-label">
                      <Tick />
                      {W.added}
                    </span>
                  ) : null}
                  <b>{p.name[lang]}</b>
                  <span className="sh-meta">
                    {W.cols[l.col]} · {l.qty} × {money(p.price)}
                  </span>
                </span>
                <b className="sh-dl__s">{money(p.price * l.qty)}</b>
              </div>
            );
          })}
          {n ? null : <p className="sh-meta">{W.emptyCart}</p>}
        </div>
        <div className="sh-drawer__f" style={{ "--i": lines.length } as Css}>
          <div className="sh-sum__t">
            <span>{W.total}</span>
            <b>
              <Roll v={money(sumOf(lines))} />
            </b>
          </div>
          <Btn
            className="sh-btn--full"
            arrow
            onClick={() => {
              setDrawer(false);
              go("cart");
            }}
          >
            {W.order}
          </Btn>
          <Btn ghost className="sh-btn--full" onClick={() => setDrawer(false)}>
            {W.goOn}
          </Btn>
        </div>
      </aside>
    </div>
  );
}
