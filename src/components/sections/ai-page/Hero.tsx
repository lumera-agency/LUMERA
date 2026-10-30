import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button/Button";
import { aiRich } from "@/components/ai/rich";
import { HeroConsoleFx, type ConsoleLine } from "./HeroConsoleFx";
import { AUDIT, LOSS_READY, usd } from "./prices";
import "./hero-console.css";

/** the day's start counts: the four places (Telegram, CRM, the table, the schedule), then the three metrics */
const COUNTS = [4, 12, 9, 6];
const METRICS = [31, 4, 6];
/** the fan's curves, in its own units (40 × 160): from the track's end (y 80) to the four rows' middles */
const FAN = [20, 60, 100, 140].map((y) => `M0 80C20 80 20 ${y} 40 ${y}`);
const DIGITS = Array.from("01234567890");
const N = [1, 2, 3, 4];

const vars = (v: Record<string, string | number>) => v as React.CSSProperties;

/**
 * a counter: one 1 em window per digit over a strip 0…9,0 (the conductor rolls it by translateY). Leading zeros stay
 * hidden; a left-aligned one (`start`) is shifted left by them, so a new digit (9 → 10) never moves the layout.
 */
function Num({ value, slots, start = false }: { value: number; slots: number; start?: boolean }) {
  const s = String(value).padStart(slots, "0");
  const lead = Math.min(slots - 1, s.length - s.replace(/^0+/, "").length);
  return (
    <span className={start ? "ai-console__n ai-console__n--start" : "ai-console__n"} data-v={value} style={start ? vars({ "--hide": lead }) : undefined}>
      <span className="ai-console__nin">
        {Array.from(s).map((d, i) => (
          <span key={i} className={i < lead ? "ai-console__nd is-z" : "ai-console__nd"}>
            <span className="ai-console__ns" style={{ transform: `translateY(-${d}em)` }}>
              {DIGITS.map((g, k) => (
                <i key={k}>{g}</i>
              ))}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}

/** a log line: its full words (a wide console) and its short ones (narrow and phones) */
function Line({ time, l }: { time: string; l: ConsoleLine }) {
  return (
    <li className="ai-console__line">
      <time>{time}</time>
      <span className="ai-console__lf">
        <span>{l.src}</span>
        <b>{`→ ${l.res}`}</b>
      </span>
      <span className="ai-console__ls">
        <span>{l.srcS}</span>
        <b>{`→ ${l.resS}`}</b>
      </span>
    </li>
  );
}

/**
 * 1 · the first screen «Пульт» (the owner's pick, 26 Oct 2026, of four art-directed designs of the live flow; refs:
 * 21st.dev «AI Agent Pipeline»): the question the page answers (two lines that rise once, CSS), what the robot takes
 * over, the request button and the audit's price on the left; on the right a dark console shows the robot at work.
 * The request at the head of the queue, a lime packet down a straight track through «читає · розбирає · передає», a
 * curve to where it goes lights, that place's dot turns ember and its count ticks, a log line slides in and the day's
 * counters roll (HeroConsoleFx). One soft light at the top right; all data is an example («Приклад · дані умовні»).
 * The markup is the still (reduced motion): P1 on its way to Telegram, the three lines before it, the start counts.
 * On a computer the first screen pins and block 2 slides over it (data-cover); on a phone it simply scrolls away
 * (the owner, 26 Oct: «убери наезд экрана на мобильном»; ai-page.css).
 */
export async function Hero() {
  const t = await getTranslations("ai");
  const c = await getTranslations("aiCommon");
  const line = (n: number): ConsoleLine => ({
    src: t(`console.log.${n}.src`),
    res: t(`console.log.${n}.res`),
    srcS: t(`console.log.${n}.srcS`),
    resS: t(`console.log.${n}.resS`),
  });
  const log = N.map(line);
  return (
    <section className="ai-hero ai-console" id="top" aria-labelledby="ai-title" data-cover="">
      <div className="ai-hero__bg ai-console__bg" aria-hidden="true" />
      <div className="ai-hero__in">
        <div className="ai-hero__copy">
          <h1 className="s-head__title ai-hero__title" id="ai-title">
            {t.rich("hero.title", aiRich)}
          </h1>
          <p className="ai-hero__lead">
            <span>{t("hero.lead")}</span> <span className="ai-hero__lead2">{t("hero.lead2")}</span>
          </p>
          <div className="ai-hero__actions">
            <ButtonLink href="#contact" variant="primary">{c("cta.auto")}</ButtonLink>
            {LOSS_READY && (
              <a className="link ai-hero__loss" href="#loss">
                <span>{t("hero.loss")}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg>
              </a>
            )}
          </div>
          <p className="ai-hero__audit">{t("hero.audit", { audit: usd(AUDIT.price) })}</p>
        </div>
        <HeroConsoleFx lines={log}>
          <div className="ai-console__fig" role="img" aria-label={t("console.label")}>
            <div className="ai-console__tilt" aria-hidden="true">
              <div className="ai-console__box" data-p="1">
                <div className="ai-console__sec ai-console__head" style={vars({ "--i": 0 })}>
                  <span className="ai-console__status">
                    <i className="ai-console__live" />
                    {t("console.status")}
                  </span>
                  <span>{t("console.today")}</span>
                </div>

                <div className="ai-console__sec ai-console__flow" style={vars({ "--i": 1 })}>
                  <p className="ai-console__lbl ai-console__lbl--in">{t("console.inbox")}</p>
                  <p className="ai-console__lbl ai-console__lbl--out">{t("console.where")}</p>
                  {/* the queue: the head card and two ghosts under it; the fourth waits hidden behind them */}
                  <div className="ai-console__queue">
                    {N.map((n, k) => (
                      <div key={n} className="ai-console__card" data-slot={k}>
                        <i>{t(`console.card.${n}.tag`)}</i>
                        <span className="ai-console__msg">
                          <span className="ai-console__mf">{t(`console.card.${n}.msg`)}</span>
                          <span className="ai-console__ms">{t(`console.card.${n}.short`)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="ai-console__mid">
                    <div className="ai-console__track">
                      {[1, 2, 3].map((n) => (
                        <span key={n} className="ai-console__st" data-s={n}>
                          <i className="ai-console__sto" />
                          <i className="ai-console__stf" />
                          <span className="ai-console__stl">
                            <span>{t(`console.st.${n}`)}</span>
                            <span className="is-ink">{t(`console.st.${n}`)}</span>
                          </span>
                        </span>
                      ))}
                      {/* the packet spans the whole track: translateX(-100% | -50% | 0) puts its dot on the stations */}
                      <span className="ai-console__lane">
                        <span className="ai-console__packet" />
                      </span>
                    </div>
                    <svg className="ai-console__fan" viewBox="0 0 40 160" preserveAspectRatio="none" focusable="false">
                      {FAN.map((d) => (
                        <path key={d} d={d} />
                      ))}
                      {FAN.map((d) => (
                        <path key={`h${d}`} className="ai-console__hot" d={d} />
                      ))}
                    </svg>
                  </div>
                  <ul className="ai-console__dests">
                    {N.map((n, k) => {
                      const name = t(`console.dest.${n}.name`);
                      const more = t(`console.dest.${n}.more`);
                      const label = (
                        <>
                          {name}
                          {more && <span className="ai-console__more">{` ${more}`}</span>}
                        </>
                      );
                      return (
                        <li key={n} className="ai-console__dest" data-d={k}>
                          <span className="ai-console__dot">
                            <i />
                          </span>
                          <span className="ai-console__name">
                            <span>{label}</span>
                            <span className="is-ink">{label}</span>
                          </span>
                          <Num value={COUNTS[k]} slots={2} />
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="ai-console__sec ai-console__log" style={vars({ "--i": 2 })}>
                  <p className="ai-console__lbl">{t("console.journal")}</p>
                  <div className="ai-console__win">
                    {/* newest on top; the first line waits above the window for the next item (P1 at 08:02) */}
                    <ul className="ai-console__strip">
                      <Line time="08:02" l={log[0]} />
                      <Line time="08:01" l={log[3]} />
                      <Line time="08:00" l={log[2]} />
                      <Line time="07:58" l={log[1]} />
                    </ul>
                  </div>
                </div>

                <div className="ai-console__sec ai-console__met" style={vars({ "--i": 3 })}>
                  {/* the third counter: «Записів» (+1 when a booking lands); «Загублених 0» waits for the owner's OK */}
                  {[1, 2, 3].map((n, k) => (
                    <div key={n} className="ai-console__cell">
                      <p className="ai-console__lbl">
                        <span className="ai-console__mtf">{t(`console.met.${n}`)}</span>
                        <span className="ai-console__mts">{t(`console.metS.${n}`)}</span>
                      </p>
                      <Num value={METRICS[k]} slots={3} start />
                    </div>
                  ))}
                </div>
              </div>
              {/* the pointer's light on the console's edge (computers) */}
              <span className="ai-console__ring">
                <i />
              </span>
            </div>
          </div>
          <p className="ai-console__note">{t("console.note")}</p>
        </HeroConsoleFx>
      </div>
    </section>
  );
}
