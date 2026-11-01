import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import type { AdsFacts } from "@/components/ads/facts";

/** Each step's small moving picture (drawn in CSS, sized in em by its tile; data-sp names its beat in the runtime): the
 *  call, the queries in and out, the test request recorded, the ad switched on, the report's bars; for the page made
 *  first, the page's texts approved, the page on its test address with your cursor, the page and the ad switched on
 *  together */
const PICS: Record<string, React.ReactNode> = {
  call: (
    <span className="rk-sp rk-sp--call" data-sp="call">
      <i className="rk-sp__ava rk-sp__ava--you" />
      <span className="rk-sp__wave">{[0, 1, 2, 3, 4].map((i) => <b key={i} />)}</span>
      <i className="rk-sp__ava" />
    </span>
  ),
  kw: (
    <span className="rk-sp rk-sp--kw" data-sp="kw">
      <i className="rk-sp__q" />
      <span className="rk-sp__chips"><b className="is-in" /><b className="is-in" /><b className="is-out" /></span>
    </span>
  ),
  rec: (
    <span className="rk-sp rk-sp--rec" data-sp="rec">
      <span className="rk-sp__form"><b /><b /><i /></span>
      <i className="rk-sp__ok" />
    </span>
  ),
  live: (
    <span className="rk-sp rk-sp--live" data-sp="live">
      <span className="rk-sp__ad"><b /><b /></span>
      <i className="rk-sp__sw"><b className="rk-sp__off" /><b className="rk-sp__knob" /></i>
    </span>
  ),
  rep: (
    <span className="rk-sp rk-sp--rep" data-sp="rep"><b /><b /><b /></span>
  ),
  doc: (
    <span className="rk-sp rk-sp--doc" data-sp="doc">
      <span className="rk-sp__page"><b /><b /><b /><b /><i /></span>
      <i className="rk-sp__ok" />
    </span>
  ),
  test: (
    <span className="rk-sp rk-sp--test" data-sp="test">
      <span className="rk-sp__win">
        <span className="rk-sp__bar"><i /><b /></span>
        <span className="rk-sp__body"><b /><b /><b /></span>
      </span>
      <i className="rk-sp__cur" />
    </span>
  ),
  both: (
    <span className="rk-sp rk-sp--both" data-sp="both">
      <span className="rk-sp__pair">
        <span className="rk-sp__mini"><b /><b /><b /></span>
        <span className="rk-sp__ad"><b /><b /></span>
      </span>
      <i className="rk-sp__sw"><b className="rk-sp__off" /><b className="rk-sp__knob" /></i>
    </span>
  ),
};

type Step = { pic: string; t: string; p: string; tag?: string };

/**
 * 8 · Як працюємо (black, no card, the steps on one line: the owner's brief of 21 Oct). On top the time, from the engine,
 * and a switch between the two cases (the bridge brief's phase 4, 26 Oct): the site is already there (wAds, «≈ 1
 * тиждень») or there is none yet or it is weak (the landing with the ads, wSiteAds, «≈ 1–2 тижні»), the second hidden
 * until chosen. Then five steps, each with a small moving picture of what happens in it (21st.dev's feature steps, Magic
 * UI's animated icons) and under it the step's title and one line. Wide screens: five across; phones: rows with the
 * picture on the left. Plays once, picture by picture (runtime: scene «how»); a switch plays the chosen list's pictures
 * (runtime: initHowPick). The switch is the sites page's time switch (.st-hseg), dark.
 */
export async function AdsHow({ index, facts }: { index: number; facts: AdsFacts }) {
  const t = await getTranslations("ads");
  const first: Step = { pic: "call", t: t("how.1.t"), p: t("how.1.p"), tag: t("how.1.tag") };
  const report = { pic: "rep", t: t("how.5.t"), p: t("how.5.p") };
  const cases: { id: "a" | "b"; time: string; steps: Step[] }[] = [
    {
      id: "a",
      time: facts.wAds,
      steps: [
        first,
        { pic: "kw", t: t("how.2.t"), p: t("how.2.p") },
        { pic: "rec", t: t("how.3.t"), p: t("how.3.p") },
        { pic: "live", t: t("how.4.t"), p: t("how.4.p") },
        { ...report, tag: t("how.5.tag") },
      ],
    },
    {
      id: "b",
      time: facts.wSiteAds,
      steps: [
        first,
        { pic: "doc", t: t("how.site.2.t"), p: t("how.site.2.p") },
        { pic: "test", t: t("how.site.3.t"), p: t("how.site.3.p") },
        { pic: "both", t: t("how.site.4.t"), p: t("how.site.4.p") },
        { ...report, tag: t("how.site.5.tag") },
      ],
    },
  ];
  return (
    <section className="section ai-sec rk-how" id="how" aria-labelledby="how-title">
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

        <div className="rk-track" data-scene="how">
          <div className="rk-track__head">
            {/* the time, as wide as the longest of the two (each stands unseen in the same cell), so the switch beside
                it never moves under the finger */}
            <div className="rk-track__time">
              <output className="rk-track__v" data-how-time="" aria-live="polite">{cases[0].time}</output>
              {cases.map((c) => <span className="rk-track__v rk-track__ghost" aria-hidden="true" key={c.id}>{c.time}</span>)}
            </div>
            <div className="rk-hseg" role="radiogroup" aria-label={t("how.pick")} data-how-pick="">
              {cases.map((c, i) => (
                <label className={`rk-hseg__o${i === 0 ? " is-on" : ""}`} key={c.id}>
                  <input type="radio" name="ads-how" value={c.id} data-time={c.time} defaultChecked={i === 0} />
                  <span>{t(`how.${c.id}`)}</span>
                </label>
              ))}
            </div>
          </div>
          {cases.map((c, i) => (
            <ol className="rk-track__list" data-how-list={c.id} hidden={i > 0} key={c.id}>
              {c.steps.map((s, k) => (
                <li className="rk-track__step" key={k}>
                  <span className="rk-track__pic" aria-hidden="true">{PICS[s.pic]}</span>
                  <div className="rk-track__txt">
                    <h3 className="rk-track__t">
                      <span className="rk-track__n" aria-hidden="true">{String(k + 1).padStart(2, "0")}</span>
                      {s.t}
                    </h3>
                    <p className="rk-track__p">{s.p}</p>
                    {s.tag && <p className="rk-track__tag">{s.tag}</p>}
                  </div>
                </li>
              ))}
            </ol>
          ))}
        </div>
      </div>
    </section>
  );
}
