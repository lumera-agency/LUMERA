import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";

type T = Awaited<ReturnType<typeof getTranslations<"about">>>;
type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/** a person, in a thin line (the stations' marks) */
const PERSON = <><circle cx="12" cy="9" r="3.75" /><path d="M5 20c.9-3.7 3.6-5.75 7-5.75S18.1 16.3 19 20" /></>;

/** One stop on a lane: who it is, the message as it arrives there; the line to the next stop (`seg`: how many columns
 *  it spans, when the message sets off), the moment the stop lights (`lit`), the message's arrival (`at`). */
function Stop({ t, who, seg, lit, at, children, col }: { t: T; who: string; seg?: { span: number; at: string }; lit: string; at: string; children: React.ReactNode; col?: number }) {
  return (
    <li className="about-tel__st" style={col ? ({ "--col": col } as CSSVars) : undefined}>
      {seg && (
        <span className="about-tel__seg" style={{ "--span": seg.span, "--t": seg.at } as CSSVars} aria-hidden="true">
          <span className="about-tel__run" />
        </span>
      )}
      <span className="about-tel__node" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">{PERSON}</svg>
        <span className="about-tel__lit" style={{ "--t": lit } as CSSVars}>
          <svg viewBox="0 0 24 24" focusable="false">{PERSON}</svg>
        </span>
      </span>
      <p className="about-tel__who">{t(`direct.${who}`)}</p>
      <div className="about-tel__at" style={{ "--t": at } as CSSVars}>{children}</div>
    </li>
  );
}

/**
 * 3 · Напряму (the owner, 3 Nov: a custom demo where it helps): the owner's «no manager who retells your words to the
 * one who does the work», shown as the old game of broken telephone. Two lanes in one dark window, played once as it
 * comes into view (runtime: scene «chain»): «Зазвичай», you → a manager → the one who does it, and the request comes out
 * changed on the way (the manager's bubble turns into a vaguer one, a «?» at the end); «В ECLO», you → the one who does
 * it, straight across the empty middle, the words as they were (a tick). Ember is the person's words that arrive; the
 * usual lane stays grey. «Приклад» under it: the words are an illustration. Then the way down to the form (block 4).
 * Phones and tablets: the lanes stand up, the line running down.
 */
export async function AboutDirect({ index }: { index: number }) {
  const t = await getTranslations("about");
  return (
    <section className="section about-direct" id="direct" aria-labelledby="direct-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("direct.meta")}</span>
          </p>
          <h2 className="s-head__title" id="direct-title" data-split="">
            <span className="tone">{t.rich("direct.title", R)}</span>
          </h2>
          <p className="s-head__intro">{t("direct.intro")}</p>
        </header>

        <figure className="about-tel" data-chain="">
          <div className="about-tel__lane about-tel__lane--usual">
            <p className="about-tel__k">{t("direct.usual")}</p>
            <ol className="about-tel__list">
              <Stop t={t} who="you" seg={{ span: 1, at: "0.3s" }} lit="0.1s" at="0.1s">
                <span className="about-tel__msg">{t("direct.msg")}</span>
              </Stop>
              <Stop t={t} who="manager" seg={{ span: 1, at: "1.6s" }} lit="1s" at="1.05s">
                {/* the manager's retelling: the words as heard, then as passed on */}
                <span className="about-tel__msg about-tel__msg--morph">
                  <span className="about-tel__was">{t("direct.msg")}</span>
                  <span className="about-tel__now">{t("direct.lost")}</span>
                </span>
              </Stop>
              <Stop t={t} who="doer" lit="2.3s" at="2.35s">
                <span className="about-tel__msg about-tel__msg--lost">{t("direct.lost")}</span>
                <span className="about-tel__mark about-tel__mark--q" aria-hidden="true">?</span>
              </Stop>
            </ol>
          </div>
          <div className="about-tel__lane about-tel__lane--us">
            <p className="about-tel__k">{t("direct.us")}</p>
            <ol className="about-tel__list">
              <Stop t={t} who="you" seg={{ span: 2, at: "0.3s" }} lit="0.1s" at="0.1s">
                <span className="about-tel__msg about-tel__msg--kept">{t("direct.msg")}</span>
              </Stop>
              <Stop t={t} who="maker" lit="1s" at="1.05s" col={3}>
                <span className="about-tel__msg about-tel__msg--kept">{t("direct.msg")}</span>
                <span className="about-tel__mark about-tel__mark--ok" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false"><path d="m6 12.5 4 4L18 8" /></svg>
                </span>
              </Stop>
            </ol>
          </div>
          <figcaption className="about-tel__cap">{t("direct.sample")}</figcaption>
        </figure>

        {/* the quiet way down to the form (a link: the page's one lime button is the form's) */}
        <a className="about-down about-direct__go" href="#contact">
          <span>{t("direct.go")}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg>
        </a>
      </div>
    </section>
  );
}
