"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowIcon } from "@/components/ui/icons/ArrowIcon";
import { useReducedMotion } from "@/lib/hooks";
import { LANDING, PRODUCTS, PRODUCT_ORDER, usd, weeksText, type Product } from "./prices";

type Site = "existing" | "landing";

/** The words the calculator shows, in the page's language (Calc.tsx reads them on the server). */
export type PriceCopy = {
  lang: "uk" | "ru";
  g1: string;
  g3: string;
  products: Record<Product, { t: string; d: string }>;
  from: string; // «від {sum}»
  after: string; // «після аудиту»
  extra: string; // «+ після аудиту: {what}»
  monthly: string; // «+ $90/міс супровід, перші 3 місяці входять у ціну»
  site: { has: string; hasD: string; hasP: string; need: string; needD: string; name: string };
  k: string;
  once: string;
  noteExisting: string;
  audit: string;
  send: string;
  fine: string;
  tol: string;
};

const fill = (pattern: string, values: Record<string, string>) => pattern.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? "");

/**
 * The price calculator (the owner, 21 Oct 2026: «калькулятор ціни відповідає на "скільки"»), on the page's own lineup
 * (offer.ts): one product, a site or a landing. The sum, «від» when the product's volume varies, the weeks (the
 * product's, plus the landing's when one is built, as the main page's engine adds them), the assistant's monthly
 * support. «Надіслати розрахунок» puts it into the form as its plan (the main page's form: package and details).
 */
export function PriceCalcForm({ copy }: { copy: PriceCopy }) {
  const [product, setProduct] = useState<Product>("search");
  const [site, setSite] = useState<Site>("existing");
  const [focus, setFocus] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const priceRef = useRef<HTMLElement>(null);
  const first = useRef(true);
  const [said, setSaid] = useState(""); // what the screen reader hears after a change (nothing on load)

  const r = useMemo(() => {
    const p = PRODUCTS[product];
    const name = copy.products[product].t;
    const landing = site === "landing";
    const sum = (p.price ?? 0) + (landing ? LANDING.price : 0);
    const lower = name.charAt(0).toLocaleLowerCase(copy.lang) + name.slice(1);
    const priceText = sum > 0 ? (p.from ? fill(copy.from, { sum: usd(sum) }) : usd(sum)) : copy.after;
    const weeks = p.weeks
      ? `≈\u00a0${weeksText(landing ? [p.weeks[0] + LANDING.weeks[0], p.weeks[1] + LANDING.weeks[1]] : p.weeks, copy.lang)}`
      : "";
    const lines = [
      `${name} — ${p.price === null ? copy.after : p.from ? fill(copy.from, { sum: usd(p.price) }) : usd(p.price)}`,
      landing ? `${copy.site.name} — ${usd(LANDING.price)}` : copy.site.has,
      ...(p.monthly ? [copy.monthly] : []),
    ];
    return {
      name: landing ? `${name} + ${copy.site.name.toLocaleLowerCase(copy.lang)}` : name,
      sum,
      priceText,
      weeks,
      extra: p.price === null && landing ? fill(copy.extra, { what: lower }) : "",
      monthly: p.monthly ? copy.monthly : "",
      note: !landing && p.price !== null ? copy.noteExisting : "",
      lines,
    };
  }, [product, site, copy]);

  // a new sum rises into place (not on the first render)
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!reduced) priceRef.current?.animate([{ opacity: 0.25, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 380, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
    setSaid(`${r.name}: ${r.priceText}${r.weeks ? `, ${r.weeks}` : ""}`);
  }, [r.priceText, r.name, r.weeks, reduced]);

  const opt = (name: string, value: string, checked: boolean, onChange: () => void, title: string, desc: string, price: React.ReactNode) => (
    <label className={["ai-opt", checked && "is-on", focus === `${name}:${value}` && "is-focus"].filter(Boolean).join(" ")} key={value}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        onFocus={(e) => setFocus(e.currentTarget.matches(":focus-visible") ? `${name}:${value}` : null)}
        onBlur={() => setFocus(null)}
      />
      <span className="ai-opt__t">{title}</span>
      <span className="ai-opt__d">{desc}</span>
      <span className="ai-opt__p">{price}</span>
    </label>
  );

  return (
    <form className="ai-calc ai-pcalc" aria-labelledby="calc-title" onSubmit={(e) => e.preventDefault()}>
      <div className="ai-calc__opts">
        <fieldset className="ai-calc__g" data-rv="">
          <legend className="ai-calc__l">{copy.g1}</legend>
          {PRODUCT_ORDER.map((p) => {
            const o = PRODUCTS[p];
            const price = o.price === null ? <span className="ai-opt__talk">{copy.after}</span> : <span>{o.from ? fill(copy.from, { sum: usd(o.price) }) : usd(o.price)}</span>;
            return opt("calc-product", p, product === p, () => setProduct(p), copy.products[p].t, copy.products[p].d, price);
          })}
        </fieldset>
        <fieldset className="ai-calc__g" data-rv="">
          <legend className="ai-calc__l">{copy.g3}</legend>
          {opt("calc-site", "existing", site === "existing", () => setSite("existing"), copy.site.has, copy.site.hasD, <span className="ai-opt__talk">{copy.site.hasP}</span>)}
          {opt("calc-site", "landing", site === "landing", () => setSite("landing"), copy.site.need, copy.site.needD, <>+ <span>{usd(LANDING.price)}</span></>)}
        </fieldset>
      </div>
      <div className="ai-calc__sum">
        <div className="ai-calc__card" data-rv="">
          <p className="ai-calc__k"><span>{copy.k}</span><span className="ai-calc__weeks">{r.weeks}</span></p>
          <p className="ai-calc__name">{r.name}</p>
          <p className="ai-calc__price">
            <b ref={priceRef} className={r.sum > 0 ? undefined : "is-talk"}>{r.priceText}</b> {r.sum > 0 && <span>{copy.once}</span>}
          </p>
          {r.extra && <p className="ai-calc__x">{r.extra}</p>}
          {r.monthly && <p className="ai-calc__x">{r.monthly}</p>}
          {r.note && <p className="ai-calc__note">{r.note}</p>}
          <p className="ai-calc__note">{copy.audit}</p>
          <button
            className="btn btn--primary ai-calc__send"
            type="button"
            onClick={() => {
              const summary = [r.name, r.sum > 0 ? `${r.priceText} ${copy.once}` : r.priceText, r.weeks].filter(Boolean).join(" · ");
              // the main page's form shows it as the chosen plan (its «package» and «details» fields) and goes there
              // (its module reads the page's address when it loads: fetched on the click, never on the server)
              import("@/components/sections/contact/lead-form.js").then(({ goToForm, leadForm }) => {
                (leadForm() as { setPlan: (name: string, details?: string[]) => void }).setPlan(summary, r.lines);
                goToForm(reduced);
              });
            }}
          >
            <span className="btn__label">{copy.send}</span>
            <ArrowIcon />
          </button>
          <p className="ai-calc__fine">{copy.fine}</p>
          <p className="ai-calc__tol">{copy.tol}</p>
          <p className="visually-hidden" aria-live="polite">{said}</p>
        </div>
      </div>
    </form>
  );
}
