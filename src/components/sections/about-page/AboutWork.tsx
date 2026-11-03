import { getTranslations } from "next-intl/server";
import { splitWords } from "./words";

const VOWS = [1, 2] as const;

/**
 * 2 · Як ми працюємо (the owner, 3 Nov: only what the main page does not say, and more creatively): the page's one light
 * block, a poster of the owner's own two rules (his brief of 26 Oct): we take as many projects as we can finish, and a
 * task that does not suit us is said at once, at the first talk. Each rule large, its key word in ember, the plain words
 * under it; as a rule reaches the screen its words come up one after another (21st.dev's Text Generate Effect, opacity
 * and a short rise only; runtime: [data-gen]).
 */
export async function AboutWork({ index }: { index: number }) {
  const t = await getTranslations("about");
  return (
    <section className="section section--ivory about-work" id="work" aria-labelledby="work-title">
      <div className="container">
        <header className="s-head about-work__head">
          <p className="s-head__meta" id="work-title">
            <span className="s-head__index">{index}</span>
            <span>{t("work.meta")}</span>
          </p>
        </header>
        <ol className="about-vows">
          {VOWS.map((n) => (
            <li className="about-vow" data-gen="" key={n}>
              <span className="about-vow__n" aria-hidden="true">{n}</span>
              <p className="about-vow__b">
                {splitWords(t.raw(`work.${n}.b`) as string, (w, i) => <span className="about-gen" style={{ "--i": i } as React.CSSProperties}>{w}</span>)}
              </p>
              <p className="about-vow__t">{t(`work.${n}.t`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
