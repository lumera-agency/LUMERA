import { getLocale, getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";
import { aiHref } from "@/components/ai/links";
import { ButtonLink } from "@/components/ui/button/Button";
import { FeedDemo } from "./CaseDemos";
import { RobotConsole } from "./RobotConsole";
import { AUDIT, NICHES, PRODUCTS, usd, weeksText, type Product } from "./prices";
import { offerScenes } from "./scenes";

/** each task the robot takes over: its product, the business it suits most (its niche's tasks), its way further */
const TASKS: { product: Exclude<Product, "custom">; niche: (typeof NICHES)[number]["key"]; can: number; link?: "case" | "asst" }[] = [
  { product: "search", niche: "service", can: 1, link: "case" },
  { product: "sources", niche: "shop", can: 2 },
  { product: "assistant", niche: "salon", can: 3, link: "asst" },
];

const CHECK = (
  <span className="check" aria-hidden="true">
    <svg viewBox="0 0 24 24">
      <path d="m5 12.5 4.2 4.2L19 7" />
    </svg>
  </span>
);

/**
 * 3 · Що робот візьме на себе, after «Що таке AI-автоматизація» (the owner, 5 Nov 2026: the niches, the lineup's words
 * and the case's salon in one block, set as the main page's services). An opening: what the robot does, in a line,
 * beside its console at work (RobotConsole). Then a row for each task: its picture in a window on the left (the case's
 * feed of orders, the letter going into the table, the assistant's chat), on the right its name, what it does, the
 * business it suits with that business's tasks, its price and time, and the way to the case or the example. Under
 * them, everyone else's way in: the audit.
 */
export async function Niches({ index }: { index: number }) {
  const t = await getTranslations("ai");
  const locale = await getLocale();
  const lang = locale === "ru" ? "ru" : "uk";
  const scenes = await offerScenes();
  const links = {
    case: { href: aiHref(locale, "/keisy/poshuk-zamovlen"), text: t("ex.case.go") },
    asst: { href: aiHref(locale, "/keisy/ai-asystent"), text: t("ex.asst.go") },
  };
  const price = (product: Product) => {
    const terms = PRODUCTS[product];
    if (terms.price === null) return t("offer.after");
    return terms.from ? t("offer.from", { sum: usd(terms.price) }) : usd(terms.price);
  };
  return (
    <section className="section ai-sec ai-tasks" id="niches" aria-labelledby="niches-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("nav.services")}</span>
          </p>
          <h2 className="s-head__title" id="niches-title" data-split="">
            <span className="tone">{t.rich("niche.title", aiRich)}</span>
          </h2>
        </header>
        <div className="ai-tasks__open">
          <p className="ai-tasks__lead" data-rv="">
            {t("niche.lead")}
          </p>
          <div className="ai-tasks__console">
            <RobotConsole />
          </div>
        </div>
        <ol className="ai-tasks__list">
          {TASKS.map((task, number) => {
            const terms = PRODUCTS[task.product];
            const tasks = [1, 2, 3].filter((n) => t.has(`niche.${task.niche}.${n}`)).map((n) => t(`niche.${task.niche}.${n}`));
            const link = task.link ? links[task.link] : null;
            return (
              <li className="ai-task" key={task.product}>
                <div className="ai-task__demo" data-rv="">
                  {task.product === "search" ? (
                    <FeedDemo />
                  ) : (
                    <div className="ai-win">
                      <p className="ai-win__bar" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                        <span>{t(`offer.${task.product}.t`)}</span>
                      </p>
                      {scenes[task.product]}
                    </div>
                  )}
                </div>
                <div className="ai-task__text" data-rv="">
                  <p className="ai-task__k">
                    <span>{number + 1}</span>
                    <span>{t(`offer.${task.product}.t`)}</span>
                  </p>
                  <h3 className="ai-task__t">{t(`how.do.${task.can}.t`)}</h3>
                  <p className="ai-task__p">{t(`offer.${task.product}.p`)}</p>
                  <p className="ai-task__for">
                    <span>{t("niche.meta")}</span>
                    <span>{t(`niche.${task.niche}.t`)}</span>
                  </p>
                  <ul className="checks ai-task__checks">
                    {tasks.map((item) => (
                      <li className="is-done" key={item}>
                        {CHECK}
                        <div>{item}</div>
                      </li>
                    ))}
                  </ul>
                  <p className="ai-task__price">
                    <b>{price(task.product)}</b>
                    {terms.weeks && <span>{weeksText(terms.weeks, lang)}</span>}
                  </p>
                  {task.product === "assistant" && (
                    <p className="ai-task__more">{t("offer.assistant.monthly", { sum: usd(terms.monthly ?? 0), n: terms.freeMonths ?? 0 })}</p>
                  )}
                  {link && (
                    <ButtonLink href={link.href} variant="ghost" size="sm" className="ai-task__go">
                      {link.text}
                    </ButtonLink>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        {/* everyone else's way in: the audit (its card is in the prices) */}
        <div className="ai-cta" data-rv="">
          <p className="ai-cta__q">
            <b>{t("niche.more")}</b> <span>{t("offer.custom.p")}</span>
          </p>
          <ButtonLink href="#audit" variant="primary">
            {t("niche.audit", { audit: usd(AUDIT.price) })}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
