import { getTranslations } from "next-intl/server";
import { aiRich } from "@/components/ai/rich";
import { TextFill } from "@/components/fx/text-fill/TextFill";
import { LetterFlow, type FlowCopy } from "./LetterFlow";

/**
 * 2 · Що таке AI-автоматизація, right under the first screen (the owner, 5 Nov 2026: what it is comes first, not in
 * block 4; ivory, the sheet that slides over the pinned first screen). What it is, in two sentences set large, their
 * words filling in with the ink as they come up (the main page's statement: fx/TextFill), all of it in the ink once it
 * is wholly on the screen (the owner: no half-grey text); then one letter's way through the program, as a live scheme
 * (LetterFlow: React and GSAP). What it can do for a business is block 3's.
 */
export async function WhatIsAutomation({ index }: { index: number }) {
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
    <section className="section section--ivory ai-sec ai-what" id="how" aria-labelledby="how-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("nav.how")}</span>
          </p>
          <h2 className="s-head__title" id="how-title" data-split="">
            <span className="tone">{t.rich("how.title", aiRich)}</span>
          </h2>
        </header>
        {/* (the fill ends once the whole statement is on the screen, its foot at 78 % of it: by then every word is
            in the ink, none left grey) */}
        <TextFill className="ai-what__lead" start="top 92%" end="bottom 78%">
          {t("how.intro")}
        </TextFill>
        <div className="ai-what__path">
          <p className="ai-what__k" data-rv="">
            {t("how.path")}
          </p>
          <LetterFlow copy={copy} loop />
        </div>
      </div>
    </section>
  );
}
