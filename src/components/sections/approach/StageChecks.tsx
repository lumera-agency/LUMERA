import { getTranslations } from "next-intl/server";

const ITEMS = [1, 2, 3, 4] as const;

/** A stage's four points with ticks (the launch card's list, for stages 1–4): they tick one by one as the stage comes up. */
export async function StageChecks({ n }: { n: 1 | 2 | 3 | 4 }) {
  const t = await getTranslations(`approach.stage.checks.${n}`);
  return (
    <>
      <p className="checks__head t-m" aria-hidden="true">{t("head")}</p>
      <ul className="checks" data-checks="" aria-label={t("head")}>
        {ITEMS.map((i) => (
          <li key={i}>
            <span className="check" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="m5 12.5 4.2 4.2L19 7" /></svg>
            </span>
            <div>
              <b>{t(`b.${i}`)}</b>
              <span>{t(`span.${i}`)}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
