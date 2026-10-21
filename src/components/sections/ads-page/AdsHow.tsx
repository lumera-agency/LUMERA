import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import type { AdsFacts } from "@/components/ads/facts";

/** the steps that carry a time of their own (the copy's «tag») */
const TAGGED = new Set([1, 5]);

/** Each step's small moving picture (drawn in CSS, sized in em by its tile): the call, the queries in and out, the test
 *  request recorded, the ad switched on, the report's bars */
const PICS: Record<number, React.ReactNode> = {
  1: (
    <span className="ad-sp ad-sp--call">
      <i className="ad-sp__ava ad-sp__ava--you" />
      <span className="ad-sp__wave">{[0, 1, 2, 3, 4].map((i) => <b key={i} />)}</span>
      <i className="ad-sp__ava" />
    </span>
  ),
  2: (
    <span className="ad-sp ad-sp--kw">
      <i className="ad-sp__q" />
      <span className="ad-sp__chips"><b className="is-in" /><b className="is-in" /><b className="is-out" /></span>
    </span>
  ),
  3: (
    <span className="ad-sp ad-sp--rec">
      <span className="ad-sp__form"><b /><b /><i /></span>
      <i className="ad-sp__ok" />
    </span>
  ),
  4: (
    <span className="ad-sp ad-sp--live">
      <span className="ad-sp__ad"><b /><b /></span>
      <i className="ad-sp__sw"><b className="ad-sp__off" /><b className="ad-sp__knob" /></i>
    </span>
  ),
  5: (
    <span className="ad-sp ad-sp--rep"><b /><b /><b /></span>
  ),
};

/**
 * 7 · Як працюємо (black, no card, the steps on one line: the owner's brief of 21 Oct), the owner's second pass of 20 Oct («the line said nothing»): one card, the setup time on top
 * (from the engine, wAds), then five steps, each with a small moving picture of what happens in it (21st.dev's feature
 * steps, Magic UI's animated icons): a call, the queries going in and the useless ones out, the test request getting
 * its tick, the ad switched on, the report's bars; under it the step's title and one line. Wide screens: five across;
 * phones: rows with the picture on the left. Plays once, picture by picture (runtime: scene «how»).
 */
export async function AdsHow({ index, facts }: { index: number; facts: AdsFacts }) {
  const t = await getTranslations("ads");
  return (
    <section className="section ai-sec ad-how" id="how" aria-labelledby="how-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("nav.how")}</span>
          </p>
          <h2 className="s-head__title" id="how-title" data-split="">
            <span className="tone">{t.rich("how.title", R)}</span>
          </h2>
          <p className="s-head__intro">{t("how.intro")}</p>
        </header>

        <div className="ad-track" data-scene="how">
          <p className="ad-track__head">
            <b className="ad-track__v">{facts.wAds}</b>
            <span className="ad-track__k">{t("how.k")}</span>
          </p>
          <ol className="ad-track__list">
            {[1, 2, 3, 4, 5].map((n) => (
              <li className={`ad-track__step${n === 1 ? " ad-track__step--you" : ""}`} key={n}>
                <span className="ad-track__pic" aria-hidden="true">{PICS[n]}</span>
                <div className="ad-track__txt">
                  <h3 className="ad-track__t">
                    <span className="ad-track__n" aria-hidden="true">{String(n).padStart(2, "0")}</span>
                    {t(`how.${n}.t`)}
                  </h3>
                  <p className="ad-track__p">{t(`how.${n}.p`)}</p>
                  {TAGGED.has(n) && <p className="ad-track__tag">{t(`how.${n}.tag`)}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
