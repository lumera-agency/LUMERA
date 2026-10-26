import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { HeroFlux } from "@/components/sites/hero-fx/HeroFlux";
import { PersonMark } from "./AboutMarks";

/** TEMPORARY: the first screen's three variants for the owner to choose from (?v=a|b|c); one stays */
export type AboutVariant = "a" | "b" | "c";

const MEMBERS = [1, 2, 3] as const;

type T = Awaited<ReturnType<typeof getTranslations<"about">>>;

/** One person: the photo's place (a square, the card's radius), the name small, the role at the reading size, one line
 *  of what they do. The main page's card (.card: its border, its light under the pointer). */
function Member({ n, t, tilt = false }: { n: (typeof MEMBERS)[number]; t: T; tilt?: boolean }) {
  return (
    <li className="card about-m" data-in="" data-tilt={tilt ? "" : undefined}>
      <div className="about-ph" aria-hidden="true">
        <PersonMark />
      </div>
      <div className="about-m__body">
        <p className="about-m__name">{t(`team.${n}.name`)}</p>
        <h3 className="about-m__role">{t(`team.${n}.role`)}</h3>
        <p className="about-m__d">{t(`team.${n}.d`)}</p>
      </div>
    </li>
  );
}

/** The quiet way down to the contacts (a link, not a button: the page's one lime button is the contacts') */
function Down({ t }: { t: T }) {
  return (
    <a className="link about-down" href="#contacts">
      <span>{t("team.down")}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg>
    </a>
  );
}

function Meta({ t }: { t: T }) {
  return (
    <p className="s-head__meta">
      <span className="s-head__index">1</span>
      <span>{t("team.meta")}</span>
    </p>
  );
}

function Title({ t }: { t: T }) {
  return (
    <h1 className="s-head__title" id="team-title" data-split="">
      <span className="tone">{t.rich("team.title", R)}</span>
    </h1>
  );
}

/**
 * 1 · Команда, the first screen: who is behind the studio (the owner's brief: three people, a photo's place each, the
 * name, the role, one line). Three layouts to choose from (Dribbble / Awwwards about pages; effects after React Bits):
 * · A «Сітка»: the sibling pages' head (the title left, the lead right), the three cards in a row, the middle one set
 *   lower (an editorial step); they rise in one after another; each leans a little toward the pointer (Tilted Card).
 * · B «Розкол»: the title stays on the left while the three cards pass on the right, each a wide card (the photo
 *   beside the words); they slide in as they reach the screen (Animated Content). Phones: compact rows, photo left.
 * · C «Віяло»: the title in the middle over the sibling pages' lines (FluxLines, black and white); the three cards come
 *   in as a fanned pile and spread into a row (Bounce Cards); under the pointer one lifts and the others step aside.
 */
export async function AboutTeam({ variant }: { variant: AboutVariant }) {
  const t = await getTranslations("about");
  return (
    <section className={`section about-hero about-hero--${variant}`} id="team" aria-labelledby="team-title">
      {variant === "c" && (
        <div className="ai-hero__bg about-hero__bg" aria-hidden="true">
          <HeroFlux under="#work" tone="mono" still />
        </div>
      )}
      <div className="container">
        {variant === "a" && (
          <>
            <header className="s-head">
              <Meta t={t} />
              <Title t={t} />
              <div className="s-head__intro">
                <p>{t("team.lead")}</p>
                <Down t={t} />
              </div>
            </header>
            <ul className="about-grid">
              {MEMBERS.map((n) => <Member n={n} t={t} tilt key={n} />)}
            </ul>
          </>
        )}

        {variant === "b" && (
          <div className="about-split">
            <header className="s-head s-head--side about-split__head">
              <Meta t={t} />
              <Title t={t} />
              <p className="s-head__intro">{t("team.lead")}</p>
              <Down t={t} />
            </header>
            <ul className="about-split__list">
              {MEMBERS.map((n) => <Member n={n} t={t} key={n} />)}
            </ul>
          </div>
        )}

        {variant === "c" && (
          <>
            <header className="s-head about-center">
              <Meta t={t} />
              <Title t={t} />
              <div className="s-head__intro">
                <p>{t("team.lead")}</p>
                <Down t={t} />
              </div>
            </header>
            <ul className="about-fan">
              {MEMBERS.map((n) => <Member n={n} t={t} key={n} />)}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
