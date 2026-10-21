import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";

const COUNT = 6;

/** each term's mark, plain line drawings: the accounts, the budget, the test request, the fixes, the report, the hand-over */
const ICON: Record<number, React.ReactNode> = {
  1: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" /></>,
  2: <><rect x="3.5" y="6.5" width="17" height="12" rx="2.5" /><path d="M15.5 12.5h5M3.5 10h11" /></>,
  3: <><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  4: <><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12.3 2.4 2.4 4.8-4.9" /></>,
  5: <path d="M5 19V9M12 19V5M19 19v-7" />,
  6: <><rect x="3.5" y="6" width="17" height="12" rx="2.5" /><path d="m10.5 9.5 4 2.5-4 2.5z" /></>,
};

/**
 * 5 · Наші умови (the owner's brief of 21 Oct): the terms as a plain list on the black, no cards, much air. The words
 * are the FAQ's answers shortened (the accounts are yours, the budget goes to Google or Meta without our markup, the
 * test request, the free fixes, no promised number of requests, the access at the end); nothing new is promised.
 * Phones (the owner, 22 Oct: «one text»): an accordion, as the FAQ, each term its mark and a short title, the sentence
 * under it on a tap, the first one open; the open one's minus in lime. Wider screens show every sentence (runtime:
 * initFolds keeps them open there; the title row is hidden).
 */
export async function AdsTerms({ index }: { index: number }) {
  const t = await getTranslations("ads");
  return (
    <section className="section ai-sec ad-terms" id="terms" aria-labelledby="terms-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("nav.terms")}</span>
          </p>
          <h2 className="s-head__title" id="terms-title" data-split="">
            <span className="tone">{t.rich("terms.title", R)}</span>
          </h2>
        </header>
        <ol className="ad-terms__list">
          {Array.from({ length: COUNT }, (_, i) => i + 1).map((n) => (
            <li className="ad-terms__item" key={n}>
              <details className="ad-terms__fold" data-fold="" data-fold-open={n === 1 ? "" : undefined} open>
                <summary className="ad-terms__sum">
                  <span className="ad-terms__ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">{ICON[n]}</svg>
                  </span>
                  <span className="ad-terms__lab">{t(`terms.labels.${n}`)}</span>
                </summary>
                <span className="ad-terms__n" aria-hidden="true">{String(n).padStart(2, "0")}</span>
                <p className="ad-terms__p">{t(`terms.items.${n}`)}</p>
              </details>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
