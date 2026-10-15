import { getTranslations } from "next-intl/server";
import { ArrowIcon } from "@/components/ui/icons/ArrowIcon";
import { aiRich } from "@/components/ai/rich";
import type { AiFacts } from "@/components/ai/facts";

/**
 * 5 · Розрахунок: the AI part of the main page's calculator, widened: what to automate (a package or a task under your
 * business, priced on request), what else (priced after a call), whether there is a site. Prices and weeks from the
 * main page's configurator engine; runtime/ai-runtime.js keeps the sum and hands it to the form. The markup is the
 * calculator's first state (Заявки в Telegram, a site already there), so the page reads right before the script.
 */
export async function Calc({ facts }: { facts: AiFacts }) {
  const t = await getTranslations("ai");
  const opt = (name: string, value: string, title: string, desc: string, price: React.ReactNode, on = false) => (
    <label className={on ? "ai-opt is-on" : "ai-opt"}>
      <input type="radio" name={name} value={value} defaultChecked={on} />
      <span className="ai-opt__t">{title}</span>
      <span className="ai-opt__d">{desc}</span>
      <span className="ai-opt__p">{price}</span>
    </label>
  );
  const chk = (value: string, text: string) => (
    <label className="ai-chk">
      <input type="checkbox" name="calc-x" value={value} />
      <span>{text}</span>
    </label>
  );
  return (
    <section className="section ai-sec" id="calc" aria-labelledby="calc-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">5</span>
            <span>{t("nav.calc")}</span>
          </p>
          <h2 className="s-head__title" id="calc-title" data-split="">
            <span className="tone">{t.rich("calc.title", aiRich)}</span>
          </h2>
          <p className="s-head__intro">{t("calc.intro")}</p>
        </header>
        <form className="ai-calc" data-calc="" aria-labelledby="calc-title">
          <div className="ai-calc__opts">
            <fieldset className="ai-calc__g">
              <legend className="ai-calc__l">{t("calc.g1")}</legend>
              {opt("calc-pack", "lead", t("do.1.t"), t("calc.lead.d"), <span>{facts.lead}</span>, true)}
              {opt("calc-pack", "crmAi", t("do.2.t"), t("calc.crm.d"), <span>{facts.crm}</span>)}
              {opt("calc-pack", "custom", t("calc.custom.t"), t("calc.custom.d"), <span className="ai-opt__talk">{t("calc.custom.p")}</span>)}
            </fieldset>
            <fieldset className="ai-calc__g">
              <legend className="ai-calc__l">
                <span>{t("calc.g2.text")}</span> <span className="ai-calc__lm">{t("calc.g2.m")}</span>
              </legend>
              <div className="ai-calc__chips">
                {chk("mail", t("do.3.t"))}
                {chk("book", t("calc.x.book"))}
                {chk("search", t("calc.x.search"))}
                {chk("other", t("calc.x.other"))}
              </div>
            </fieldset>
            <fieldset className="ai-calc__g">
              <legend className="ai-calc__l">{t("calc.g3")}</legend>
              {opt("calc-site", "existing", t("calc.site.has.text"), t("calc.site.has.d"), <span className="ai-opt__talk">{t("calc.site.has.p")}</span>, true)}
              {opt("calc-site", "landing", t("calc.site.new.text"), t("calc.site.new.d"), <>+ <span>{facts.landing}</span></>)}
            </fieldset>
          </div>
          <div className="ai-calc__sum">
            <div className="ai-calc__card">
              <p className="ai-calc__k"><span>{t("calc.k")}</span><span className="ai-calc__weeks" data-calc-weeks="">{facts.leadWeeks}</span></p>
              <p className="ai-calc__name" data-calc-name="">{t("do.1.t")}</p>
              <p className="ai-calc__price"><b data-calc-price="">{facts.lead}</b> <span data-calc-once="">{t("svc.once")}</span></p>
              <p className="ai-calc__x" data-calc-extra="" hidden />
              <details className="ai-calc__inc">
                <summary>
                  <span>{t("svc.inc")}</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-plus" /></svg>
                </summary>
                <div data-calc-inc="" />
              </details>
              <p className="ai-calc__note" data-calc-note="" />
              <button className="btn btn--primary ai-calc__send" type="button" data-calc-send="">
                <span className="btn__label">{t("calc.send")}</span>
                <ArrowIcon />
              </button>
              <p className="ai-calc__fine">{t("calc.fine")}</p>
              <p className="ai-calc__tol">{t("calc.tol")}</p>
              <p className="visually-hidden" aria-live="polite" data-calc-live="" />
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

/** The words the calculator writes into its card (runtime/ai-runtime.js `t`), in the page's language. */
export async function calcStrings() {
  const t = await getTranslations("ai");
  const strings: Record<string, string> = {
    "ai.do.1.t": t("do.1.t"),
    "ai.do.2.t": t("do.2.t"),
    "ai.calc.custom.t": t("calc.custom.t"),
    "ai.calc.site.name": t("calc.site.name"),
    "ai.calc.site.has": t("calc.site.has.text"),
    "ai.calc.talk": t("calc.talk"),
    "ai.calc.extra": t("calc.extra"),
    "ai.calc.empty": t("calc.empty"),
    "ai.calc.note.existing": t("calc.note.existing"),
    "ai.inc.crm.note": t("inc.crm.note"),
    "ai.svc.once": t("svc.once"),
  };
  for (const [prefix, n] of [["lead", 4], ["crm", 5], ["site", 5]] as const) {
    for (let i = 1; i <= n; i++) strings[`ai.inc.${prefix}.${i}`] = t(`inc.${prefix}.${i}`);
  }
  return strings;
}
