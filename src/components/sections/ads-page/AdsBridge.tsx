import { getLocale, getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { aiHref } from "@/components/ai/links";
import { ButtonLink } from "@/components/ui/button/Button";
import { priceLine, type AdsFacts } from "@/components/ads/facts";

/**
 * 5 · Сторінка: the bridge from the ads to the sites page, as a short film (the owner's pick of 26 Oct, «Курсор»; the
 * storyboard by an art director after prompt-motion.com's product films). One visitor clicks the ad and lands on an
 * unclear page: they hunt for the price, scroll, wait for a page to load and close the tab, and the paid click falls
 * struck onto «Бюджет зливається»; the same visitor on a clear page goes straight to «Залишити заявку», and the request
 * comes. Under it the two ways: a landing with the ads, or the ads alone (the price cards' plans go to the form).
 *
 * The film is a fixed artboard measured in u (1/64 of its width; phones: a portrait board 22.5u wide, the windows'
 * insides scaled as one). The CSS draws its last frame, which is also what reduced motion shows; the page runtime
 * plays it (scene «page»: transform and opacity). The cursor's way and its dotted trail come from one table, baked here.
 */

type Box = [number, number, number?, number?];
/** a place on the board: the desktop box and the phone box (null: not shown on phones) */
function at(d: Box, m: Box | null): React.CSSProperties {
  const s: Record<string, string | number> = { "--x": d[0], "--y": d[1] };
  if (d[2] != null) s["--w"] = d[2];
  if (d[3] != null) s["--h"] = d[3];
  if (m) {
    s["--mx"] = m[0];
    s["--my"] = m[1];
    if (m[2] != null) s["--mw"] = m[2];
    if (m[3] != null) s["--mh"] = m[3];
  }
  return s as React.CSSProperties;
}
/** a place inside a window (the window's inside scales as one on phones) */
function ip(x: number, y: number, w?: number, h?: number): React.CSSProperties {
  const s: Record<string, string | number> = { "--ix": x, "--iy": y };
  if (w != null) s["--iw"] = w;
  if (h != null) s["--ih"] = h;
  return s as React.CSSProperties;
}

type WP = [number, number, number]; // ms, x, y (board u)
/** a cursor's way through its stops: Catmull-Rom, eased in and out between stops, sampled every `step` ms */
function sampleWay(wp: WP[], step: number): WP[] {
  const out: WP[] = [];
  const ease = (s: number) => (s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2);
  const cr = (a: number, b: number, c: number, d: number, s: number) =>
    0.5 * (2 * b + (-a + c) * s + (2 * a - 5 * b + 4 * c - d) * s * s + (-a + 3 * b - 3 * c + d) * s * s * s);
  for (let t = wp[0][0]; t <= wp[wp.length - 1][0]; t += step) {
    let i = 0;
    while (i < wp.length - 2 && t > wp[i + 1][0]) i++;
    const p0 = wp[Math.max(0, i - 1)], p1 = wp[i], p2 = wp[i + 1], p3 = wp[Math.min(wp.length - 1, i + 2)];
    const s = ease(Math.min(1, Math.max(0, (t - p1[0]) / Math.max(1, p2[0] - p1[0]))));
    out.push([t, +cr(p0[1], p1[1], p2[1], p3[1], s).toFixed(2), +cr(p0[2], p1[2], p2[2], p3[2], s).toFixed(2)]);
  }
  return out;
}
/** the trail: an even dotted line, a dot every `gap` u of the way, each timed */
function trailOf(p: WP[], from: number, to: number, gap: number): WP[] {
  const out: WP[] = [];
  let acc = gap;
  for (let i = 1; i < p.length; i++) {
    const [t0, x0, y0] = p[i - 1];
    const [t1, x1, y1] = p[i];
    if (t1 < from || t0 > to) continue;
    const d = Math.hypot(x1 - x0, y1 - y0);
    for (let s = gap - acc; s <= d; s += gap) {
      const k = d ? s / d : 0;
      out.push([Math.round(t0 + (t1 - t0) * k), +(x0 + (x1 - x0) * k).toFixed(2), +(y0 + (y1 - y0) * k).toFixed(2)]);
    }
    acc = (acc + d) % gap;
  }
  return out;
}

// the windows: desktop A at (3,7), B at (33,7), 28×20; phones A at (1,5.6), B at (1,21.8), the insides scaled 0.732
const K = 0.732;
const mapA = ([t, x, y]: WP): WP => [t, +(1 + (x - 3) * K).toFixed(2), +(5.6 + (y - 7) * K).toFixed(2)];
const mapB = ([t, x, y]: WP): WP => [t, +(1 + (x - 33) * K).toFixed(2), +(21.8 + (y - 7) * K).toFixed(2)];

/** the two visitors' ways for one menu: `navX`, where «Послуги» / «Услуги» sits (the click while waiting) */
function ways(navX: number) {
  // visitor 1: in from the corner to the ad, the click, into the unclear page: the headline, the menu, a scroll, the menu again, a wait, the ×
  const a: WP[] = [
    [250, 41, 30], [800, 32, 16.2], [950, 32, 16.2], [1500, 13, 14.6], [1700, 12.6, 14.4], [1800, 12.9, 14.2], [1900, 12.4, 14.6], [2050, 6, 9.7],
    [2140, 9.4, 9.7], [2230, 12.8, 9.7], [2320, 16.4, 9.7], [2410, 20.2, 9.7], [2550, 23.6, 10.4], [2800, 15, 18.5], [3000, 8.5, 21], [3200, 19, 22.6],
    [3450, navX, 9.7], [3520, navX, 9.7], [3800, navX + 0.9, 11.2], [4100, navX + 2.3, 10.4], [4250, 18, 9], [4600, 30.05, 7.85], [4700, 30.05, 7.85],
  ];
  // visitor 2: in from below on the clear page, the price, then the button
  const b: WP[] = [[5700, 54, 22.5], [6200, 37.6, 16.9], [6400, 37.8, 16.8], [6620, 42, 17.9], [6850, 39.4, 19.3], [7000, 39.4, 19.3]];
  const am: WP[] = [[250, 18, 13.5], [800, 11.25, 13], [950, 11.25, 13], ...a.slice(3).map(mapA)];
  const pa = sampleWay(a, 20), pam = sampleWay(am, 20), pb = sampleWay(b, 20), pbm = sampleWay(b.map(mapB), 20);
  return {
    pa, pam, pb, pbm,
    ta: trailOf(pa, 1450, 4600, 0.34), tam: trailOf(pam, 1450, 4600, 0.26),
    tb: trailOf(pb, 5750, 6850, 0.34), tbm: trailOf(pbm, 5750, 6850, 0.26),
  };
}
// where the second menu item sits (measured on the board: the words differ in length)
const NAV_X: Record<string, number> = { uk: 8.05, ru: 7.4 };
const WAYS: Record<string, ReturnType<typeof ways>> = {};
const waysFor = (locale: string) => (WAYS[locale] ??= ways(NAV_X[locale] ?? NAV_X.uk));
const last = (p: WP[]) => p[p.length - 1];

const ARROW = <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-arrow" /></svg>;
const TICK = <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 12.5 4.2 4.2L19 7" /></svg>;
const CURSOR = <svg viewBox="0 0 16 22" aria-hidden="true" focusable="false"><path d="M1 1v17.5l4.6-4.3 3 6.8 3-1.3-3-6.6H15L1 1Z" /></svg>;

/** a narration line: in at `inn`, out at `out` (none: the last line, it stays); its words rise out of their masks */
function Line({ inn, out, children }: { inn: number; out?: number; children: React.ReactNode }) {
  return (
    <p className={`rk-film__line${out == null ? " rk-film__line--last" : ""}`} data-in={inn} data-out={out} style={at([3, 1.5, 58], [1, 1, 20.5])}>
      {children}
    </p>
  );
}
const words = (s: string) => s.split(" ").flatMap((w, i) => [<span className="rk-film__w" key={i}><span>{w}</span></span>, " "]);

function Trails({ a, b, vb, cls }: { a: WP[]; b: WP[]; vb: [number, number]; cls: string }) {
  return (
    <svg className={`rk-cur__trail ${cls}`} viewBox={`0 0 ${vb[0]} ${vb[1]}`} aria-hidden="true" focusable="false">
      {a.map(([t, x, y], i) => <circle className="rk-cur__td rk-cur__td--a" cx={x} cy={y} r="0.09" data-t={t} key={`a${i}`} />)}
      {b.map(([t, x, y], i) => <circle className="rk-cur__td rk-cur__td--b" cx={x} cy={y} r="0.1" data-t={t} key={`b${i}`} />)}
    </svg>
  );
}

export async function AdsBridge({ index, facts }: { index: number; facts: AdsFacts }) {
  const t = await getTranslations("ads");
  const locale = await getLocale();
  const w = waysFor(locale);
  const endA = last(w.pa), endAm = last(w.pam), endB = last(w.pb), endBm = last(w.pbm);
  // the unclear page's crowded menu, one string in the messages («|» between the items)
  const nav = t("bridge.nav").split("|");
  const tag = (key: string, inn: number, x: number, y: number) => (
    <span className="rk-film__tag" data-in={inn} data-dx="-0.4" style={ip(x, y)}><i />{t(`bridge.tags.${key}`)}</span>
  );
  const ring = (x: number, y: number, m: WP, inn: number) => (
    <i className="rk-film__ring" data-ring={inn} style={at([x - 0.8, y - 0.8, 1.6, 1.6], [m[1] - 0.6, m[2] - 0.6, 1.2, 1.2])} />
  );
  const navX = NAV_X[locale] ?? NAV_X.uk;
  // the two ways under the film: the price cards' plans and their details, so the form opens on the same plan
  const pack = { plan: `${t("price.b.siteAds.t")} · ${facts.siteAds}`, details: t("price.b.siteAds.d") };
  const ads = { plan: `${t("price.g.t")} · ${facts.ads}`, details: [1, 2, 3, 4].map((n) => t(`price.g.${n}`)).join("\n") };
  return (
    <section className="section ai-sec rk-bridge" id="storinka" aria-labelledby="bridge-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("nav.page")}</span>
          </p>
          <h2 className="s-head__title" id="bridge-title" data-split="">
            <span className="tone">{t.rich("bridge.title", R)}</span>
          </h2>
          <p className="s-head__intro">{t("bridge.intro")}</p>
        </header>

        <div className="rk-film">
          <div className="rk-film__b rk-cur" data-scene="page" role="img" aria-label={t("bridge.alt")}>
            <div className="rk-film__say" aria-hidden="true">
              <Line inn={0} out={1300}>{words(t("bridge.l1"))}</Line>
              <Line inn={2050} out={5400}>
                <span className="rk-film__ph" data-in="2050">{words(t("bridge.l2.a"))}</span> <span className="rk-film__ph" data-in="2600">{words(t("bridge.l2.b"))}</span>{" "}
                <span className="rk-film__ph" data-in="3700">{words(t("bridge.l2.c"))}</span> <span className="rk-film__ph rk-film__lost" data-in="4650">{words(t("bridge.l2.d"))}</span>
              </Line>
              <Line inn={5500} out={7400}>{words(t("bridge.l3"))}</Line>
              <Line inn={7500}>{words(t("bridge.l4"))} <em>{words(t("bridge.l4hl"))}</em></Line>
            </div>

            <div className="rk-film__cam" aria-hidden="true">
              <span className="rk-film__lab" data-in="1000" style={at([3, 5.7], [1, 4.7])}>{t("bridge.unclear")}</span>
              <span className="rk-film__lab" data-in="5400" style={at([33, 5.7], [1, 20.9])}>{t("bridge.clear")}</span>

              {/* window A: the unclear page */}
              <div className="rk-cur__win rk-cur__win--a" style={at([3, 7, 28, 20], [1, 5.6, 20.5, 14.64])}>
                <div className="rk-cur__in">
                  <p className="rk-cur__bar" style={ip(0, 0, 28, 1.6)}><i /><i /><i /><span>vash-sait.ua</span><b className="rk-cur__x">×</b></p>
                  <i className="rk-cur__prog" style={ip(0, 1.6, 28, 0.14)} />
                  <div className="rk-cur__page rk-cur__page--a" style={ip(0, 1.6, 28, 44)}>
                    <p className="rk-cur__nav" style={ip(1.2, 0.7, 26)}>{nav.map((n) => <span key={n}>{n}</span>)}</p>
                    <div className="rk-cur__hero" style={ip(1.2, 2.4, 25.6, 8.6)}>
                      <span className="rk-cur__arr" style={ip(0.6, 3.6)}>‹</span>
                      <span className="rk-cur__arr" style={ip(24.2, 3.6)}>›</span>
                      <span className="rk-cur__sl" style={ip(11.4, 7.4)}><i /><i /><i /><i /></span>
                    </div>
                    <p className="rk-cur__vague" style={ip(2.6, 4.2, 15)}>{t("bridge.vague")}</p>
                    {[12, 13.2, 14.4, 15.6, 17.4, 18.6, 19.8, 21, 22.2].map((y, i) => <i className="rk-cur__txt" style={ip(1.2, y, [25, 23, 24.4, 16, 25, 22, 24, 19, 12][i], 0.36)} key={y} />)}
                    <i className="rk-cur__img" style={ip(1.2, 24.6, 12, 7)} />
                    <i className="rk-cur__img" style={ip(14, 24.6, 12.8, 7)} />
                    {[33, 34.2, 35.4].map((y) => <i className="rk-cur__txt" style={ip(1.2, y, 22, 0.36)} key={y} />)}
                    <span className="rk-cur__ghost" style={ip(1.2, 38, 7, 1.7)}>{t("bridge.more")}</span>
                  </div>
                  <span className="rk-cur__spin" style={ip(21.6, 3.4, 2, 2)}><i /></span>
                  {tag("what", 1900, 12.4, 8.6)}
                  {tag("price", 2450, 13.4, 3.15)}
                  {tag("button", 3100, 1.2, 17.6)}
                  {tag("wait", 3800, 18.2, 6.1)}
                  <span className="rk-cur__stamp" data-pop="4700" style={ip(8.6, 10.2)}>{t("bridge.stamp")}</span>
                </div>
              </div>

              {/* window B: the clear page */}
              <div className="rk-cur__win rk-cur__win--b" data-in="5400" style={at([33, 7, 28, 20], [1, 21.8, 20.5, 14.64])}>
                <div className="rk-cur__in">
                  <p className="rk-cur__bar" style={ip(0, 0, 28, 1.6)}><i /><i /><i /><span>vash-sait.ua</span></p>
                  <div className="rk-cur__page" style={ip(0, 1.6, 28, 18.4)}>
                    <p className="rk-cur__brand" style={ip(1.5, 1.4)}>{t("bridge.brand")}</p>
                    <p className="rk-cur__h" style={ip(1.5, 2.6, 17)}>{t("bridge.h")}</p>
                    <p className="rk-cur__price" style={ip(1.5, 7.3)}>{t("bridge.from")}</p>
                    <span className="rk-cur__pill" style={ip(1.5, 9.4, 9, 2.2)}>{t("bridge.send")}</span>
                    <i className="rk-cur__tile" style={ip(19.5, 2.6, 7, 4.6)} />
                    <span className="rk-cur__quote" style={ip(19.5, 7.8, 7, 3.6)}>“<i /><i /></span>
                  </div>
                  <span className="rk-cur__chip rk-cur__chip--b" data-pop="5650" style={ip(1.5, 13.6)}>{t("bridge.chip")}<b className="rk-cur__ok" data-pop="7000">{TICK}</b></span>
                </div>
              </div>

              {/* the paid click of visitor 1: out of the ad, into window A, struck when the tab closes, down onto the ledge */}
              <i className="rk-cur__ledge" data-draw="4950" style={at([3, 29.25, 28, 0.06], null)} data-m="off" />
              <span className="rk-cur__chip rk-cur__chip--a" data-click={JSON.stringify([[30.2, 17.4], [4.2, 25]])} data-click-m={JSON.stringify([[9.6, 14], [1.6, 18.5]])} style={at([3, 27.95], [1.6, 18.45])}>
                <span className="rk-cur__ce">{t("bridge.chip")}</span>
                <span className="rk-cur__cl">{t("bridge.chip")}</span>
                <i className="rk-cur__strike" />
              </span>
              <span className="rk-cur__drain" data-in="5000" style={at([13.6, 28.15], [9.9, 18.75])}>{t("bridge.drain")}</span>

              {/* the ad: in at the centre, clicked, it opens into window A */}
              <div className="rk-cur__ad" style={at([23, 13.8, 18, 4.6], [2.25, 10.6, 18, 4.6])}>
                <p><b>{t("bridge.ad.k")}</b> · vash-sait.ua</p>
                <p className="rk-cur__adt">{t("bridge.ad.t")}</p>
              </div>

              <Trails a={w.ta} b={w.tb} vb={[64, 32]} cls="rk-cur__trail--d" />
              <Trails a={w.tam} b={w.tbm} vb={[22.5, 38]} cls="rk-cur__trail--m" />
              {ring(32, 16.2, [0, 11.25, 13], 820)}
              {ring(navX, 9.7, mapA([0, navX, 9.7]), 3500)}
              {ring(30.05, 7.85, mapA([0, 30.05, 7.85]), 4620)}
              {ring(39.4, 19.3, mapB([0, 39.4, 19.3]), 6850)}
              <span className="rk-cur__cur rk-cur__cur--a" data-way={JSON.stringify(w.pa)} data-way-m={JSON.stringify(w.pam)} data-press="820,3500,4620" style={at([endA[1], endA[2]], [endAm[1], endAm[2]])}><i>{CURSOR}</i></span>
              <span className="rk-cur__cur rk-cur__cur--b" data-way={JSON.stringify(w.pb)} data-way-m={JSON.stringify(w.pbm)} data-press="6850" style={at([endB[1], endB[2]], [endBm[1], endBm[2]])}><i>{CURSOR}</i></span>
              <p className="rk-film__toast" data-pop="7000" style={at([46.5, 24.6, 15, 3.4], [3, 33.7, 17.5, 3])}>
                <span className="rk-film__tick">{TICK}</span>
                <span className="rk-film__tt"><b>{t("bridge.toast.t")}</b><small>{t("bridge.toast.src")}</small></span>
              </p>
            </div>
          </div>
          <p className="rk-film__cap" aria-hidden="true">{t("sample")}</p>
        </div>

        {/* the two ways: a landing with the ads, or the ads alone */}
        <div className="rk-paths">
          <div className="rk-paths__cell">
            <p className="rk-paths__k">{t("bridge.paths.a.k")}</p>
            <p className="rk-paths__t">{t("bridge.paths.a.t")}</p>
            <p className="rk-paths__p">{priceLine(t.raw("bridge.paths.a.p"), facts)}</p>
            <ButtonLink href="#contact" variant="primary" size="sm" className="rk-paths__go" data-plan={pack.plan} data-details={pack.details}>{t("bridge.paths.a.go")}</ButtonLink>
          </div>
          <div className="rk-paths__cell">
            <p className="rk-paths__k">{t("bridge.paths.b.k")}</p>
            <p className="rk-paths__t">{t("bridge.paths.b.t")}</p>
            <p className="rk-paths__p">{priceLine(t.raw("bridge.paths.b.p"), facts)}</p>
            <ButtonLink href="#contact" variant="ghost" size="sm" className="rk-paths__go" data-plan={ads.plan} data-details={ads.details}>{t("bridge.paths.b.go")}</ButtonLink>
          </div>
          <a className="rk-paths__sites" href={`${aiHref(locale, "/dyzain-i-saity")}#formats`}>
            <span>{t("bridge.paths.sites")}</span>
            {ARROW}
          </a>
        </div>
      </div>
    </section>
  );
}
