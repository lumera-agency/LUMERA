import { getTranslations } from "next-intl/server";

/** The hero's rail: Site → Google Ads → Leads, one line with a light running along it. */
export async function HeroRail() {
  const t = await getTranslations("hero.rail");
  const steps = [1, 2, 3] as const;
  return (
    <div className="rail" data-rail>
      <div className="rail__inner">
        <div className="rail__track" aria-hidden="true" data-rail-track><span className="rail__pulse" /></div>
        <ol className="rail__list" aria-label={t("label")}>
          {steps.map((n, i) => (
            <li key={n} className="rail__step" style={{ "--i": i } as React.CSSProperties} data-reveal="step">
              <span className="rail__node" aria-hidden="true" />
              <span className="rail__num" aria-hidden="true">{n}</span>
              <span className="rail__title">{t(`${n}.title`)}</span>
              <span className="rail__text">{t(`${n}.text`)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
