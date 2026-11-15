import { getLocale, getTranslations } from "next-intl/server";
import { aiHref } from "@/components/ai/links";
import { PbMark } from "@/components/about/pb-3d/PbMark";
import { splitWords } from "../words";
import { streamChars, streamWords } from "./stream";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/**
 * Variant B, 1 · Студія, the first screen: the title, the lead and the way down beside the studio's mark in chrome
 * (about/pb-3d: a live object on wide screens, its still elsewhere); under them the studio in words, as one editorial
 * row: the goal (about.pb.studio.goal, from the AI page's «Вам лишається подзвонити» and the main page's «Беремося за
 * весь шлях клієнта») at h3 size, and two short paragraphs (what the studio makes; the animation, 3D and second
 * language as on this site, open prices with a link to the calculator, the ad money paid to Google or Meta directly;
 * every fact from the site's own lines: meta.org, services.*, sites.faq, ads.terms; nothing the next blocks say). No
 * cards, names, faces, photos or counts (the owner, 15 Nov: no photos, no passes, no role cards).
 * Wide screens (1200+): the title, the lead and the way down in cols 1–10, the mark in cols 12–16 beside them; the goal
 * in cols 1–7, the paragraphs in cols 9–12 and 13–16. 861–1199: the same on 8 columns, the goal across, the paragraphs
 * side by side under it. Phones (≤860): the title beside the mark, then one under another. The title rises out of its
 * cut, the lead's words come up, then the studio's words stream in (21st.dev's Animated Text, stream.tsx): the goal
 * character by character, the paragraphs word by word, once, from the first paint (the row starts on the first
 * screen at every width).
 */
export async function PbTeam() {
  const t = await getTranslations("about");
  /* the paragraphs' tags: a hyphenated word that never breaks at its hyphen («AI-асистента»), the link to the main
     page's calculator (its open prices) */
  const calc = `${aiHref(await getLocale(), "/")}#pricing`;
  const goal = t("pb.studio.goal");
  const tags = {
    nb: (chunks: React.ReactNode) => <span className="pb-nb">{chunks}</span>,
    calc: (chunks: React.ReactNode) => <a className="link" href={calc}>{chunks}</a>,
  };
  return (
    <section className="section pb-hero" id="team" aria-labelledby="team-title">
      <div className="container pb-c">
        <div className="s-head pb-hero__grid">
          <p className="s-head__meta">
            <span className="s-head__index">1</span>
            <span>{t("team.meta")}</span>
          </p>
          <h1 className="s-head__title pb-hero__title" id="team-title">
            <span className="tone">
              {splitWords(t.raw("team.title") as string, (w, i) => (
                <span className="about-cut">
                  <span className="about-cut__w" style={{ "--i": i } as CSSVars}>{w}</span>
                </span>
              ))}
            </span>
          </h1>
          <p className="s-head__intro about-hero__lead pb-hero__lead">
            {splitWords(t.raw("team.lead") as string, (w, i) => <span className="about-gen" style={{ "--i": i } as CSSVars}>{w}</span>)}
          </p>
          <div className="pb-hero__obj">
            <PbMark />
          </div>
          {/* the quiet way down to the form (a link, not a button: the page's one lime button is the form's) */}
          <a className="about-down pb-hero__down" href="#contact">
            <span>{t("team.down")}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg>
          </a>
          {/* the studio's words stream in (stream.tsx): the goal character by character once the title is up, then the
              paragraphs word by word; the goal's letters are hidden from screen readers, which read its plain copy */}
          <div className="pb-studio">
            <p className="pb-studio__goal">
              <span className="visually-hidden">{goal}</span>
              <span aria-hidden="true">{streamChars(goal, 1100, 1700)}</span>
            </p>
            <p className="pb-studio__text">{streamWords(t.rich("pb.studio.text", tags), 2400, 1100)}</p>
            <p className="pb-studio__text">{streamWords(t.rich("pb.studio.text2", tags), 3000, 1300)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
