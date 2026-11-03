import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button/Button";
import { aiRich as R } from "@/components/ai/rich";
import { priceLine, type AdsFacts } from "@/components/ads/facts";

type Src = "google" | "insta" | "fb";
const NAME: Record<Src, string> = { google: "Google", insta: "Instagram", fb: "Facebook" };

/** A number whose digits stand on strips of 0–9 (React Bits' Counter): at rest each strip shows its digit; the runtime
 *  steps the last one as requests come in. Screen readers get the number itself. */
function Count({ value }: { value: number }) {
  const s = String(value);
  return (
    <>
      <span className="rk-count" aria-hidden="true">
        {Array.from(s).map((ch, i) => (
          <span className="rk-count__d" style={{ "--d": ch } as React.CSSProperties} data-last={i === s.length - 1 ? "" : undefined} key={i}>
            <span className="rk-count__sizer">0</span>
            <span className="rk-count__strip">
              {"0123456789".split("").map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        ))}
      </span>
      <span className="visually-hidden">{value}</span>
    </>
  );
}

/** The month's latest requests in the live report (a sample), newest first; what each was about comes from the first
 *  screen's list (hero.req), the time from here («вчора» from the copy) */
const LIVE: { time: string | null; req: number; src: Src }[] = [
  { time: "14:32", req: 1, src: "google" },
  { time: "12:05", req: 2, src: "insta" },
  { time: "10:47", req: 3, src: "google" },
  { time: null, req: 4, src: "fb" },
  { time: null, req: 1, src: "google" },
];
/** The month's totals: 15 · 6 · 4; `from` is where each stands before the five requests above come in */
const TOTALS: { src: Src; n: number; from: number }[] = [
  { src: "google", n: 15, from: 12 },
  { src: "insta", n: 6, from: 5 },
  { src: "fb", n: 4, from: 3 },
];

/**
 * 3 · Аналітика (dark), the owner's picks of 20 Oct: on wide screens the art director's «Живий звіт» (C), on phones and
 * narrow tablets «Ярлик» (A).
 * C: the report is the hero, a light Google Analytics page on the dark; requests come in at the top of the list one by
 * one (Magic UI's / React Bits' Animated List), each with its source, and the totals beside tick up by one (React Bits'
 * Counter, Magic UI's Number Ticker); under it how it works in three chips, the facts as chips, the button.
 * A: one request's way in three stills on a rail (Aceternity's Tracing Beam): a lime label «позначка: google» rides the
 * link from the ad to the site (Magic UI's Animated Beam), the form is sent, «Записано», and «+1 заявка» runs on to the
 * report, where Google ticks 14 → 15. The price of a request is shown as a formula only (no sums: the owner, 20 Oct).
 */
export async function AdsAnalytics({ index, facts }: { index: number; facts: AdsFacts }) {
  const t = await getTranslations("ads");
  const m = (k: string) => t(`ch.mock.${k}`);
  /** analytics on its own: the same choice as its price card */
  const alone = { plan: `${t("price.a.t")} · ${facts.analytics}`, details: [1, 2, 3].map((n) => t(`price.a.${n}`)).join("\n") };
  const go = (
    <ButtonLink href="#contact" variant="primary" className="rk-fact__go" data-plan={alone.plan} data-details={alone.details}>
      {t("an.f.go")}
    </ButtonLink>
  );
  const arrow = <svg className="rk-live__arr" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8h10M9 4l4 4-4 4" /></svg>;
  const tag = (slot?: string) => (
    <span className="rk-path__tag" data-slot={slot}><i />{t("an.tag")}</span>
  );
  return (
    <section className="section ai-sec rk-an" id="analytics" aria-labelledby="an-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("nav.analytics")}</span>
          </p>
          <h2 className="s-head__title" id="an-title" data-split="">
            <span className="tone">{t.rich("an.title", R)}</span>
          </h2>
          <p className="s-head__intro">{t("an.intro")}</p>
        </header>

        {/* C · wide screens: the live report */}
        <div className="rk-an__desk">
          <div className="rk-live" data-scene="live">
            <p className="rk-live__bar">
              <svg className="rk-live__logo" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect x="2" y="11" width="4" height="7" rx="2" /><rect x="8" y="6.5" width="4" height="11.5" rx="2" /><rect x="14" y="2" width="4" height="16" rx="2" /></svg>
              <b>Google Analytics</b>
              <span className="rk-live__crumb">/ {t("an.live.crumb")}</span>
            </p>
            <div className="rk-live__body">
              <div className="rk-live__feed">
                <p className="rk-live__k" id="live-feed">{t("an.live.feed")}</p>
                <ul className="rk-live__list" aria-labelledby="live-feed">
                  {LIVE.map((r, i) => (
                    <li className="rk-live__row" key={i}>
                      <span className="rk-live__time">{r.time ?? t("an.live.yday")}</span>
                      <span className="rk-live__what">{t(`hero.req.${r.req}`)}</span>
                      <span className="rk-live__src" data-src={r.src}><i aria-hidden="true" /><span><b>{t("an.live.ad")}&nbsp;</b>{NAME[r.src]}</span></span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rk-live__sum">
                <p className="rk-live__k">{t("an.live.sum")}</p>
                <div className="rk-live__tot">
                  {TOTALS.map((x) => (
                    <p className="rk-live__t" data-src={x.src} data-from={x.from} key={x.src}>
                      <span className="rk-live__tk"><i aria-hidden="true" />{NAME[x.src]}</span>
                      <b className="rk-live__tv"><em className="rk-live__plus" aria-hidden="true">{t("an.live.plus")}</em><Count value={x.n} /></b>
                      <span className="rk-live__tb" aria-hidden="true"><i style={{ width: `${Math.round((x.n / TOTALS[0].n) * 10000) / 100}%` }} /></span>
                    </p>
                  ))}
                </div>
                <p className="rk-live__cpl"><b>{t("an.cpl.t")}</b><span>{t("an.cpl.f")}</span><small>{t("an.cpl.s")}</small></p>
              </div>
            </div>
            <p className="rk-live__note">{t("an.note")}</p>
          </div>
          <p className="rk-note">{t("sample")}</p>
          <p className="rk-live__how">
            <span className="rk-live__how-k">{t("an.how.k")}</span>
            <span className="rk-live__chip rk-live__chip--sys"><i aria-hidden="true" />{t("an.how.1")}</span>
            {arrow}
            <span className="rk-live__chip">{t("an.how.2")}</span>
            {arrow}
            <span className="rk-live__chip">{t("an.how.3")}</span>
          </p>
          <div className="rk-live__foot">
            <ul className="rk-live__facts">
              <li>{priceLine(t.raw("an.chip.1"), facts)}</li>
              <li>{t("an.chip.2")}</li>
              <li>{t("an.chip.3")}</li>
            </ul>
            {go}
          </div>
        </div>

        {/* A · phones and narrow tablets: one request's way on a rail */}
        <div className="rk-an__mob">
          <div className="rk-path" data-scene="path">
            <div className="rk-path__top"><p className="rk-path__k">{t("an.label")}</p></div>
            <div className="rk-path__flow" aria-hidden="true">
              <figure className="rk-path__frame" data-f="1">
                <figcaption className="rk-path__cap"><span className="rk-path__n">1</span><p><b>{t("an.s.1.t")}</b><span>{t("an.s.1.p")}</span></p></figcaption>
                <div className="rk-path__shot">
                  <p className="rk-path__sk">{t("an.shot.g")}</p>
                  <div className="rk-path__ad">
                    <p className="rk-path__sp"><b>{m("ad")}</b> · {m("site")}</p>
                    <p className="rk-path__h">{m("head")}</p>
                    <p className="rk-path__d">{m("desc")}</p>
                  </div>
                  {tag("1")}
                </div>
                <span className="rk-path__seg"><i /></span>
              </figure>
              <figure className="rk-path__frame" data-f="2">
                <figcaption className="rk-path__cap"><span className="rk-path__n">2</span><p><b>{t("an.s.2.t")}</b><span>{t("an.s.2.p")}</span></p></figcaption>
                <div className="rk-path__shot">
                  <p className="rk-path__url">{m("site")}{tag("2")}</p>
                  <p className="rk-path__fh">{t("an.form")}</p>
                  <p className="rk-path__form"><span className="rk-path__field"><span className="rk-path__fv">+380 67 ••• •• 12</span></span><span className="rk-path__send">{t("an.send")}<i className="rk-path__tap" /></span></p>
                  <p className="rk-path__rec"><span className="rk-path__tick" />{t("an.rec")}</p>
                </div>
                <span className="rk-path__seg"><i /></span>
              </figure>
              <figure className="rk-path__frame" data-f="3">
                <figcaption className="rk-path__cap"><span className="rk-path__n">3</span><p><b>{t("an.s.3.t")}</b><span>{t("an.s.3.p")}</span></p></figcaption>
                <div className="rk-path__shot">
                  <p className="rk-path__sk">{t("an.shot.ga")}</p>
                  <ul className="rk-path__rows">
                    {TOTALS.map((x) => (
                      <li className="rk-path__row" data-src={x.src} key={x.src}>
                        {x.src === "google" && <span className="rk-path__flash" />}
                        <span className="rk-path__name">{NAME[x.src]}</span>
                        <span className="rk-path__bar"><i style={{ width: `${Math.round((x.n / TOTALS[0].n) * 10000) / 100}%` }} /></span>
                        <b className="rk-path__v">{x.src === "google" ? <Count value={x.n} /> : x.n}</b>
                      </li>
                    ))}
                  </ul>
                  <p className="rk-path__cpl"><b>{t("an.cpl.t")} {t("an.cpl.f")}</b><br />{t("an.cpl.s")}</p>
                </div>
              </figure>
              {/* the riders: the label from the ad to the site, «+1 заявка» from the record to the report (only while it plays) */}
              <span className="rk-path__run rk-path__run--tag"><span className="rk-path__tag"><i />{t("an.tag")}</span></span>
              <span className="rk-path__run rk-path__run--hit">{t("an.hit")}</span>
            </div>
            <p className="visually-hidden">{t("an.path")}</p>
          </div>
          <p className="rk-note">{t("sample")}</p>
          <div className="rk-path__foot">
            <ul className="rk-path__facts">
              {[1, 2, 3].map((n) => (
                <li key={n}>
                  <p className="rk-path__ft">{priceLine(t.raw(`an.f.${n}.t`), facts)}</p>
                  <p className="rk-path__fp">{t(`an.f.${n}.p`)}</p>
                </li>
              ))}
            </ul>
            {go}
          </div>
        </div>
      </div>
    </section>
  );
}
