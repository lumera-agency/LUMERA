import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button/Button";
import { aiRich } from "@/components/ai/rich";
import { Replay, Sample } from "@/components/ai/parts";
import { AiStoneSlot } from "@/components/ai/AiStoneSlot";

/**
 * 1 · the first screen, centred: what the page is about, plainly (two lines that rise once, CSS), the request button,
 * then today's to-do list (three tasks done by the system, one left to you; scene «todo»). Far behind the words, the
 * main page's stone: a still that the live 3D stone replaces once it has drawn (three/ai-stone, AiStoneSlot). It pins, and
 * the page slides over it (data-cover).
 */
export async function Hero() {
  const t = await getTranslations("ai");
  const c = await getTranslations("aiCommon");
  const rows = [
    { n: 1, who: "prog", text: t("todo.1"), label: t("todo.who.prog") },
    { n: 2, who: "bot", text: t("todo.2"), label: t("todo.who.bot") },
    { n: 3, who: "prog", text: t("todo.3"), label: t("todo.who.prog") },
  ];
  return (
    <section className="ai-hero ai-hero--center" id="top" aria-labelledby="ai-title" data-cover="">
      {/* the main page's first-screen background: its dark light (the stone is behind the words, below) */}
      <div className="ai-hero__bg" aria-hidden="true" />
      <div className="ai-hero__in">
        <div className="ai-hero__copy">
          <div className="ai-hero__head">
            <div className="ai-hero__rock" aria-hidden="true">
              <i className="ai-hero__glow" />
              {/* the largest thing on the first screen (the browser's LCP): fetched early, 32 KB. The live stone takes its
                  place once it has drawn */}
              {/* eslint-disable-next-line @next/next/no-img-element -- a fixed still under the live stone, swapped by script */}
              <img className="ai-hero__stone" src="/img/ai/lock-stone.webp" width={520} height={626} alt="" decoding="async" fetchPriority="high" />
              <AiStoneSlot />
            </div>
            <h1 className="s-head__title s-head__title--stone ai-hero__title ai-hero__title--auto" id="ai-title">
              {t.rich("hero.title", aiRich)}
            </h1>
          </div>
          <p className="ai-hero__lead">{t("hero.lead")}</p>
          <div className="ai-hero__actions">
            <ButtonLink href="#contact" variant="primary">{c("cta.auto")}</ButtonLink>
          </div>
        </div>

        {/* today's to-do list (a sample): rows 1–3 get done by the program or the assistant (signal), row 4 is left to
            you (ember). A real list for screen readers; the numbers and ticks are decoration */}
        <div className="ai-hero__visual">
          <div className="ai-todo" data-scene="todo">
            <div className="ai-sheet__win ai-todo__win">
              <div className="ai-sheet__bar ai-todo__bar">
                <i aria-hidden="true" />
                <i aria-hidden="true" />
                <i aria-hidden="true" />
                <span id="todo-head">{t("todo.head")}</span>
                <Sample>{c("sample")}</Sample>
              </div>
              <ol className="ai-todo__list" aria-labelledby="todo-head">
                {rows.map((r) => (
                  <li className="ai-todo__row" data-who={r.who} key={r.n}>
                    <span className="ai-todo__n" aria-hidden="true">{r.n}<i className="ai-todo__fill">{r.n}</i></span>
                    <span className="ai-todo__t">{r.text}</span>
                    <span className="ai-todo__who"><span aria-hidden="true">✓ </span><span>{r.label}</span></span>
                  </li>
                ))}
                <li className="ai-todo__row ai-todo__row--you" data-who="you">
                  <i className="ai-todo__hl" aria-hidden="true" />
                  <span className="ai-todo__n" aria-hidden="true">4<i className="ai-todo__fill">4</i></span>
                  <span className="ai-todo__t">{t("todo.4")}</span>
                  <span className="ai-todo__who"><span>{t("todo.who.you")}</span></span>
                </li>
              </ol>
            </div>
            <Replay scenes="todo" label={t("replay.todo")}>{c("replay")}</Replay>
          </div>
        </div>
      </div>
    </section>
  );
}
