import { getTranslations } from "next-intl/server";
import { InView } from "./InView";

/*
 * The case block's two looping demos (the owner, 21 Oct 2026: «анімовані демки» in place of the empty screenshot
 * frames). Pictures of the robot's work, built from the case page's own example data (case.*): no platform named.
 * CSS keyframes only (ai-page.css, .ai-demo): they run while the demo is on the screen (InView) and rest off it;
 * reduced motion shows the final frame. Both are a picture for screen readers (role img + a sentence).
 */

/** «Схема робота»: three sources → the selection (its three checks tick, the far one and the repeat drop out) →
 *  Telegram and the table. An SVG on a 300 × 360 grid: it scales with its frame, the type stays 11–13 px. */
export async function SchemeDemo() {
  const t = await getTranslations();
  const src = [
    { x: 6, label: "Kleinanzeigen" },
    { x: 104, label: t("ai.demo.scheme.fb") },
    { x: 202, label: t("ai.demo.scheme.mail") },
  ];
  const checks = [t("ai.demo.scheme.c1"), t("ai.demo.scheme.c2"), t("ai.demo.scheme.c3")];
  return (
    <InView className="ai-demo ai-demo--scheme" label={t("ai.demo.scheme.sr")}>
      <div className="ai-demo__bar" aria-hidden="true"><i /><i /><i /><span>{t("ai.demo.scheme.bar")}</span></div>
      <svg className="ai-scheme" viewBox="0 0 300 360" aria-hidden="true" focusable="false">
        {/* the morning's count */}
        <g className="ai-scheme__count">
          <rect x="105" y="4" width="90" height="20" rx="10" />
          <text x="150" y="18">{t("case.bento.count")}</text>
        </g>
        {/* the wires: into the selection, out of it */}
        <path className="ai-scheme__wire" d="M52 66 V96 H150 V126 M150 66 V126 M248 66 V96 H150 V126" />
        <path className="ai-scheme__wire ai-scheme__wire--out" d="M150 232 V258 H90 V286 M150 258 H210 V286" />
        {/* the sources */}
        {src.map((s) => (
          <g className="ai-scheme__src" key={s.x}>
            <rect x={s.x} y="36" width="92" height="30" rx="8" />
            <text x={s.x + 46} y="55">{s.label}</text>
          </g>
        ))}
        {/* the selection and its checks */}
        <g className="ai-scheme__robot">
          <rect className="ai-scheme__box" x="40" y="126" width="220" height="106" rx="12" />
          <text className="ai-scheme__title" x="60" y="150">{t("ai.demo.scheme.robot")}</text>
          {checks.map((c, i) => (
            <g className={`ai-scheme__check ai-scheme__check--${i + 1}`} key={i}>
              <circle className="ai-scheme__dot-off" cx="66" cy={172 + i * 22} r="6.5" />
              <g className="ai-scheme__tick">
                <circle cx="66" cy={172 + i * 22} r="6.5" />
                <path d={`M62.5 ${172 + i * 22} l2.4 2.4 l4.4 -4.6`} />
              </g>
              <text x="80" y={176 + i * 22}>{c}</text>
            </g>
          ))}
        </g>
        {/* what drops out */}
        <text className="ai-scheme__drop ai-scheme__drop--far" x="6" y="114">✕ {t("ai.demo.scheme.far")}</text>
        <text className="ai-scheme__drop ai-scheme__drop--dup" x="294" y="114">✕ {t("case.bento.dup.text")}</text>
        {/* where the right ones go */}
        <g className="ai-scheme__out ai-scheme__out--tg">
          <rect className="ai-scheme__ring" x="30" y="286" width="120" height="46" rx="10" />
          <rect x="30" y="286" width="120" height="46" rx="10" />
          <text className="ai-scheme__out-t" x="90" y="305">Telegram</text>
          <text className="ai-scheme__out-s" x="90" y="321">{t("ai.demo.scheme.tg")}</text>
        </g>
        <g className="ai-scheme__out ai-scheme__out--sheet">
          <rect x="160" y="286" width="110" height="46" rx="10" />
          <text className="ai-scheme__out-t" x="215" y="305">{t("ai.demo.scheme.sheet")}</text>
          <text className="ai-scheme__out-s" x="215" y="321">{t("ai.demo.scheme.row")}</text>
        </g>
        <text className="ai-scheme__plus" x="160" y="281">+1</text>
        {/* the ads on their way in, the right one on its way out */}
        <circle className="ai-scheme__ad ai-scheme__ad--1" cx="52" cy="66" r="4" />
        <circle className="ai-scheme__ad ai-scheme__ad--2" cx="150" cy="66" r="4" />
        <circle className="ai-scheme__ad ai-scheme__ad--3" cx="248" cy="66" r="4" />
        <circle className="ai-scheme__go ai-scheme__go--tg" cx="150" cy="232" r="4.5" />
        <circle className="ai-scheme__go ai-scheme__go--sheet" cx="150" cy="232" r="4.5" />
      </svg>
    </InView>
  );
}

/** «Що приходить щодня»: the brigade's bot in Telegram, three new orders arriving one after another (the case
 *  page's example messages: a score, the job, the rough price, the ad's link). */
export async function FeedDemo() {
  const t = await getTranslations();
  const msgs = [
    { n: 1, time: "08:02" },
    { n: 2, time: "08:03" },
    { n: 3, time: "08:04" },
  ];
  return (
    <InView className="ai-demo ai-demo--feed" label={t("ai.demo.feed.sr")}>
      <div className="ai-feed__bar" aria-hidden="true">
        <span className="ai-feed__ava">{t("case.bot.ava")}</span>
        <span className="ai-feed__who"><b>{t("case.bot.text")}</b><span>{t("aiCommon.tg.bot")}</span></span>
      </div>
      <div className="ai-feed__chat" aria-hidden="true">
        <p className="ai-feed__day">{t("aiCommon.tg.today")}</p>
        {msgs.map((m) => (
          <div className={`ai-feed__msg ai-feed__msg--${m.n}`} key={m.n}>
            <p className="ai-feed__t">{t(`case.push.${m.n}.t`)}</p>
            <p className="ai-feed__b">{t(`case.push.${m.n}.b`)}</p>
            <p className="ai-feed__f"><u>{t("case.tg.6")}</u><time>{m.time}</time></p>
          </div>
        ))}
      </div>
    </InView>
  );
}
