import { getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";
import { LetterFlow, type FlowCopy } from "./LetterFlow";

/** Як це працює (after the niches since 21 Oct 2026): one letter's way through the program, as a live scheme (LetterFlow: React and GSAP) (ivory). */
export async function Path({ index }: { index: number }) {
  const t = await getTranslations("ai");
  const c = await getTranslations("aiCommon");
  const copy: FlowCopy = {
    steps: [1, 2, 3, 4].map((n) => ({ who: t(`step.${n}.who`), text: t(`step.${n}.text`), kind: n === 1 || n === 4 ? "person" : "sys" })),
    node: { mail: t("flow.node.mail"), ai: t("flow.node.ai"), table: t("flow.node.table"), tg: t("flow.node.tg") },
    from: t("art.mail.from"),
    body: t("art.mail.body"),
    fields: [
      { k: t("art.f.name"), v: t("art.mail.from") },
      { k: t("art.f.budget"), v: "20 000 ₴" },
      { k: t("art.f.term"), v: t("art.term") },
    ],
    reading: t("flow.reading"),
    read: t("flow.read"),
    writing: t("flow.writing"),
    written: t("flow.written"),
    tgTitle: t("art.tg.t"),
    tgBody: t("art.tg.b"),
    now: t("flow.now"),
    call: t("flow.call"),
    sample: c("sample"),
    replay: c("replay"),
    replayLabel: t("replay.path"),
  };
  return (
    <section className="section section--ivory ai-sec" id="how" aria-labelledby="how-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("nav.how")}</span>
          </p>
          <h2 className="s-head__title" id="how-title" data-split="">
            <span className="tone">{t.rich("how.title", aiRich)}</span>
          </h2>
          <p className="s-head__intro">{t("how.intro")}</p>
        </header>
        <LetterFlow copy={copy} loop />
      </div>
    </section>
  );
}
